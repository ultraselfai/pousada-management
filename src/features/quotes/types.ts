/**
 * Quotes Types
 *
 * Tipos TypeScript para a feature de Orçamentos.
 */

import type { QuoteStatus, DiscountType } from "@/generated/prisma/client";

/**
 * Extra em orçamento
 */
export interface QuoteExtra {
  name: string;
  price: number;
}

/**
 * Tipo base do Quote (espelhando o Prisma)
 */
export interface Quote {
  id: string;
  quoteNumber: string;
  guestName: string;
  guestPhone: string | null;
  guestEmail: string | null;
  roomId: string | null;
  roomName: string;
  checkIn: Date;
  checkOut: Date;
  adults: number;
  children: number;
  basePrice: number;
  discount: number;
  discountType: DiscountType;
  extras: QuoteExtra[] | null;
  totalPrice: number;
  status: QuoteStatus;
  validUntil: Date;
  pdfUrl: string | null;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Resultado de ação genérico
 */
export interface QuoteActionResult {
  success: boolean;
  error?: string;
  message?: string;
  quote?: Quote;
}

/**
 * Resultado de listagem
 */
export interface QuotesListResult {
  success: boolean;
  quotes: Quote[];
  total: number;
  error?: string;
}

/**
 * Filtros para listagem de orçamentos
 */
export interface QuoteFilters {
  status?: QuoteStatus;
  search?: string;
  page?: number;
  limit?: number;
}

/**
 * Labels para status de orçamento
 */
export const QUOTE_STATUS_LABELS: Record<QuoteStatus, string> = {
  PENDING: "Pendente",
  SENT: "Enviado",
  ACCEPTED: "Aceito",
  REJECTED: "Rejeitado",
  EXPIRED: "Expirado",
  CONVERTED: "Convertido",
};

/**
 * Cores para status de orçamento
 */
export const QUOTE_STATUS_COLORS: Record<QuoteStatus, string> = {
  PENDING: "gray",
  SENT: "blue",
  ACCEPTED: "green",
  REJECTED: "red",
  EXPIRED: "orange",
  CONVERTED: "purple",
};
