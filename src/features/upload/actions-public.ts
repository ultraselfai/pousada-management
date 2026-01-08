"use server";

import { getPresignedUploadUrl, getPublicUrl } from "@/lib/r2";

export type PublicUploadUrlResponse =
  | {
      success: true;
      uploadUrl: string;
      publicUrl: string;
      key: string;
    }
  | {
      success: false;
      error: string;
    };

/**
 * Verifica se o R2 está configurado
 */
function isR2Configured(): boolean {
  return !!(
    process.env.R2_ACCOUNT_ID &&
    process.env.R2_ACCESS_KEY_ID &&
    process.env.R2_SECRET_ACCESS_KEY &&
    process.env.R2_BUCKET_NAME &&
    process.env.R2_PUBLIC_URL
  );
}

/**
 * Gera uma URL pré-assinada para upload público (sem autenticação)
 * Usado em formulários públicos como o briefing
 */
export async function generatePublicUploadUrl(
  filename: string,
  contentType: string,
  formSlug: string
): Promise<PublicUploadUrlResponse> {
  try {
    // Verificar se R2 está configurado
    if (!isR2Configured()) {
      console.error("R2 não está configurado. Verifique as variáveis de ambiente.");
      return {
        success: false,
        error: "Upload não disponível. Storage não configurado.",
      };
    }

    // Validar tipo de arquivo - apenas imagens
    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/gif",
      "image/webp",
    ];

    if (!allowedTypes.includes(contentType)) {
      return {
        success: false,
        error: `Tipo de arquivo não permitido: ${contentType}`,
      };
    }

    // Organizar por slug do form para facilitar gestão
    const folder = `forms/${formSlug}`;
    const { url, key } = await getPresignedUploadUrl(filename, contentType, folder);
    const publicUrl = getPublicUrl(key);

    return {
      success: true,
      uploadUrl: url,
      publicUrl,
      key,
    };
  } catch (error) {
    console.error("Erro ao gerar URL de upload público:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erro interno ao processar upload.",
    };
  }
}
