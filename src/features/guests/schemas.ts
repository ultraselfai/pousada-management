import { z } from "zod";

/**
 * Guests Validation Schemas
 *
 * Schemas Zod para validação de dados de hóspedes.
 */

/**
 * Validação de CPF (formato brasileiro)
 */
const cpfRegex = /^\d{3}\.\d{3}\.\d{3}-\d{2}$|^\d{11}$/;

/**
 * Schema para criar um novo hóspede
 */
export const createGuestSchema = z.object({
  name: z
    .string()
    .min(3, "Nome deve ter no mínimo 3 caracteres")
    .max(100, "Nome deve ter no máximo 100 caracteres"),
  cpf: z
    .string()
    .regex(cpfRegex, "CPF inválido. Use o formato 000.000.000-00 ou 00000000000"),
  email: z
    .string()
    .email("Email inválido")
    .max(100, "Email deve ter no máximo 100 caracteres")
    .optional()
    .nullable()
    .or(z.literal("")),
  phone: z
    .string()
    .min(10, "Telefone deve ter no mínimo 10 dígitos")
    .max(20, "Telefone deve ter no máximo 20 caracteres"),
  birthDate: z.any().transform((val) => {
    if (!val || val === "" || val === null) return null;
    if (val instanceof Date) return val;
    const date = new Date(val);
    return isNaN(date.getTime()) ? null : date;
  }).nullable(),
  origin: z
    .enum([
      "DIRECT",
      "BOOKING_COM",
      "AIRBNB",
      "WHATSAPP",
      "INSTAGRAM",
      "FACEBOOK",
      "INDICACAO",
      "MOTOR_RESERVAS",
      "OUTRO",
    ])
    .default("DIRECT"),
  notes: z
    .string()
    .max(1000, "Notas devem ter no máximo 1000 caracteres")
    .optional()
    .nullable(),
});

/**
 * Schema para atualizar um hóspede
 */
export const updateGuestSchema = z.object({
  id: z.string().min(1, "ID do hóspede é obrigatório"),
  name: z
    .string()
    .min(3, "Nome deve ter no mínimo 3 caracteres")
    .max(100, "Nome deve ter no máximo 100 caracteres")
    .optional(),
  cpf: z
    .string()
    .regex(cpfRegex, "CPF inválido. Use o formato 000.000.000-00 ou 00000000000")
    .optional(),
  email: z
    .string()
    .email("Email inválido")
    .max(100, "Email deve ter no máximo 100 caracteres")
    .optional()
    .nullable()
    .or(z.literal("")),
  phone: z
    .string()
    .min(10, "Telefone deve ter no mínimo 10 dígitos")
    .max(20, "Telefone deve ter no máximo 20 caracteres")
    .optional(),
  birthDate: z.any().transform((val) => {
    if (!val || val === "" || val === null) return null;
    if (val instanceof Date) return val;
    const date = new Date(val);
    return isNaN(date.getTime()) ? null : date;
  }).nullable(),
  origin: z
    .enum([
      "DIRECT",
      "BOOKING_COM",
      "AIRBNB",
      "WHATSAPP",
      "INSTAGRAM",
      "FACEBOOK",
      "INDICACAO",
      "MOTOR_RESERVAS",
      "OUTRO",
    ])
    .optional(),
  notes: z
    .string()
    .max(1000, "Notas devem ter no máximo 1000 caracteres")
    .optional()
    .nullable(),
});

/**
 * Schema para busca de hóspede por CPF
 */
export const searchGuestByCpfSchema = z.object({
  cpf: z.string().min(1, "CPF é obrigatório"),
});

// Tipos inferidos dos schemas
export type CreateGuestInput = z.infer<typeof createGuestSchema>;
export type UpdateGuestInput = z.infer<typeof updateGuestSchema>;
