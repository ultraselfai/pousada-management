"use client"

import {
  Clock,
  Send,
  CheckCircle2,
  XCircle,
  AlertCircle,
  RefreshCw,
} from "lucide-react"

/**
 * Status de orçamentos para filtros
 */
export const quoteStatuses = [
  { value: "PENDING", label: "Pendente", icon: Clock, color: "gray" },
  { value: "SENT", label: "Enviado", icon: Send, color: "blue" },
  { value: "ACCEPTED", label: "Aceito", icon: CheckCircle2, color: "green" },
  { value: "REJECTED", label: "Rejeitado", icon: XCircle, color: "red" },
  { value: "EXPIRED", label: "Expirado", icon: AlertCircle, color: "orange" },
  { value: "CONVERTED", label: "Convertido", icon: RefreshCw, color: "purple" },
]

/**
 * Tipos de desconto
 */
export const discountTypes = [
  { value: "PERCENTAGE", label: "Porcentagem (%)" },
  { value: "FIXED", label: "Valor Fixo (R$)" },
]

/**
 * Mapear status para cor
 */
export function getStatusColor(status: string): string {
  const found = quoteStatuses.find((s) => s.value === status)
  return found?.color ?? "gray"
}

/**
 * Mapear status para label
 */
export function getStatusLabel(status: string): string {
  const found = quoteStatuses.find((s) => s.value === status)
  return found?.label ?? status
}
