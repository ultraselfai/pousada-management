import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Tarefas | Cliente",
  description: "Gestão de tarefas e projetos",
}

/**
 * Tarefas do Cliente
 * 
 * Página de gestão de tarefas para o usuário final.
 */
export default function ClientTasksPage() {
  return (
    <div className="px-4 lg:px-6">
      <div className="flex flex-col gap-6">
        {/* Header */}
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-bold tracking-tight">Tarefas</h1>
          <p className="text-muted-foreground">
            Gerencie suas tarefas e projetos.
          </p>
        </div>

        {/* Lista de tarefas */}
        <div className="rounded-lg border bg-card min-h-[400px] p-6">
          <div className="space-y-4">
            {/* Exemplo de tarefas */}
            <div className="flex items-center gap-4 p-4 border rounded-lg">
              <input type="checkbox" className="h-5 w-5 rounded" />
              <div className="flex-1">
                <div className="font-medium">Revisar proposta comercial</div>
                <div className="text-sm text-muted-foreground">Vence hoje</div>
              </div>
              <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">Urgente</span>
            </div>
            <div className="flex items-center gap-4 p-4 border rounded-lg">
              <input type="checkbox" className="h-5 w-5 rounded" />
              <div className="flex-1">
                <div className="font-medium">Preparar apresentação</div>
                <div className="text-sm text-muted-foreground">Vence em 2 dias</div>
              </div>
              <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">Média</span>
            </div>
            <div className="flex items-center gap-4 p-4 border rounded-lg">
              <input type="checkbox" className="h-5 w-5 rounded" />
              <div className="flex-1">
                <div className="font-medium">Atualizar documentação</div>
                <div className="text-sm text-muted-foreground">Vence em 5 dias</div>
              </div>
              <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">Baixa</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
