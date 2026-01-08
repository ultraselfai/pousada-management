"use client"

import React from "react"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { SiteHeader, SiteFooter } from "@/components/layout"
import { ClientSidebar } from "@/components/layout/client-sidebar"
import { ImpersonationBanner } from "@/components/layout/impersonation-banner"
import { useSidebarConfig } from "@/hooks/use-sidebar-config"
import { TenantProvider, type TenantData } from "@/contexts/tenant-context"
import { featureRegistry } from "@/config/features"

interface ClientLayoutWrapperProps {
  children: React.ReactNode
  tenant: TenantData
  impersonatedBy?: string | null
  userName?: string | null
}

/**
 * Wrapper Client Component para o layout do cliente
 * 
 * Recebe os dados da organização do Server Component,
 * provê o TenantContext e renderiza o sidebar dinâmico.
 * 
 * IMPORTANTE: Este wrapper isola completamente o painel do cliente
 * do painel admin. Rotas são prefixadas com o slug do tenant.
 */
export function ClientLayoutWrapper({
  children,
  tenant,
  impersonatedBy,
  userName,
}: ClientLayoutWrapperProps) {
  const { config } = useSidebarConfig()

  // Calcula as features ativas para este tenant
  const activeFeatures = React.useMemo(() => {
    if (tenant.isSandbox) {
      // Sandbox (Decode Lab) tem TODAS as features habilitadas
      return featureRegistry.map(f => f.key)
    }
    // Outros clientes só têm as features que o admin ativou
    return tenant.allowedFeatures
  }, [tenant.isSandbox, tenant.allowedFeatures])

  return (
    <TenantProvider tenant={tenant}>
      {/* Banner de impersonação - fixed no footer */}
      <ImpersonationBanner 
        impersonatedUserId={impersonatedBy}
        impersonatedUserName={userName || undefined}
        organizationId={tenant.id}
      />
      
      <div className="flex flex-col min-h-svh">
        <SidebarProvider
          style={{
            "--sidebar-width": "16rem",
            "--sidebar-width-icon": "3rem",
            "--header-height": "calc(var(--spacing) * 14)",
          } as React.CSSProperties}
          className="app-panel flex-1"
        >
        <ClientSidebar
          variant={config.variant}
          collapsible={config.collapsible}
          side={config.side}
          allowedFeatures={activeFeatures}
        />
        <SidebarInset>
          <SiteHeader />
          <div className="flex flex-1 flex-col">
            <div className="@container/main flex flex-1 flex-col gap-2">
              <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
                {children}
              </div>
            </div>
          </div>
          <SiteFooter />
        </SidebarInset>
      </SidebarProvider>
      </div>
    </TenantProvider>
  )
}
