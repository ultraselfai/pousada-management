"use server";

import { getPresignedUploadUrl, getPublicUrl } from "@/lib/r2";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export type UploadUrlResponse = {
  success: true;
  uploadUrl: string;
  publicUrl: string;
  key: string;
} | {
  success: false;
  error: string;
};

/**
 * Gera uma URL pré-assinada para upload direto ao R2
 * O cliente faz PUT diretamente para o R2, sem passar pelo servidor
 */
export async function generateUploadUrl(
  filename: string,
  contentType: string,
  folder: string = "uploads"
): Promise<UploadUrlResponse> {
  try {
    // Verificar autenticação
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return {
        success: false,
        error: "Não autorizado. Faça login para fazer upload.",
      };
    }

    // Validar tipo de arquivo
    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/gif",
      "image/webp",
      "image/svg+xml",
      "application/pdf",
      "text/plain",
      "text/csv",
    ];

    if (!allowedTypes.includes(contentType)) {
      return {
        success: false,
        error: `Tipo de arquivo não permitido: ${contentType}`,
      };
    }

    // Gerar URL pré-assinada (inclui user ID no folder para segurança)
    const userFolder = `${folder}/${session.user.id}`;
    const { url, key } = await getPresignedUploadUrl(filename, contentType, userFolder);
    const publicUrl = getPublicUrl(key);

    return {
      success: true,
      uploadUrl: url,
      publicUrl,
      key,
    };
  } catch (error) {
    console.error("Erro ao gerar URL de upload:", error);
    return {
      success: false,
      error: "Erro interno ao processar upload.",
    };
  }
}

/**
 * Valida que um arquivo foi uploadado com sucesso
 * Pode ser usado após o upload para confirmar
 */
export async function confirmUpload(key: string): Promise<{ success: boolean; publicUrl?: string; error?: string }> {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return {
        success: false,
        error: "Não autorizado.",
      };
    }

    // Verificar se o key pertence ao usuário
    if (!key.includes(session.user.id)) {
      return {
        success: false,
        error: "Acesso negado a este arquivo.",
      };
    }

    const publicUrl = getPublicUrl(key);
    
    return {
      success: true,
      publicUrl,
    };
  } catch (error) {
    console.error("Erro ao confirmar upload:", error);
    return {
      success: false,
      error: "Erro ao confirmar upload.",
    };
  }
}
