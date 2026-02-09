"use client"
import * as React from "react"
import { useSession } from "@/lib/auth-client"
import {
  LayoutDashboard,
  CalendarDays,
  Users,
  BookOpen,
  Package,
  DollarSign,
  Settings,
  BedDouble,
  FileText,
  Map,
  Wrench,
  Heart,
  TrendingUp,
  TrendingDown,
} from "lucide-react"
import Link from "next/link"
import { Logo } from "@/components/logo"

import { NavMain } from "@/components/layout/nav-main"
import { NavUser } from "@/components/layout/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

const data = {
  user: {
    name: "Pousada",
    email: "contato@pousadadoiscorações.com.br",
    avatar: "",
  },
  navGroups: [
    {
      label: "Visão Geral",
      items: [
        {
          title: "Visão do Dia",
          url: "/overview",
          icon: LayoutDashboard,
        },
        {
          title: "Mapa de Reservas",
          url: "/map/reservations",
          icon: Map,
        },
      ],
    },
    {
      label: "Gestão",
      items: [
        {
          title: "Hóspedes",
          url: "/guests",
          icon: Users,
        },
        {
          title: "Reservas",
          url: "/bookings",
          icon: BookOpen,
        },
        {
          title: "Orçamentos",
          url: "#",
          icon: FileText,
          items: [
            {
              title: "Todos",
              url: "/quotes",
            },
            {
              title: "Novo Orçamento",
              url: "/quotes/new",
            },
          ],
        },
      ],
    },
    {
      label: "Operações",
      items: [
        {
          title: "Quartos",
          url: "/rooms",
          icon: BedDouble,
        },
        {
          title: "Estoque",
          url: "/stock",
          icon: Package,
        },
        {
          title: "Manutenções",
          url: "/maintenance",
          icon: Wrench,
        },
      ],
    },
    {
      label: "Financeiro",
      items: [
        {
          title: "Visão Geral",
          url: "/financial",
          icon: LayoutDashboard,
        },
        {
          title: "Despesas",
          url: "/financial/expenses",
          icon: TrendingDown,
        },
        {
          title: "Receitas",
          url: "/financial/revenues",
          icon: TrendingUp,
        },
        {
          title: "Extrato",
          url: "/financial/statement",
          icon: FileText,
        },
        {
          title: "DRE",
          url: "/financial/dre", // Atualizado para rota unificada se houver
          icon: FileText,
        },
      ],
    },
    {
      label: "Configurações",
      items: [
        {
          title: "Configurações",
          url: "#",
          icon: Settings,
          items: [
            {
              title: "Perfil",
              url: "/settings/profile",
            },
            {
              title: "Usuários & Permissões",
              url: "/settings/user",
            },
            {
              title: "Conta",
              url: "/settings/account",
            },
            {
              title: "Aparência",
              url: "/settings/appearance",
            },
          ],
        },
      ],
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { data: session } = useSession()
  const user = session?.user

  // Map permissions to labels matches
  // 'overview' -> "Visão Geral"
  // 'management' -> "Gestão"
  // 'operations' -> "Operações"
  // 'financial' -> "Financeiro"
  // 'settings' -> "Configurações"

  const filteredNavGroups = React.useMemo(() => {
    if (!user) return [] // Or default public items? usually login required.

    // If admin or owner, show all
    if (user.role === "admin" || user.role === "owner") return data.navGroups

    const userPermissions = (user as any).permissions || []
    console.log("Sidebar User:", user.email, "| Role:", user.role, "| Permissions:", userPermissions);

    return data.navGroups.filter(group => {
      // Mapping
      let requiredPermission = ""
      if (group.label === "Visão Geral") requiredPermission = "overview"
      else if (group.label === "Gestão") requiredPermission = "management"
      else if (group.label === "Operações") requiredPermission = "operations"
      else if (group.label === "Financeiro") requiredPermission = "financial"
      else if (group.label === "Configurações") requiredPermission = "settings"
      
      // If no mapping matched (e.g. unknown group), maybe show it or hide it. 
      // Safest is to hide if it matches a restricted category label. 
      // If it doesn't match any known restricted category, we could show it (e.g. "Public").
      // But here we mapped all standard groups.
      
      if (!requiredPermission) return true 

      return userPermissions.includes(requiredPermission)
    })
  }, [user])

  // Update Settings links dynamically if needed, or just static update in 'data' object below
  
  return (
    <Sidebar {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/overview">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg overflow-hidden">
                  <img 
                    src="/form-step-7/favicon.png" 
                    alt="Logo Pousada Dois Corações" 
                    className="size-8 object-contain"
                  />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">Pousada</span>
                  <span className="truncate text-xs">Dois Corações</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        {filteredNavGroups.map((group) => (
          <NavMain key={group.label} label={group.label} items={group.items} />
        ))}
      </SidebarContent>
      <SidebarFooter>
        <NavUser 
          user={user ? {
            name: user.name,
            email: user.email,
            avatar: user.image || "",
          } : data.user} 
          logoutRedirect="/admin-login" 
        />
      </SidebarFooter>
    </Sidebar>
  )
}
