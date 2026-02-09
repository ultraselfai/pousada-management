"use server";

/**
 * Bookings Server Actions
 *
 * Server Actions para gerenciamento de reservas.
 * Inclui CRUD, check-in/check-out e mapa de reservas.
 */

import { revalidatePath } from "next/cache";
import { prisma } from "@/db";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import {
  createBookingSchema,
  updateBookingSchema,
  updateBookingStatusSchema,
  type CreateBookingInput,
  type UpdateBookingInput,
  type UpdateBookingStatusInput,
} from "./schemas";
import type {
  Booking,
  BookingWithDetails,
  BookingActionResult,
  BookingsListResult,
  BookingFilters,
  ReservationMapByRoom,
} from "./types";
import {
  BookingStatus,
  RoomStatus,
  TransactionType,
  Prisma,
} from "@/generated/prisma/client";

/**
 * Gerar número de reserva único
 */
async function generateBookingNumber(): Promise<string> {
  const year = new Date().getFullYear();
  const lastBooking = await prisma.booking.findFirst({
    where: {
      bookingNumber: { startsWith: `RES-${year}` },
    },
    orderBy: { bookingNumber: "desc" },
  });

  let nextNumber = 1;
  if (lastBooking) {
    const parts = lastBooking.bookingNumber.split("-");
    nextNumber = parseInt(parts[2], 10) + 1;
  }

  return `RES-${year}-${nextNumber.toString().padStart(4, "0")}`;
}

/**
 * Calcular número de noites
 */
function calculateNights(checkIn: Date, checkOut: Date): number {
  const diff = checkOut.getTime() - checkIn.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

/**
 * Verificar conflito de datas
 */
async function hasConflict(
  roomId: string,
  checkIn: Date,
  checkOut: Date,
  excludeBookingId?: string
): Promise<boolean> {
  const conflicting = await prisma.booking.findFirst({
    where: {
      roomId,
      id: excludeBookingId ? { not: excludeBookingId } : undefined,
      status: {
        in: [
          BookingStatus.PRE_BOOKING,
          BookingStatus.CONFIRMED,
          BookingStatus.CHECKED_IN,
        ],
      },
      OR: [
        { checkIn: { lte: checkIn }, checkOut: { gt: checkIn } },
        { checkIn: { lt: checkOut }, checkOut: { gte: checkOut } },
        { checkIn: { gte: checkIn }, checkOut: { lte: checkOut } },
      ],
    },
  });

  return !!conflicting;
}

/**
 * Listar reservas
 */
export async function getBookings(
  filters?: BookingFilters
): Promise<BookingsListResult> {
  try {
    const page = filters?.page || 1;
    const limit = filters?.limit || 20;
    const skip = (page - 1) * limit;

    const where: Prisma.BookingWhereInput = {};

    if (filters?.status) {
      where.status = Array.isArray(filters.status)
        ? { in: filters.status }
        : filters.status;
    }

    if (filters?.roomId) where.roomId = filters.roomId;
    if (filters?.guestId) where.guestId = filters.guestId;

    if (filters?.checkInStart || filters?.checkInEnd) {
      where.checkIn = {
        ...(filters.checkInStart && { gte: filters.checkInStart }),
        ...(filters.checkInEnd && { lte: filters.checkInEnd }),
      };
    }

    if (filters?.checkOutStart || filters?.checkOutEnd) {
      where.checkOut = {
        ...(filters.checkOutStart && { gte: filters.checkOutStart }),
        ...(filters.checkOutEnd && { lte: filters.checkOutEnd }),
      };
    }

    if (filters?.search) {
      where.OR = [
        { bookingNumber: { contains: filters.search, mode: "insensitive" } },
        { guest: { name: { contains: filters.search, mode: "insensitive" } } },
        { guest: { cpf: { contains: filters.search } } },
      ];
    }

    const [bookings, total] = await Promise.all([
      prisma.booking.findMany({
        where,
        include: {
          guest: {
            select: { id: true, name: true, cpf: true, phone: true, email: true },
          },
          room: { select: { id: true, name: true, category: true } },
        },
        orderBy: { checkIn: "desc" },
        skip,
        take: limit,
      }),
      prisma.booking.count({ where }),
    ]);

    return {
      success: true,
      bookings: bookings.map((b) => ({
        ...b,
        totalAmount: b.totalAmount.toNumber(),
        paidAmount: b.paidAmount.toNumber(),
      })),
      total,
    };
  } catch (error) {
    console.error("Erro ao listar reservas:", error);
    return {
      success: false,
      bookings: [],
      total: 0,
      error: "Erro interno ao listar reservas",
    };
  }
}

/**
 * Buscar reserva por ID
 */
export async function getBooking(
  id: string
): Promise<BookingActionResult> {
  try {
    const booking = await prisma.booking.findUnique({
      where: { id },
      include: {
        guest: {
          select: { id: true, name: true, cpf: true, phone: true, email: true },
        },
        room: { select: { id: true, name: true, category: true } },
      },
    });

    if (!booking) {
      return { success: false, error: "Reserva não encontrada" };
    }

    return {
      success: true,
      booking: {
        ...booking,
        totalAmount: booking.totalAmount.toNumber(),
        paidAmount: booking.paidAmount.toNumber(),
      },
    };
  } catch (error) {
    console.error("Erro ao buscar reserva:", error);
    return { success: false, error: "Erro interno ao buscar reserva" };
  }
}

/**
 * Criar uma nova reserva
 */
export async function createBooking(
  input: CreateBookingInput
): Promise<BookingActionResult> {
  try {
    // Verificar autenticação
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      return { success: false, error: "Não autenticado" };
    }

    // Validar input
    const validated = createBookingSchema.safeParse(input);
    if (!validated.success) {
      return {
        success: false,
        error: validated.error.issues[0].message,
      };
    }

    const data = validated.data;

    // Verificar conflito de datas
    const conflict = await hasConflict(data.roomId, data.checkIn, data.checkOut);
    if (conflict) {
      return {
        success: false,
        error: "Já existe uma reserva para este quarto neste período",
      };
    }

    // Gerar número de reserva
    const bookingNumber = await generateBookingNumber();

    // Determinar status inicial baseado no pagamento
    // Se houver pagamento (parcial ou integral), status = CONFIRMED
    // Se não houver pagamento, status = PRE_BOOKING
    const initialStatus = data.paidAmount > 0 
      ? BookingStatus.CONFIRMED 
      : BookingStatus.PRE_BOOKING;

    // Separar paymentDate dos dados da reserva
    const { paymentDate, ...bookingData } = data;

    // Criar reserva
    const booking = await prisma.booking.create({
      data: {
        bookingNumber,
        ...bookingData,
        status: initialStatus, // Sobrescreve o status padrão
      },
      include: {
        guest: {
          select: { id: true, name: true, cpf: true, phone: true, email: true },
        },
        room: { select: { id: true, name: true, category: true } },
      },
    });

    // Se houver pagamento, registrar transação
    if (data.paidAmount > 0) {
      await prisma.transaction.create({
        data: {
          type: TransactionType.INCOME,
          amount: data.paidAmount,
          date: data.paymentDate || new Date(),
          description: `Pagamento reserva ${bookingNumber}`,
          bookingId: booking.id,
        },
      });
    }

    revalidatePath("/overview");
    revalidatePath("/map/reservations");
    revalidatePath("/bookings");

    return {
      success: true,
      message: "Reserva criada com sucesso!",
      booking: {
        ...booking,
        totalAmount: booking.totalAmount.toNumber(),
        paidAmount: booking.paidAmount.toNumber(),
      },
    };
  } catch (error) {
    console.error("Erro ao criar reserva:", error);
    return { success: false, error: "Erro interno ao criar reserva" };
  }
}

/**
 * Atualizar uma reserva
 */
export async function updateBooking(
  input: UpdateBookingInput
): Promise<BookingActionResult> {
  try {
    // Verificar autenticação
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      return { success: false, error: "Não autenticado" };
    }

    // Validar input
    const validated = updateBookingSchema.safeParse(input);
    if (!validated.success) {
      return {
        success: false,
        error: validated.error.issues[0].message,
      };
    }

    const { id, ...data } = validated.data;

    // Buscar reserva atual
    const currentBooking = await prisma.booking.findUnique({
      where: { id },
    });

    if (!currentBooking) {
      return { success: false, error: "Reserva não encontrada" };
    }

    // Se estiver alterando datas ou quarto, verificar conflitos
    if (data.roomId || data.checkIn || data.checkOut) {
      const roomId = data.roomId || currentBooking.roomId;
      const checkIn = data.checkIn || currentBooking.checkIn;
      const checkOut = data.checkOut || currentBooking.checkOut;

      const conflict = await hasConflict(roomId, checkIn, checkOut, id);
      if (conflict) {
        return {
          success: false,
          error: "Já existe uma reserva para este quarto neste período",
        };
      }
    }

    // Calcular diferença de pagamento (se houver aumento, criar transação)
    const currentPaidAmount = currentBooking.paidAmount.toNumber();
    const newPaidAmount = data.paidAmount ?? currentPaidAmount;
    const paymentDifference = newPaidAmount - currentPaidAmount;

    // Se mudou para um status específico ou adicionou pagamento, pode precisar atualizar status
    let statusUpdate = data.status;
    if (!statusUpdate && paymentDifference > 0 && currentBooking.status === BookingStatus.PRE_BOOKING) {
      // Se era pré-reserva e adicionou pagamento, muda para confirmada
      statusUpdate = BookingStatus.CONFIRMED;
    }

    // Separar paymentDate para não enviar ao Prisma (Booking não tem esse campo)
    const { paymentDate, ...updateData } = data;

    const booking = await prisma.booking.update({
      where: { id },
      data: {
        ...updateData,
        ...(statusUpdate && { status: statusUpdate }),
      },
      include: {
        guest: {
          select: { id: true, name: true, cpf: true, phone: true, email: true },
        },
        room: { select: { id: true, name: true, category: true } },
      },
    });

    // Se houve aumento no valor pago, criar transação financeira
    if (paymentDifference > 0) {
      await prisma.transaction.create({
        data: {
          type: TransactionType.INCOME,
          amount: paymentDifference,
          date: data.paymentDate || new Date(),
          description: `Pagamento adicional reserva ${booking.bookingNumber}`,
          bookingId: booking.id,
        },
      });
    }

    revalidatePath("/overview");
    revalidatePath("/map/reservations");
    revalidatePath("/bookings");
    revalidatePath("/financial");

    return {
      success: true,
      message: "Reserva atualizada com sucesso!",
      booking: {
        ...booking,
        totalAmount: booking.totalAmount.toNumber(),
        paidAmount: booking.paidAmount.toNumber(),
      },
    };
  } catch (error) {
    console.error("Erro ao atualizar reserva:", error);
    return { success: false, error: "Erro interno ao atualizar reserva" };
  }
}

/**
 * Realizar check-in
 */
export async function checkIn(id: string): Promise<BookingActionResult> {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      return { success: false, error: "Não autenticado" };
    }

    const booking = await prisma.booking.findUnique({
      where: { id },
      include: { room: true },
    });

    if (!booking) {
      return { success: false, error: "Reserva não encontrada" };
    }

    if (
      booking.status !== BookingStatus.CONFIRMED &&
      booking.status !== BookingStatus.PRE_BOOKING
    ) {
      return {
        success: false,
        error: "Status inválido para check-in",
      };
    }

    // Atualizar reserva e quarto em transação
    const [updatedBooking] = await prisma.$transaction([
      prisma.booking.update({
        where: { id },
        data: { status: BookingStatus.CHECKED_IN },
        include: {
          guest: {
            select: { id: true, name: true, cpf: true, phone: true, email: true },
          },
          room: { select: { id: true, name: true, category: true } },
        },
      }),
      prisma.room.update({
        where: { id: booking.roomId },
        data: { status: RoomStatus.OCCUPIED },
      }),
    ]);

    revalidatePath("/overview");
    revalidatePath("/map/rooms");
    revalidatePath("/bookings");

    return {
      success: true,
      message: "Check-in realizado com sucesso!",
      booking: {
        ...updatedBooking,
        totalAmount: updatedBooking.totalAmount.toNumber(),
        paidAmount: updatedBooking.paidAmount.toNumber(),
      },
    };
  } catch (error) {
    console.error("Erro ao realizar check-in:", error);
    return { success: false, error: "Erro interno ao realizar check-in" };
  }
}

/**
 * Realizar check-out
 */
export async function checkOut(id: string): Promise<BookingActionResult> {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      return { success: false, error: "Não autenticado" };
    }

    const booking = await prisma.booking.findUnique({
      where: { id },
    });

    if (!booking) {
      return { success: false, error: "Reserva não encontrada" };
    }

    if (booking.status !== BookingStatus.CHECKED_IN) {
      return {
        success: false,
        error: "Reserva não está em check-in",
      };
    }

    // Atualizar reserva, quarto e criar manutenção (limpeza)
    const [updatedBooking] = await prisma.$transaction([
      prisma.booking.update({
        where: { id },
        data: { status: BookingStatus.CHECKED_OUT },
        include: {
          guest: {
            select: { id: true, name: true, cpf: true, phone: true, email: true },
          },
          room: { select: { id: true, name: true, category: true } },
        },
      }),
      prisma.room.update({
        where: { id: booking.roomId },
        data: { status: RoomStatus.CLEANING },
      }),
      prisma.roomMaintenance.create({
        data: {
          roomId: booking.roomId,
          type: "CLEANING",
          status: "PENDING",
          description: `Limpeza pós check-out - ${booking.bookingNumber}`,
        },
      }),
    ]);

    revalidatePath("/overview");
    revalidatePath("/map/rooms");
    revalidatePath("/bookings");

    return {
      success: true,
      message: "Check-out realizado com sucesso!",
      booking: {
        ...updatedBooking,
        totalAmount: updatedBooking.totalAmount.toNumber(),
        paidAmount: updatedBooking.paidAmount.toNumber(),
      },
    };
  } catch (error) {
    console.error("Erro ao realizar check-out:", error);
    return { success: false, error: "Erro interno ao realizar check-out" };
  }
}

/**
 * Atualizar status da reserva
 */
export async function updateBookingStatus(
  id: string,
  status: BookingStatus
): Promise<BookingActionResult> {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      return { success: false, error: "Não autenticado" };
    }

    const booking = await prisma.booking.findUnique({ where: { id } });

    if (!booking) {
      return { success: false, error: "Reserva não encontrada" };
    }

    const updatedBooking = await prisma.booking.update({
      where: { id },
      data: { status },
      include: {
        guest: {
          select: { id: true, name: true, cpf: true, phone: true, email: true },
        },
        room: { select: { id: true, name: true, category: true } },
      },
    });

    revalidatePath("/overview");
    revalidatePath("/map/reservations");
    revalidatePath("/bookings");

    return {
      success: true,
      message: "Status atualizado com sucesso!",
      booking: {
        ...updatedBooking,
        totalAmount: updatedBooking.totalAmount.toNumber(),
        paidAmount: updatedBooking.paidAmount.toNumber(),
      },
    };
  } catch (error) {
    console.error("Erro ao atualizar status:", error);
    return { success: false, error: "Erro interno ao atualizar status" };
  }
}

/**
 * Cancelar reserva
 */
export async function cancelBooking(
  id: string,
  reason?: string
): Promise<BookingActionResult> {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      return { success: false, error: "Não autenticado" };
    }

    const booking = await prisma.booking.findUnique({ where: { id } });

    if (!booking) {
      return { success: false, error: "Reserva não encontrada" };
    }

    if (booking.status === BookingStatus.CHECKED_OUT) {
      return { success: false, error: "Reserva já foi finalizada" };
    }

    const updatedBooking = await prisma.booking.update({
      where: { id },
      data: {
        status: BookingStatus.CANCELLED,
        notes: reason ? `${booking.notes || ""}\nMotivo cancelamento: ${reason}` : booking.notes,
      },
      include: {
        guest: {
          select: { id: true, name: true, cpf: true, phone: true, email: true },
        },
        room: { select: { id: true, name: true, category: true } },
      },
    });

    revalidatePath("/overview");
    revalidatePath("/map/reservations");
    revalidatePath("/bookings");

    return {
      success: true,
      message: "Reserva cancelada com sucesso!",
      booking: {
        ...updatedBooking,
        totalAmount: updatedBooking.totalAmount.toNumber(),
        paidAmount: updatedBooking.paidAmount.toNumber(),
      },
    };
  } catch (error) {
    console.error("Erro ao cancelar reserva:", error);
    return { success: false, error: "Erro interno ao cancelar reserva" };
  }
}

/**
 * Excluir uma reserva permanentemente
 * Remove a reserva e todas as transações associadas
 */
export async function deleteBooking(id: string): Promise<BookingActionResult> {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      return { success: false, error: "Não autenticado" };
    }

    const booking = await prisma.booking.findUnique({ where: { id } });

    if (!booking) {
      return { success: false, error: "Reserva não encontrada" };
    }

    // Primeiro excluir todas as transações associadas
    await prisma.transaction.deleteMany({
      where: { bookingId: id },
    });

    // Depois excluir a reserva
    await prisma.booking.delete({ where: { id } });

    revalidatePath("/overview");
    revalidatePath("/map/reservations");
    revalidatePath("/bookings");
    revalidatePath("/rooms");
    revalidatePath("/guests");

    return {
      success: true,
      message: "Reserva excluída permanentemente!",
    };
  } catch (error) {
    console.error("Erro ao excluir reserva:", error);
    return { success: false, error: "Erro interno ao excluir reserva" };
  }
}

/**
 * Obter entradas de hoje
 */
export async function getTodayArrivals(): Promise<BookingWithDetails[]> {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const bookings = await prisma.booking.findMany({
      where: {
        checkIn: { gte: today, lt: tomorrow },
        status: { in: [BookingStatus.CONFIRMED, BookingStatus.PRE_BOOKING] },
      },
      include: {
        guest: {
          select: { id: true, name: true, cpf: true, phone: true, email: true },
        },
        room: { select: { id: true, name: true, category: true } },
      },
      orderBy: { checkIn: "asc" },
    });

    return bookings.map((b) => ({
      ...b,
      totalAmount: b.totalAmount.toNumber(),
      paidAmount: b.paidAmount.toNumber(),
    }));
  } catch (error) {
    console.error("Erro ao buscar entradas de hoje:", error);
    return [];
  }
}

/**
 * Obter saídas de hoje
 */
export async function getTodayDepartures(): Promise<BookingWithDetails[]> {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const bookings = await prisma.booking.findMany({
      where: {
        checkOut: { gte: today, lt: tomorrow },
        status: BookingStatus.CHECKED_IN,
      },
      include: {
        guest: {
          select: { id: true, name: true, cpf: true, phone: true, email: true },
        },
        room: { select: { id: true, name: true, category: true } },
      },
      orderBy: { checkOut: "asc" },
    });

    return bookings.map((b) => ({
      ...b,
      totalAmount: b.totalAmount.toNumber(),
      paidAmount: b.paidAmount.toNumber(),
    }));
  } catch (error) {
    console.error("Erro ao buscar saídas de hoje:", error);
    return [];
  }
}

/**
 * Obter dados para o mapa de reservas
 */
export async function getReservationMap(
  startDate: Date,
  endDate: Date
): Promise<ReservationMapByRoom[]> {
  try {
    const rooms = await prisma.room.findMany({
      orderBy: [{ category: "asc" }, { name: "asc" }],
      include: {
        bookings: {
          where: {
            status: {
              in: [
                BookingStatus.PRE_BOOKING,
                BookingStatus.CONFIRMED,
                BookingStatus.CHECKED_IN,
              ],
            },
            OR: [
              { checkIn: { gte: startDate, lte: endDate } },
              { checkOut: { gte: startDate, lte: endDate } },
              { checkIn: { lte: startDate }, checkOut: { gte: endDate } },
            ],
          },
          include: {
            guest: { select: { name: true } },
          },
          orderBy: { checkIn: "asc" },
        },
      },
    });

    return rooms.map((room) => ({
      roomId: room.id,
      roomName: room.name,
      roomCategory: room.category,
      bookings: room.bookings.map((b) => ({
        id: b.id,
        bookingNumber: b.bookingNumber,
        guestName: b.guest.name,
        roomId: room.id,
        roomName: room.name,
        roomCategory: room.category,
        checkIn: b.checkIn,
        checkOut: b.checkOut,
        status: b.status,
        totalAmount: b.totalAmount.toNumber(),
        nights: calculateNights(b.checkIn, b.checkOut),
      })),
    }));
  } catch (error) {
    console.error("Erro ao buscar mapa de reservas:", error);
    return [];
  }
}

/**
 * Registrar pagamento
 */
export async function registerPayment(
  bookingId: string,
  amount: number
): Promise<BookingActionResult> {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      return { success: false, error: "Não autenticado" };
    }

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
    });

    if (!booking) {
      return { success: false, error: "Reserva não encontrada" };
    }

    const newPaidAmount = booking.paidAmount.toNumber() + amount;

    const [updatedBooking] = await prisma.$transaction([
      prisma.booking.update({
        where: { id: bookingId },
        data: { paidAmount: newPaidAmount },
        include: {
          guest: {
            select: { id: true, name: true, cpf: true, phone: true, email: true },
          },
          room: { select: { id: true, name: true, category: true } },
        },
      }),
      prisma.transaction.create({
        data: {
          type: TransactionType.INCOME,
          amount,
          date: new Date(),
          description: `Pagamento reserva ${booking.bookingNumber}`,
          bookingId,
        },
      }),
    ]);

    revalidatePath("/bookings");
    revalidatePath("/financial");

    return {
      success: true,
      message: "Pagamento registrado com sucesso!",
      booking: {
        ...updatedBooking,
        totalAmount: updatedBooking.totalAmount.toNumber(),
        paidAmount: updatedBooking.paidAmount.toNumber(),
      },
    };
  } catch (error) {
    console.error("Erro ao registrar pagamento:", error);
    return { success: false, error: "Erro interno ao registrar pagamento" };
  }
}
