"use client"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Edit, Trash2 } from "lucide-react"
import { deleteUser } from "@/features/users/actions"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { UserDialog } from "./user-dialog"
import { Badge } from "@/components/ui/badge"
import { PERMISSIONS } from "@/config/permissions"

interface UsersTableProps {
  initialUsers: any[]
}

export function UsersTable({ initialUsers }: UsersTableProps) {
  const router = useRouter()
  const [editingUser, setEditingUser] = useState<any>(null)
  const [isDeleting, setIsDeleting] = useState<string | null>(null)

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este usuário?")) return
    
    setIsDeleting(id)
    try {
      const res = await deleteUser(id)
      if (res.success) {
        toast.success("Usuário excluído")
      } else {
        toast.error(res.error)
      }
    } catch {
      toast.error("Erro ao excluir")
    } finally {
      setIsDeleting(null)
    }
  }

  const getPermissionLabel = (value: string) => {
    return PERMISSIONS.find(p => p.value === value)?.label || value
  }

  return (
    <div className="border rounded-md">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nome / Email</TableHead>
            <TableHead>Função</TableHead>
            <TableHead>Permissões</TableHead>
            <TableHead className="w-[100px]">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {initialUsers.map((user) => (
            <TableRow key={user.id}>
              <TableCell>
                <div className="flex flex-col">
                  <span className="font-medium">{user.name}</span>
                  <span className="text-sm text-muted-foreground">{user.email}</span>
                </div>
              </TableCell>
              <TableCell>
                <Badge variant={user.role === "admin" || user.role === "owner" ? "default" : "secondary"}>
                  {user.role === "owner" ? "Owner" : user.role === "admin" ? "Admin" : "Usuário"}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="flex flex-wrap gap-1">
                  {user.role === "admin" || user.role === "owner" ? (
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Acesso Total</Badge>
                  ) : user.permissions && user.permissions.length > 0 ? (
                    user.permissions.map((p: string) => (
                      <Badge key={p} variant="outline" className="text-xs">
                        {getPermissionLabel(p)}
                      </Badge>
                    ))
                  ) : (
                    <span className="text-sm text-muted-foreground italic">Nenhuma permissão</span>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <UserDialog 
                    mode="edit" 
                    user={user} 
                    trigger={
                      <Button variant="ghost" size="icon" className="h-8 w-8 cursor-pointer">
                        <Edit className="h-4 w-4" />
                      </Button>
                    }
                  />
                  
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50 cursor-pointer"
                    onClick={() => handleDelete(user.id)}
                    disabled={isDeleting === user.id || user.role === "owner"}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
          {initialUsers.length === 0 && (
            <TableRow>
              <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                Nenhum usuário encontrado.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}
