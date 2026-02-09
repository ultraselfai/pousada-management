"use client"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Plus } from "lucide-react"
import { UserForm } from "@/features/users/components/user-form"
import { useState } from "react"

interface UserDialogProps {
  mode?: "create" | "edit"
  user?: any
  trigger?: React.ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export function UserDialog({ mode = "create", user, trigger, open: controlledOpen, onOpenChange }: UserDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false)
  
  const isControlled = controlledOpen !== undefined
  const open = isControlled ? controlledOpen : internalOpen
  const setOpen = onOpenChange || setInternalOpen

  const handleSuccess = () => {
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button className="cursor-pointer">
            <Plus className="mr-2 h-4 w-4" />
            Novo Usuário
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{mode === "create" ? "Criar Novo Usuário" : "Editar Usuário"}</DialogTitle>
          <DialogDescription>
            {mode === "create" 
              ? "Adicione um novo usuário e defina suas permissões de acesso." 
              : "Atualize os dados e permissões do usuário."
            }
          </DialogDescription>
        </DialogHeader>
        <UserForm user={user} onSuccess={handleSuccess} />
      </DialogContent>
    </Dialog>
  )
}
