import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Analytics | Cliente",
  description: "Relatórios e métricas avançadas",
}

/**
 * Analytics do Cliente
 * 
 * Página de analytics para o usuário final.
 * NOTA: Esta é uma feature 'dev' - só aparece no Decode Lab.
 */
export default function ClientAnalyticsPage() {
  return (
    <div className="px-4 lg:px-6">
      <div className="flex flex-col gap-6">
        {/* Header */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight">Analytics</h1>
            <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
              Em Desenvolvimento
            </span>
          </div>
          <p className="text-muted-foreground">
            Relatórios e métricas avançadas do seu negócio.
          </p>
        </div>

        {/* Área de analytics */}
        <div className="rounded-lg border bg-card min-h-[400px] flex items-center justify-center">
          <div className="text-center text-muted-foreground">
            <p className="text-lg font-medium">Feature em Desenvolvimento</p>
            <p className="text-sm mt-2">
              Esta funcionalidade está sendo desenvolvida no ambiente Sandbox.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
