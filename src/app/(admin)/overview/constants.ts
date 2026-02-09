/**
 * Constantes e tipos para a Visão Geral
 */

import { RoomStatus, BookingStatus } from "@/generated/prisma/client";

/**
 * Cores para cada status de quarto
 * 
 * Nota: Os status "Check-in Hoje" e "Check-out Hoje" são calculados dinamicamente
 * baseados nas reservas, não são status reais do enum RoomStatus.
 */
export const ROOM_STATUS_COLORS: Record<RoomStatus, { bg: string; text: string; border: string }> = {
  AVAILABLE: { bg: "bg-green-100 dark:bg-green-950", text: "text-green-700 dark:text-green-400", border: "border-green-200 dark:border-green-800" },
  OCCUPIED: { bg: "bg-red-100 dark:bg-red-950", text: "text-red-700 dark:text-red-400", border: "border-red-200 dark:border-red-800" },
  CLEANING: { bg: "bg-yellow-100 dark:bg-yellow-950", text: "text-yellow-700 dark:text-yellow-400", border: "border-yellow-200 dark:border-yellow-800" },
  MAINTENANCE: { bg: "bg-purple-100 dark:bg-purple-950", text: "text-purple-700 dark:text-purple-400", border: "border-purple-200 dark:border-purple-800" },
  BLOCKED: { bg: "bg-gray-100 dark:bg-gray-900", text: "text-gray-700 dark:text-gray-400", border: "border-gray-200 dark:border-gray-800" },
};

/**
 * Labels para status de quarto
 */
export const ROOM_STATUS_LABELS: Record<RoomStatus, string> = {
  AVAILABLE: "Livre",
  OCCUPIED: "Ocupado",
  CLEANING: "Limpeza",
  MAINTENANCE: "Manutenção",
  BLOCKED: "Bloqueado",
};

/**
 * Ícones para status de quarto (Lucide icons)
 */
export const ROOM_STATUS_ICONS: Record<RoomStatus, string> = {
  AVAILABLE: "check-circle",
  OCCUPIED: "user",
  CLEANING: "sparkles",
  MAINTENANCE: "wrench",
  BLOCKED: "lock",
};

/**
 * Cores para badges de status de reserva
 */
export const BOOKING_STATUS_COLORS: Record<BookingStatus, string> = {
  PRE_BOOKING: "bg-yellow-500",
  CONFIRMED: "bg-green-500",
  CHECKED_IN: "bg-blue-500",
  CHECKED_OUT: "bg-gray-500",
  CANCELLED: "bg-red-500",
  NO_SHOW: "bg-orange-500",
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
