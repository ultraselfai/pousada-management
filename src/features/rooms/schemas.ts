import { z } from "zod";

/**
 * Rooms Validation Schemas
 *
 * Schemas Zod para validação de dados de quartos.
 */

/**
 * Schema para tipo de cama
 */
export const bedTypeSchema = z.object({
  type: z.enum(["casal", "solteiro", "bicama", "beliche"], {
    message: "Tipo de cama inválido",
  }),
  qty: z.number().min(1, "Quantidade deve ser pelo menos 1"),
});

/**
 * Schema para criar um novo quarto
 */
export const createRoomSchema = z.object({
  name: z
    .string()
    .min(2, "Nome deve ter no mínimo 2 caracteres")
    .max(50, "Nome deve ter no máximo 50 caracteres"),
  category: z.enum(["STANDARD", "LUXO", "LUXO_SUPERIOR"], {
    message: "Categoria inválida",
  }),
  bedTypes: z
    .array(bedTypeSchema)
    .min(1, "Deve ter pelo menos um tipo de cama"),
  hasBathroom: z.boolean().default(true),
  equipment: z.array(z.string()).default([]),
  photos: z.array(z.string().url("URL de foto inválida")).default([]),
  basePrice: z
    .number()
    .positive("Preço deve ser maior que zero")
    .max(99999999.99, "Preço máximo excedido"),
  description: z
    .string()
    .max(1000, "Descrição deve ter no máximo 1000 caracteres")
    .optional()
    .nullable(),
  maxGuests: z
    .number()
    .int()
    .min(1, "Deve acomodar pelo menos 1 hóspede")
    .max(20, "Máximo de 20 hóspedes por quarto")
    .default(2),
});

/**
 * Schema para atualizar um quarto
 */
export const updateRoomSchema = z.object({
  id: z.string().min(1, "ID do quarto é obrigatório"),
  name: z
    .string()
    .min(2, "Nome deve ter no mínimo 2 caracteres")
    .max(50, "Nome deve ter no máximo 50 caracteres")
    .optional(),
  category: z
    .enum(["STANDARD", "LUXO", "LUXO_SUPERIOR"], {
      message: "Categoria inválida",
    })
    .optional(),
  bedTypes: z
    .array(bedTypeSchema)
    .min(1, "Deve ter pelo menos um tipo de cama")
    .optional(),
  hasBathroom: z.boolean().optional(),
  equipment: z.array(z.string()).optional(),
  photos: z.array(z.string().url("URL de foto inválida")).optional(),
  basePrice: z
    .number()
    .positive("Preço deve ser maior que zero")
    .max(99999999.99, "Preço máximo excedido")
    .optional(),
  description: z
    .string()
    .max(1000, "Descrição deve ter no máximo 1000 caracteres")
    .optional()
    .nullable(),
  maxGuests: z
    .number()
    .int()
    .min(1, "Deve acomodar pelo menos 1 hóspede")
    .max(20, "Máximo de 20 hóspedes por quarto")
    .optional(),
  status: z
    .enum(["AVAILABLE", "OCCUPIED", "CLEANING", "MAINTENANCE", "BLOCKED"], {
      message: "Status inválido",
    })
    .optional(),
});

/**
 * Schema para atualizar status do quarto
 */
export const updateRoomStatusSchema = z.object({
  id: z.string().min(1, "ID do quarto é obrigatório"),
  status: z.enum(
    ["AVAILABLE", "OCCUPIED", "CLEANING", "MAINTENANCE", "BLOCKED"],
    {
      message: "Status inválido",
    }
  ),
});

/**
 * Schema para verificar disponibilidade
 */
export const checkAvailabilitySchema = z.object({
  roomId: z.string().min(1, "ID do quarto é obrigatório"),
  checkIn: z.coerce.date(),
  checkOut: z.coerce.date(),
  excludeBookingId: z.string().optional(),
});

// Tipos inferidos dos schemas
export type CreateRoomInput = z.infer<typeof createRoomSchema>;
export type UpdateRoomInput = z.infer<typeof updateRoomSchema>;
export type UpdateRoomStatusInput = z.infer<typeof updateRoomStatusSchema>;
export type CheckAvailabilityInput = z.infer<typeof checkAvailabilitySchema>;
