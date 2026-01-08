import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Dashboard | Cliente",
  description: "Painel principal do cliente com métricas e visão geral",
}

/**
 * Dashboard do Cliente
 * 
 * Esta é a página principal do painel do cliente.
 * Diferente do Dashboard Admin, ela é focada nas métricas
 * e informações relevantes para o usuário final.
 */
export default function ClientDashboardPage() {
  return (
    <div className="px-4 lg:px-6">
      <div className="flex flex-col gap-6">
        {/* Header */}
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Bem-vindo ao seu painel. Aqui você encontra uma visão geral das suas atividades.
          </p>
        </div>

        {/* Cards de resumo */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-lg border bg-card p-6">
            <div className="text-sm font-medium text-muted-foreground">
              Tarefas Pendentes
            </div>
            <div className="text-2xl font-bold">12</div>
          </div>
          <div className="rounded-lg border bg-card p-6">
            <div className="text-sm font-medium text-muted-foreground">
              Eventos Hoje
            </div>
            <div className="text-2xl font-bold">3</div>
          </div>
          <div className="rounded-lg border bg-card p-6">
            <div className="text-sm font-medium text-muted-foreground">
              Mensagens Não Lidas
            </div>
            <div className="text-2xl font-bold">7</div>
          </div>
          <div className="rounded-lg border bg-card p-6">
            <div className="text-sm font-medium text-muted-foreground">
              Arquivos Recentes
            </div>
            <div className="text-2xl font-bold">24</div>
          </div>
        </div>

        {/* Área de conteúdo principal */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          <div className="col-span-4 rounded-lg border bg-card p-6">
            <h3 className="text-lg font-semibold mb-4">Atividade Recente</h3>
            <div className="space-y-4">
              <div className="flex items-center gap-4 text-sm">
                <div className="h-2 w-2 rounded-full bg-green-500" />
                <span className="flex-1">Tarefa "Revisar proposta" concluída</span>
                <span className="text-muted-foreground">2 min</span>
              </div>
              <div className="flex items-center gap-4 text-sm">
                <div className="h-2 w-2 rounded-full bg-blue-500" />
                <span className="flex-1">Nova mensagem de João</span>
                <span className="text-muted-foreground">15 min</span>
              </div>
              <div className="flex items-center gap-4 text-sm">
                <div className="h-2 w-2 rounded-full bg-yellow-500" />
                <span className="flex-1">Reunião em 1 hora</span>
                <span className="text-muted-foreground">1 hr</span>
              </div>
            </div>
          </div>
          <div className="col-span-3 rounded-lg border bg-card p-6">
            <h3 className="text-lg font-semibold mb-4">Próximos Eventos</h3>
            <div className="space-y-4">
              <div className="flex items-center gap-4 text-sm">
                <div className="rounded bg-primary/10 p-2 text-primary">
                  14:00
                </div>
                <span className="flex-1">Reunião de Alinhamento</span>
              </div>
              <div className="flex items-center gap-4 text-sm">
                <div className="rounded bg-primary/10 p-2 text-primary">
                  16:00
                </div>
                <span className="flex-1">Call com Cliente</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
