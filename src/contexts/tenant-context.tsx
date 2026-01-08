"use client"

import React, { createContext, useContext } from "react"

/**
 * Contexto do Tenant
 * 
 * Fornece informações da organização atual para todos os componentes
 * dentro do painel do cliente (app)/[tenantId].
 * 
 * Isso permite que componentes como ClientSidebar saibam qual é o
 * tenant atual e possam montar rotas corretas.
 */

export interface TenantData {
  /** ID da organização */
  id: string
  /** Nome da organização */
  name: string
  /** Slug da organização (usado na URL) */
  slug: string
  /** Logo da organização */
  logo: string | null
  /** Features ativas para esta organização */
  allowedFeatures: string[]
  /** Se é organização sandbox (Decode Lab) */
  isSandbox: boolean
}

interface TenantContextType {
  /** Dados da organização atual */
  tenant: TenantData
  /** Prefixo de rota para links (ex: "/decode-lab") */
  routePrefix: string
  /** Verifica se uma feature está ativa */
  hasFeature: (featureKey: string) => boolean
}

const TenantContext = createContext<TenantContextType | null>(null)

interface TenantProviderProps {
  children: React.ReactNode
  tenant: TenantData
}

export function TenantProvider({ children, tenant }: TenantProviderProps) {
  // O prefixo de rota usa o slug da organização
  const routePrefix = `/${tenant.slug}`

  // Função para verificar se feature está ativa
  const hasFeature = (featureKey: string): boolean => {
    // Sandbox tem todas as features
    if (tenant.isSandbox) return true
    // Outros clientes só têm features ativadas
    return tenant.allowedFeatures.includes(featureKey)
  }

  return (
    <TenantContext.Provider value={{ tenant, routePrefix, hasFeature }}>
      {children}
    </TenantContext.Provider>
  )
}

/**
 * Hook para acessar o contexto do tenant
 * 
 * @example
 * ```tsx
 * const { tenant, routePrefix, hasFeature } = useTenant()
 * 
 * // Criar link com prefixo correto
 * <Link href={`${routePrefix}/dashboard`}>Dashboard</Link>
 * 
 * // Verificar se feature está ativa
 * if (hasFeature('calendar')) { ... }
 * ```
 */
export function useTenant(): TenantContextType {
  const context = useContext(TenantContext)
  
  if (!context) {
    throw new Error(
      "useTenant deve ser usado dentro de um TenantProvider. " +
      "Certifique-se de que o componente está dentro de (app)/[tenantId]/layout.tsx"
    )
  }
  
  return context
}

/**
 * Hook opcional que não lança erro se não estiver no contexto
 * Útil para componentes que podem estar dentro ou fora do painel do cliente
 */
export function useTenantOptional(): TenantContextType | null {
  return useContext(TenantContext)
}
