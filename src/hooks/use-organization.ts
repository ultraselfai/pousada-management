/**
 * Hook useOrganization - DEC-19
 * 
 * Fornece acesso à organização ativa do usuário atual.
 * Usado pelo FeatureGuard e outros componentes que precisam
 * verificar features e permissões.
 */

'use client'

import { useActiveOrganization } from '@/lib/auth-client'

export interface OrganizationData {
  id: string
  name: string
  slug: string
  logo: string | null
  metadata: unknown
  allowedFeatures: string[]
  isSandbox: boolean
  createdAt: Date
}

/**
 * Hook para acessar a organização ativa do usuário
 * 
 * Retorna a organização ativa ou null se não houver nenhuma selecionada.
 * 
 * Uso:
 * ```tsx
 * const { organization, isLoading, error } = useOrganization()
 * 
 * if (isLoading) return <Skeleton />
 * if (!organization) return <SelectOrgPrompt />
 * 
 * return <div>{organization.name}</div>
 * ```
 */
export function useOrganization() {
  const { data: activeOrg, isPending, error } = useActiveOrganization()

  // Mapeia para o formato esperado
  const organization: OrganizationData | null = activeOrg ? {
    id: activeOrg.id,
    name: activeOrg.name,
    slug: activeOrg.slug,
    logo: activeOrg.logo || null,
    metadata: activeOrg.metadata,
    // Campos customizados que adicionamos
    allowedFeatures: (activeOrg as any).allowedFeatures || [],
    isSandbox: (activeOrg as any).isSandbox || false,
    createdAt: new Date(activeOrg.createdAt),
  } : null

  return {
    organization,
    isLoading: isPending,
    error: error || null,
  }
}

/**
 * Hook para verificar se o usuário está em uma organização sandbox (Decode Lab)
 */
export function useIsSandbox(): boolean {
  const { organization } = useOrganization()
  return organization?.isSandbox ?? false
}
