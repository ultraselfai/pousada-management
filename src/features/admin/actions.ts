/**
 * Admin Feature Management Actions - DEC-20
 * 
 * Server Actions para gerenciar features de organizações.
 * Apenas admins podem executar essas ações.
 */

'use server'

import { headers } from 'next/headers'
import { revalidatePath } from 'next/cache'
import { auth } from '@/lib/auth'
import { prisma } from '@/db'
import { isValidFeatureKey, getActivatableFeatures, getFeature } from '@/config/features'
import { requireAdminAccess } from '@/lib/admin-guard'

export interface ToggleFeatureResult {
  success: boolean
  message: string
  allowedFeatures?: string[]
}

/**
 * Ativa ou desativa uma feature para uma organização
 * 
 * @param orgId - ID da organização
 * @param featureKey - Key da feature a toggle
 * @returns Resultado da operação
 */
export async function toggleFeatureForOrg(
  orgId: string,
  featureKey: string
): Promise<ToggleFeatureResult> {
  try {
    // Verifica se é admin
    await requireAdminAccess()

    // Valida feature key
    if (!isValidFeatureKey(featureKey)) {
      return {
        success: false,
        message: `Feature "${featureKey}" não existe no registry`,
      }
    }

    // Verifica se a feature pode ser ativada (não é 'dev')
    const feature = getFeature(featureKey)
    if (feature?.status === 'dev') {
      return {
        success: false,
        message: `Feature "${featureKey}" está em desenvolvimento e não pode ser ativada para clientes`,
      }
    }

    // Busca organização
    const org = await prisma.organization.findUnique({
      where: { id: orgId },
      select: { id: true, allowedFeatures: true, name: true },
    })

    if (!org) {
      return {
        success: false,
        message: 'Organização não encontrada',
      }
    }

    // Toggle: adiciona se não tem, remove se já tem
    const currentFeatures = org.allowedFeatures || []
    const hasFeature = currentFeatures.includes(featureKey)

    let newFeatures: string[]
    let action: string

    if (hasFeature) {
      // Remove a feature
      newFeatures = currentFeatures.filter(f => f !== featureKey)
      action = 'removida'
    } else {
      // Adiciona a feature
      newFeatures = [...currentFeatures, featureKey]
      action = 'ativada'
    }

    // Atualiza no banco
    await prisma.organization.update({
      where: { id: orgId },
      data: { allowedFeatures: newFeatures },
    })

    // Revalida as páginas que podem ter sido afetadas
    revalidatePath('/users')
    revalidatePath(`/${org.name}`)

    return {
      success: true,
      message: `Feature "${feature?.label || featureKey}" ${action} para ${org.name}`,
      allowedFeatures: newFeatures,
    }
  } catch (error) {
    console.error('[toggleFeatureForOrg] Erro:', error)
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Erro ao atualizar features',
    }
  }
}

/**
 * Define as features de uma organização (sobrescreve todas)
 * 
 * @param orgId - ID da organização
 * @param featureKeys - Lista de features a ativar
 * @returns Resultado da operação
 */
export async function setFeaturesForOrg(
  orgId: string,
  featureKeys: string[]
): Promise<ToggleFeatureResult> {
  try {
    // Verifica se é admin
    await requireAdminAccess()

    // Valida todas as feature keys
    const invalidFeatures = featureKeys.filter(key => !isValidFeatureKey(key))
    if (invalidFeatures.length > 0) {
      return {
        success: false,
        message: `Features inválidas: ${invalidFeatures.join(', ')}`,
      }
    }

    // Remove features 'dev' da lista (não podem ser ativadas assim)
    const validFeatures = featureKeys.filter(key => {
      const feature = getFeature(key)
      return feature && feature.status !== 'dev'
    })

    // Busca organização
    const org = await prisma.organization.findUnique({
      where: { id: orgId },
      select: { id: true, name: true },
    })

    if (!org) {
      return {
        success: false,
        message: 'Organização não encontrada',
      }
    }

    // Atualiza no banco
    await prisma.organization.update({
      where: { id: orgId },
      data: { allowedFeatures: validFeatures },
    })

    // Revalida as páginas
    revalidatePath('/users')

    return {
      success: true,
      message: `Features atualizadas para ${org.name}`,
      allowedFeatures: validFeatures,
    }
  } catch (error) {
    console.error('[setFeaturesForOrg] Erro:', error)
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Erro ao atualizar features',
    }
  }
}

/**
 * Lista organizações com suas features
 */
export async function listOrganizationsWithFeatures() {
  try {
    await requireAdminAccess()

    const orgs = await prisma.organization.findMany({
      select: {
        id: true,
        name: true,
        slug: true,
        allowedFeatures: true,
        isSandbox: true,
        createdAt: true,
        _count: {
          select: { members: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return {
      success: true,
      organizations: orgs.map(org => ({
        ...org,
        memberCount: org._count.members,
      })),
    }
  } catch (error) {
    console.error('[listOrganizationsWithFeatures] Erro:', error)
    return {
      success: false,
      organizations: [],
      message: error instanceof Error ? error.message : 'Erro ao listar organizações',
    }
  }
}

/**
 * Retorna as features que podem ser ativadas para clientes
 * (exclui features 'dev')
 */
export async function getActivatableFeaturesAction() {
  try {
    await requireAdminAccess()
    
    return {
      success: true,
      features: getActivatableFeatures(),
    }
  } catch (error) {
    return {
      success: false,
      features: [],
      message: error instanceof Error ? error.message : 'Erro ao listar features',
    }
  }
}
