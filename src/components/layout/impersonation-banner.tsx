"use client"

/**
 * Banner de Impersonação
 * 
 * Exibido quando um admin está impersonando um usuário.
 * Mostra quem está sendo impersonado e permite voltar à conta admin.
 */

import { useState, useTransition } from "react"
import { AlertTriangle, ArrowLeft, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { stopImpersonating } from "@/features/admin/client-actions"
import { toast } from "sonner"

interface ImpersonationBannerProps {
  impersonatedUserId?: string | null
  impersonatedUserName?: string
  organizationId?: string
}

export function ImpersonationBanner({ 
  impersonatedUserId, 
  impersonatedUserName,
  organizationId 
}: ImpersonationBannerProps) {
  const [isPending, startTransition] = useTransition()
  const [isVisible, setIsVisible] = useState(true)

  // Se não está impersonando, não mostra nada
  if (!impersonatedUserId || !isVisible) {
    return null
  }

  async function handleStopImpersonating() {
    startTransition(async () => {
      const result = await stopImpersonating()
      
      if (result.success) {
        toast.success(result.message)
        // Redireciona para a página da organização que estava sendo impersonada
        window.location.href = organizationId ? `/organizations/${organizationId}` : "/organizations"
      } else {
        toast.error(result.message)
      }
    })
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[100] w-full bg-amber-500/80 dark:bg-amber-600/80 backdrop-blur-sm text-black px-4 py-1.5">
      <div className="flex items-center justify-between max-w-screen-2xl mx-auto">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-3.5 w-3.5" />
          <span className="text-xs font-medium">
            Modo Admin
          </span>
        </div>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={handleStopImpersonating}
          disabled={isPending}
          className="h-6 text-xs text-black hover:bg-amber-600 dark:hover:bg-amber-700 px-2"
        >
          {isPending ? (
            <Loader2 className="h-3 w-3 mr-1.5 animate-spin" />
          ) : (
            <ArrowLeft className="h-3 w-3 mr-1.5" />
          )}
          Retornar ao console
        </Button>
      </div>
    </div>
  )
}
