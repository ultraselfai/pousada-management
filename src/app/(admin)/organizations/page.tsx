/**
 * Página de Clientes (Organizações) - DEC-20
 * 
 * Painel Admin para gerenciar as organizações (clientes) do SaaS.
 * Permite visualizar, criar, editar e gerenciar features de cada cliente.
 */

import { Suspense } from "react"
import { StatCards } from "./components/stat-cards"
import { ClientsDataTable } from "./components/data-table"
import { prisma } from "@/db"
import { getActivatableFeatures } from "@/config/features"

// Força a página a ser dinâmica (não pré-renderizada no build)
export const dynamic = 'force-dynamic'

// Busca as organizações do banco
async function getOrganizations() {
  const organizations = await prisma.organization.findMany({
    include: {
      _count: {
        select: { members: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  })

  return organizations.map(org => ({
    id: org.id,
    name: org.name,
    slug: org.slug,
    logo: org.logo,
    plan: (org.metadata as any)?.plan || 'Free',
    status: org.isSandbox ? 'Sandbox' : 'Active',
    allowedFeatures: org.allowedFeatures,
    isSandbox: org.isSandbox,
    memberCount: org._count.members,
    createdAt: org.createdAt.toISOString().split('T')[0],
  }))
}

// Busca estatísticas para os cards
async function getStats() {
  const [totalOrgs, activeOrgs, totalMembers] = await Promise.all([
    prisma.organization.count(),
    prisma.organization.count({ where: { isSandbox: false } }),
    prisma.member.count(),
  ])

  return {
    totalClients: totalOrgs,
    activeClients: activeOrgs,
    totalMembers,
    sandboxCount: totalOrgs - activeOrgs,
  }
}

export const metadata = {
  title: "Clientes | Decode Console Admin",
  description: "Gestão de clientes (organizações) do Decode Console",
}

export default async function ClientsPage() {
  const [organizations, stats, features] = await Promise.all([
    getOrganizations(),
    getStats(),
    Promise.resolve(getActivatableFeatures()),
  ])

  return (
    <div className="flex flex-col gap-4">
      <div className="@container/main px-4 lg:px-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold tracking-tight">Clientes</h1>
          <p className="text-muted-foreground">
            Gerencie as organizações e seus módulos contratados
          </p>
        </div>
        <Suspense fallback={<div>Carregando...</div>}>
          <StatCards stats={stats} />
        </Suspense>
      </div>
      
      <div className="@container/main px-4 lg:px-6 mt-8 lg:mt-12">
        <Suspense fallback={<div>Carregando...</div>}>
          <ClientsDataTable 
            organizations={organizations}
            availableFeatures={features}
          />
        </Suspense>
      </div>
    </div>
  )
}
