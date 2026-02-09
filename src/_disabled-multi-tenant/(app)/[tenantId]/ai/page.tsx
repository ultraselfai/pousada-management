import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Assistente IA | Cliente",
  description: "Assistente virtual com IA",
}

/**
 * Assistente IA do Cliente
 * 
 * Página do assistente virtual com IA.
 * NOTA: Esta é uma feature 'dev' - só aparece no Decode Lab.
 */
export default function ClientAIPage() {
  return (
    <div className="px-4 lg:px-6">
      <div className="flex flex-col gap-6">
        {/* Header */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight">Assistente IA</h1>
            <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
              Em Desenvolvimento
            </span>
          </div>
          <p className="text-muted-foreground">
            Seu assistente virtual inteligente.
          </p>
        </div>

        {/* Área do chat IA */}
        <div className="rounded-lg border bg-card min-h-[500px] flex flex-col">
          <div className="flex-1 p-6 flex items-center justify-center">
            <div className="text-center text-muted-foreground">
              <div className="h-16 w-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                <svg className="h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <p className="text-lg font-medium">Assistente IA</p>
              <p className="text-sm mt-2">
                Feature em desenvolvimento no ambiente Sandbox.
              </p>
            </div>
          </div>
          
          {/* Input */}
          <div className="border-t p-4">
            <div className="flex gap-2">
              <input 
                type="text" 
                placeholder="Pergunte algo ao assistente..."
                className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                disabled
              />
              <button className="px-4 py-2 bg-muted text-muted-foreground rounded-lg cursor-not-allowed">
                Enviar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
