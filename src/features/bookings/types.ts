/**
 * Bookings Types
 *
 * Tipos TypeScript para a feature de Reservas.
 */

import type {
  BookingStatus,
  PaymentMethod,
  PaymentType,
  RoomCategory,
} from "@/generated/prisma/client";

/**
 * Tipo base do Booking (espelhando o Prisma)
 */
export interface Booking {
  id: string;
  bookingNumber: string;
  guestId: string;
  roomId: string;
  checkIn: Date;
  checkOut: Date;
  adults: number;
  children: number;
  mealsIncluded: boolean;
  paymentMethod: PaymentMethod;
  paymentType: PaymentType;
  totalAmount: number;
  paidAmount: number;
  status: BookingStatus;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Booking com dados de hóspede e quarto
 */
export interface BookingWithDetails extends Booking {
  guest: {
    id: string;
    name: string;
    cpf: string;
    phone: string;
    email: string | null;
  };
  room: {
    id: string;
    name: string;
    category: RoomCategory;
  };
}

/**
 * Resultado de ação genérico
 */
export interface BookingActionResult {
  success: boolean;
  error?: string;
  message?: string;
  booking?: BookingWithDetails;
}

/**
 * Resultado de listagem
 */
export interface BookingsListResult {
  success: boolean;
  bookings: BookingWithDetails[];
  total: number;
  error?: string;
}

/**
 * Filtros para listagem de reservas
 */
export interface BookingFilters {
  status?: BookingStatus | BookingStatus[];
  roomId?: string;
  guestId?: string;
  checkInStart?: Date;
  checkInEnd?: Date;
  checkOutStart?: Date;
  checkOutEnd?: Date;
  search?: string;
  page?: number;
  limit?: number;
}

/**
 * Dados para o mapa de reservas (timeline)
 */
export interface ReservationMapItem {
  id: string;
  bookingNumber: string;
  guestName: string;
  roomId: string;
  roomName: string;
  roomCategory: RoomCategory;
  checkIn: Date;
  checkOut: Date;
  status: BookingStatus;
  totalAmount: number;
  nights: number;
}

/**
 * Dados agrupados por quarto para o mapa
 */
export interface ReservationMapByRoom {
  roomId: string;
  roomName: string;
  roomCategory: RoomCategory;
  bookings: ReservationMapItem[];
}

/**
 * Labels para status de reserva
 */
export const BOOKING_STATUS_LABELS: Record<BookingStatus, string> = {
  PRE_BOOKING: "Pré-Reserva",
  CONFIRMED: "Confirmada",
  CHECKED_IN: "Check-in",
  CHECKED_OUT: "Check-out",
  CANCELLED: "Cancelada",
  NO_SHOW: "No-Show",
};

/**
 * Cores para status de reserva
 */
export const BOOKING_STATUS_COLORS: Record<BookingStatus, string> = {
  PRE_BOOKING: "yellow",
  CONFIRMED: "green",
  CHECKED_IN: "blue",
  CHECKED_OUT: "gray",
  CANCELLED: "red",
  NO_SHOW: "orange",
};

/**
 * Labels para métodos de pagamento
 */
export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  PIX: "PIX",
  CREDIT_CARD: "Cartão de Crédito",
  DEBIT_CARD: "Cartão de Débito",
  CASH: "Dinheiro",
  TRANSFER: "Transferência",
};

/**
 * Labels para tipos de pagamento
 */
export const PAYMENT_TYPE_LABELS: Record<PaymentType, string> = {
  FULL_UPFRONT: "Integral Antecipado",
  SPLIT_50_50: "50% Reserva + 50% Check-in",
};
