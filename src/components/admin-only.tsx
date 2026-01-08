import { redirect } from 'next/navigation'
import { checkAdminAccess } from '@/lib/admin-guard'

interface AdminOnlyProps {
  children: React.ReactNode
  fallbackUrl?: string
}

/**
 * Componente de Proteção Admin (DEC-18)
 * 
 * Envolve páginas que só podem ser acessadas por admins.
 * Se o usuário não for admin, redireciona para a página de erro.
 * 
 * Uso:
 * ```tsx
 * export default async function AdminPage() {
 *   return (
 *     <AdminOnly>
 *       <YourPageContent />
 *     </AdminOnly>
 *   )
 * }
 * ```
 */
export async function AdminOnly({ 
  children, 
  fallbackUrl = '/errors/forbidden' 
}: AdminOnlyProps) {
  const { isAdmin } = await checkAdminAccess()
  
  if (!isAdmin) {
    redirect(fallbackUrl)
  }
  
  return <>{children}</>
}

/**
 * Hook de verificação de admin para uso em Server Components
 * Retorna os dados de admin ou null
 */
export async function getAdminSession() {
  const result = await checkAdminAccess()
  
  if (!result.isAdmin) {
    return null
  }
  
  return result
}
