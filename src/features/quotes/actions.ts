"use server";

/**
 * Quotes Server Actions
 *
 * Server Actions para gerenciamento de orçamentos.
 * Inclui CRUD, geração de PDF e conversão em reserva.
 */

import { revalidatePath } from "next/cache";
import { prisma } from "@/db";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import {
  createQuoteSchema,
  updateQuoteSchema,
  updateQuoteStatusSchema,
  type CreateQuoteInput,
  type UpdateQuoteInput,
  type UpdateQuoteStatusInput,
} from "./schemas";
import type {
  Quote,
  QuoteActionResult,
  QuotesListResult,
  QuoteFilters,
  QuoteExtra,
} from "./types";
import { QuoteStatus, Prisma } from "@/generated/prisma/client";

/**
 * Gerar número de orçamento único
 */
async function generateQuoteNumber(): Promise<string> {
  const year = new Date().getFullYear();
  const lastQuote = await prisma.quote.findFirst({
    where: {
      quoteNumber: { startsWith: `ORC-${year}` },
    },
    orderBy: { quoteNumber: "desc" },
  });

  let nextNumber = 1;
  if (lastQuote) {
    const parts = lastQuote.quoteNumber.split("-");
    nextNumber = parseInt(parts[2], 10) + 1;
  }

  return `ORC-${year}-${nextNumber.toString().padStart(4, "0")}`;
}

/**
 * Calcular preço total do orçamento
 */
function calculateTotalPrice(
  basePrice: number,
  discount: number,
  discountType: "PERCENTAGE" | "FIXED",
  extras: QuoteExtra[] | null,
  checkIn: Date,
  checkOut: Date
): number {
  const nights = Math.ceil(
    (checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24)
  );

  let total = basePrice * nights;

  // Adicionar extras
  if (extras && extras.length > 0) {
    total += extras.reduce((sum, e) => sum + e.price, 0);
  }

  // Aplicar desconto
  if (discount > 0) {
    if (discountType === "PERCENTAGE") {
      total = total * (1 - discount / 100);
    } else {
      total = total - discount;
    }
  }

  return Math.max(0, total);
}

/**
 * Listar orçamentos
 */
export async function getQuotes(
  filters?: QuoteFilters
): Promise<QuotesListResult> {
  try {
    const page = filters?.page || 1;
    const limit = filters?.limit || 20;
    const skip = (page - 1) * limit;

    const where: Prisma.QuoteWhereInput = {};

    if (filters?.status) {
      where.status = filters.status;
    }

    if (filters?.search) {
      where.OR = [
        { quoteNumber: { contains: filters.search, mode: "insensitive" } },
        { guestName: { contains: filters.search, mode: "insensitive" } },
        { guestPhone: { contains: filters.search } },
      ];
    }

    const [quotes, total] = await Promise.all([
      prisma.quote.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.quote.count({ where }),
    ]);

    return {
      success: true,
      quotes: quotes.map((q) => ({
        ...q,
        basePrice: q.basePrice.toNumber(),
        discount: q.discount.toNumber(),
        totalPrice: q.totalPrice.toNumber(),
        extras: q.extras as QuoteExtra[] | null,
      })),
      total,
    };
  } catch (error) {
    console.error("Erro ao listar orçamentos:", error);
    return {
      success: false,
      quotes: [],
      total: 0,
      error: "Erro interno ao listar orçamentos",
    };
  }
}

/**
 * Buscar orçamento por ID
 */
export async function getQuote(id: string): Promise<QuoteActionResult> {
  try {
    const quote = await prisma.quote.findUnique({
      where: { id },
    });

    if (!quote) {
      return { success: false, error: "Orçamento não encontrado" };
    }

    return {
      success: true,
      quote: {
        ...quote,
        basePrice: quote.basePrice.toNumber(),
        discount: quote.discount.toNumber(),
        totalPrice: quote.totalPrice.toNumber(),
        extras: quote.extras as QuoteExtra[] | null,
      },
    };
  } catch (error) {
    console.error("Erro ao buscar orçamento:", error);
    return { success: false, error: "Erro interno ao buscar orçamento" };
  }
}

/**
 * Criar um novo orçamento
 */
export async function createQuote(
  input: CreateQuoteInput
): Promise<QuoteActionResult> {
  try {
    // Verificar autenticação
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      return { success: false, error: "Não autenticado" };
    }

    // Validar input
    const validated = createQuoteSchema.safeParse(input);
    if (!validated.success) {
      return {
        success: false,
        error: validated.error.issues[0].message,
      };
    }

    const data = validated.data;

    // Gerar número de orçamento
    const quoteNumber = await generateQuoteNumber();

    // Calcular preço total
    const totalPrice = calculateTotalPrice(
      data.basePrice,
      data.discount,
      data.discountType,
      data.extras || null,
      data.checkIn,
      data.checkOut
    );

    const quote = await prisma.quote.create({
      data: {
        quoteNumber,
        guestName: data.guestName,
        guestPhone: data.guestPhone || null,
        guestEmail: data.guestEmail || null,
        roomId: data.roomId || null,
        roomName: data.roomName,
        checkIn: data.checkIn,
        checkOut: data.checkOut,
        adults: data.adults,
        children: data.children,
        basePrice: data.basePrice,
        discount: data.discount,
        discountType: data.discountType,
        extras: data.extras as Prisma.InputJsonValue,
        totalPrice,
        validUntil: data.validUntil,
        notes: data.notes || null,
      },
    });

    revalidatePath("/bookings/quotes");

    return {
      success: true,
      message: "Orçamento criado com sucesso!",
      quote: {
        ...quote,
        basePrice: quote.basePrice.toNumber(),
        discount: quote.discount.toNumber(),
        totalPrice: quote.totalPrice.toNumber(),
        extras: quote.extras as QuoteExtra[] | null,
      },
    };
  } catch (error) {
    console.error("Erro ao criar orçamento:", error);
    return { success: false, error: "Erro interno ao criar orçamento" };
  }
}

/**
 * Atualizar um orçamento
 */
export async function updateQuote(
  input: UpdateQuoteInput
): Promise<QuoteActionResult> {
  try {
    // Verificar autenticação
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      return { success: false, error: "Não autenticado" };
    }

    // Validar input
    const validated = updateQuoteSchema.safeParse(input);
    if (!validated.success) {
      return {
        success: false,
        error: validated.error.issues[0].message,
      };
    }

    const { id, extras, ...rest } = validated.data;

    // Buscar orçamento atual para recalcular total se necessário
    const currentQuote = await prisma.quote.findUnique({
      where: { id },
    });

    if (!currentQuote) {
      return { success: false, error: "Orçamento não encontrado" };
    }

    let totalPrice = currentQuote.totalPrice.toNumber();

    // Recalcular se algum valor relevante mudou
    if (
      rest.basePrice ||
      rest.discount !== undefined ||
      rest.discountType ||
      extras ||
      rest.checkIn ||
      rest.checkOut
    ) {
      totalPrice = calculateTotalPrice(
        rest.basePrice || currentQuote.basePrice.toNumber(),
        rest.discount ?? currentQuote.discount.toNumber(),
        rest.discountType || currentQuote.discountType,
        extras !== undefined ? extras : (currentQuote.extras as QuoteExtra[] | null),
        rest.checkIn || currentQuote.checkIn,
        rest.checkOut || currentQuote.checkOut
      );
    }

    const quote = await prisma.quote.update({
      where: { id },
      data: {
        ...rest,
        ...(extras !== undefined && { extras: extras as Prisma.InputJsonValue }),
        totalPrice,
      },
    });

    revalidatePath("/bookings/quotes");

    return {
      success: true,
      message: "Orçamento atualizado com sucesso!",
      quote: {
        ...quote,
        basePrice: quote.basePrice.toNumber(),
        discount: quote.discount.toNumber(),
        totalPrice: quote.totalPrice.toNumber(),
        extras: quote.extras as QuoteExtra[] | null,
      },
    };
  } catch (error) {
    console.error("Erro ao atualizar orçamento:", error);
    return { success: false, error: "Erro interno ao atualizar orçamento" };
  }
}

/**
 * Atualizar status do orçamento
 */
export async function updateQuoteStatus(
  input: UpdateQuoteStatusInput
): Promise<QuoteActionResult> {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      return { success: false, error: "Não autenticado" };
    }

    const validated = updateQuoteStatusSchema.safeParse(input);
    if (!validated.success) {
      return {
        success: false,
        error: validated.error.issues[0].message,
      };
    }

    const quote = await prisma.quote.update({
      where: { id: validated.data.id },
      data: { status: validated.data.status },
    });

    revalidatePath("/bookings/quotes");

    return {
      success: true,
      message: "Status atualizado com sucesso!",
      quote: {
        ...quote,
        basePrice: quote.basePrice.toNumber(),
        discount: quote.discount.toNumber(),
        totalPrice: quote.totalPrice.toNumber(),
        extras: quote.extras as QuoteExtra[] | null,
      },
    };
  } catch (error) {
    console.error("Erro ao atualizar status:", error);
    return { success: false, error: "Erro interno ao atualizar status" };
  }
}

/**
 * Excluir orçamento
 */
export async function deleteQuote(id: string): Promise<QuoteActionResult> {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      return { success: false, error: "Não autenticado" };
    }

    const quote = await prisma.quote.findUnique({ where: { id } });

    if (!quote) {
      return { success: false, error: "Orçamento não encontrado" };
    }

    if (quote.status === QuoteStatus.CONVERTED) {
      return {
        success: false,
        error: "Não é possível excluir orçamento convertido em reserva",
      };
    }

    await prisma.quote.delete({ where: { id } });

    revalidatePath("/bookings/quotes");

    return {
      success: true,
      message: "Orçamento excluído com sucesso!",
    };
  } catch (error) {
    console.error("Erro ao excluir orçamento:", error);
    return { success: false, error: "Erro interno ao excluir orçamento" };
  }
}

/**
 * Marcar orçamento como enviado
 */
export async function markQuoteAsSent(id: string): Promise<QuoteActionResult> {
  return updateQuoteStatus({ id, status: "SENT" });
}

/**
 * Verificar e marcar orçamentos expirados
 */
export async function checkExpiredQuotes(): Promise<number> {
  try {
    const result = await prisma.quote.updateMany({
      where: {
        status: { in: [QuoteStatus.PENDING, QuoteStatus.SENT] },
        validUntil: { lt: new Date() },
      },
      data: { status: QuoteStatus.EXPIRED },
    });

    revalidatePath("/bookings/quotes");

    return result.count;
  } catch (error) {
    console.error("Erro ao verificar orçamentos expirados:", error);
    return 0;
  }
}

/**
 * Converter orçamento em reserva
 */
export async function convertQuoteToBooking(
  id: string
): Promise<QuoteActionResult> {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      return { success: false, error: "Não autenticado" };
    }

    const quote = await prisma.quote.findUnique({ where: { id } });

    if (!quote) {
      return { success: false, error: "Orçamento não encontrado" };
    }

    if (quote.status === QuoteStatus.CONVERTED) {
      return { success: false, error: "Orçamento já foi convertido" };
    }

    if (quote.status === QuoteStatus.EXPIRED) {
      return { success: false, error: "Orçamento expirado" };
    }

    // Marcar como convertido
    const updatedQuote = await prisma.quote.update({
      where: { id },
      data: { status: QuoteStatus.CONVERTED },
    });

    revalidatePath("/bookings/quotes");

    return {
      success: true,
      message: "Orçamento convertido! Crie a reserva manualmente.",
      quote: {
        ...updatedQuote,
        basePrice: updatedQuote.basePrice.toNumber(),
        discount: updatedQuote.discount.toNumber(),
        totalPrice: updatedQuote.totalPrice.toNumber(),
        extras: updatedQuote.extras as QuoteExtra[] | null,
      },
    };
  } catch (error) {
    console.error("Erro ao converter orçamento:", error);
    return { success: false, error: "Erro interno ao converter orçamento" };
  }
}

/**
 * Gerar URL de PDF do orçamento (placeholder)
 */
export async function generateQuotePdf(id: string): Promise<{ success: boolean; url?: string; error?: string }> {
  try {
    const quote = await prisma.quote.findUnique({ where: { id } });

    if (!quote) {
      return { success: false, error: "Orçamento não encontrado" };
    }

    // TODO: Implementar geração real de PDF
    // Por enquanto, retorna uma URL placeholder
    return {
      success: true,
      url: `/api/quotes/${id}/pdf`,
    };
  } catch (error) {
    console.error("Erro ao gerar PDF:", error);
    return { success: false, error: "Erro interno ao gerar PDF" };
  }
}
