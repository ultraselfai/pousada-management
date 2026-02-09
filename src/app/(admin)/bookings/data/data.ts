"use client"

import {
  Calendar,
  CalendarCheck,
  CalendarX,
  Clock,
  XCircle,
  AlertCircle,
  CheckCircle2,
} from "lucide-react"
import type { BookingStatus, PaymentMethod, PaymentType } from "@/generated/prisma/client"

/**
 * Status de reservas para filtros
 */
export const bookingStatuses = [
  { value: "PRE_BOOKING", label: "Pré-Reserva", icon: Clock, color: "yellow" },
  { value: "CONFIRMED", label: "Confirmada", icon: CheckCircle2, color: "green" },
  { value: "CHECKED_IN", label: "Check-in", icon: CalendarCheck, color: "blue" },
  { value: "CHECKED_OUT", label: "Check-out", icon: CalendarX, color: "gray" },
  { value: "CANCELLED", label: "Cancelada", icon: XCircle, color: "red" },
  { value: "NO_SHOW", label: "No-Show", icon: AlertCircle, color: "orange" },
]

/**
 * Métodos de pagamento
 */
export const paymentMethods = [
  { value: "PIX", label: "PIX" },
  { value: "CREDIT_CARD", label: "Cartão de Crédito" },
  { value: "DEBIT_CARD", label: "Cartão de Débito" },
  { value: "CASH", label: "Dinheiro" },
  { value: "TRANSFER", label: "Transferência" },
]

/**
 * Tipos de pagamento
 */
export const paymentTypes = [
  { value: "FULL_UPFRONT", label: "Integral Antecipado" },
  { value: "SPLIT_50_50", label: "50% Reserva + 50% Check-in" },
]

/**
 * Mapear status para cor
 */
export function getStatusColor(status: BookingStatus): string {
  const found = bookingStatuses.find((s) => s.value === status)
  return found?.color ?? "gray"
}

/**
 * Mapear status para label
 */
export function getStatusLabel(status: BookingStatus): string {
  const found = bookingStatuses.find((s) => s.value === status)
  return found?.label ?? status
}

/**
 * Mapear método de pagamento para label
 */
export function getPaymentMethodLabel(method: PaymentMethod): string {
  const found = paymentMethods.find((m) => m.value === method)
  return found?.label ?? method
}

/**
 * Mapear tipo de pagamento para label
 */
export function getPaymentTypeLabel(type: PaymentType): string {
  const found = paymentTypes.find((t) => t.value === type)
  return found?.label ?? type
}
