"use server"

import { getQuotes } from "@/features/quotes"
import type { QuoteFilters } from "@/features/quotes/types"

/**
 * Action para buscar orçamentos para a página de listagem
 */
export async function fetchQuotes(filters?: QuoteFilters) {
  const result = await getQuotes(filters)
  return result
}
