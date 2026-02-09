import { getUsers } from "@/features/users/actions"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Plus } from "lucide-react"
import { UsersTable } from "./users-table"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { UserForm } from "@/features/users/components/user-form"
import { UserDialog } from "./user-dialog"

export default async function UsersPage() {
  const users = await getUsers()

  return (
    <div className="space-y-6 px-4 lg:px-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Gestão de Usuários</h1>
          <p className="text-muted-foreground">
            Gerencie quem tem acesso ao sistema e suas permissões.
          </p>
        </div>
        <UserDialog />
      </div>

      <UsersTable initialUsers={users} />
    </div>
  )
}
