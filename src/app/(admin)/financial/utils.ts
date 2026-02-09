/**
 * Utilitários para formatação de dados financeiros
 */

import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

/**
 * Formata data para exibição
 */
export function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date
  return format(d, "dd/MM/yyyy", { locale: ptBR })
}

/**
 * Formata mês/ano
 */
export function formatMonthYear(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date
  return format(d, "MMMM 'de' yyyy", { locale: ptBR })
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
 * Formata porcentagem
 */
export function formatPercentage(value: number): string {
  return `${value.toFixed(1)}%`
}

/**
 * Calcula variação percentual
 */
export function calculateVariation(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0
  return ((current - previous) / previous) * 100
}
