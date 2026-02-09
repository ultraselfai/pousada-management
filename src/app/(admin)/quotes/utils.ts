/**
 * Utilitários para formatação de dados de orçamentos
 */

import { differenceInDays, format, isPast } from "date-fns"
import { ptBR } from "date-fns/locale"

/**
 * Formata data para exibição
 */
export function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date
  return format(d, "dd/MM/yyyy", { locale: ptBR })
}

/**
 * Calcula número de noites
 */
export function calculateNights(checkIn: Date | string, checkOut: Date | string): number {
  const start = typeof checkIn === "string" ? new Date(checkIn) : checkIn
  const end = typeof checkOut === "string" ? new Date(checkOut) : checkOut
  return differenceInDays(end, start)
}

/**
 * Formata valor monetário
 */
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value)
}

/**
 * Verifica se orçamento está expirado
 */
export function isExpired(validUntil: Date | string): boolean {
  const date = typeof validUntil === "string" ? new Date(validUntil) : validUntil
  return isPast(date)
}

/**
 * Calcula valor com desconto
 */
export function calculateDiscountedPrice(
  basePrice: number,
  discount: number,
  discountType: "PERCENTAGE" | "FIXED"
): number {
  if (discountType === "PERCENTAGE") {
    return basePrice * (1 - discount / 100)
  }
  return basePrice - discount
}
