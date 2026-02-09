"use server";

/**
 * Rooms Server Actions
 *
 * Server Actions para gerenciamento de quartos.
 * Inclui CRUD completo e verificação de disponibilidade.
 */

import { revalidatePath } from "next/cache";
import { prisma } from "@/db";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import {
  createRoomSchema,
  updateRoomSchema,
  updateRoomStatusSchema,
  checkAvailabilitySchema,
  type CreateRoomInput,
  type UpdateRoomInput,
  type UpdateRoomStatusInput,
  type CheckAvailabilityInput,
} from "./schemas";
import type {
  Room,
  RoomActionResult,
  RoomsListResult,
  RoomFilters,
  DailyOverview,
  RoomCard,
} from "./types";
import { RoomStatus, BookingStatus, Prisma } from "@/generated/prisma/client";

/**
 * Listar todos os quartos
 */
export async function getRooms(
  filters?: RoomFilters
): Promise<RoomsListResult> {
  try {
    const where: Prisma.RoomWhereInput = {};

    if (filters?.category) {
      where.category = filters.category;
    }

    if (filters?.status) {
      where.status = filters.status;
    }

    if (filters?.search) {
      where.name = {
        contains: filters.search,
        mode: "insensitive",
      };
    }

    const [rooms, total] = await Promise.all([
      prisma.room.findMany({
        where,
        orderBy: [{ category: "asc" }, { name: "asc" }],
      }),
      prisma.room.count({ where }),
    ]);

    return {
      success: true,
      rooms: rooms.map((room) => ({
        ...room,
        basePrice: room.basePrice.toNumber(),
        bedTypes: room.bedTypes as unknown as Room["bedTypes"],
        equipment: room.equipment as unknown as string[],
      })),
      total,
    };
  } catch (error) {
    console.error("Erro ao listar quartos:", error);
    return {
      success: false,
      rooms: [],
      total: 0,
      error: "Erro interno ao listar quartos",
    };
  }
}

/**
 * Buscar quarto por ID
 */
export async function getRoom(id: string): Promise<RoomActionResult> {
  try {
    const room = await prisma.room.findUnique({
      where: { id },
    });

    if (!room) {
      return { success: false, error: "Quarto não encontrado" };
    }

    return {
      success: true,
      room: {
        ...room,
        basePrice: room.basePrice.toNumber(),
        bedTypes: room.bedTypes as unknown as Room["bedTypes"],
        equipment: room.equipment as unknown as string[],
      },
    };
  } catch (error) {
    console.error("Erro ao buscar quarto:", error);
    return { success: false, error: "Erro interno ao buscar quarto" };
  }
}

/**
 * Criar um novo quarto
 */
export async function createRoom(
  input: CreateRoomInput
): Promise<RoomActionResult> {
  try {
    // Verificar autenticação
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      return { success: false, error: "Não autenticado" };
    }

    // Validar input
    const validated = createRoomSchema.safeParse(input);
    if (!validated.success) {
      return {
        success: false,
        error: validated.error.issues[0].message,
      };
    }

    const { bedTypes, equipment, ...rest } = validated.data;

    const room = await prisma.room.create({
      data: {
        ...rest,
        bedTypes: bedTypes as Prisma.InputJsonValue,
        equipment: equipment as Prisma.InputJsonValue,
      },
    });

    revalidatePath("/overview");
    revalidatePath("/map/rooms");

    return {
      success: true,
      message: "Quarto criado com sucesso!",
      room: {
        ...room,
        basePrice: room.basePrice.toNumber(),
        bedTypes: room.bedTypes as unknown as Room["bedTypes"],
        equipment: room.equipment as unknown as string[],
      },
    };
  } catch (error) {
    console.error("Erro ao criar quarto:", error);
    return { success: false, error: "Erro interno ao criar quarto" };
  }
}

/**
 * Atualizar um quarto
 */
export async function updateRoom(
  input: UpdateRoomInput
): Promise<RoomActionResult> {
  try {
    // Verificar autenticação
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      return { success: false, error: "Não autenticado" };
    }

    // Validar input
    const validated = updateRoomSchema.safeParse(input);
    if (!validated.success) {
      return {
        success: false,
        error: validated.error.issues[0].message,
      };
    }

    const { id, bedTypes, equipment, ...rest } = validated.data;

    const updateData: Prisma.RoomUpdateInput = { ...rest };

    if (bedTypes) {
      updateData.bedTypes = bedTypes as Prisma.InputJsonValue;
    }

    if (equipment) {
      updateData.equipment = equipment as Prisma.InputJsonValue;
    }

    const room = await prisma.room.update({
      where: { id },
      data: updateData,
    });

    revalidatePath("/overview");
    revalidatePath("/map/rooms");

    return {
      success: true,
      message: "Quarto atualizado com sucesso!",
      room: {
        ...room,
        basePrice: room.basePrice.toNumber(),
        bedTypes: room.bedTypes as unknown as Room["bedTypes"],
        equipment: room.equipment as unknown as string[],
      },
    };
  } catch (error) {
    console.error("Erro ao atualizar quarto:", error);
    return { success: false, error: "Erro interno ao atualizar quarto" };
  }
}

/**
 * Excluir um quarto
 * @param force - Se true, exclui todas as reservas associadas antes de excluir o quarto
 */
export async function deleteRoom(id: string, force: boolean = false): Promise<RoomActionResult> {
  try {
    // Verificar autenticação
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      return { success: false, error: "Não autenticado" };
    }

    // Verificar se tem reservas ativas
    const activeBookings = await prisma.booking.count({
      where: {
        roomId: id,
        status: {
          in: [
            BookingStatus.PRE_BOOKING,
            BookingStatus.CONFIRMED,
            BookingStatus.CHECKED_IN,
          ],
        },
      },
    });

    if (activeBookings > 0 && !force) {
      return {
        success: false,
        error: `Não é possível excluir quarto com ${activeBookings} reserva(s) ativa(s). Use a opção "Forçar exclusão" para excluir mesmo assim.`,
      };
    }

    // Se force, excluir todas as reservas e transações associadas primeiro
    if (force) {
      // Primeiro excluir transações das reservas desse quarto
      await prisma.transaction.deleteMany({
        where: {
          booking: {
            roomId: id,
          },
        },
      });
      
      // Depois excluir as reservas
      await prisma.booking.deleteMany({
        where: { roomId: id },
      });
    }

    await prisma.room.delete({ where: { id } });

    revalidatePath("/rooms");
    revalidatePath("/overview");
    revalidatePath("/map/rooms");
    revalidatePath("/bookings");

    return {
      success: true,
      message: force 
        ? "Quarto e todas as reservas associadas excluídos com sucesso!" 
        : "Quarto excluído com sucesso!",
    };
  } catch (error) {
    console.error("Erro ao excluir quarto:", error);
    return { success: false, error: "Erro interno ao excluir quarto" };
  }
}

/**
 * Atualizar status do quarto
 */
export async function updateRoomStatus(
  input: UpdateRoomStatusInput
): Promise<RoomActionResult> {
  try {
    // Verificar autenticação
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      return { success: false, error: "Não autenticado" };
    }

    // Validar input
    const validated = updateRoomStatusSchema.safeParse(input);
    if (!validated.success) {
      return {
        success: false,
        error: validated.error.issues[0].message,
      };
    }

    const room = await prisma.room.update({
      where: { id: validated.data.id },
      data: { status: validated.data.status },
    });

    revalidatePath("/overview");
    revalidatePath("/map/rooms");

    return {
      success: true,
      message: "Status atualizado com sucesso!",
      room: {
        ...room,
        basePrice: room.basePrice.toNumber(),
        bedTypes: room.bedTypes as unknown as Room["bedTypes"],
        equipment: room.equipment as unknown as string[],
      },
    };
  } catch (error) {
    console.error("Erro ao atualizar status:", error);
    return { success: false, error: "Erro interno ao atualizar status" };
  }
}

/**
 * Verificar disponibilidade de um quarto para um período
 */
export async function checkAvailability(
  input: CheckAvailabilityInput
): Promise<{ available: boolean; conflictingBookings?: string[] }> {
  try {
    const validated = checkAvailabilitySchema.safeParse(input);
    if (!validated.success) {
      return { available: false };
    }

    const { roomId, checkIn, checkOut, excludeBookingId } = validated.data;

    // Buscar reservas conflitantes
    const conflictingBookings = await prisma.booking.findMany({
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
        // Verificar sobreposição de datas
        OR: [
          {
            // Check-in está entre as datas da reserva existente
            checkIn: { lte: checkIn },
            checkOut: { gt: checkIn },
          },
          {
            // Check-out está entre as datas da reserva existente
            checkIn: { lt: checkOut },
            checkOut: { gte: checkOut },
          },
          {
            // Nova reserva engloba a reserva existente
            checkIn: { gte: checkIn },
            checkOut: { lte: checkOut },
          },
        ],
      },
      select: { bookingNumber: true },
    });

    return {
      available: conflictingBookings.length === 0,
      conflictingBookings: conflictingBookings.map((b) => b.bookingNumber),
    };
  } catch (error) {
    console.error("Erro ao verificar disponibilidade:", error);
    return { available: false };
  }
}

/**
 * Obter visão geral do dia
 */
export async function getDailyOverview(): Promise<DailyOverview> {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const [
      totalRooms,
      availableRooms,
      occupiedRooms,
      cleaningRooms,
      maintenanceRooms,
      checkInsToday,
      checkOutsToday,
      guestsInHouse,
    ] = await Promise.all([
      prisma.room.count(),
      prisma.room.count({ where: { status: RoomStatus.AVAILABLE } }),
      prisma.room.count({ where: { status: RoomStatus.OCCUPIED } }),
      prisma.room.count({ where: { status: RoomStatus.CLEANING } }),
      prisma.room.count({ where: { status: RoomStatus.MAINTENANCE } }),
      prisma.booking.count({
        where: {
          checkIn: { gte: today, lt: tomorrow },
          status: { in: [BookingStatus.CONFIRMED, BookingStatus.PRE_BOOKING] },
        },
      }),
      prisma.booking.count({
        where: {
          checkOut: { gte: today, lt: tomorrow },
          status: BookingStatus.CHECKED_IN,
        },
      }),
      prisma.booking.aggregate({
        where: { status: BookingStatus.CHECKED_IN },
        _sum: { adults: true, children: true },
      }),
    ]);

    return {
      totalRooms,
      available: availableRooms,
      occupied: occupiedRooms,
      cleaning: cleaningRooms,
      maintenance: maintenanceRooms,
      checkInsToday,
      checkOutsToday,
      guestsInHouse:
        (guestsInHouse._sum.adults || 0) + (guestsInHouse._sum.children || 0),
    };
  } catch (error) {
    console.error("Erro ao buscar overview:", error);
    return {
      totalRooms: 0,
      available: 0,
      occupied: 0,
      cleaning: 0,
      maintenance: 0,
      checkInsToday: 0,
      checkOutsToday: 0,
      guestsInHouse: 0,
    };
  }
}

/**
 * Obter quartos com informação de reserva atual (para o mapa)
 */
export async function getRoomsWithCurrentBooking(): Promise<RoomCard[]> {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const rooms = await prisma.room.findMany({
      orderBy: [{ category: "asc" }, { name: "asc" }],
      include: {
        bookings: {
          where: {
            status: {
              in: [
                BookingStatus.CONFIRMED,
                BookingStatus.CHECKED_IN,
                BookingStatus.PRE_BOOKING,
              ],
            },
            checkIn: { lte: tomorrow },
            checkOut: { gt: today },
          },
          include: {
            guest: { select: { name: true } },
          },
          take: 1,
          orderBy: { checkIn: "asc" },
        },
      },
    });

    return rooms.map((room) => {
      const currentBooking = room.bookings[0];
      const checkInDate = currentBooking?.checkIn
        ? new Date(currentBooking.checkIn)
        : null;
      const checkOutDate = currentBooking?.checkOut
        ? new Date(currentBooking.checkOut)
        : null;

      return {
        id: room.id,
        name: room.name,
        category: room.category,
        bedTypes: room.bedTypes as unknown as Room["bedTypes"],
        hasBathroom: room.hasBathroom,
        equipment: room.equipment as unknown as string[],
        photos: room.photos,
        basePrice: room.basePrice.toNumber(),
        status: room.status,
        description: room.description,
        maxGuests: room.maxGuests,
        createdAt: room.createdAt,
        updatedAt: room.updatedAt,
        currentBooking: currentBooking
          ? {
              id: currentBooking.id,
              bookingNumber: currentBooking.bookingNumber,
              guestName: currentBooking.guest.name,
              checkIn: currentBooking.checkIn,
              checkOut: currentBooking.checkOut,
              status: currentBooking.status,
              isCheckInToday:
                checkInDate?.toDateString() === today.toDateString(),
              isCheckOutToday:
                checkOutDate?.toDateString() === today.toDateString(),
            }
          : null,
      };
    });
  } catch (error) {
    console.error("Erro ao buscar quartos com reservas:", error);
    return [];
  }
}
