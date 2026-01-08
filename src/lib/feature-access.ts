/**
 * Feature Access Logic - DEC-19
 * 
 * Lógica central para determinar se uma organização tem acesso a uma feature.
 * 
 * Regras:
 * 1. Features 'stable': Retorna true se estiver em allowedFeatures da Org
 * 2. Features 'beta': Retorna true se estiver em allowedFeatures da Org
 * 3. Features 'dev': Retorna true APENAS se a Org for sandbox (isSandbox=true)
 * 
 * O Decode Lab é a única organização com isSandbox=true, portanto é a única
 * que pode ver features em desenvolvimento.
 */

import { getFeature, type Feature, type FeatureStatus } from '@/config/features'

export interface OrganizationForFeatureCheck {
  id: string
  allowedFeatures: string[]
  isSandbox: boolean
}

export interface FeatureAccessResult {
  hasAccess: boolean
  reason: 'allowed' | 'not-allowed' | 'dev-only' | 'invalid-feature' | 'no-org'
  feature?: Feature
}

/**
 * Verifica se uma organização tem acesso a uma feature específica
 * 
 * @param org - A organização a verificar
 * @param featureKey - O key da feature a verificar
 * @returns Resultado com hasAccess e razão
 */
export function hasFeatureAccess(
  org: OrganizationForFeatureCheck | null | undefined,
  featureKey: string
): FeatureAccessResult {
  // Sem organização = sem acesso
  if (!org) {
    return {
      hasAccess: false,
      reason: 'no-org',
    }
  }

  // Busca a feature no registry
  const feature = getFeature(featureKey)

  // Feature não existe no registry
  if (!feature) {
    return {
      hasAccess: false,
      reason: 'invalid-feature',
    }
  }

  // Features em desenvolvimento ('dev')
  if (feature.status === 'dev') {
    // Apenas organizações sandbox (Decode Lab) podem acessar
    if (org.isSandbox) {
      return {
        hasAccess: true,
        reason: 'allowed',
        feature,
      }
    }
    return {
      hasAccess: false,
      reason: 'dev-only',
      feature,
    }
  }

  // Features 'beta' ou 'stable': verifica se está no allowedFeatures
  const isAllowed = org.allowedFeatures.includes(featureKey)

  return {
    hasAccess: isAllowed,
    reason: isAllowed ? 'allowed' : 'not-allowed',
    feature,
  }
}

/**
 * Retorna todas as features acessíveis para uma organização
 * 
 * @param org - A organização
 * @returns Lista de features acessíveis
 */
export function getAccessibleFeatures(
  org: OrganizationForFeatureCheck | null | undefined
): Feature[] {
  if (!org) {
    return []
  }

  // Importa todas as features
  const { featureRegistry } = require('@/config/features')

  return featureRegistry.filter((feature: Feature) => {
    const result = hasFeatureAccess(org, feature.key)
    return result.hasAccess
  })
}

/**
 * Verifica múltiplas features de uma vez
 * 
 * @param org - A organização
 * @param featureKeys - Lista de keys a verificar
 * @returns Map com key => hasAccess
 */
export function checkMultipleFeatures(
  org: OrganizationForFeatureCheck | null | undefined,
  featureKeys: string[]
): Record<string, boolean> {
  const results: Record<string, boolean> = {}
  
  for (const key of featureKeys) {
    const result = hasFeatureAccess(org, key)
    results[key] = result.hasAccess
  }
  
  return results
}

/**
 * Helper para verificar se a org é o Decode Lab (sandbox)
 */
export function isDecodeLab(org: OrganizationForFeatureCheck | null | undefined): boolean {
  return org?.isSandbox === true
}

/**
 * Retorna features que podem ser ativadas para uma organização específica
 * (não inclui features 'dev' para orgs normais)
 */
export function getAvailableFeaturesForOrg(
  org: OrganizationForFeatureCheck | null | undefined
): Feature[] {
  const { featureRegistry } = require('@/config/features')
  
  if (!org) {
    return []
  }
  
  // Sandbox vê todas as features
  if (org.isSandbox) {
    return featureRegistry
  }
  
  // Orgs normais só veem features que não são 'dev'
  return featureRegistry.filter((f: Feature) => f.status !== 'dev')
}
