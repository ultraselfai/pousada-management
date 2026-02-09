import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Calendário | Cliente",
  description: "Agendamento e gestão de eventos",
}

/**
 * Calendário do Cliente
 * 
 * Página de calendário para o usuário final.
 * Mostra eventos e agendamentos do usuário.
 */
export default function ClientCalendarPage() {
  return (
    <div className="px-4 lg:px-6">
      <div className="flex flex-col gap-6">
        {/* Header */}
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-bold tracking-tight">Calendário</h1>
          <p className="text-muted-foreground">
            Gerencie seus eventos e agendamentos.
          </p>
        </div>

        {/* Área do calendário */}
        <div className="rounded-lg border bg-card min-h-[500px] flex items-center justify-center">
          <div className="text-center text-muted-foreground">
            <p className="text-lg font-medium">Calendário em construção</p>
            <p className="text-sm mt-2">
              Em breve você poderá gerenciar seus eventos aqui.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
