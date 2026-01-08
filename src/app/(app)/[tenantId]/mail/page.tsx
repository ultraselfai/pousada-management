import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Email | Cliente",
  description: "Caixa de entrada integrada",
}

/**
 * Email do Cliente
 * 
 * Página de email para o usuário final.
 */
export default function ClientMailPage() {
  return (
    <div className="px-4 lg:px-6">
      <div className="flex flex-col gap-6">
        {/* Header */}
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-bold tracking-tight">Email</h1>
          <p className="text-muted-foreground">
            Sua caixa de entrada integrada.
          </p>
        </div>

        {/* Lista de emails */}
        <div className="rounded-lg border bg-card min-h-[400px] p-6">
          <div className="space-y-2">
            {/* Exemplo de emails */}
            <div className="flex items-center gap-4 p-4 border rounded-lg hover:bg-muted/50 cursor-pointer">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium">
                JD
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <div className="font-medium">João da Silva</div>
                  <div className="text-xs text-muted-foreground">10:30</div>
                </div>
                <div className="text-sm text-muted-foreground truncate">
                  Atualização do projeto - Confira as novidades...
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4 p-4 border rounded-lg hover:bg-muted/50 cursor-pointer">
              <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center text-green-800 font-medium">
                MS
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <div className="font-medium">Maria Santos</div>
                  <div className="text-xs text-muted-foreground">09:15</div>
                </div>
                <div className="text-sm text-muted-foreground truncate">
                  Re: Reunião de amanhã - Confirmado!
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4 p-4 border rounded-lg hover:bg-muted/50 cursor-pointer bg-muted/30">
              <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-800 font-medium">
                S
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <div className="font-medium">Sistema</div>
                  <div className="text-xs text-muted-foreground">Ontem</div>
                </div>
                <div className="text-sm text-muted-foreground truncate">
                  Seu relatório mensal está disponível
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
