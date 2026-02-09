"use client"

import type { Row } from "@tanstack/react-table"
import {
  Eye,
  MoreHorizontal,
  Pencil,
  Trash2,
  CalendarCheck,
  CalendarX,
  CheckCircle2,
  Ban,
  AlertTriangle,
} from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
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
import { toast } from "sonner"
import type { BookingWithDetails } from "@/features/bookings/types"
import { updateBookingStatus, cancelBooking, deleteBooking } from "@/features/bookings"

interface BookingRowActionsProps {
  row: Row<BookingWithDetails>
  onRefresh?: () => void
}

type DialogType = "cancel" | "delete" | null

export function BookingRowActions({ row, onRefresh }: BookingRowActionsProps) {
  const router = useRouter()
  const booking = row.original
  const [loading, setLoading] = useState(false)
  const [dialogType, setDialogType] = useState<DialogType>(null)

  const triggerRefresh = () => {
    if (onRefresh) {
      onRefresh()
    } else {
      router.refresh()
    }
  }

  const handleStatusChange = async (status: string) => {
    setLoading(true)
    try {
      const result = await updateBookingStatus(booking.id, status as any)
      if (result.success) {
        toast.success("Status atualizado!")
        triggerRefresh()
      } else {
        toast.error(result.error || "Erro ao atualizar status")
      }
    } catch (error) {
      toast.error("Erro ao atualizar status")
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = async () => {
    setLoading(true)
    try {
      const result = await cancelBooking(booking.id, "Cancelado pelo usuário")
      if (result.success) {
        toast.success("Reserva cancelada!")
        setDialogType(null)
        triggerRefresh()
      } else {
        toast.error(result.error || "Erro ao cancelar reserva")
      }
    } catch (error) {
      toast.error("Erro ao cancelar reserva")
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    setLoading(true)
    try {
      const result = await deleteBooking(booking.id)
      if (result.success) {
        toast.success("Reserva excluída permanentemente!")
        setDialogType(null)
        triggerRefresh()
      } else {
        toast.error(result.error || "Erro ao excluir reserva")
      }
    } catch (error) {
      toast.error("Erro ao excluir reserva")
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="flex h-8 w-8 p-0 data-[state=open]:bg-muted cursor-pointer"
            disabled={loading}
          >
            <MoreHorizontal className="h-4 w-4" />
            <span className="sr-only">Abrir menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-[180px]">
          <DropdownMenuItem
            className="cursor-pointer"
            onClick={() => router.push(`/bookings/${booking.id}`)}
          >
            <Eye className="mr-2 h-4 w-4" />
            Ver detalhes
          </DropdownMenuItem>
          <DropdownMenuItem
            className="cursor-pointer"
            onClick={() => router.push(`/bookings/${booking.id}/edit`)}
          >
            <Pencil className="mr-2 h-4 w-4" />
            Editar
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          
          {/* Ações rápidas de status */}
          {booking.status === "PRE_BOOKING" && (
            <DropdownMenuItem
              className="cursor-pointer text-green-600"
              onClick={() => handleStatusChange("CONFIRMED")}
            >
              <CheckCircle2 className="mr-2 h-4 w-4" />
              Confirmar
            </DropdownMenuItem>
          )}
          
          {booking.status === "CONFIRMED" && (
            <DropdownMenuItem
              className="cursor-pointer text-blue-600"
              onClick={() => handleStatusChange("CHECKED_IN")}
            >
              <CalendarCheck className="mr-2 h-4 w-4" />
              Check-in
            </DropdownMenuItem>
          )}
          
          {booking.status === "CHECKED_IN" && (
            <DropdownMenuItem
              className="cursor-pointer"
              onClick={() => handleStatusChange("CHECKED_OUT")}
            >
              <CalendarX className="mr-2 h-4 w-4" />
              Check-out
            </DropdownMenuItem>
          )}
          
          <DropdownMenuSub>
            <DropdownMenuSubTrigger className="cursor-pointer">
              Alterar Status
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              <DropdownMenuItem onClick={() => handleStatusChange("PRE_BOOKING")}>
                Pré-Reserva
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleStatusChange("CONFIRMED")}>
                Confirmada
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleStatusChange("CHECKED_IN")}>
                Check-in
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleStatusChange("CHECKED_OUT")}>
                Check-out
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleStatusChange("NO_SHOW")}>
                No-Show
              </DropdownMenuItem>
            </DropdownMenuSubContent>
          </DropdownMenuSub>
          
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="cursor-pointer text-amber-600 focus:text-amber-600"
            onClick={() => setDialogType("cancel")}
          >
            <Ban className="mr-2 h-4 w-4" />
            Cancelar Reserva
          </DropdownMenuItem>
          <DropdownMenuItem
            className="cursor-pointer text-red-600 focus:text-red-600"
            onClick={() => setDialogType("delete")}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Excluir Permanente
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Dialog de Cancelamento */}
      <AlertDialog open={dialogType === "cancel"} onOpenChange={(open) => !open && setDialogType(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Ban className="h-5 w-5 text-amber-600" />
              Cancelar reserva?
            </AlertDialogTitle>
            <AlertDialogDescription>
              A reserva <strong>{booking.bookingNumber}</strong> será marcada como cancelada.
              <br />
              <span className="text-muted-foreground">Hóspede: {booking.guest?.name}</span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={loading}>Voltar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleCancel} 
              disabled={loading}
              className="bg-amber-600 hover:bg-amber-700"
            >
              {loading ? "Cancelando..." : "Cancelar Reserva"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Dialog de Exclusão Permanente */}
      <AlertDialog open={dialogType === "delete"} onOpenChange={(open) => !open && setDialogType(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="h-5 w-5" />
              Excluir permanentemente?
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              <span className="block">
                A reserva <strong>{booking.bookingNumber}</strong> e todas as suas transações 
                serão excluídas permanentemente.
              </span>
              <span className="block text-muted-foreground">
                Hóspede: {booking.guest?.name}
              </span>
              <span className="block text-red-600 font-medium mt-2">
                ⚠️ Esta ação é IRREVERSÍVEL!
              </span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={loading}>Voltar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete} 
              disabled={loading}
              className="bg-red-600 hover:bg-red-700"
            >
              {loading ? "Excluindo..." : "🗑️ Excluir Permanente"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
