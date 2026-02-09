"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/db";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { createUserSchema, updateUserSchema, type CreateUserInput, type UpdateUserInput } from "./schemas";

export async function getUsers() {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    
    // Only Admin/Owner can list users
    if (!session?.user || (session.user.role !== "admin" && session.user.role !== "owner")) {
      // return empty or throw? safe is empty
      return [];
    }

    const users = await prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        permissions: true,
        createdAt: true,
        image: true,
        banned: true,
      },
    });
    return users;
  } catch (error) {
    console.error("Erro ao listar usuários:", error);
    return [];
  }
}

export async function createUser(input: CreateUserInput) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    // Check if user is admin/owner
    if (!session?.user || (session.user.role !== "admin" && session.user.role !== "owner")) {
      return { success: false, error: "Sem permissão (Admin required)" };
    }

    const validated = createUserSchema.safeParse(input);
    if (!validated.success) {
      return { success: false, error: validated.error.issues[0].message };
    }

    const { name, email, password, role, permissions } = validated.data;

    // Create user using Better Auth API
    const result = await auth.api.signUpEmail({
      body: {
        email,
        password,
        name,
      }
    });

    if (!result?.user) {
      return { success: false, error: "Erro ao criar usuário no Auth System" };
    }

    // Update permissions (and role if signUp didn't set it correctly)
    await prisma.user.update({
      where: { id: result.user.id },
      data: {
        permissions,
        role, // Ensure role is set
      },
    });

    revalidatePath("/settings/users");
    return { success: true, message: "Usuário criado com sucesso" };
  } catch (error: any) {
    console.error("Erro ao criar usuário:", error);
    return { success: false, error: error.message || "Erro interno" };
  }
}

export async function updateUser(input: UpdateUserInput) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user || (session.user.role !== "admin" && session.user.role !== "owner")) {
      return { success: false, error: "Sem permissão" };
    }

    const validated = updateUserSchema.safeParse(input);
    if (!validated.success) {
      return { success: false, error: validated.error.issues[0].message };
    }

    const { id, name, email, role, permissions, password } = validated.data;

    const data: any = {
      permissions,
    };
    if (name) data.name = name;
    if (email) data.email = email;
    if (role) data.role = role;

    await prisma.user.update({
      where: { id },
      data,
    });
    
    // Password update handling
    if (password && password.length >= 6) {
      try {
        // Admin plugin 'setUserPassword' method
        await (auth.api as any).setUserPassword({
           body: {
             password: password,
             userId: id,
           },
           headers: await headers()
        });
      } catch (pwError) {
        console.error("Erro ao atualizar senha:", pwError);
        // Don't fail the whole request, but log it
      }
    }

    revalidatePath("/settings/users");
    return { success: true, message: "Usuário atualizado com sucesso" };
  } catch (error) {
    console.error("Erro ao atualizar usuário:", error);
    return { success: false, error: "Erro interno" };
  }
}

export async function deleteUser(userId: string) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user || (session.user.role !== "admin" && session.user.role !== "owner")) {
      return { success: false, error: "Sem permissão" };
    }

    // Prevent self-deletion
    if (userId === session.user.id) {
        return { success: false, error: "Não é possível excluir o próprio usuário" };
    }

    await prisma.user.delete({
      where: { id: userId },
    });

    revalidatePath("/settings/users");
    return { success: true, message: "Usuário excluído com sucesso" };
  } catch (error) {
    console.error("Erro ao excluir usuário:", error);
    return { success: false, error: "Erro interno" };
  }
}
