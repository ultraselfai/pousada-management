"use server"

import { prisma } from "@/db"
import { differenceInDays } from "date-fns"

/**
 * Buscar quartos disponíveis para um período
 */
export async function searchAvailableRooms(
  checkIn: Date,
  checkOut: Date,
  adults: number = 1,
  children: number = 0
) {
  try {
    const totalGuests = adults + children

    // Buscar todos os quartos que comportam a quantidade de hóspedes
    const rooms = await prisma.room.findMany({
      where: {
        status: "AVAILABLE",
        maxGuests: {
          gte: totalGuests,
        },
      },
      orderBy: { name: "asc" },
    })

    // Verificar disponibilidade de cada quarto
    const availableRooms = []

    for (const room of rooms) {
      // Verificar se tem reserva conflitante
      const conflictingBooking = await prisma.booking.findFirst({
        where: {
          roomId: room.id,
          status: {
            notIn: ["CANCELLED", "NO_SHOW"],
          },
          AND: [
            { checkIn: { lt: checkOut } },
            { checkOut: { gt: checkIn } },
          ],
        },
      })

      if (!conflictingBooking) {
        const nights = differenceInDays(checkOut, checkIn)
        availableRooms.push({
          ...room,
          nights,
          totalPrice: Number(room.basePrice) * nights,
        })
      }
    }

    return {
      success: true,
      rooms: availableRooms,
      searchParams: { checkIn, checkOut, adults, children },
    }
  } catch (error) {
    console.error("Erro ao buscar quartos:", error)
    return {
      success: false,
      rooms: [],
      error: "Erro ao buscar disponibilidade",
    }
  }
}

/**
 * Buscar detalhes de um quarto
 */
export async function getRoomDetails(roomId: string) {
  try {
    const room = await prisma.room.findUnique({
      where: { id: roomId },
    })

    if (!room) {
      return { success: false, error: "Quarto não encontrado" }
    }

    return { success: true, room }
  } catch (error) {
    console.error("Erro ao buscar quarto:", error)
    return { success: false, error: "Erro ao buscar quarto" }
  }
}

/**
 * Criar reserva pública (pré-reserva)
 */
export async function createPublicBooking(data: {
  roomId: string
  checkIn: Date
  checkOut: Date
  adults: number
  children: number
  guestName: string
  guestCpf: string
  guestEmail?: string
  guestPhone: string
  notes?: string
}) {
  try {
    // Verificar disponibilidade novamente
    const conflicting = await prisma.booking.findFirst({
      where: {
        roomId: data.roomId,
        status: { notIn: ["CANCELLED", "NO_SHOW"] },
        AND: [
          { checkIn: { lt: data.checkOut } },
          { checkOut: { gt: data.checkIn } },
        ],
      },
    })

    if (conflicting) {
      return { success: false, error: "Este quarto não está mais disponível para as datas selecionadas" }
    }

    // Buscar quarto para calcular preço
    const room = await prisma.room.findUnique({
      where: { id: data.roomId },
    })

    if (!room) {
      return { success: false, error: "Quarto não encontrado" }
    }

    const nights = differenceInDays(data.checkOut, data.checkIn)
    const totalAmount = Number(room.basePrice) * nights

    // Criar ou buscar hóspede
    const normalizedCpf = data.guestCpf.replace(/\D/g, "")
    let guest = await prisma.guest.findUnique({
      where: { cpf: normalizedCpf },
    })

    if (!guest) {
      guest = await prisma.guest.create({
        data: {
          name: data.guestName,
          cpf: normalizedCpf,
          email: data.guestEmail,
          phone: data.guestPhone,
          origin: "MOTOR_RESERVAS",
        },
      })
    }

    // Gerar número da reserva
    const count = await prisma.booking.count()
    const bookingNumber = `RES-${new Date().getFullYear()}-${String(count + 1).padStart(4, "0")}`

    // Criar reserva como pré-reserva
    const booking = await prisma.booking.create({
      data: {
        bookingNumber,
        guestId: guest.id,
        roomId: data.roomId,
        checkIn: data.checkIn,
        checkOut: data.checkOut,
        adults: data.adults,
        children: data.children,
        mealsIncluded: true,
        paymentMethod: "PIX",
        paymentType: "SPLIT_50_50",
        totalAmount,
        paidAmount: 0,
        status: "PRE_BOOKING",
        notes: data.notes,
      },
      include: {
        room: true,
        guest: true,
      },
    })

    return {
      success: true,
      booking: {
        ...booking,
        totalAmount: Number(booking.totalAmount),
        paidAmount: Number(booking.paidAmount),
      },
    }
  } catch (error) {
    console.error("Erro ao criar reserva:", error)
    return { success: false, error: "Erro ao criar reserva" }
  }
}
