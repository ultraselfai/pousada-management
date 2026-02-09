import { z } from "zod";

export const bookingReceiptSchema = z.object({
  // Dados do Hóspede
  guest: z.object({
    firstName: z.string().min(1, "Nome é obrigatório"),
    lastName: z.string().min(1, "Sobrenome é obrigatório"),
    cpf: z.string().min(14, "CPF inválido"), // Formato: 000.000.000-00
    phone: z.string().min(10, "Telefone inválido"),
    email: z.string().email("Email inválido"),
    observations: z.string().optional(),
  }),

  // Dados da Reserva
  booking: z.object({
    accommodation: z.string().min(1, "Ocupação é obrigatória"),
    periodStart: z.string().min(1, "Data de início é obrigatória"),
    periodEnd: z.string().min(1, "Data de fim é obrigatória"),
    checkInTime: z.string(),
    checkOutTime: z.string(),
    averageDailyRate: z.number().min(0, "Valor inválido"),
    totalDays: z.number().min(1, "Número de diárias inválido"),
    adults: z.number().min(1, "Mínimo 1 adulto"),
    children: z.number().min(0),
    babies: z.number().min(0),
    meals: z.array(z.string()),
  }),

  // Tipo de Pagamento
  paymentType: z.enum(["FULL", "PARTIAL"]),

  // Pagamento único (para pagamento integral)
  singlePayment: z.object({
    method: z.enum(["PIX", "CARTAO"]),
    date: z.string(),
    amount: z.number().min(0),
  }).optional(),

  // Pagamentos parciais (para pagamento parcial)
  partialPayments: z.array(
    z.object({
      method: z.enum(["PIX", "CARTAO"]),
      date: z.string(),
      amount: z.number().min(0),
    })
  ).optional(),

  // Pagamento do check-in (para pagamento parcial)
  checkInPayment: z.object({
    method: z.enum(["PIX", "CARTAO"]),
    date: z.string(),
    amount: z.number().min(0),
  }).optional(),
});

export type BookingReceiptFormData = z.infer<typeof bookingReceiptSchema>;

// Opções de alimentação
export const MEAL_OPTIONS = [
  { id: "breakfast", label: "Café da manhã" },
  { id: "lunch", label: "Almoço" },
  { id: "dinner", label: "Janta" },
];

// Opções de número de pessoas (0-6)
export const PERSON_COUNT_OPTIONS = [0, 1, 2, 3, 4, 5, 6];
