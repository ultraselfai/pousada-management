import { z } from "zod";

/**
 * Stock Validation Schemas
 *
 * Schemas Zod para validação de dados de estoque.
 */

/**
 * Schema para criar categoria
 */
export const createCategorySchema = z.object({
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
    .regex(/^#([0-9a-fA-F]{3}){1,2}$/, "Cor deve estar no formato #RRGGBB ou #RGB")
    .optional()
    .nullable(),
});

/**
 * Schema para criar item de estoque
 */
export const createItemSchema = z.object({
  name: z
    .string()
    .min(2, "Nome deve ter no mínimo 2 caracteres")
    .max(100, "Nome deve ter no máximo 100 caracteres"),
  categoryId: z.string().min(1, "Categoria é obrigatória"),
  unit: z
    .string()
    .min(1, "Unidade é obrigatória")
    .max(10, "Unidade deve ter no máximo 10 caracteres")
    .default("un"),
  currentStock: z
    .number()
    .min(0, "Estoque não pode ser negativo")
    .default(0),
  minimumStock: z
    .number()
    .min(0, "Estoque mínimo não pode ser negativo")
    .default(0),
});

/**
 * Schema para atualizar item de estoque
 */
export const updateItemSchema = z.object({
  id: z.string().min(1, "ID do item é obrigatório"),
  name: z.string().min(2).max(100).optional(),
  categoryId: z.string().min(1).optional(),
  unit: z.string().min(1).max(10).optional(),
  currentStock: z.number().min(0).optional(),
  minimumStock: z.number().min(0).optional(),
});

/**
 * Schema para ajuste de estoque
 */
export const adjustStockSchema = z.object({
  id: z.string().min(1, "ID do item é obrigatório"),
  quantity: z.number().refine((n) => n !== 0, "Quantidade deve ser diferente de zero"),
  reason: z.string().max(200, "Motivo deve ter no máximo 200 caracteres").optional(),
});

/**
 * Schema para item de compra
 */
const purchaseItemSchema = z.object({
  itemId: z.string().min(1, "Item é obrigatório"),
  quantity: z.number().positive("Quantidade deve ser maior que zero"),
  unitPrice: z.number().min(0, "Preço não pode ser negativo"),
});

/**
 * Schema para criar compra
 */
export const createPurchaseSchema = z.object({
  purchaseDate: z.coerce.date({ message: "Data da compra é obrigatória" }),
  supplier: z
    .string()
    .max(100, "Fornecedor deve ter no máximo 100 caracteres")
    .optional()
    .nullable(),
  items: z
    .array(purchaseItemSchema)
    .min(1, "Deve ter pelo menos um item"),
  receiptUrl: z.string().url("URL inválida").optional().nullable(),
  notes: z
    .string()
    .max(500, "Notas devem ter no máximo 500 caracteres")
    .optional()
    .nullable(),
});

// Tipos inferidos dos schemas
export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type CreateItemInput = z.infer<typeof createItemSchema>;
export type UpdateItemInput = z.infer<typeof updateItemSchema>;
export type AdjustStockInput = z.infer<typeof adjustStockSchema>;
export type CreatePurchaseInput = z.infer<typeof createPurchaseSchema>;
