"use client"

import * as React from "react"
import {
  LayoutDashboard,
  Mail,
  CheckSquare,
  MessageCircle,
  Calendar,
  Settings,
  Users,
  Upload,
  BarChart3,
  DollarSign,
  Bot,
  FolderKanban,
  type LucideIcon,
} from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Logo } from "@/components/logo"
import { useTenant } from "@/contexts/tenant-context"

import { NavUser } from "@/components/layout/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
} from "@/components/ui/sidebar"

import { getSidebarFeatures, type Feature } from "@/config/features"

// Mapeamento de ícones por nome string
const iconMap: Record<string, LucideIcon> = {
  LayoutDashboard,
  Mail,
  CheckSquare,
  MessageSquare: MessageCircle,
  Calendar,
  Settings,
  Users,
  Upload,
  BarChart3,
  DollarSign,
  Bot,
  FolderKanban,
}

interface ClientSidebarProps extends React.ComponentProps<typeof Sidebar> {
  /** Features ativas para esta organização */
  allowedFeatures: string[]
  /** Dados do usuário logado */
  user?: {
    name: string
    email: string
    avatar?: string
  }
}

/**
 * Sidebar dinâmico para o painel do cliente
 * 
 * IMPORTANTE: Este sidebar usa o TenantContext para:
 * 1. Obter o nome da organização
 * 2. Prefixar todas as rotas com o slug do tenant
 * 
 * Rotas geradas: /{tenant.slug}/dashboard, /{tenant.slug}/calendar, etc.
 * Isso garante ISOLAMENTO TOTAL do painel admin.
 */
export function ClientSidebar({
  allowedFeatures,
  user,
  ...props
}: ClientSidebarProps) {
  const pathname = usePathname()
  const { tenant, routePrefix } = useTenant()
  
  // Busca as features que podem ser exibidas no sidebar
  const sidebarFeatures = getSidebarFeatures(allowedFeatures)
  
  // Agrupa por categoria
  const featuresByCategory = sidebarFeatures.reduce((acc, feature) => {
    const category = feature.category || 'core'
    if (!acc[category]) acc[category] = []
    acc[category].push(feature)
    return acc
  }, {} as Record<string, Feature[]>)

  // Labels das categorias
  const categoryLabels: Record<string, string> = {
    core: 'Principal',
    productivity: 'Produtividade',
    analytics: 'Analytics',
    integration: 'Integrações',
    experimental: 'Experimental',
  }

  // Ordem das categorias
  const categoryOrder = ['core', 'productivity', 'analytics', 'integration', 'experimental']

  /**
   * Gera a rota completa com prefixo do tenant
   * Ex: /decode-lab/dashboard, /cliente-x/calendar
   */
  const getTenantRoute = (featureRoute: string): string => {
    // Remove barra inicial se existir para evitar //
    const cleanRoute = featureRoute.startsWith('/') ? featureRoute.slice(1) : featureRoute
    return `${routePrefix}/${cleanRoute}`
  }

  /**
   * Verifica se a rota atual corresponde à feature
   */
  const isRouteActive = (featureRoute: string): boolean => {
    const fullRoute = getTenantRoute(featureRoute)
    return pathname === fullRoute || pathname.startsWith(`${fullRoute}/`)
  }

  return (
    <Sidebar {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild className="cursor-pointer">
              <Link href={`${routePrefix}/dashboard`}>
                <Logo />
                <div className="flex flex-col gap-0.5 leading-none">
                  <span className="font-semibold">{tenant.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {tenant.isSandbox ? "Sandbox (Dev)" : "Painel do Cliente"}
                  </span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        {categoryOrder.map(category => {
          const features = featuresByCategory[category]
          if (!features || features.length === 0) return null

          return (
            <SidebarGroup key={category}>
              <SidebarGroupLabel>{categoryLabels[category]}</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {features.map(feature => {
                    const Icon = feature.icon ? iconMap[feature.icon] : LayoutDashboard
                    const fullRoute = feature.route ? getTenantRoute(feature.route) : '#'
                    const isActive = feature.route ? isRouteActive(feature.route) : false
                    
                    return (
                      <SidebarMenuItem key={feature.key}>
                        <SidebarMenuButton
                          asChild
                          isActive={isActive}
                          tooltip={feature.description}
                        >
                          <Link href={fullRoute}>
                            {Icon && <Icon className="h-4 w-4" />}
                            <span>{feature.label}</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    )
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          )
        })}

        {/* Mensagem se não houver features */}
        {sidebarFeatures.length === 0 && (
          <div className="p-4 text-center text-sm text-muted-foreground">
            <p>Nenhum módulo ativo.</p>
            <p className="mt-2">Entre em contato com o administrador para ativar módulos.</p>
          </div>
        )}
      </SidebarContent>

      <SidebarFooter>
        <NavUser
          user={{
            name: user?.name || "Usuário",
            email: user?.email || "usuario@email.com",
            avatar: user?.avatar || "",
          }}
        />
      </SidebarFooter>
    </Sidebar>
  )
}
