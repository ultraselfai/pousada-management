"use server";

/**
 * Server Actions para o Mapa de Reservas
 */

import { prisma } from "@/db";
import { BookingStatus, RoomCategory } from "@/generated/prisma/client";
import type { ReservationMapData, MapRoom, MapBooking } from "./constants";

const CATEGORY_LABELS: Record<RoomCategory, string> = {
  STANDARD: "Standard",
  LUXO: "Luxo",
  LUXO_SUPERIOR: "Luxo Superior",
};

/**
 * Buscar dados para o mapa de reservas
 */
export async function getReservationMapData(
  startDate: Date,
  days: number = 14
): Promise<ReservationMapData> {
  try {
    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);

    const end = new Date(start);
    end.setDate(end.getDate() + days);

    // Buscar todos os quartos
    const rooms = await prisma.room.findMany({
      orderBy: [
        { category: "asc" },
        { name: "asc" },
      ],
      select: {
        id: true,
        name: true,
        category: true,
      },
    });

    // Buscar reservas no período (incluindo as que se estendem para fora)
    const bookings = await prisma.booking.findMany({
      where: {
        status: {
          notIn: [BookingStatus.CANCELLED],
        },
        OR: [
          // Check-in no período
          {
            checkIn: { gte: start, lt: end },
          },
          // Check-out no período
          {
            checkOut: { gt: start, lte: end },
          },
          // Reserva que engloba o período
          {
            checkIn: { lte: start },
            checkOut: { gte: end },
          },
        ],
      },
      include: {
        guest: {
          select: { name: true },
        },
        room: {
          select: { id: true, name: true },
        },
      },
      orderBy: { checkIn: "asc" },
    });

    const mapRooms: MapRoom[] = rooms.map((room) => ({
      id: room.id,
      name: room.name,
      category: CATEGORY_LABELS[room.category],
    }));

    const mapBookings: MapBooking[] = bookings.map((booking) => ({
      id: booking.id,
      guestName: booking.guest.name,
      checkIn: booking.checkIn,
      checkOut: booking.checkOut,
      status: booking.status,
      totalGuests: booking.adults + booking.children,
      roomId: booking.room.id,
      roomName: booking.room.name,
      totalAmount: Number(booking.totalAmount),
    }));

    return {
      rooms: mapRooms,
      bookings: mapBookings,
      startDate: start,
      endDate: end,
    };
  } catch (error) {
    console.error("Erro ao buscar dados do mapa:", error);
    return {
      rooms: [],
      bookings: [],
      startDate: new Date(),
      endDate: new Date(),
    };
  }
}
