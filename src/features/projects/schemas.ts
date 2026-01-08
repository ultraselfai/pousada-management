import { z } from "zod";

/**
 * Projects Validation Schemas - DEC-28
 *
 * Schemas Zod para validação de dados de projetos (formulários/briefings).
 */

/**
 * Schema para criar um novo projeto
 */
export const createProjectSchema = z.object({
  name: z
    .string()
    .min(2, { error: "Nome deve ter no mínimo 2 caracteres" })
    .max(100, { error: "Nome deve ter no máximo 100 caracteres" }),
  slug: z
    .string()
    .min(2, { error: "Slug deve ter no mínimo 2 caracteres" })
    .max(50, { error: "Slug deve ter no máximo 50 caracteres" })
    .regex(
      /^[a-z0-9-]+$/,
      { error: "Slug deve conter apenas letras minúsculas, números e hífens" }
    ),
  description: z
    .string()
    .max(500, { error: "Descrição deve ter no máximo 500 caracteres" })
    .optional(),
  organizationId: z.string().min(1, { error: "Organization ID é obrigatório" }),
});

/**
 * Schema para atualizar um projeto
 */
export const updateProjectSchema = z.object({
  id: z.string().min(1, { error: "Project ID é obrigatório" }),
  name: z
    .string()
    .min(2, { error: "Nome deve ter no mínimo 2 caracteres" })
    .max(100, { error: "Nome deve ter no máximo 100 caracteres" })
    .optional(),
  description: z
    .string()
    .max(500, { error: "Descrição deve ter no máximo 500 caracteres" })
    .optional()
    .nullable(),
});

/**
 * Schema para submissão de formulário (público)
 * O campo data é flexível para aceitar qualquer estrutura de formulário
 */
export const submitFormSchema = z.object({
  projectId: z.string().min(1, { error: "Project ID é obrigatório" }),
  data: z.record(z.string(), z.unknown()).refine(
    (data) => Object.keys(data).length > 0,
    { message: "Dados do formulário são obrigatórios" }
  ),
});

// Tipos inferidos dos schemas
export type CreateProjectInput = z.infer<typeof createProjectSchema>;
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;
export type SubmitFormInput = z.infer<typeof submitFormSchema>;
