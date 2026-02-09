import { redirect } from "next/navigation"
import { prisma } from "@/db"

/**
 * Página raiz do tenant - Redireciona para o dashboard
 * 
 * Quando o usuário acessa /[tenantId], ele é redirecionado
 * automaticamente para /[tenantId]/dashboard
 */

interface TenantRootPageProps {
  params: Promise<{ tenantId: string }>;
}

export default async function TenantRootPage({ params }: TenantRootPageProps) {
  const { tenantId } = await params;

  // Busca a organização para obter o slug correto
  let org = await prisma.organization.findUnique({
    where: { id: tenantId },
    select: { slug: true },
  })
  
  if (!org) {
    org = await prisma.organization.findUnique({
      where: { slug: tenantId },
      select: { slug: true },
    })
  }

  // Redireciona para o dashboard usando o slug
  const slug = org?.slug || tenantId
  redirect(`/${slug}/dashboard`)
}
