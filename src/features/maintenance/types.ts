/**
 * Maintenance Types
 *
 * Tipos TypeScript para o módulo de manutenções.
 */

import type {
  RoomMaintenance as PrismaRoomMaintenance,
  Room,
  MaintenanceType,
  MaintenanceStatus,
  MaintenancePriority,
} from "@/generated/prisma/client";

// Re-export enums para uso em componentes
export type { MaintenanceType, MaintenanceStatus, MaintenancePriority };

// Manutenção com dados do quarto
export interface MaintenanceWithRoom extends PrismaRoomMaintenance {
  room: Pick<Room, "id" | "name" | "category">;
}

// Result type para actions
export interface MaintenanceActionResult {
  success: boolean;
  error?: string;
  message?: string;
  maintenance?: MaintenanceWithRoom;
}

// Lista de manutenções
export interface MaintenanceListResult {
  success: boolean;
  maintenances: MaintenanceWithRoom[];
  total: number;
  error?: string;
}

// Input para criar manutenção
export interface CreateMaintenanceInput {
  roomId: string;
  type: MaintenanceType;
  priority?: MaintenancePriority;
  description?: string;
  assignedTo?: string;
}

// Input para atualizar manutenção
export interface UpdateMaintenanceInput {
  type?: MaintenanceType;
  status?: MaintenanceStatus;
  priority?: MaintenancePriority;
  description?: string;
  assignedTo?: string;
}
