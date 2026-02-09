/**
 * Tipos e constantes para o Mapa de Reservas
 */

import { BookingStatus } from "@/generated/prisma/client";

/**
 * Cores para cada status de reserva no mapa
 */
export const BOOKING_STATUS_COLORS: Record<BookingStatus, string> = {
  PRE_BOOKING: "bg-yellow-400 dark:bg-yellow-600",
  CONFIRMED: "bg-green-500 dark:bg-green-600",
  CHECKED_IN: "bg-blue-500 dark:bg-blue-600",
  CHECKED_OUT: "bg-gray-400 dark:bg-gray-600",
  CANCELLED: "bg-red-400 dark:bg-red-600 opacity-50",
  NO_SHOW: "bg-orange-400 dark:bg-orange-600",
};

/**
 * Cores de borda para cada status
 */
export const BOOKING_BORDER_COLORS: Record<BookingStatus, string> = {
  PRE_BOOKING: "border-yellow-500",
  CONFIRMED: "border-green-600",
  CHECKED_IN: "border-blue-600",
  CHECKED_OUT: "border-gray-500",
  CANCELLED: "border-red-500",
  NO_SHOW: "border-orange-500",
};

/**
 * Labels para status de reserva
 */
export const BOOKING_STATUS_LABELS: Record<BookingStatus, string> = {
  PRE_BOOKING: "Pré-reserva",
  CONFIRMED: "Confirmada",
  CHECKED_IN: "Check-in",
  CHECKED_OUT: "Check-out",
  CANCELLED: "Cancelada",
  NO_SHOW: "No-show",
};

/**
 * Reserva no mapa
 */
export interface MapBooking {
  id: string;
  guestName: string;
  checkIn: Date;
  checkOut: Date;
  status: BookingStatus;
  totalGuests: number;
  roomId: string;
  roomName: string;
  totalAmount?: number;
}

/**
 * Quarto para o mapa
 */
export interface MapRoom {
  id: string;
  name: string;
  category: string;
}

/**
 * Dados do mapa
 */
export interface ReservationMapData {
  rooms: MapRoom[];
  bookings: MapBooking[];
  startDate: Date;
  endDate: Date;
}

/**
 * Calcular posição e largura da reserva no grid
 * 
 * CORREÇÃO: Uma reserva de check-in dia 3 e check-out dia 5 
 * deve ocupar os dias 3 e 4 (2 células), pois check-out é às 12h
 */
export function calculateBookingPosition(
  checkIn: Date,
  checkOut: Date,
  startDate: Date,
  endDate: Date,
  cellWidth: number
): { left: number; width: number; visible: boolean } {
  // Normalizar datas para meia-noite
  const normalizeDate = (d: Date) => {
    const date = new Date(d);
    date.setHours(0, 0, 0, 0);
    return date;
  };

  const startTime = normalizeDate(startDate).getTime();
  const endTime = normalizeDate(endDate).getTime();
  const checkInTime = normalizeDate(checkIn).getTime();
  const checkOutTime = normalizeDate(checkOut).getTime();

  // Se a reserva está totalmente fora do período
  if (checkOutTime <= startTime || checkInTime >= endTime) {
    return { left: 0, width: 0, visible: false };
  }

  // Ajustar para os limites do período visível
  const visibleStart = Math.max(checkInTime, startTime);
  const visibleEnd = Math.min(checkOutTime, endTime);

  // Calcular dias desde o início
  const msPerDay = 1000 * 60 * 60 * 24;
  const daysFromStart = Math.floor((visibleStart - startTime) / msPerDay);
  
  // Calcular duração: check-out dia N significa última noite é dia N-1
  // Então a reserva ocupa os dias de checkIn até checkOut-1 (inclusive)
  const durationDays = Math.max(1, Math.floor((visibleEnd - visibleStart) / msPerDay));

  return {
    left: daysFromStart * cellWidth,
    width: Math.max(durationDays * cellWidth, cellWidth), // Mínimo 1 célula
    visible: true,
  };
}

/**
 * Gerar array de datas para o período
 */
export function generateDateRange(startDate: Date, days: number): Date[] {
  const dates: Date[] = [];
  const current = new Date(startDate);
  current.setHours(0, 0, 0, 0);

  for (let i = 0; i < days; i++) {
    dates.push(new Date(current));
    current.setDate(current.getDate() + 1);
  }

  return dates;
}

/**
 * Formatar data para exibição
 */
export function formatDateHeader(date: Date): { day: string; weekday: string; month: string; isToday: boolean; isWeekend: boolean } {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const dateNormalized = new Date(date);
  dateNormalized.setHours(0, 0, 0, 0);

  const dayOfWeek = date.getDay();

  return {
    day: date.getDate().toString().padStart(2, "0"),
    weekday: date.toLocaleDateString("pt-BR", { weekday: "short" }).replace(".", ""),
    month: date.toLocaleDateString("pt-BR", { month: "short" }).replace(".", ""),
    isToday: dateNormalized.getTime() === today.getTime(),
    isWeekend: dayOfWeek === 0 || dayOfWeek === 6,
  };
}

/**
 * Formatar valor em reais
 */
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}
