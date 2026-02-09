import { z } from "zod";

/**
 * Bookings Validation Schemas
 *
 * Schemas Zod para validação de dados de reservas.
 */

/**
 * Schema para criar uma nova reserva
 */
export const createBookingSchema = z
  .object({
    guestId: z.string().min(1, "Hóspede é obrigatório"),
    roomId: z.string().min(1, "Quarto é obrigatório"),
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
    mealsIncluded: z.boolean().default(true),
    paymentMethod: z.enum(
      ["PIX", "CREDIT_CARD", "DEBIT_CARD", "CASH", "TRANSFER"],
      {
        message: "Método de pagamento inválido",
      }
    ),
    paymentType: z.enum(["FULL_UPFRONT", "SPLIT_50_50"], {
      message: "Tipo de pagamento inválido",
    }),
    totalAmount: z
      .number()
      .positive("Valor total deve ser maior que zero")
      .max(9999999.99, "Valor máximo excedido"),
    paidAmount: z
      .number()
      .min(0, "Valor pago não pode ser negativo")
      .default(0),
    paymentDate: z.coerce.date().optional(),
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
 * Schema para atualizar uma reserva
 */
export const updateBookingSchema = z.object({
  id: z.string().min(1, "ID da reserva é obrigatório"),
  roomId: z.string().min(1).optional(),
  checkIn: z.coerce.date().optional(),
  checkOut: z.coerce.date().optional(),
  adults: z.number().int().min(1).max(20).optional(),
  children: z.number().int().min(0).max(20).optional(),
  mealsIncluded: z.boolean().optional(),
  paymentMethod: z
    .enum(["PIX", "CREDIT_CARD", "DEBIT_CARD", "CASH", "TRANSFER"])
    .optional(),
  paymentType: z.enum(["FULL_UPFRONT", "SPLIT_50_50"]).optional(),
  totalAmount: z.number().positive().max(9999999.99).optional(),
  paidAmount: z.number().min(0).optional(),
  paymentDate: z.coerce.date().optional(),
  notes: z.string().max(1000).optional().nullable(),
  status: z.enum([
    "PRE_BOOKING",
    "CONFIRMED",
    "CHECKED_IN",
    "CHECKED_OUT",
    "CANCELLED",
    "NO_SHOW",
  ]).optional(),
});

/**
 * Schema para atualizar status
 */
export const updateBookingStatusSchema = z.object({
  id: z.string().min(1, "ID da reserva é obrigatório"),
  status: z.enum([
    "PRE_BOOKING",
    "CONFIRMED",
    "CHECKED_IN",
    "CHECKED_OUT",
    "CANCELLED",
    "NO_SHOW",
  ]),
});

/**
 * Schema para cancelar reserva
 */
export const cancelBookingSchema = z.object({
  id: z.string().min(1, "ID da reserva é obrigatório"),
  reason: z.string().max(500, "Motivo deve ter no máximo 500 caracteres").optional(),
});

/**
 * Schema para filtros do mapa de reservas
 */
export const reservationMapFiltersSchema = z.object({
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
  roomCategory: z.enum(["STANDARD", "LUXO", "LUXO_SUPERIOR"]).optional(),
});

// Tipos inferidos dos schemas
export type CreateBookingInput = z.infer<typeof createBookingSchema>;
export type UpdateBookingInput = z.infer<typeof updateBookingSchema>;
export type UpdateBookingStatusInput = z.infer<typeof updateBookingStatusSchema>;
export type CancelBookingInput = z.infer<typeof cancelBookingSchema>;
export type ReservationMapFiltersInput = z.infer<typeof reservationMapFiltersSchema>;
