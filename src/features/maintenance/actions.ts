"use server";

/**
 * Maintenance Server Actions
 *
 * Server Actions para gerenciamento de manutenções de quartos.
 */

import { revalidatePath } from "next/cache";
import { prisma } from "@/db";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import {
  createMaintenanceSchema,
  updateMaintenanceSchema,
} from "./schemas";
import type {
  MaintenanceWithRoom,
  MaintenanceActionResult,
  MaintenanceListResult,
  CreateMaintenanceInput,
  UpdateMaintenanceInput,
} from "./types";
import {
  MaintenanceStatus,
  MaintenancePriority,
  MaintenanceType,
} from "@/generated/prisma/client";

const maintenanceInclude = {
  room: {
    select: { id: true, name: true, category: true },
  },
};

/**
 * Listar todas as manutenções
 */
export async function getMaintenances(): Promise<MaintenanceListResult> {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      return { success: false, maintenances: [], total: 0, error: "Não autenticado" };
    }

    const maintenances = await prisma.roomMaintenance.findMany({
      include: maintenanceInclude,
      orderBy: [
        { status: "asc" }, // PENDING first, then IN_PROGRESS, then COMPLETED
        { priority: "desc" }, // HIGH first
        { createdAt: "desc" },
      ],
    });

    return {
      success: true,
      maintenances,
      total: maintenances.length,
    };
  } catch (error) {
    console.error("Erro ao listar manutenções:", error);
    return { success: false, maintenances: [], total: 0, error: "Erro interno" };
  }
}

/**
 * Criar nova manutenção
 */
export async function createMaintenance(
  input: CreateMaintenanceInput
): Promise<MaintenanceActionResult> {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      return { success: false, error: "Não autenticado" };
    }

    const parsed = createMaintenanceSchema.safeParse(input);
    if (!parsed.success) {
      return { success: false, error: parsed.error.errors[0].message };
    }

    const data = parsed.data;

    // Verificar se o quarto existe
    const room = await prisma.room.findUnique({ where: { id: data.roomId } });
    if (!room) {
      return { success: false, error: "Quarto não encontrado" };
    }

    const maintenance = await prisma.roomMaintenance.create({
      data: {
        roomId: data.roomId,
        type: data.type as MaintenanceType,
        priority: (data.priority as MaintenancePriority) || MaintenancePriority.MEDIUM,
        description: data.description,
        assignedTo: data.assignedTo,
      },
      include: maintenanceInclude,
    });

    revalidatePath("/maintenance");
    revalidatePath("/rooms");
    revalidatePath("/overview");

    return {
      success: true,
      message: "Manutenção criada com sucesso!",
      maintenance,
    };
  } catch (error) {
    console.error("Erro ao criar manutenção:", error);
    return { success: false, error: "Erro interno ao criar manutenção" };
  }
}

/**
 * Atualizar manutenção
 */
export async function updateMaintenance(
  id: string,
  input: UpdateMaintenanceInput
): Promise<MaintenanceActionResult> {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      return { success: false, error: "Não autenticado" };
    }

    const parsed = updateMaintenanceSchema.safeParse(input);
    if (!parsed.success) {
      return { success: false, error: parsed.error.errors[0].message };
    }

    const data = parsed.data;

    const existing = await prisma.roomMaintenance.findUnique({ where: { id } });
    if (!existing) {
      return { success: false, error: "Manutenção não encontrada" };
    }

    // Determinar timestamps baseado no status
    let startedAt = existing.startedAt;
    let completedAt = existing.completedAt;

    if (data.status === "IN_PROGRESS" && !existing.startedAt) {
      startedAt = new Date();
    }
    if (data.status === "COMPLETED" && !existing.completedAt) {
      completedAt = new Date();
      if (!startedAt) startedAt = new Date();
    }

    const maintenance = await prisma.roomMaintenance.update({
      where: { id },
      data: {
        type: data.type as MaintenanceType | undefined,
        status: data.status as MaintenanceStatus | undefined,
        priority: data.priority as MaintenancePriority | undefined,
        description: data.description,
        assignedTo: data.assignedTo,
        startedAt,
        completedAt,
      },
      include: maintenanceInclude,
    });

    revalidatePath("/maintenance");
    revalidatePath("/rooms");
    revalidatePath("/overview");

    return {
      success: true,
      message: "Manutenção atualizada com sucesso!",
      maintenance,
    };
  } catch (error) {
    console.error("Erro ao atualizar manutenção:", error);
    return { success: false, error: "Erro interno ao atualizar manutenção" };
  }
}

/**
 * Marcar manutenção como concluída
 */
export async function completeMaintenance(id: string): Promise<MaintenanceActionResult> {
  return updateMaintenance(id, { status: "COMPLETED" });
}

/**
 * Iniciar manutenção (colocar em andamento)
 */
export async function startMaintenance(id: string): Promise<MaintenanceActionResult> {
  return updateMaintenance(id, { status: "IN_PROGRESS" });
}

/**
 * Excluir manutenção
 */
export async function deleteMaintenance(id: string): Promise<MaintenanceActionResult> {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      return { success: false, error: "Não autenticado" };
    }

    const existing = await prisma.roomMaintenance.findUnique({ where: { id } });
    if (!existing) {
      return { success: false, error: "Manutenção não encontrada" };
    }

    await prisma.roomMaintenance.delete({ where: { id } });

    revalidatePath("/maintenance");
    revalidatePath("/rooms");
    revalidatePath("/overview");

    return {
      success: true,
      message: "Manutenção excluída com sucesso!",
    };
  } catch (error) {
    console.error("Erro ao excluir manutenção:", error);
    return { success: false, error: "Erro interno ao excluir manutenção" };
  }
}
