import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Chat | Cliente",
  description: "Comunicação em tempo real",
}

/**
 * Chat do Cliente
 * 
 * Página de chat para o usuário final.
 */
export default function ClientChatPage() {
  return (
    <div className="px-4 lg:px-6">
      <div className="flex flex-col gap-6">
        {/* Header */}
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-bold tracking-tight">Chat</h1>
          <p className="text-muted-foreground">
            Comunicação em tempo real com sua equipe.
          </p>
        </div>

        {/* Área do chat */}
        <div className="rounded-lg border bg-card min-h-[500px] flex flex-col">
          {/* Lista de conversas */}
          <div className="flex-1 p-6">
            <div className="space-y-4">
              <div className="flex gap-3">
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-sm font-medium">
                  JD
                </div>
                <div className="bg-muted rounded-lg p-3 max-w-[70%]">
                  <div className="text-sm">Olá! Tudo bem?</div>
                  <div className="text-xs text-muted-foreground mt-1">10:30</div>
                </div>
              </div>
              <div className="flex gap-3 justify-end">
                <div className="bg-primary text-primary-foreground rounded-lg p-3 max-w-[70%]">
                  <div className="text-sm">Tudo ótimo! E você?</div>
                  <div className="text-xs opacity-70 mt-1">10:32</div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Input de mensagem */}
          <div className="border-t p-4">
            <div className="flex gap-2">
              <input 
                type="text" 
                placeholder="Digite sua mensagem..."
                className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <button className="px-4 py-2 bg-primary text-primary-foreground rounded-lg">
                Enviar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
