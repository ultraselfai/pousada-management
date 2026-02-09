"use client"

import { useEffect, useState, useCallback } from "react"
import {
  Wrench,
  Plus,
  MoreHorizontal,
  Pencil,
  Check,
  BedDouble,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Play,
  Trash2,
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"

import {
  getMaintenances,
  createMaintenance,
  updateMaintenance,
  completeMaintenance,
  startMaintenance,
  deleteMaintenance,
  type MaintenanceWithRoom,
} from "@/features/maintenance"
import { getRooms } from "@/features/rooms"

// Labels
const typeLabels: Record<string, string> = {
  CLEANING: "Limpeza",
  REPAIR: "Reparo",
  INSPECTION: "Inspeção",
}

const statusLabels: Record<string, string> = {
  PENDING: "Pendente",
  IN_PROGRESS: "Em Andamento",
  COMPLETED: "Concluído",
}

const statusColors: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-800 border-yellow-300",
  IN_PROGRESS: "bg-blue-100 text-blue-800 border-blue-300",
  COMPLETED: "bg-green-100 text-green-800 border-green-300",
}

const priorityLabels: Record<string, string> = {
  LOW: "Baixa",
  MEDIUM: "Média",
  HIGH: "Alta",
}

const priorityColors: Record<string, string> = {
  LOW: "bg-gray-100 text-gray-800",
  MEDIUM: "bg-orange-100 text-orange-800",
  HIGH: "bg-red-100 text-red-800",
}

interface Room {
  id: string
  name: string
  category: string
}

export default function MaintenancePage() {
  const [maintenances, setMaintenances] = useState<MaintenanceWithRoom[]>([])
  const [rooms, setRooms] = useState<Room[]>([])
  const [loading, setLoading] = useState(true)
  const [formDialogOpen, setFormDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [maintenanceToDelete, setMaintenanceToDelete] = useState<string | null>(null)
  const [editingMaintenance, setEditingMaintenance] = useState<MaintenanceWithRoom | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    roomId: "",
    type: "CLEANING" as string,
    description: "",
    priority: "MEDIUM" as string,
    assignedTo: "",
  })

  const loadData = useCallback(async () => {
    try {
      setLoading(true)
      const [maintenanceResult, roomsResult] = await Promise.all([
        getMaintenances(),
        getRooms(),
      ])
      
      if (maintenanceResult.success) {
        setMaintenances(maintenanceResult.maintenances)
      }
      if (roomsResult.success) {
        setRooms(roomsResult.rooms)
      }
    } catch (error) {
      console.error("Erro ao carregar dados:", error)
      toast.error("Erro ao carregar dados")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  const openCreateDialog = () => {
    setEditingMaintenance(null)
    setFormData({
      roomId: "",
      type: "CLEANING",
      description: "",
      priority: "MEDIUM",
      assignedTo: "",
    })
    setFormDialogOpen(true)
  }

  const openEditDialog = (maintenance: MaintenanceWithRoom) => {
    setEditingMaintenance(maintenance)
    setFormData({
      roomId: maintenance.roomId,
      type: maintenance.type,
      description: maintenance.description || "",
      priority: maintenance.priority,
      assignedTo: maintenance.assignedTo || "",
    })
    setFormDialogOpen(true)
  }

  const handleSubmit = async () => {
    if (!formData.roomId) {
      toast.error("Selecione um quarto")
      return
    }

    setSubmitting(true)
    try {
      let result
      if (editingMaintenance) {
        result = await updateMaintenance(editingMaintenance.id, {
          type: formData.type as any,
          priority: formData.priority as any,
          description: formData.description || undefined,
          assignedTo: formData.assignedTo || undefined,
        })
      } else {
        result = await createMaintenance({
          roomId: formData.roomId,
          type: formData.type as any,
          priority: formData.priority as any,
          description: formData.description || undefined,
          assignedTo: formData.assignedTo || undefined,
        })
      }

      if (result.success) {
        toast.success(result.message)
        setFormDialogOpen(false)
        await loadData()
      } else {
        toast.error(result.error)
      }
    } catch (error) {
      toast.error("Erro ao salvar manutenção")
    } finally {
      setSubmitting(false)
    }
  }

  const handleStart = async (id: string) => {
    const result = await startMaintenance(id)
    if (result.success) {
      toast.success("Manutenção iniciada!")
      await loadData()
    } else {
      toast.error(result.error)
    }
  }

  const handleComplete = async (id: string) => {
    const result = await completeMaintenance(id)
    if (result.success) {
      toast.success("Manutenção concluída!")
      await loadData()
    } else {
      toast.error(result.error)
    }
  }

  const handleDelete = async () => {
    if (!maintenanceToDelete) return
    
    const result = await deleteMaintenance(maintenanceToDelete)
    if (result.success) {
      toast.success("Manutenção excluída!")
      setDeleteDialogOpen(false)
      setMaintenanceToDelete(null)
      await loadData()
    } else {
      toast.error(result.error)
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
        <div className="grid gap-4 md:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-48" />
          ))}
        </div>
      </div>
    )
  }

  // Summary
  const pendingCount = maintenances.filter((m) => m.status === "PENDING").length
  const inProgressCount = maintenances.filter((m) => m.status === "IN_PROGRESS").length
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const completedTodayCount = maintenances.filter((m) => {
    if (m.status !== "COMPLETED" || !m.completedAt) return false
    const completed = new Date(m.completedAt)
    completed.setHours(0, 0, 0, 0)
    return completed.getTime() === today.getTime()
  }).length

  return (
    <div className="flex flex-1 flex-col px-4 md:px-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Wrench className="h-6 w-6" />
            Manutenções
          </h1>
          <p className="text-muted-foreground">
            Gerencie limpezas, reparos e inspeções dos quartos
          </p>
        </div>
        <Button onClick={openCreateDialog}>
          <Plus className="mr-2 h-4 w-4" />
          Nova Manutenção
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-yellow-200 bg-yellow-50/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-yellow-800 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Pendentes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-yellow-700">{pendingCount}</div>
          </CardContent>
        </Card>

        <Card className="border-blue-200 bg-blue-50/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-blue-800 flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Em Andamento
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-700">{inProgressCount}</div>
          </CardContent>
        </Card>

        <Card className="border-green-200 bg-green-50/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-green-800 flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4" />
              Concluídas (Hoje)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-700">{completedTodayCount}</div>
          </CardContent>
        </Card>
      </div>

      {/* Maintenances List */}
      {maintenances.length === 0 ? (
        <Card className="flex flex-col items-center justify-center py-12">
          <Wrench className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="font-semibold text-lg">Nenhuma manutenção registrada</h3>
          <p className="text-muted-foreground text-center max-w-md mt-1">
            Registre limpezas, reparos e inspeções para manter os quartos em perfeito estado.
          </p>
          <Button className="mt-4" onClick={openCreateDialog}>
            <Plus className="mr-2 h-4 w-4" />
            Registrar Manutenção
          </Button>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {maintenances.map((maintenance) => (
            <Card key={maintenance.id} className="relative">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2 text-base">
                      <BedDouble className="h-4 w-4 text-muted-foreground" />
                      {maintenance.room?.name || "Quarto"}
                    </CardTitle>
                    <CardDescription className="flex items-center gap-2 mt-1">
                      <Badge variant="outline">{typeLabels[maintenance.type]}</Badge>
                      <Badge variant="outline" className={priorityColors[maintenance.priority]}>
                        {priorityLabels[maintenance.priority]}
                      </Badge>
                    </CardDescription>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="cursor-pointer">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem 
                        className="cursor-pointer"
                        onClick={() => openEditDialog(maintenance)}
                      >
                        <Pencil className="mr-2 h-4 w-4" />
                        Editar
                      </DropdownMenuItem>
                      {maintenance.status === "PENDING" && (
                        <DropdownMenuItem 
                          className="cursor-pointer text-blue-600"
                          onClick={() => handleStart(maintenance.id)}
                        >
                          <Play className="mr-2 h-4 w-4" />
                          Iniciar
                        </DropdownMenuItem>
                      )}
                      {maintenance.status !== "COMPLETED" && (
                        <DropdownMenuItem 
                          className="cursor-pointer text-green-600"
                          onClick={() => handleComplete(maintenance.id)}
                        >
                          <Check className="mr-2 h-4 w-4" />
                          Marcar Concluído
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        className="cursor-pointer text-red-600"
                        onClick={() => {
                          setMaintenanceToDelete(maintenance.id)
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
                  <Badge variant="outline" className={statusColors[maintenance.status]}>
                    {statusLabels[maintenance.status]}
                  </Badge>

                  {maintenance.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {maintenance.description}
                    </p>
                  )}

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Responsável</span>
                    <span>{maintenance.assignedTo || "Não atribuído"}</span>
                  </div>

                  <div className="text-xs text-muted-foreground">
                    Criado em {new Date(maintenance.createdAt).toLocaleDateString("pt-BR")}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={formDialogOpen} onOpenChange={setFormDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingMaintenance ? "Editar Manutenção" : "Nova Manutenção"}
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="roomId">Quarto *</Label>
              <Select
                value={formData.roomId}
                onValueChange={(value) => setFormData({ ...formData, roomId: value })}
                disabled={!!editingMaintenance}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o quarto" />
                </SelectTrigger>
                <SelectContent>
                  {rooms.length === 0 ? (
                    <SelectItem value="" disabled>
                      Nenhum quarto cadastrado
                    </SelectItem>
                  ) : (
                    rooms.map((room) => (
                      <SelectItem key={room.id} value={room.id}>
                        {room.name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="type">Tipo *</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value) => setFormData({ ...formData, type: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CLEANING">Limpeza</SelectItem>
                    <SelectItem value="REPAIR">Reparo</SelectItem>
                    <SelectItem value="INSPECTION">Inspeção</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="priority">Prioridade</Label>
                <Select
                  value={formData.priority}
                  onValueChange={(value) => setFormData({ ...formData, priority: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="LOW">Baixa</SelectItem>
                    <SelectItem value="MEDIUM">Média</SelectItem>
                    <SelectItem value="HIGH">Alta</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="assignedTo">Responsável</Label>
              <Input
                id="assignedTo"
                placeholder="Nome do responsável"
                value={formData.assignedTo}
                onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                placeholder="Descreva a manutenção..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setFormDialogOpen(false)} disabled={submitting}>
              Cancelar
            </Button>
            <Button onClick={handleSubmit} disabled={submitting}>
              {submitting ? "Salvando..." : editingMaintenance ? "Salvar" : "Criar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-red-600">
              <Trash2 className="h-5 w-5" />
              Excluir manutenção?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. A manutenção será removida permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
