"use client"

import { useState } from "react"
import type { Row } from "@tanstack/react-table"
import { Eye, MoreHorizontal, Pencil, Trash2, History, AlertTriangle } from "lucide-react"
import { useRouter } from "next/navigation"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import type { GuestWithBookingCount } from "@/features/guests/types"
import { deleteGuest } from "@/features/guests"

interface GuestRowActionsProps {
  row: Row<GuestWithBookingCount>
}

export function GuestRowActions({ row }: GuestRowActionsProps) {
  const router = useRouter()
  const guest = row.original
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [showBlockedDialog, setShowBlockedDialog] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      const result = await deleteGuest(guest.id)
      if (result.success) {
        // Recarregar a página para atualizar a lista
        router.refresh()
        setShowDeleteDialog(false)
      } else {
        // Se bloqueado por ter reservas, mostrar dialog especial
        setShowDeleteDialog(false)
        setShowBlockedDialog(true)
      }
    } catch (error) {
      console.error("Erro ao excluir hóspede:", error)
      alert("Erro ao excluir hóspede")
    } finally {
      setIsDeleting(false)
    }
  }

  const hasBookings = guest._count?.bookings > 0

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="flex h-8 w-8 p-0 data-[state=open]:bg-muted cursor-pointer"
          >
            <MoreHorizontal className="h-4 w-4" />
            <span className="sr-only">Abrir menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-[180px]">
          <DropdownMenuItem
            className="cursor-pointer"
            onClick={() => router.push(`/guests/${guest.id}`)}
          >
            <Eye className="mr-2 h-4 w-4" />
            Ver detalhes
          </DropdownMenuItem>
          <DropdownMenuItem
            className="cursor-pointer"
            onClick={() => router.push(`/guests/${guest.id}/edit`)}
          >
            <Pencil className="mr-2 h-4 w-4" />
            Editar
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="cursor-pointer text-destructive focus:text-destructive"
            onClick={() => setShowDeleteDialog(true)}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Excluir
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Dialog de confirmação normal */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Tem certeza?</AlertDialogTitle>
            <AlertDialogDescription>
              Você está prestes a excluir o hóspede <strong>{guest.name}</strong>.
              {hasBookings && (
                <>
                  <br />
                  <br />
                  <span className="text-warning font-medium flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4" />
                    Este hóspede possui {guest._count.bookings} reserva(s) associada(s).
                  </span>
                </>
              )}
              <br />
              <br />
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive hover:bg-destructive/90"
            >
              {isDeleting ? "Excluindo..." : "Sim, excluir"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Dialog quando bloqueado por ter reservas */}
      <AlertDialog open={showBlockedDialog} onOpenChange={setShowBlockedDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <div className="flex items-center gap-2 text-warning">
              <AlertTriangle className="h-6 w-6" />
              <AlertDialogTitle>Não é possível excluir</AlertDialogTitle>
            </div>
            <AlertDialogDescription className="space-y-3 pt-2">
              <p>
                <strong>{guest.name}</strong> possui <strong>{guest._count?.bookings || 0} reserva(s)</strong> associada(s).
              </p>
              <p>
                Para excluir este hóspede, você precisa primeiro cancelar todas as reservas.
              </p>
              <div className="bg-muted p-3 rounded-lg text-sm">
                <p className="font-medium mb-1">💡 Próximos passos:</p>
                <ol className="list-decimal list-inside space-y-1">
                  <li>Acesse o histórico de reservas do hóspede</li>
                  <li>Cancele todas as reservas ativas</li>
                  <li>Tente excluir novamente</li>
                </ol>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col sm:flex-row gap-2">
            <AlertDialogCancel className="sm:order-2">Fechar</AlertDialogCancel>
            <Button
              asChild
              variant="default"
              className="sm:order-1"
            >
              <Link href={`/guests/${guest.id}`}>
                <Eye className="mr-2 h-4 w-4" />
                Ver Detalhes
              </Link>
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
