import { prisma } from "@/db"
import { notFound } from "next/navigation"
import { headers } from "next/headers"
import { auth } from "@/lib/auth"
import { ClientLayoutWrapper } from "./client-layout-wrapper"
import type { TenantData } from "@/contexts/tenant-context"

/**
 * App Layout - Painel do Cliente (Tenant)
 * 
 * Este layout é usado para o produto que o cliente usa.
 * Foco em features de negócio, não em gestão interna.
 * 
 * O tenantId é extraído da URL e usado para contextualizar
 * todas as operações dentro deste layout.
 * 
 * IMPORTANTE: As rotas do cliente são ISOLADAS das rotas admin.
 * - Admin: /dashboard, /calendar, etc. (dentro de (admin))
 * - Cliente: /[tenantId]/dashboard, /[tenantId]/calendar (dentro de (app)/[tenantId])
 */

interface AppTenantLayoutProps {
  children: React.ReactNode
  params: Promise<{ tenantId: string }>
}

async function getOrganizationData(tenantId: string): Promise<TenantData | null> {
  // Primeiro tenta buscar por ID
  let org = await prisma.organization.findUnique({
    where: { id: tenantId },
    select: {
      id: true,
      name: true,
      slug: true,
      logo: true,
      allowedFeatures: true,
      isSandbox: true,
    },
  })
  
  // Se não encontrou por ID, tenta por slug
  if (!org) {
    org = await prisma.organization.findUnique({
      where: { slug: tenantId },
      select: {
        id: true,
        name: true,
        slug: true,
        logo: true,
        allowedFeatures: true,
        isSandbox: true,
      },
    })
  }
  
  return org
}

async function getSessionInfo() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    })
    
    return {
      userId: session?.user?.id || null,
      userName: session?.user?.name || null,
      impersonatedBy: session?.session?.impersonatedBy || null,
    }
  } catch {
    return {
      userId: null,
      userName: null,
      impersonatedBy: null,
    }
  }
}

export default async function AppTenantLayout({
  children,
  params,
}: AppTenantLayoutProps) {
  const { tenantId } = await params
  
  const [tenant, sessionInfo] = await Promise.all([
    getOrganizationData(tenantId),
    getSessionInfo(),
  ])
  
  if (!tenant) {
    notFound()
  }

  return (
    <ClientLayoutWrapper 
      tenant={tenant}
      impersonatedBy={sessionInfo.impersonatedBy}
      userName={sessionInfo.userName}
    >
      {children}
    </ClientLayoutWrapper>
  )
}
