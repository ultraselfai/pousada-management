"use client"

import { useEffect, useState, useCallback } from "react"
import Link from "next/link"
import {
  BedDouble,
  Plus,
  MoreHorizontal,
  Pencil,
  Trash2,
  Eye,
  RefreshCw,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Wrench,
} from "lucide-react"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { CurrencyInput, parseCurrencyToNumber } from "@/components/ui/currency-input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"

import { getRooms, deleteRoom, createRoom, updateRoom } from "@/features/rooms"
import type { Room } from "@/features/rooms/types"

const statusLabels: Record<string, string> = {
  AVAILABLE: "Disponível",
  OCCUPIED: "Ocupado",
  CLEANING: "Limpeza",
  MAINTENANCE: "Manutenção",
  BLOCKED: "Bloqueado",
}

const statusColors: Record<string, string> = {
  AVAILABLE: "bg-green-100 text-green-800 border-green-300",
  OCCUPIED: "bg-blue-100 text-blue-800 border-blue-300",
  CLEANING: "bg-yellow-100 text-yellow-800 border-yellow-300",
  MAINTENANCE: "bg-orange-100 text-orange-800 border-orange-300",
  BLOCKED: "bg-red-100 text-red-800 border-red-300",
}

const statusIcons: Record<string, React.ElementType> = {
  AVAILABLE: CheckCircle,
  OCCUPIED: BedDouble,
  CLEANING: RefreshCw,
  MAINTENANCE: Wrench,
  BLOCKED: XCircle,
}

const categoryLabels: Record<string, string> = {
  STANDARD: "Standard",
  LUXO: "Luxo",
  LUXO_SUPERIOR: "Luxo Superior",
}

const categoryColors: Record<string, string> = {
  STANDARD: "bg-gray-100 text-gray-800",
  LUXO: "bg-purple-100 text-purple-800",
  LUXO_SUPERIOR: "bg-amber-100 text-amber-800",
}

export default function RoomsPage() {
  const [rooms, setRooms] = useState<Room[]>([])
  const [loading, setLoading] = useState(true)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [roomToDelete, setRoomToDelete] = useState<string | null>(null)
  const [forceDelete, setForceDelete] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)
  const [formDialogOpen, setFormDialogOpen] = useState(false)
  const [editingRoom, setEditingRoom] = useState<Room | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    category: "STANDARD" as "STANDARD" | "LUXO" | "LUXO_SUPERIOR",
    basePrice: "",
    maxGuests: "",
    equipment: [] as string[],
    description: "",
    status: "AVAILABLE" as "AVAILABLE" | "OCCUPIED" | "CLEANING" | "MAINTENANCE" | "BLOCKED",
  })
  const [submitting, setSubmitting] = useState(false)

  const loadRooms = useCallback(async () => {
    try {
      setLoading(true)
      const result = await getRooms()
      if (result.success) {
        setRooms(result.rooms)
      }
    } catch (error) {
      console.error("Erro ao carregar quartos:", error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadRooms()
  }, [loadRooms])

  const handleDelete = async (force: boolean = false) => {
    if (!roomToDelete) return
    setDeleteError(null)
    try {
      const result = await deleteRoom(roomToDelete, force)
      if (result.success) {
        await loadRooms()
        setDeleteDialogOpen(false)
        setRoomToDelete(null)
        setForceDelete(false)
      } else {
        // Se falhou por ter reservas ativas, mostrar opção de forçar
        setDeleteError(result.error || "Erro ao excluir")
        setForceDelete(true)
      }
    } catch (error) {
      console.error("Erro ao excluir quarto:", error)
      setDeleteError("Erro inesperado ao excluir")
    }
  }

  const openCreateDialog = () => {
    setEditingRoom(null)
    setFormData({
      name: "",
      category: "STANDARD",
      basePrice: "",
      maxGuests: "",
      equipment: [],
      description: "",
      status: "AVAILABLE",
    })
    setFormDialogOpen(true)
  }

  const openEditDialog = (room: Room) => {
    setEditingRoom(room)
    setFormData({
      name: room.name,
      category: room.category as "STANDARD" | "LUXO" | "LUXO_SUPERIOR",
      basePrice: String(room.basePrice),
      maxGuests: String(room.maxGuests),
      equipment: room.equipment as string[] || [],
      description: room.description || "",
      status: room.status as "AVAILABLE" | "OCCUPIED" | "CLEANING" | "MAINTENANCE" | "BLOCKED",
    })
    setFormDialogOpen(true)
  }

  const handleSubmit = async () => {
    if (!formData.name || !formData.basePrice) return
    setSubmitting(true)
    try {
      if (editingRoom) {
        await updateRoom({
          id: editingRoom.id,
          name: formData.name,
          category: formData.category,
          basePrice: parseCurrencyToNumber(formData.basePrice),
          maxGuests: Number(formData.maxGuests) || 2,
          equipment: formData.equipment,
          description: formData.description || undefined,
          status: formData.status,
        })
      } else {
        await createRoom({
          name: formData.name,
          category: formData.category,
          basePrice: parseCurrencyToNumber(formData.basePrice),
          maxGuests: Number(formData.maxGuests) || 2,
          equipment: formData.equipment,
          description: formData.description || undefined,
          bedTypes: [{ type: "casal", qty: 1 }],
          hasBathroom: true,
          photos: [],
        })
      }
      await loadRooms()
      setFormDialogOpen(false)
    } catch (error) {
      console.error("Erro ao salvar quarto:", error)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex flex-1 flex-col px-4 md:px-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-64 mt-2" />
          </div>
          <Skeleton className="h-9 w-32" />
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-48" />
          ))}
        </div>
      </div>
    )
  }

  // Status summary
  const statusSummary = rooms.reduce((acc, room) => {
    acc[room.status] = (acc[room.status] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  return (
    <div className="flex flex-1 flex-col px-4 md:px-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <BedDouble className="h-6 w-6" />
            Gerenciamento de Quartos
          </h1>
          <p className="text-muted-foreground">
            {rooms.length} quarto{rooms.length !== 1 ? "s" : ""} cadastrado{rooms.length !== 1 ? "s" : ""}
          </p>
        </div>
        <Button asChild>
          <Link href="/rooms/new">
            <Plus className="mr-2 h-4 w-4" />
            Novo Quarto
          </Link>
        </Button>
      </div>

      {/* Status summary */}
      <div className="flex flex-wrap gap-3">
        {Object.entries(statusSummary).map(([status, count]) => {
          const Icon = statusIcons[status] || BedDouble
          return (
            <Badge key={status} variant="outline" className={`${statusColors[status]} px-3 py-1`}>
              <Icon className="h-3 w-3 mr-1" />
              {statusLabels[status]}: {count}
            </Badge>
          )
        })}
      </div>

      {/* Grid de quartos */}
      {rooms.length === 0 ? (
        <Card className="flex flex-col items-center justify-center py-12">
          <BedDouble className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="font-semibold text-lg">Nenhum quarto cadastrado</h3>
          <p className="text-muted-foreground text-center max-w-md mt-1">
            Comece cadastrando os quartos da pousada para gerenciar reservas e manutenções.
          </p>
          <Button className="mt-4" asChild>
            <Link href="/rooms/new">
              <Plus className="mr-2 h-4 w-4" />
              Cadastrar Primeiro Quarto
            </Link>
          </Button>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {rooms.map((room) => {
            const StatusIcon = statusIcons[room.status] || BedDouble
            return (
              <Card key={room.id} className="relative">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        {room.name}
                      </CardTitle>
                      <CardDescription className="flex items-center gap-2 mt-1">
                        <Badge variant="secondary" className={categoryColors[room.category]}>
                          {categoryLabels[room.category]}
                        </Badge>
                      </CardDescription>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => openEditDialog(room)}>
                          <Pencil className="mr-2 h-4 w-4" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-red-600"
                          onClick={() => {
                            setRoomToDelete(room.id)
                            setDeleteDialogOpen(true)
                          }}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Excluir
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Status</span>
                      <Badge variant="outline" className={statusColors[room.status]}>
                        <StatusIcon className="h-3 w-3 mr-1" />
                        {statusLabels[room.status]}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Diária</span>
                      <span className="font-semibold">
                        {new Intl.NumberFormat("pt-BR", {
                          style: "currency",
                          currency: "BRL",
                        }).format(Number(room.basePrice))}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Capacidade</span>
                      <span className="text-sm">{room.maxGuests} hóspede{room.maxGuests !== 1 ? "s" : ""}</span>
                    </div>
                    {room.equipment && (room.equipment as string[]).length > 0 && (
                      <div className="flex flex-wrap gap-1 pt-2">
                        {(room.equipment as string[]).slice(0, 3).map((item) => (
                          <Badge key={item} variant="secondary" className="text-xs">
                            {item}
                          </Badge>
                        ))}
                        {(room.equipment as string[]).length > 3 && (
                          <Badge variant="secondary" className="text-xs">
                            +{(room.equipment as string[]).length - 3}
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* Delete confirmation dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={(open) => {
        setDeleteDialogOpen(open)
        if (!open) {
          setDeleteError(null)
          setForceDelete(false)
          setRoomToDelete(null)
        }
      }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {forceDelete ? "⚠️ Forçar exclusão?" : "Excluir quarto?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {deleteError ? (
                <span className="text-amber-600">{deleteError}</span>
              ) : (
                "Esta ação não pode ser desfeita. Isso excluirá permanentemente o quarto e removerá todos os dados associados."
              )}
              {forceDelete && (
                <span className="block mt-2 text-red-600 font-medium">
                  Ao forçar a exclusão, TODAS as reservas associadas a este quarto também serão excluídas permanentemente!
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            {forceDelete ? (
              <AlertDialogAction 
                onClick={() => handleDelete(true)} 
                className="bg-red-600 hover:bg-red-700"
              >
                🗑️ Forçar Exclusão
              </AlertDialogAction>
            ) : (
              <AlertDialogAction 
                onClick={() => handleDelete(false)} 
                className="bg-red-600 hover:bg-red-700"
              >
                Excluir
              </AlertDialogAction>
            )}
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Create/Edit dialog */}
      <Dialog open={formDialogOpen} onOpenChange={setFormDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingRoom ? "Editar Quarto" : "Novo Quarto"}
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Nome do Quarto *</Label>
              <Input
                id="name"
                placeholder="Ex: Apto 01"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="category">Categoria *</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData({ ...formData, category: value as typeof formData.category })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="STANDARD">Standard</SelectItem>
                  <SelectItem value="LUXO">Luxo</SelectItem>
                  <SelectItem value="LUXO_SUPERIOR">Luxo Superior</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="basePrice">Diária *</Label>
                <CurrencyInput
                  id="basePrice"
                  value={formData.basePrice}
                  onChange={(value) => setFormData({ ...formData, basePrice: value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="maxGuests">Capacidade</Label>
                <Input
                  id="maxGuests"
                  type="number"
                  placeholder="2"
                  value={formData.maxGuests}
                  onChange={(e) => setFormData({ ...formData, maxGuests: e.target.value })}
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                placeholder="Descrição do quarto..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
            {editingRoom && (
              <div className="grid gap-2">
                <Label htmlFor="status">Status do Quarto</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => setFormData({ ...formData, status: value as typeof formData.status })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="AVAILABLE">✅ Disponível</SelectItem>
                    <SelectItem value="CLEANING">🧹 Limpeza</SelectItem>
                    <SelectItem value="MAINTENANCE">🔧 Manutenção</SelectItem>
                    <SelectItem value="BLOCKED">🚫 Bloqueado</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Quartos em manutenção ou bloqueados não podem ser reservados
                </p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setFormDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSubmit} disabled={submitting || !formData.name || !formData.basePrice}>
              {submitting ? "Salvando..." : editingRoom ? "Salvar" : "Criar Quarto"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
