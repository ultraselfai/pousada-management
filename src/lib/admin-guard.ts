/**
 * Utilitário de verificação de acesso Admin
 * 
 * DEC-18: Proteção de rotas admin
 * 
 * Verifica se o usuário atual tem permissão de acesso ao painel admin.
 * Apenas usuários com role 'owner' ou 'admin' em qualquer organização
 * podem acessar o painel administrativo.
 * 
 * NOTA: A mesma lógica está replicada em src/lib/auth.ts na função isAdmin
 * do plugin admin. Mantenha ambos sincronizados.
 */

import { headers } from 'next/headers'
import { auth } from '@/lib/auth'
import { prisma } from '@/db'

// Super-admins do sistema (deve ser o mesmo de auth.ts)
const SUPER_ADMIN_EMAILS = [
  'admin@decode.ink',
  'admin@decode.app',
]

export type AdminCheckResult = {
  isAdmin: boolean
  userId?: string
  email?: string
  role?: string
}

/**
 * Verifica se a sessão atual tem acesso admin
 * 
 * Um usuário é considerado admin se:
 * 1. Tem role 'admin' no campo user.role
 * 2. Tem role 'owner' ou 'admin' em pelo menos uma organização
 * 3. Ou é um super-admin do sistema (email em lista específica)
 */
export async function checkAdminAccess(): Promise<AdminCheckResult> {
  try {
    // Obtém a sessão atual
    const session = await auth.api.getSession({
      headers: await headers(),
    })

    if (!session?.user) {
      return { isAdmin: false }
    }

    const { user } = session

    // 1. Verifica role 'admin' direto no user
    if (user.role === 'admin') {
      return {
        isAdmin: true,
        userId: user.id,
        email: user.email,
        role: 'admin',
      }
    }

    // 2. Super-admins do sistema (hardcoded por segurança)
    if (SUPER_ADMIN_EMAILS.includes(user.email)) {
      return {
        isAdmin: true,
        userId: user.id,
        email: user.email,
        role: 'super-admin',
      }
    }

    // 3. Verifica se é owner ou admin de alguma organização
    const adminMembership = await prisma.member.findFirst({
      where: {
        userId: user.id,
        role: {
          in: ['owner', 'admin'],
        },
      },
    })

    if (adminMembership) {
      return {
        isAdmin: true,
        userId: user.id,
        email: user.email,
        role: adminMembership.role,
      }
    }

    return {
      isAdmin: false,
      userId: user.id,
      email: user.email,
    }
  } catch (error) {
    console.error('[checkAdminAccess] Erro ao verificar acesso:', error)
    return { isAdmin: false }
  }
}

/**
 * Middleware helper para rotas de API admin
 * Lança erro se não for admin
 */
export async function requireAdminAccess(): Promise<AdminCheckResult> {
  const result = await checkAdminAccess()
  
  if (!result.isAdmin) {
    throw new Error('Acesso negado: permissão de administrador necessária')
  }
  
  return result
}
