/**
 * Rooms Types
 *
 * Tipos TypeScript para a feature de Quartos.
 */

import type { RoomCategory, RoomStatus } from "@/generated/prisma/client";

/**
 * Tipo de cama
 */
export interface BedType {
  type: "casal" | "solteiro" | "bicama" | "beliche";
  qty: number;
}

/**
 * Tipo base do Room (espelhando o Prisma)
 */
export interface Room {
  id: string;
  name: string;
  category: RoomCategory;
  bedTypes: BedType[];
  hasBathroom: boolean;
  equipment: string[];
  photos: string[];
  basePrice: number; // Decimal convertido para number
  status: RoomStatus;
  description: string | null;
  maxGuests: number;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Room com contagem de reservas
 */
export interface RoomWithBookingCount extends Room {
  _count: {
    bookings: number;
  };
}

/**
 * Room com reserva atual (se houver)
 */
export interface RoomWithCurrentBooking extends Room {
  currentBooking?: {
    id: string;
    guestName: string;
    checkIn: Date;
    checkOut: Date;
  } | null;
}

/**
 * Resultado de ação genérico
 */
export interface RoomActionResult {
  success: boolean;
  error?: string;
  message?: string;
  room?: Room;
}

/**
 * Resultado de listagem
 */
export interface RoomsListResult {
  success: boolean;
  rooms: Room[];
  total: number;
  error?: string;
}

/**
 * Filtros para listagem de quartos
 */
export interface RoomFilters {
  category?: RoomCategory;
  status?: RoomStatus;
  search?: string;
}

/**
 * Dados para overview do dia
 */
export interface DailyOverview {
  totalRooms: number;
  available: number;
  occupied: number;
  cleaning: number;
  maintenance: number;
  checkInsToday: number;
  checkOutsToday: number;
  guestsInHouse: number;
}

/**
 * Card de quarto para exibição no mapa
 */
export interface RoomCard extends Room {
  currentBooking?: {
    id: string;
    bookingNumber: string;
    guestName: string;
    checkIn: Date;
    checkOut: Date;
    status: string;
    isCheckInToday: boolean;
    isCheckOutToday: boolean;
  } | null;
}
