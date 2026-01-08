import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Financeiro | Cliente",
  description: "Gestão financeira completa",
}

/**
 * Módulo Financeiro do Cliente
 * 
 * Página de gestão financeira para o usuário final.
 * NOTA: Esta é uma feature 'dev' - só aparece no Decode Lab.
 */
export default function ClientFinanceiroPage() {
  return (
    <div className="px-4 lg:px-6">
      <div className="flex flex-col gap-6">
        {/* Header */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight">Financeiro</h1>
            <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
              Em Desenvolvimento
            </span>
          </div>
          <p className="text-muted-foreground">
            Gestão financeira completa da sua organização.
          </p>
        </div>

        {/* Área do financeiro */}
        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-lg border bg-card p-6">
            <div className="text-sm font-medium text-muted-foreground">Receita Mensal</div>
            <div className="text-2xl font-bold text-green-600">R$ 0,00</div>
          </div>
          <div className="rounded-lg border bg-card p-6">
            <div className="text-sm font-medium text-muted-foreground">Despesas</div>
            <div className="text-2xl font-bold text-red-600">R$ 0,00</div>
          </div>
          <div className="rounded-lg border bg-card p-6">
            <div className="text-sm font-medium text-muted-foreground">Saldo</div>
            <div className="text-2xl font-bold">R$ 0,00</div>
          </div>
        </div>

        <div className="rounded-lg border bg-card min-h-[300px] flex items-center justify-center">
          <div className="text-center text-muted-foreground">
            <p className="text-lg font-medium">Feature em Desenvolvimento</p>
            <p className="text-sm mt-2">
              O módulo financeiro está sendo desenvolvido no ambiente Sandbox.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
