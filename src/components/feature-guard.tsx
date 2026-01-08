'use client'

import React from 'react'
import { useOrganization } from '@/hooks/use-organization'
import { hasFeatureAccess, type OrganizationForFeatureCheck } from '@/lib/feature-access'

interface FeatureGuardProps {
  /** Key da feature a verificar */
  feature: string
  /** Conteúdo a renderizar se tem acesso */
  children: React.ReactNode
  /** Conteúdo alternativo se não tem acesso (opcional) */
  fallback?: React.ReactNode
  /** Se true, mostra loading enquanto carrega org */
  showLoading?: boolean
}

/**
 * FeatureGuard - Componente Client para ocultar UI baseado em features
 * 
 * DEC-19: Esconde botões/abas/seções automaticamente se o usuário
 * não tem acesso à feature.
 * 
 * Uso:
 * ```tsx
 * <FeatureGuard feature="financeiro">
 *   <FinanceiroButton />
 * </FeatureGuard>
 * ```
 * 
 * Com fallback:
 * ```tsx
 * <FeatureGuard feature="mail" fallback={<UpgradePrompt />}>
 *   <MailInbox />
 * </FeatureGuard>
 * ```
 */
export function FeatureGuard({
  feature,
  children,
  fallback = null,
  showLoading = false,
}: FeatureGuardProps) {
  const { organization, isLoading } = useOrganization()

  // Loading state
  if (isLoading && showLoading) {
    return (
      <div className="animate-pulse bg-muted rounded h-8 w-24" />
    )
  }

  // Verifica acesso
  const org: OrganizationForFeatureCheck | null = organization ? {
    id: organization.id,
    allowedFeatures: organization.allowedFeatures || [],
    isSandbox: organization.isSandbox || false,
  } : null

  const result = hasFeatureAccess(org, feature)

  // Se não tem acesso, mostra fallback
  if (!result.hasAccess) {
    return <>{fallback}</>
  }

  // Tem acesso, renderiza children
  return <>{children}</>
}

/**
 * Hook para verificar acesso a feature no client
 */
export function useFeatureAccess(featureKey: string): {
  hasAccess: boolean
  isLoading: boolean
  reason: string | null
} {
  const { organization, isLoading } = useOrganization()

  if (isLoading) {
    return { hasAccess: false, isLoading: true, reason: null }
  }

  const org: OrganizationForFeatureCheck | null = organization ? {
    id: organization.id,
    allowedFeatures: organization.allowedFeatures || [],
    isSandbox: organization.isSandbox || false,
  } : null

  const result = hasFeatureAccess(org, featureKey)

  return {
    hasAccess: result.hasAccess,
    isLoading: false,
    reason: result.reason,
  }
}
