"use server";

/**
 * Guests Server Actions
 *
 * Server Actions para gerenciamento de hóspedes.
 * Inclui CRUD completo e busca por CPF.
 */

import { revalidatePath } from "next/cache";
import { prisma } from "@/db";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import {
  createGuestSchema,
  updateGuestSchema,
  type CreateGuestInput,
  type UpdateGuestInput,
} from "./schemas";
import type {
  Guest,
  GuestActionResult,
  GuestsListResult,
  GuestFilters,
  GuestWithHistory,
} from "./types";
import { Prisma } from "@/generated/prisma/client";

/**
 * Normaliza CPF removendo pontuação
 */
function normalizeCpf(cpf: string): string {
  return cpf.replace(/\D/g, "");
}

/**
 * Listar todos os hóspedes
 */
export async function getGuests(
  filters?: GuestFilters
): Promise<GuestsListResult> {
  try {
    const page = filters?.page || 1;
    const limit = filters?.limit || 20;
    const skip = (page - 1) * limit;

    const where: Prisma.GuestWhereInput = {};

    if (filters?.search) {
      const searchNormalized = normalizeCpf(filters.search);
      where.OR = [
        { name: { contains: filters.search, mode: "insensitive" } },
        { cpf: { contains: searchNormalized } },
        { phone: { contains: filters.search } },
        { email: { contains: filters.search, mode: "insensitive" } },
      ];
    }

    if (filters?.origin) {
      where.origin = filters.origin;
    }

    const [guests, total] = await Promise.all([
      prisma.guest.findMany({
        where,
        include: {
          _count: {
            select: { bookings: true },
          },
        },
        orderBy: { name: "asc" },
        skip,
        take: limit,
      }),
      prisma.guest.count({ where }),
    ]);

    return {
      success: true,
      guests: guests.map((g) => ({
        ...g,
        _count: g._count,
      })),
      total,
    };
  } catch (error) {
    console.error("Erro ao listar hóspedes:", error);
    return {
      success: false,
      guests: [],
      total: 0,
      error: "Erro interno ao listar hóspedes",
    };
  }
}

/**
 * Buscar hóspede por ID
 */
export async function getGuest(id: string): Promise<GuestActionResult> {
  try {
    const guest = await prisma.guest.findUnique({
      where: { id },
    });

    if (!guest) {
      return { success: false, error: "Hóspede não encontrado" };
    }

    return {
      success: true,
      guest,
    };
  } catch (error) {
    console.error("Erro ao buscar hóspede:", error);
    return { success: false, error: "Erro interno ao buscar hóspede" };
  }
}

/**
 * Buscar hóspede por CPF
 */
export async function getGuestByCpf(
  cpf: string
): Promise<GuestActionResult> {
  try {
    const normalizedCpf = normalizeCpf(cpf);

    const guest = await prisma.guest.findFirst({
      where: {
        cpf: {
          contains: normalizedCpf,
        },
      },
    });

    if (!guest) {
      return { success: false, error: "Hóspede não encontrado" };
    }

    return {
      success: true,
      guest,
    };
  } catch (error) {
    console.error("Erro ao buscar hóspede por CPF:", error);
    return { success: false, error: "Erro interno ao buscar hóspede" };
  }
}

/**
 * Criar um novo hóspede
 */
export async function createGuest(
  input: CreateGuestInput
): Promise<GuestActionResult> {
  try {
    // Verificar autenticação
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      return { success: false, error: "Não autenticado" };
    }

    // Validar input
    const validated = createGuestSchema.safeParse(input);
    if (!validated.success) {
      return {
        success: false,
        error: validated.error.issues[0].message,
      };
    }

    // Normalizar CPF
    const normalizedCpf = normalizeCpf(validated.data.cpf);

    // Verificar se CPF já existe
    const existingGuest = await prisma.guest.findFirst({
      where: { cpf: normalizedCpf },
    });

    if (existingGuest) {
      return { success: false, error: "Já existe um hóspede com este CPF" };
    }

    const guest = await prisma.guest.create({
      data: {
        ...validated.data,
        cpf: normalizedCpf,
        email: validated.data.email || null,
      },
    });

    revalidatePath("/guests");

    return {
      success: true,
      message: "Hóspede cadastrado com sucesso!",
      guest,
    };
  } catch (error) {
    console.error("Erro ao criar hóspede:", error);
    return { success: false, error: "Erro interno ao criar hóspede" };
  }
}

/**
 * Atualizar um hóspede
 */
export async function updateGuest(
  input: UpdateGuestInput
): Promise<GuestActionResult> {
  try {
    // Verificar autenticação
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      return { success: false, error: "Não autenticado" };
    }

    // Validar input
    const validated = updateGuestSchema.safeParse(input);
    if (!validated.success) {
      return {
        success: false,
        error: validated.error.issues[0].message,
      };
    }

    const { id, cpf, ...rest } = validated.data;

    // Se CPF está sendo atualizado, normalizar e verificar duplicidade
    let updateData: Prisma.GuestUpdateInput = { ...rest };
    if (cpf) {
      const normalizedCpf = normalizeCpf(cpf);
      const existingGuest = await prisma.guest.findFirst({
        where: {
          cpf: normalizedCpf,
          id: { not: id },
        },
      });

      if (existingGuest) {
        return { success: false, error: "Já existe um hóspede com este CPF" };
      }

      updateData.cpf = normalizedCpf;
    }

    const guest = await prisma.guest.update({
      where: { id },
      data: updateData,
    });

    revalidatePath("/guests");

    return {
      success: true,
      message: "Hóspede atualizado com sucesso!",
      guest,
    };
  } catch (error) {
    console.error("Erro ao atualizar hóspede:", error);
    return { success: false, error: "Erro interno ao atualizar hóspede" };
  }
}

/**
 * Excluir um hóspede
 */
export async function deleteGuest(id: string): Promise<GuestActionResult> {
  try {
    // Verificar autenticação
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      return { success: false, error: "Não autenticado" };
    }

    // Verificar se tem reservas
    const bookingsCount = await prisma.booking.count({
      where: { guestId: id },
    });

    if (bookingsCount > 0) {
      return {
        success: false,
        error: `Não é possível excluir hóspede com ${bookingsCount} reserva(s). Considere apenas desativar.`,
      };
    }

    await prisma.guest.delete({ where: { id } });

    revalidatePath("/guests");

    return {
      success: true,
      message: "Hóspede excluído com sucesso!",
    };
  } catch (error) {
    console.error("Erro ao excluir hóspede:", error);
    return { success: false, error: "Erro interno ao excluir hóspede" };
  }
}

/**
 * Obter histórico de estadias do hóspede
 */
export async function getGuestHistory(
  id: string
): Promise<{ success: boolean; guest?: GuestWithHistory; error?: string }> {
  try {
    const guest = await prisma.guest.findUnique({
      where: { id },
      include: {
        bookings: {
          include: {
            room: { select: { name: true } },
          },
          orderBy: { checkIn: "desc" },
        },
      },
    });

    if (!guest) {
      return { success: false, error: "Hóspede não encontrado" };
    }

    return {
      success: true,
      guest: {
        ...guest,
        bookings: guest.bookings.map((b) => ({
          id: b.id,
          bookingNumber: b.bookingNumber,
          roomName: b.room.name,
          checkIn: b.checkIn,
          checkOut: b.checkOut,
          status: b.status,
          totalAmount: b.totalAmount.toNumber(),
        })),
      },
    };
  } catch (error) {
    console.error("Erro ao buscar histórico:", error);
    return { success: false, error: "Erro interno ao buscar histórico" };
  }
}

/**
 * Buscar ou criar hóspede (para nova reserva)
 */
export async function getOrCreateGuest(
  input: CreateGuestInput
): Promise<GuestActionResult> {
  try {
    // Verificar autenticação
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      return { success: false, error: "Não autenticado" };
    }

    // Validar input
    const validated = createGuestSchema.safeParse(input);
    if (!validated.success) {
      return {
        success: false,
        error: validated.error.issues[0].message,
      };
    }

    const normalizedCpf = normalizeCpf(validated.data.cpf);

    // Tentar encontrar hóspede existente
    let guest = await prisma.guest.findFirst({
      where: { cpf: normalizedCpf },
    });

    if (guest) {
      // Atualizar dados se necessário
      guest = await prisma.guest.update({
        where: { id: guest.id },
        data: {
          name: validated.data.name,
          phone: validated.data.phone,
          email: validated.data.email || null,
          origin: validated.data.origin,
        },
      });

      return {
        success: true,
        message: "Hóspede encontrado e atualizado!",
        guest,
      };
    }

    // Criar novo hóspede
    guest = await prisma.guest.create({
      data: {
        ...validated.data,
        cpf: normalizedCpf,
        email: validated.data.email || null,
      },
    });

    revalidatePath("/guests");

    return {
      success: true,
      message: "Hóspede cadastrado com sucesso!",
      guest,
    };
  } catch (error) {
    console.error("Erro ao buscar/criar hóspede:", error);
    return { success: false, error: "Erro interno ao buscar/criar hóspede" };
  }
}
