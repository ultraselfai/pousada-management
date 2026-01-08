import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Configurações | Cliente",
  description: "Configurações da conta e organização",
}

/**
 * Configurações do Cliente
 * 
 * Página de configurações para o usuário final.
 */
export default function ClientSettingsPage() {
  return (
    <div className="px-4 lg:px-6">
      <div className="flex flex-col gap-6">
        {/* Header */}
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-bold tracking-tight">Configurações</h1>
          <p className="text-muted-foreground">
            Gerencie as configurações da sua conta.
          </p>
        </div>

        {/* Seções de configuração */}
        <div className="space-y-6">
          {/* Perfil */}
          <div className="rounded-lg border bg-card p-6">
            <h3 className="text-lg font-semibold mb-4">Perfil</h3>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Nome</label>
                <input 
                  type="text" 
                  className="mt-1 w-full px-3 py-2 border rounded-lg"
                  placeholder="Seu nome"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Email</label>
                <input 
                  type="email" 
                  className="mt-1 w-full px-3 py-2 border rounded-lg"
                  placeholder="seu@email.com"
                  disabled
                />
              </div>
            </div>
          </div>

          {/* Notificações */}
          <div className="rounded-lg border bg-card p-6">
            <h3 className="text-lg font-semibold mb-4">Notificações</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">Notificações por email</div>
                  <div className="text-sm text-muted-foreground">
                    Receba atualizações por email
                  </div>
                </div>
                <input type="checkbox" className="h-5 w-5" defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">Notificações push</div>
                  <div className="text-sm text-muted-foreground">
                    Receba notificações no navegador
                  </div>
                </div>
                <input type="checkbox" className="h-5 w-5" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
