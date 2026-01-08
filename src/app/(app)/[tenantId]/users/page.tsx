import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Usuários | Cliente",
  description: "Gerenciar usuários e permissões da organização",
}

/**
 * Gestão de Usuários do Cliente
 * 
 * Página para o cliente gerenciar os membros da sua organização.
 */
export default function ClientUsersPage() {
  return (
    <div className="px-4 lg:px-6">
      <div className="flex flex-col gap-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-2">
            <h1 className="text-2xl font-bold tracking-tight">Usuários</h1>
            <p className="text-muted-foreground">
              Gerencie os membros da sua organização.
            </p>
          </div>
          <button className="px-4 py-2 bg-primary text-primary-foreground rounded-lg">
            Convidar Usuário
          </button>
        </div>

        {/* Lista de usuários */}
        <div className="rounded-lg border bg-card">
          <table className="w-full">
            <thead className="border-b">
              <tr>
                <th className="text-left p-4 font-medium">Usuário</th>
                <th className="text-left p-4 font-medium">Função</th>
                <th className="text-left p-4 font-medium">Status</th>
                <th className="text-right p-4 font-medium">Ações</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b">
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium">
                      V
                    </div>
                    <div>
                      <div className="font-medium">Você</div>
                      <div className="text-sm text-muted-foreground">voce@email.com</div>
                    </div>
                  </div>
                </td>
                <td className="p-4">
                  <span className="text-sm bg-primary/10 text-primary px-2 py-1 rounded">
                    Administrador
                  </span>
                </td>
                <td className="p-4">
                  <span className="text-sm text-green-600">Ativo</span>
                </td>
                <td className="p-4 text-right">
                  <span className="text-sm text-muted-foreground">Conta atual</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
