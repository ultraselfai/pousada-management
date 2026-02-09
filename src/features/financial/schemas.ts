import { z } from "zod";

/**
 * Financial Validation Schemas
 *
 * Schemas Zod para validação de dados financeiros.
 */

/**
 * Schema para criar categoria de despesa
 */
export const createExpenseCategorySchema = z.object({
  name: z
    .string()
    .min(2, "Nome deve ter no mínimo 2 caracteres")
    .max(50, "Nome deve ter no máximo 50 caracteres"),
  slug: z
    .string()
    .min(2, "Slug deve ter no mínimo 2 caracteres")
    .max(50, "Slug deve ter no máximo 50 caracteres")
    .regex(/^[a-z0-9-]+$/, "Slug deve conter apenas letras minúsculas, números e hífens"),
  icon: z.string().max(10).optional().nullable(),
  color: z
    .string()
    .regex(/^#[0-9a-fA-F]{6}$/, "Cor deve estar no formato #RRGGBB")
    .optional()
    .nullable(),
});

/**
 * Schema para criar despesa
 */
export const createExpenseSchema = z.object({
  description: z
    .string()
    .min(3, "Descrição deve ter no mínimo 3 caracteres")
    .max(200, "Descrição deve ter no máximo 200 caracteres"),
  categoryId: z.string().min(1, "Categoria é obrigatória"),
  amount: z
    .number()
    .positive("Valor deve ser maior que zero")
    .max(99999999.99, "Valor máximo excedido"),
  dueDate: z.coerce.date({ message: "Data de vencimento é obrigatória" }),
  isPaid: z.boolean().default(false),
  paidAt: z.coerce.date().optional().nullable(),
  isRecurring: z.boolean().default(false),
  recurrence: z
    .enum(["DAILY", "WEEKLY", "MONTHLY", "YEARLY"])
    .optional()
    .nullable(),
  receiptUrl: z.string().url("URL inválida").optional().nullable(),
  notes: z
    .string()
    .max(500, "Notas devem ter no máximo 500 caracteres")
    .optional()
    .nullable(),
});

/**
 * Schema para atualizar despesa
 */
export const updateExpenseSchema = z.object({
  id: z.string().min(1, "ID da despesa é obrigatório"),
  description: z.string().min(3).max(200).optional(),
  categoryId: z.string().min(1).optional(),
  amount: z.number().positive().max(99999999.99).optional(),
  dueDate: z.coerce.date().optional(),
  isPaid: z.boolean().optional(),
  paidAt: z.coerce.date().optional().nullable(),
  isRecurring: z.boolean().optional(),
  recurrence: z.enum(["DAILY", "WEEKLY", "MONTHLY", "YEARLY"]).optional().nullable(),
  receiptUrl: z.string().url().optional().nullable(),
  notes: z.string().max(500).optional().nullable(),
});

/**
 * Schema para criar receita
 */
export const createRevenueSchema = z.object({
  description: z
    .string()
    .min(3, "Descrição deve ter no mínimo 3 caracteres")
    .max(200, "Descrição deve ter no máximo 200 caracteres"),
  source: z.enum(["BOOKING", "EXTRA_SERVICE", "PRODUCT_SALE", "OTHER"], {
    message: "Fonte inválida",
  }),
  amount: z
    .number()
    .positive("Valor deve ser maior que zero")
    .max(99999999.99, "Valor máximo excedido"),
  receivedAt: z.coerce.date({ message: "Data de recebimento é obrigatória" }),
  bookingId: z.string().optional().nullable(),
  notes: z
    .string()
    .max(500, "Notas devem ter no máximo 500 caracteres")
    .optional()
    .nullable(),
});

/**
 * Schema para atualizar receita
 */
export const updateRevenueSchema = z.object({
  id: z.string().min(1, "ID da receita é obrigatório"),
  description: z.string().min(3).max(200).optional(),
  source: z.enum(["BOOKING", "EXTRA_SERVICE", "PRODUCT_SALE", "OTHER"]).optional(),
  amount: z.number().positive().max(99999999.99).optional(),
  receivedAt: z.coerce.date().optional(),
  notes: z.string().max(500).optional().nullable(),
});

/**
 * Schema para filtros de período
 */
export const periodFiltersSchema = z.object({
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
});

// Tipos inferidos dos schemas
export type CreateExpenseCategoryInput = z.infer<typeof createExpenseCategorySchema>;
export type CreateExpenseInput = z.infer<typeof createExpenseSchema>;
export type UpdateExpenseInput = z.infer<typeof updateExpenseSchema>;
export type CreateRevenueInput = z.infer<typeof createRevenueSchema>;
export type UpdateRevenueInput = z.infer<typeof updateRevenueSchema>;
export type PeriodFiltersInput = z.infer<typeof periodFiltersSchema>;
