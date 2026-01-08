import { headers } from "next/headers";
import { cache } from "react";
import { prisma } from "@/db";

/**
 * Obtém o slug do tenant atual a partir dos headers
 * Definido pelo middleware baseado no subdomínio
 */
export const getTenantSlug = cache(async (): Promise<string | null> => {
  const headersList = await headers();
  return headersList.get("x-tenant-slug");
});

/**
 * Obtém a organização (tenant) atual do banco de dados
 * Retorna null se não houver tenant ou se não existir
 */
export const getCurrentTenant = cache(async () => {
  const slug = await getTenantSlug();
  
  if (!slug) {
    return null;
  }
  
  const organization = await prisma.organization.findUnique({
    where: { slug },
  });
  
  return organization;
});

/**
 * Obtém o tenant e lança erro se não existir
 * Use em rotas que REQUEREM um tenant válido
 */
export async function requireTenant() {
  const tenant = await getCurrentTenant();
  
  if (!tenant) {
    throw new Error("Tenant não encontrado");
  }
  
  return tenant;
}

/**
 * Verifica se o usuário atual é membro do tenant
 */
export async function isUserMemberOfTenant(userId: string): Promise<boolean> {
  const tenant = await getCurrentTenant();
  
  if (!tenant) {
    return false;
  }
  
  const member = await prisma.member.findFirst({
    where: {
      organizationId: tenant.id,
      userId,
    },
  });
  
  return !!member;
}

/**
 * Obtém o membro atual (usuário + organização)
 */
export async function getCurrentMember(userId: string) {
  const tenant = await getCurrentTenant();
  
  if (!tenant) {
    return null;
  }
  
  const member = await prisma.member.findFirst({
    where: {
      organizationId: tenant.id,
      userId,
    },
    include: {
      user: true,
      organization: true,
    },
  });
  
  return member;
}
