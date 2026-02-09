/**
 * Utilitários para formatação de dados de reservas
 */

import { differenceInDays, format } from "date-fns"
import { ptBR } from "date-fns/locale"

/**
 * Formata data para exibição
 */
export function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date
  return format(d, "dd/MM/yyyy", { locale: ptBR })
}

/**
 * Formata data curta
 */
export function formatShortDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date
  return format(d, "dd/MM", { locale: ptBR })
}

/**
 * Formata data com dia da semana
 */
export function formatDateWithWeekday(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date
  return format(d, "EEEE, dd 'de' MMMM", { locale: ptBR })
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
 * Calcula porcentagem paga
 */
export function calculatePaidPercentage(paid: number, total: number): number {
  if (total === 0) return 0
  return Math.round((paid / total) * 100)
}
