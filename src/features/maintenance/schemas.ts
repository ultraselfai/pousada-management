/**
 * Maintenance Schemas
 *
 * Schemas Zod para validação de dados de manutenções.
 */

import { z } from "zod";

export const createMaintenanceSchema = z.object({
  roomId: z.string().min(1, "Quarto é obrigatório"),
  type: z.enum(["CLEANING", "REPAIR", "INSPECTION"]),
  priority: z.enum(["LOW", "MEDIUM", "HIGH"]).optional().default("MEDIUM"),
  description: z.string().optional(),
  assignedTo: z.string().optional(),
});

export const updateMaintenanceSchema = z.object({
  type: z.enum(["CLEANING", "REPAIR", "INSPECTION"]).optional(),
  status: z.enum(["PENDING", "IN_PROGRESS", "COMPLETED"]).optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH"]).optional(),
  description: z.string().optional(),
  assignedTo: z.string().optional(),
});

export type CreateMaintenanceSchema = z.infer<typeof createMaintenanceSchema>;
export type UpdateMaintenanceSchema = z.infer<typeof updateMaintenanceSchema>;
