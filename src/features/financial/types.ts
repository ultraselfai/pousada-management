/**
 * Financial Types
 *
 * Tipos TypeScript para a feature Financeira.
 */

import type {
  TransactionType,
  RevenueSource,
  Recurrence,
} from "@/generated/prisma/client";

/**
 * Categoria de despesa
 */
export interface ExpenseCategory {
  id: string;
  name: string;
  slug: string;
  color: string | null;
  icon: string | null;
  createdAt: Date;
}

/**
 * Categoria com totais
 */
export interface ExpenseCategoryWithTotal extends ExpenseCategory {
  total: number;
  count: number;
}

/**
 * Despesa
 */
export interface Expense {
  id: string;
  description: string;
  categoryId: string;
  amount: number;
  dueDate: Date;
  paidAt: Date | null;
  isPaid: boolean;
  isRecurring: boolean;
  recurrence: Recurrence | null;
  receiptUrl: string | null;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Despesa com categoria
 */
export interface ExpenseWithCategory extends Expense {
  category: ExpenseCategory;
}

/**
 * Receita
 */
export interface Revenue {
  id: string;
  description: string;
  source: RevenueSource;
  amount: number;
  receivedAt: Date;
  bookingId: string | null;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Transação
 */
export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  date: Date;
  description: string;
  bookingId: string | null;
  expenseId: string | null;
  revenueId: string | null;
  purchaseId: string | null;
  createdAt: Date;
}

/**
 * Fluxo de caixa
 */
export interface CashFlow {
  currentBalance: number;
  totalIncome: number;
  totalExpenses: number;
  periodStart: Date;
  periodEnd: Date;
  transactions: Transaction[];
}

/**
 * DRE (Demonstração de Resultado)
 */
export interface DRE {
  period: string;
  revenue: {
    bookings: number;
    extras: number;
    other: number;
    total: number;
    taxes: number; // Impostos calculados sobre receita bruta
    netRevenue: number; // Receita Líquida (Bruta - Impostos)
  };
  expenses: {
    byCategory: {
      categoryName: string;
      total: number;
    }[];
    total: number;
  };
  result: number;
  margin: number;
}

/**
 * Filtros de período
 */
export interface PeriodFilters {
  startDate?: Date;
  endDate?: Date;
}

/**
 * Resultado de ação genérico
 */
export interface FinancialActionResult {
  success: boolean;
  error?: string;
  message?: string;
}

/**
 * Labels para fontes de receita
 */
export const REVENUE_SOURCE_LABELS: Record<RevenueSource, string> = {
  BOOKING: "Reserva",
  EXTRA_SERVICE: "Serviço Extra",
  PRODUCT_SALE: "Venda de Produto",
  OTHER: "Outro",
};

/**
 * Labels para recorrência
 */
export const RECURRENCE_LABELS: Record<Recurrence, string> = {
  DAILY: "Diária",
  WEEKLY: "Semanal",
  MONTHLY: "Mensal",
  YEARLY: "Anual",
};

/**
 * Categorias de despesas padrão
 */
export const DEFAULT_EXPENSE_CATEGORIES = [
  { name: "Folha Salarial", slug: "folha-salarial", icon: "👷", color: "#3b82f6" },
  { name: "Despesas Fixas", slug: "despesas-fixas", icon: "🏠", color: "#6366f1" },
  { name: "Despensa/Estoque", slug: "despensa", icon: "🛒", color: "#f59e0b" },
  { name: "Equipamentos", slug: "equipamentos", icon: "🔧", color: "#8b5cf6" },
  { name: "Variáveis", slug: "variaveis", icon: "📊", color: "#ec4899" },
  { name: "Imprevistos", slug: "imprevistos", icon: "⚠️", color: "#ef4444" },
  { name: "Manutenções", slug: "manutencoes", icon: "🔨", color: "#f97316" },
  { name: "Pró-labore", slug: "pro-labore", icon: "💼", color: "#10b981" },
] as const;
