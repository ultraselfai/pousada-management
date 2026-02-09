"use server"

import {
  getCashFlow,
  getExpenses,
  getRevenues,
  getExpenseCategoriesWithTotals,
  getDRE,
  getTransactions,
  fetchPendingRevenues as fetchPendingRevenuesCore,
} from "@/features/financial"
import { startOfMonth, endOfMonth } from "date-fns"
import { TransactionType } from "@/generated/prisma/client"

/**
 * Action para buscar fluxo de caixa
 */
export async function fetchCashFlow(startDate?: Date, endDate?: Date) {
  const start = startDate || startOfMonth(new Date())
  const end = endDate || endOfMonth(new Date())
  const result = await getCashFlow(start, end)
  return result
}

/**
 * Action para buscar despesas
 */
export async function fetchExpenses(filters?: {
  categoryId?: string
  isPaid?: boolean
  startDate?: Date
  endDate?: Date
}) {
  const result = await getExpenses(filters)
  return result
}

/**
 * Action para buscar receitas em aberto
 */
export async function fetchPendingRevenues() {
  const result = await fetchPendingRevenuesCore()
  return result
}

/**
 * Action para buscar receitas
 */
export async function fetchRevenues(filters?: {
  source?: string
  startDate?: Date
  endDate?: Date
}) {
  const result = await getRevenues(filters)
  return result
}

/**
 * Action para buscar categorias com totais
 */
export async function fetchCategoriesWithTotals(startDate?: Date, endDate?: Date) {
  const start = startDate || startOfMonth(new Date())
  const end = endDate || endOfMonth(new Date())
  const result = await getExpenseCategoriesWithTotals(start, end)
  return result
}

/**
 * Action para buscar DRE
 */
export async function fetchDRE(startDate?: Date, endDate?: Date) {
  const start = startDate || startOfMonth(new Date())
  const end = endDate || endOfMonth(new Date())
  const result = await getDRE(start, end)
  return result
}

/**
 * Action para buscar transações (Extrato)
 */
export async function fetchTransactions(filters?: {
  type?: "INCOME" | "EXPENSE" | "ALL"
  startDate?: Date
  endDate?: Date
  page?: number
  limit?: number
}) {
  let typeFilter: TransactionType | undefined
  if (filters?.type && filters.type !== "ALL") {
      typeFilter = filters.type as TransactionType
  }

  const result = await getTransactions({
      ...filters,
      type: typeFilter
  }, filters?.page, filters?.limit)
  return result
}

/**
 * Action para buscar taxa do DRE
 */
export async function fetchDRETaxRate() {
  const { getDRETaxRate } = await import("@/features/financial/actions")
  return getDRETaxRate()
}

/**
 * Action para atualizar taxa do DRE
 */
export async function saveDRETaxRate(rate: number) {
  const { updateDRETaxRate } = await import("@/features/financial/actions")
  return updateDRETaxRate(rate)
}
