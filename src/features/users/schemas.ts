import { z } from "zod";

export const createUserSchema = z.object({
  name: z.string().min(2, "Nome deve ter no mínimo 2 caracteres"),
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "Senha deve ter no mínimo 6 caracteres"),
  role: z.enum(["admin", "user"]).default("user"),
  permissions: z.array(z.string()).default([]),
});

export const updateUserSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(2).optional(),
  email: z.string().email().optional(),
  role: z.enum(["admin", "user"]).optional(),
  permissions: z.array(z.string()).optional(),
  // Password update might be separate or optional here
  password: z.string().min(6).optional().or(z.literal("")),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
