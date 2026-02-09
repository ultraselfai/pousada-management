import { z } from "zod";

/**
 * Quotes Validation Schemas
 *
 * Schemas Zod para validação de dados de orçamentos.
 */

/**
 * Schema para extra
 */
const quoteExtraSchema = z.object({
  name: z.string().min(1, "Nome do extra é obrigatório"),
  price: z.number().min(0, "Preço não pode ser negativo"),
});

/**
 * Schema para criar um novo orçamento
 */
export const createQuoteSchema = z
  .object({
    guestName: z
      .string()
      .min(3, "Nome deve ter no mínimo 3 caracteres")
      .max(100, "Nome deve ter no máximo 100 caracteres"),
    guestPhone: z
      .string()
      .max(20, "Telefone deve ter no máximo 20 caracteres")
      .optional()
      .nullable(),
    guestEmail: z
      .string()
      .email("Email inválido")
      .max(100, "Email deve ter no máximo 100 caracteres")
      .optional()
      .nullable()
      .or(z.literal("")),
    roomId: z.string().optional().nullable(),
    roomName: z.string().min(1, "Nome do quarto é obrigatório"),
    checkIn: z.coerce.date({ message: "Data de check-in é obrigatória" }),
    checkOut: z.coerce.date({ message: "Data de check-out é obrigatória" }),
    adults: z
      .number()
      .int()
      .min(1, "Deve ter pelo menos 1 adulto")
      .max(20, "Máximo de 20 adultos"),
    children: z
      .number()
      .int()
      .min(0, "Número de crianças não pode ser negativo")
      .max(20, "Máximo de 20 crianças")
      .default(0),
    basePrice: z
      .number()
      .positive("Preço base deve ser maior que zero")
      .max(9999999.99, "Valor máximo excedido"),
    discount: z
      .number()
      .min(0, "Desconto não pode ser negativo")
      .default(0),
    discountType: z
      .enum(["PERCENTAGE", "FIXED"])
      .default("PERCENTAGE"),
    extras: z.array(quoteExtraSchema).optional().nullable(),
    validUntil: z.coerce.date({ message: "Data de validade é obrigatória" }),
    notes: z
      .string()
      .max(1000, "Notas devem ter no máximo 1000 caracteres")
      .optional()
      .nullable(),
  })
  .refine((data) => data.checkOut > data.checkIn, {
    message: "Check-out deve ser após o check-in",
    path: ["checkOut"],
  });

/**
 * Schema para atualizar um orçamento
 */
export const updateQuoteSchema = z.object({
  id: z.string().min(1, "ID do orçamento é obrigatório"),
  guestName: z.string().min(3).max(100).optional(),
  guestPhone: z.string().max(20).optional().nullable(),
  guestEmail: z.string().email().max(100).optional().nullable().or(z.literal("")),
  roomId: z.string().optional().nullable(),
  roomName: z.string().min(1).optional(),
  checkIn: z.coerce.date().optional(),
  checkOut: z.coerce.date().optional(),
  adults: z.number().int().min(1).max(20).optional(),
  children: z.number().int().min(0).max(20).optional(),
  basePrice: z.number().positive().max(9999999.99).optional(),
  discount: z.number().min(0).optional(),
  discountType: z.enum(["PERCENTAGE", "FIXED"]).optional(),
  extras: z.array(quoteExtraSchema).optional().nullable(),
  validUntil: z.coerce.date().optional(),
  notes: z.string().max(1000).optional().nullable(),
});

/**
 * Schema para atualizar status
 */
export const updateQuoteStatusSchema = z.object({
  id: z.string().min(1, "ID do orçamento é obrigatório"),
  status: z.enum([
    "PENDING",
    "SENT",
    "ACCEPTED",
    "REJECTED",
    "EXPIRED",
    "CONVERTED",
  ]),
});

// Tipos inferidos dos schemas
export type CreateQuoteInput = z.infer<typeof createQuoteSchema>;
export type UpdateQuoteInput = z.infer<typeof updateQuoteSchema>;
export type UpdateQuoteStatusInput = z.infer<typeof updateQuoteStatusSchema>;
