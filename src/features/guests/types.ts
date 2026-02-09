/**
 * Guests Types
 *
 * Tipos TypeScript para a feature de Hóspedes.
 */

import type { GuestOrigin } from "@/generated/prisma/client";

/**
 * Tipo base do Guest (espelhando o Prisma)
 */
export interface Guest {
  id: string;
  name: string;
  cpf: string;
  email: string | null;
  phone: string;
  origin: GuestOrigin;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Guest com contagem de reservas
 */
export interface GuestWithBookingCount extends Guest {
  _count: {
    bookings: number;
  };
}

/**
 * Guest com histórico de estadias
 */
export interface GuestWithHistory extends Guest {
  bookings: {
    id: string;
    bookingNumber: string;
    roomName: string;
    checkIn: Date;
    checkOut: Date;
    status: string;
    totalAmount: number;
  }[];
}

/**
 * Resultado de ação genérico
 */
export interface GuestActionResult {
  success: boolean;
  error?: string;
  message?: string;
  guest?: Guest;
}

/**
 * Resultado de listagem
 */
export interface GuestsListResult {
  success: boolean;
  guests: GuestWithBookingCount[];
  total: number;
  error?: string;
}

/**
 * Filtros para listagem de hóspedes
 */
export interface GuestFilters {
  search?: string;
  origin?: GuestOrigin;
  page?: number;
  limit?: number;
}

/**
 * Labels para origens de hóspedes
 */
export const GUEST_ORIGIN_LABELS: Record<GuestOrigin, string> = {
  DIRECT: "Direto/Telefone",
  BOOKING_COM: "Booking.com",
  AIRBNB: "Airbnb",
  WHATSAPP: "WhatsApp",
  INSTAGRAM: "Instagram",
  FACEBOOK: "Facebook",
  INDICACAO: "Indicação",
  MOTOR_RESERVAS: "Motor de Reservas",
  OUTRO: "Outro",
};
