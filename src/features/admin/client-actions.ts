/**
 * Admin Client Management Actions - DEC-20 Enhanced
 * 
 * Server Actions para gerenciar clientes (organizações e usuários).
 * Inclui criar, editar, excluir clientes e impersonar usuários.
 */

'use server'

import { headers } from 'next/headers'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { prisma } from '@/db'
import { requireAdminAccess } from '@/lib/admin-guard'
import { scryptAsync } from '@noble/hashes/scrypt.js'
import { randomBytes } from 'crypto'

// =============================================================================
// TIPOS
// =============================================================================

export interface ActionResult<T = unknown> {
  success: boolean
  message: string
  data?: T
}

export interface ClientDetails {
  id: string
  name: string
  slug: string
  logo: string | null
  plan: string
  status: string
  allowedFeatures: string[]
  isSandbox: boolean
  createdAt: string
  updatedAt: string
  members: {
    id: string
    userId: string
    role: string
    user: {
      id: string
      name: string
      email: string
      image: string | null
      role: string
      banned: boolean
      createdAt: string
    }
  }[]
}

export interface CreateClientInput {
  name: string
  slug: string
  plan?: string
  ownerName: string
  ownerEmail: string
  ownerPassword: string
}

export interface UpdateClientInput {
  id: string
  name?: string
  plan?: string
  allowedFeatures?: string[]
}

export interface UpdateClientUserInput {
  userId: string
  name?: string
  email?: string
  password?: string
  banned?: boolean
}

// =============================================================================
// HELPERS
// =============================================================================

/**
 * Converte bytes para hex string
 */
function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

/**
 * Hash de senha usando scrypt (algoritmo padrão do Better Auth)
 */
async function hashPassword(password: string): Promise<string> {
  const salt = bytesToHex(randomBytes(16))
  const key = await scryptAsync(password.normalize('NFKC'), salt, {
    N: 16384,
    r: 16,
    p: 1,
    dkLen: 64,
    maxmem: 128 * 16384 * 16 * 2,
  })
  return `${salt}:${bytesToHex(key)}`
}

/**
 * Gera um ID único
 */
function generateId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).substr(2, 9)}`
}

// =============================================================================
// ACTIONS
// =============================================================================

/**
 * Busca detalhes completos de um cliente
 */
export async function getClientDetails(clientId: string): Promise<ActionResult<ClientDetails>> {
  try {
    await requireAdminAccess()

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
        },
      },
    })

    if (!org) {
      return {
        success: false,
        message: 'Cliente não encontrado',
      }
    }

    return {
      success: true,
      message: 'Cliente encontrado',
      data: {
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
      },
    }
  } catch (error) {
    console.error('[getClientDetails] Erro:', error)
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Erro ao buscar cliente',
    }
  }
}

/**
 * Cria um novo cliente (organização + usuário owner)
 */
export async function createClient(input: CreateClientInput): Promise<ActionResult<{ clientId: string; userId: string }>> {
  try {
    await requireAdminAccess()

    // Valida slug único
    const existingOrg = await prisma.organization.findUnique({
      where: { slug: input.slug },
    })

    if (existingOrg) {
      return {
        success: false,
        message: `Slug "${input.slug}" já está em uso`,
      }
    }

    // Valida email único
    const existingUser = await prisma.user.findUnique({
      where: { email: input.ownerEmail },
    })

    if (existingUser) {
      return {
        success: false,
        message: `Email "${input.ownerEmail}" já está em uso`,
      }
    }

    // Gera IDs
    const orgId = generateId()
    const userId = generateId()
    const accountId = generateId()
    const memberId = generateId()

    // Hash da senha
    const hashedPassword = await hashPassword(input.ownerPassword)

    // Cria tudo em uma transação
    await prisma.$transaction(async (tx) => {
      // 1. Criar organização
      await tx.organization.create({
        data: {
          id: orgId,
          name: input.name,
          slug: input.slug,
          metadata: { plan: input.plan || 'Free' },
          allowedFeatures: ['dashboard'], // Feature básica
          isSandbox: false,
        },
      })

      // 2. Criar usuário
      await tx.user.create({
        data: {
          id: userId,
          name: input.ownerName,
          email: input.ownerEmail,
          emailVerified: true, // Admin criou, já validado
          role: 'user', // Usuário comum (não admin do sistema)
          banned: false,
        },
      })

      // 3. Criar account (credenciais)
      await tx.account.create({
        data: {
          id: accountId,
          userId: userId,
          accountId: userId,
          providerId: 'credential',
          password: hashedPassword,
        },
      })

      // 4. Criar member (vínculo user-org)
      await tx.member.create({
        data: {
          id: memberId,
          userId: userId,
          organizationId: orgId,
          role: 'owner', // Owner da organização
          createdAt: new Date(),
        },
      })
    })

    revalidatePath('/organizations')

    return {
      success: true,
      message: `Cliente "${input.name}" criado com sucesso`,
      data: {
        clientId: orgId,
        userId: userId,
      },
    }
  } catch (error) {
    console.error('[createClient] Erro:', error)
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Erro ao criar cliente',
    }
  }
}

/**
 * Atualiza dados de um cliente
 */
export async function updateClient(input: UpdateClientInput): Promise<ActionResult> {
  try {
    await requireAdminAccess()

    const org = await prisma.organization.findUnique({
      where: { id: input.id },
    })

    if (!org) {
      return {
        success: false,
        message: 'Cliente não encontrado',
      }
    }

    // Monta dados de atualização
    const updateData: any = {}
    if (input.name) updateData.name = input.name
    if (input.allowedFeatures) updateData.allowedFeatures = input.allowedFeatures
    if (input.plan) {
      updateData.metadata = {
        ...((org.metadata as any) || {}),
        plan: input.plan,
      }
    }

    await prisma.organization.update({
      where: { id: input.id },
      data: updateData,
    })

    revalidatePath('/organizations')
    revalidatePath(`/organizations/${input.id}`)

    return {
      success: true,
      message: 'Cliente atualizado com sucesso',
    }
  } catch (error) {
    console.error('[updateClient] Erro:', error)
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Erro ao atualizar cliente',
    }
  }
}

/**
 * Atualiza dados de um usuário do cliente (incluindo senha)
 */
export async function updateClientUser(input: UpdateClientUserInput): Promise<ActionResult> {
  try {
    await requireAdminAccess()

    const user = await prisma.user.findUnique({
      where: { id: input.userId },
      include: { accounts: true },
    })

    if (!user) {
      return {
        success: false,
        message: 'Usuário não encontrado',
      }
    }

    // Atualiza usuário
    const userUpdateData: any = {}
    if (input.name) userUpdateData.name = input.name
    if (input.email) userUpdateData.email = input.email
    if (input.banned !== undefined) userUpdateData.banned = input.banned

    if (Object.keys(userUpdateData).length > 0) {
      await prisma.user.update({
        where: { id: input.userId },
        data: userUpdateData,
      })
    }

    // Se está mudando a senha
    if (input.password) {
      const hashedPassword = await hashPassword(input.password)
      
      // Encontra a account de credencial
      const credentialAccount = user.accounts.find(a => a.providerId === 'credential')
      
      if (credentialAccount) {
        await prisma.account.update({
          where: { id: credentialAccount.id },
          data: { password: hashedPassword },
        })
      } else {
        // Cria uma nova account de credencial
        await prisma.account.create({
          data: {
            id: generateId(),
            userId: input.userId,
            accountId: input.userId,
            providerId: 'credential',
            password: hashedPassword,
          },
        })
      }
    }

    revalidatePath('/organizations')

    return {
      success: true,
      message: 'Usuário atualizado com sucesso',
    }
  } catch (error) {
    console.error('[updateClientUser] Erro:', error)
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Erro ao atualizar usuário',
    }
  }
}

/**
 * Impersona um usuário (cria sessão temporária como esse usuário)
 */
export async function impersonateUser(userId: string): Promise<ActionResult<{ redirectUrl: string }>> {
  try {
    await requireAdminAccess()

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        members: {
          include: {
            organization: true,
          },
        },
      },
    })

    if (!user) {
      return {
        success: false,
        message: 'Usuário não encontrado',
      }
    }

    if (user.banned) {
      return {
        success: false,
        message: 'Não é possível impersonar um usuário banido',
      }
    }

    // Usa a API do Better Auth para impersonar
    // O admin plugin foi configurado no auth.ts
    const headersList = await headers()
    
    const response = await auth.api.impersonateUser({
      headers: headersList,
      body: { userId },
    })

    if (!response) {
      return {
        success: false,
        message: 'Falha ao impersonar usuário',
      }
    }

    // Determina para onde redirecionar
    const firstOrg = user.members[0]?.organization
    const redirectUrl = firstOrg ? `/${firstOrg.slug}` : '/dashboard'

    return {
      success: true,
      message: `Impersonando ${user.name}`,
      data: { redirectUrl },
    }
  } catch (error) {
    console.error('[impersonateUser] Erro:', error)
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Erro ao impersonar usuário',
    }
  }
}

/**
 * Para de impersonar e volta à conta admin
 */
export async function stopImpersonating(): Promise<ActionResult> {
  try {
    const headersList = await headers()
    
    await auth.api.stopImpersonating({
      headers: headersList,
    })

    revalidatePath('/')

    return {
      success: true,
      message: 'Voltou à conta admin',
    }
  } catch (error) {
    console.error('[stopImpersonating] Erro:', error)
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Erro ao parar impersonação',
    }
  }
}

/**
 * Exclui um cliente (organização e todos os dados relacionados)
 */
export async function deleteClient(clientId: string): Promise<ActionResult> {
  try {
    await requireAdminAccess()

    const org = await prisma.organization.findUnique({
      where: { id: clientId },
    })

    if (!org) {
      return {
        success: false,
        message: 'Cliente não encontrado',
      }
    }

    // Não permite excluir organizações sandbox/sistema
    if (org.isSandbox || org.slug === 'decode' || org.slug === 'decode-lab') {
      return {
        success: false,
        message: 'Não é possível excluir organizações do sistema',
      }
    }

    // Exclui em cascata (members e invitations são deletados automaticamente)
    await prisma.organization.delete({
      where: { id: clientId },
    })

    revalidatePath('/organizations')

    return {
      success: true,
      message: `Cliente "${org.name}" excluído com sucesso`,
    }
  } catch (error) {
    console.error('[deleteClient] Erro:', error)
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Erro ao excluir cliente',
    }
  }
}
