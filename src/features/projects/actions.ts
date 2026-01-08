"use server";

/**
 * Projects Server Actions - DEC-28
 *
 * Server Actions para gerenciamento de projetos (formulários/briefings).
 * Inclui criação, listagem, atualização e submissão de formulários.
 */

import { revalidatePath } from "next/cache";
import { prisma } from "@/db";
import { Prisma } from "@/generated/prisma/client";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import {
  createProjectSchema,
  updateProjectSchema,
  submitFormSchema,
  type CreateProjectInput,
  type UpdateProjectInput,
  type SubmitFormInput,
} from "./schemas";
import type {
  ProjectActionResult,
  SubmissionActionResult,
  ProjectWithCount,
  ProjectsListResult,
} from "./types";

/**
 * Criar um novo projeto
 */
export async function createProject(
  input: CreateProjectInput
): Promise<ProjectActionResult> {
  try {
    // Validar input
    const validated = createProjectSchema.safeParse(input);
    if (!validated.success) {
      return {
        success: false,
        error: validated.error.issues[0].message,
      };
    }

    // Verificar autenticação
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      return { success: false, error: "Não autenticado" };
    }

    // Verificar se slug já existe
    const existingProject = await prisma.project.findUnique({
      where: { slug: validated.data.slug },
    });

    if (existingProject) {
      return { success: false, error: "Já existe um projeto com este slug" };
    }

    // Criar projeto
    const project = await prisma.project.create({
      data: {
        name: validated.data.name,
        slug: validated.data.slug,
        description: validated.data.description,
        organizationId: validated.data.organizationId,
      },
    });

    revalidatePath(`/decode-lab/projects`);

    return {
      success: true,
      message: "Projeto criado com sucesso!",
      project,
    };
  } catch (error) {
    console.error("Erro ao criar projeto:", error);
    return {
      success: false,
      error: "Erro interno ao criar projeto",
    };
  }
}

/**
 * Listar projetos de uma organização
 */
export async function listProjects(
  organizationId: string
): Promise<ProjectsListResult> {
  try {
    const [projects, total] = await Promise.all([
      prisma.project.findMany({
        where: { organizationId },
        include: {
          _count: {
            select: { submissions: true },
          },
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.project.count({ where: { organizationId } }),
    ]);

    return { projects: projects as ProjectWithCount[], total };
  } catch (error) {
    console.error("Erro ao listar projetos:", error);
    return { projects: [], total: 0 };
  }
}

/**
 * Buscar projeto por ID
 */
export async function getProject(id: string) {
  try {
    const project = await prisma.project.findUnique({
      where: { id },
      include: {
        _count: {
          select: { submissions: true },
        },
      },
    });

    return project;
  } catch (error) {
    console.error("Erro ao buscar projeto:", error);
    return null;
  }
}

/**
 * Buscar projeto por slug (para formulário público)
 */
export async function getProjectBySlug(slug: string) {
  try {
    const project = await prisma.project.findUnique({
      where: { slug },
    });

    return project;
  } catch (error) {
    console.error("Erro ao buscar projeto por slug:", error);
    return null;
  }
}

/**
 * Atualizar projeto
 */
export async function updateProject(
  input: UpdateProjectInput
): Promise<ProjectActionResult> {
  try {
    // Validar input
    const validated = updateProjectSchema.safeParse(input);
    if (!validated.success) {
      return {
        success: false,
        error: validated.error.issues[0].message,
      };
    }

    // Verificar autenticação
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      return { success: false, error: "Não autenticado" };
    }

    // Atualizar projeto
    const project = await prisma.project.update({
      where: { id: validated.data.id },
      data: {
        ...(validated.data.name && { name: validated.data.name }),
        ...(validated.data.description !== undefined && {
          description: validated.data.description,
        }),
      },
    });

    revalidatePath(`/decode-lab/projects`);

    return {
      success: true,
      message: "Projeto atualizado com sucesso!",
      project,
    };
  } catch (error) {
    console.error("Erro ao atualizar projeto:", error);
    return {
      success: false,
      error: "Erro interno ao atualizar projeto",
    };
  }
}

/**
 * Deletar projeto
 */
export async function deleteProject(id: string): Promise<ProjectActionResult> {
  try {
    // Verificar autenticação
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      return { success: false, error: "Não autenticado" };
    }

    // Deletar projeto (e submissions em cascata via Prisma)
    await prisma.project.delete({
      where: { id },
    });

    revalidatePath(`/decode-lab/projects`);

    return {
      success: true,
      message: "Projeto excluído com sucesso!",
    };
  } catch (error) {
    console.error("Erro ao deletar projeto:", error);
    return {
      success: false,
      error: "Erro interno ao excluir projeto",
    };
  }
}

/**
 * Submeter formulário (público - não requer autenticação)
 */
export async function submitForm(
  input: SubmitFormInput
): Promise<SubmissionActionResult> {
  try {
    // Validar input
    const validated = submitFormSchema.safeParse(input);
    if (!validated.success) {
      return {
        success: false,
        error: validated.error.issues[0].message,
      };
    }

    // Verificar se projeto existe
    const project = await prisma.project.findUnique({
      where: { id: validated.data.projectId },
    });

    if (!project) {
      return { success: false, error: "Projeto não encontrado" };
    }

    // Criar submission
    const submission = await prisma.submission.create({
      data: {
        projectId: validated.data.projectId,
        data: validated.data.data as Prisma.InputJsonValue,
      },
    });

    // Não revalidamos o path público, apenas o admin
    revalidatePath(`/decode-lab/projects`);

    return {
      success: true,
      message: "Formulário enviado com sucesso!",
      submission,
    };
  } catch (error) {
    console.error("Erro ao submeter formulário:", error);
    return {
      success: false,
      error: "Erro interno ao enviar formulário",
    };
  }
}

/**
 * Listar submissions de um projeto
 */
export async function listSubmissions(projectId: string) {
  try {
    const submissions = await prisma.submission.findMany({
      where: { projectId },
      orderBy: { createdAt: "desc" },
    });

    return submissions;
  } catch (error) {
    console.error("Erro ao listar submissions:", error);
    return [];
  }
}

/**
 * Marcar submission como visualizada
 */
export async function markSubmissionAsViewed(id: string) {
  try {
    await prisma.submission.update({
      where: { id },
      data: { viewed: true },
    });

    revalidatePath(`/decode-lab/projects`);
    return { success: true };
  } catch (error) {
    console.error("Erro ao marcar submission como lida:", error);
    return { success: false };
  }
}

/**
 * Buscar uma submission específica por ID
 */
export async function getSubmission(id: string) {
  try {
    const submission = await prisma.submission.findUnique({
      where: { id },
    });

    return submission;
  } catch (error) {
    console.error("Erro ao buscar submission:", error);
    return null;
  }
}

/**
 * Deletar uma submission específica
 */
export async function deleteSubmission(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    // Verificar autenticação
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      return { success: false, error: "Não autenticado" };
    }

    // Deletar submission
    await prisma.submission.delete({
      where: { id },
    });

    revalidatePath(`/decode-lab/projects`);

    return { success: true };
  } catch (error) {
    console.error("Erro ao deletar submission:", error);
    return {
      success: false,
      error: "Erro interno ao excluir resposta",
    };
  }
}

