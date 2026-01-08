/**
 * Página de Detalhes do Cliente - DEC-20
 * 
 * Exibe e permite editar todos os dados de um cliente:
 * - Dados da organização (nome, slug, plano)
 * - Dados do usuário owner (nome, email, senha)
 * - Gestão de features disponíveis
 */

import { notFound } from 'next/navigation'
import { prisma } from '@/db'
import { getActivatableFeatures } from '@/config/features'
import { ClientDetailsForm } from './components/client-details-form'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

// Força a página a ser dinâmica
export const dynamic = 'force-dynamic'

interface PageProps {
  params: Promise<{ id: string }>
}

async function getClientData(clientId: string) {
  const org = await prisma.organization.findUnique({
    where: { id: clientId },
    include: {
      members: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
              role: true,
              banned: true,
              createdAt: true,
            },
          },
        },
        orderBy: { createdAt: 'asc' },
      },
    },
  })

  if (!org) return null

  return {
    id: org.id,
    name: org.name,
    slug: org.slug,
    logo: org.logo,
    plan: (org.metadata as any)?.plan || 'Free',
    status: org.isSandbox ? 'Sandbox' : 'Active',
    allowedFeatures: org.allowedFeatures,
    isSandbox: org.isSandbox,
    createdAt: org.createdAt.toISOString(),
    updatedAt: org.updatedAt.toISOString(),
    members: org.members.map(m => ({
      id: m.id,
      userId: m.userId,
      role: m.role,
      user: {
        id: m.user.id,
        name: m.user.name,
        email: m.user.email,
        image: m.user.image,
        role: m.user.role,
        banned: m.user.banned,
        createdAt: m.user.createdAt.toISOString(),
      },
    })),
  }
}

export async function generateMetadata({ params }: PageProps) {
  const { id } = await params
  const client = await getClientData(id)
  
  if (!client) {
    return { title: 'Cliente não encontrado' }
  }

  return {
    title: `${client.name} | Clientes | Decode Console Admin`,
    description: `Gerenciar cliente ${client.name}`,
  }
}

export default async function ClientDetailsPage({ params }: PageProps) {
  const { id } = await params
  const [client, features] = await Promise.all([
    getClientData(id),
    Promise.resolve(getActivatableFeatures()),
  ])

  if (!client) {
    notFound()
  }

  // Encontra o owner (primeiro membro ou role owner)
  const owner = client.members.find(m => m.role === 'owner') || client.members[0]

  return (
    <div className="flex flex-col gap-6">
      <div className="px-4 lg:px-6">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/organizations">
              <ArrowLeft className="size-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{client.name}</h1>
            <p className="text-muted-foreground">
              decode.app/{client.slug} • Criado em {new Date(client.createdAt).toLocaleDateString('pt-BR')}
            </p>
          </div>
        </div>
        
        <ClientDetailsForm 
          client={client}
          owner={owner}
          availableFeatures={features}
        />
      </div>
    </div>
  )
}
