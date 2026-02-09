"use client"

import { useEffect, useState } from "react"
import { Plus, Users, Pencil, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"

import { getStaff, createStaff, updateStaff, deleteStaff } from "@/features/team/actions"

interface Staff {
  id: string
  name: string
  role: string
  color: string | null
  email: string | null
  phone: string | null
}

const ROLES = ["Gerente", "Recepcionista", "Camareira", "Ajudante Geral", "Cozinha", "Manutenção"]
const COLORS = [
  { name: "Azul", value: "#3b82f6" },
  { name: "Verde", value: "#22c55e" },
  { name: "Vermelho", value: "#ef4444" },
  { name: "Amarelo", value: "#eab308" },
  { name: "Roxo", value: "#a855f7" },
  { name: "Rosa", value: "#ec4899" },
]

export function TeamOrgChart() {
  const [data, setData] = useState<Staff[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingStaff, setEditingStaff] = useState<Staff | null>(null)

  // Form states
  const [name, setName] = useState("")
  const [role, setRole] = useState("")
  const [color, setColor] = useState("#3b82f6")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")

  useEffect(() => {
    loadStaff()
  }, [])

  async function loadStaff() {
    try {
      const staff = await getStaff()
      setData(staff)
    } catch (error) {
      toast.error("Erro ao carregar equipe")
    } finally {
      setLoading(false)
    }
  }

  function handleOpenDialog(staff?: Staff) {
    if (staff) {
      setEditingStaff(staff)
      setName(staff.name)
      setRole(staff.role)
      setColor(staff.color || "#3b82f6")
      setEmail(staff.email || "")
      setPhone(staff.phone || "")
    } else {
      setEditingStaff(null)
      setName("")
      setRole("")
      setColor("#3b82f6")
      setEmail("")
      setPhone("")
    }
    setIsDialogOpen(true)
  }

  async function handleSubmit() {
    try {
      if (!name || !role) {
        toast.error("Nome e Cargo são obrigatórios")
        return
      }

      if (editingStaff) {
        await updateStaff(editingStaff.id, { name, role, color, email, phone })
        toast.success("Funcionário atualizado!")
      } else {
        await createStaff({ name, role, color, email, phone })
        toast.success("Funcionário adicionado!")
      }

      setIsDialogOpen(false)
      loadStaff()
    } catch (error) {
      toast.error("Erro ao salvar funcionário")
    }
  }

  async function handleDelete(id: string) {
    if (confirm("Tem certeza que deseja remover este funcionário?")) {
      try {
        await deleteStaff(id)
        toast.success("Funcionário removido")
        loadStaff()
      } catch (error) {
        toast.error("Erro ao remover")
      }
    }
  }

  // Agrupando por cargo para visual hierárquico simples
  const managers = data.filter(s => s.role === "Gerente")
  const others = data.filter(s => s.role !== "Gerente")

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Button onClick={() => handleOpenDialog()}>
          <Plus className="mr-2 h-4 w-4" />
          Adicionar Funcionário
        </Button>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingStaff ? "Editar Funcionário" : "Novo Funcionário"}</DialogTitle>
            <DialogDescription>
              Preencha os dados do colaborador abaixo.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Nome Completo</Label>
              <Input id="name" value={name} onChange={e => setName(e.target.value)} placeholder="Ex: Maria Silva" />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                <Label htmlFor="role">Cargo</Label>
                <Select value={role} onValueChange={setRole}>
                    <SelectTrigger>
                    <SelectValue placeholder="Selecione..." />
                    </SelectTrigger>
                    <SelectContent>
                    {ROLES.map(r => (
                        <SelectItem key={r} value={r}>{r}</SelectItem>
                    ))}
                    </SelectContent>
                </Select>
                </div>
                <div className="grid gap-2">
                <Label htmlFor="color">Cor (Escala)</Label>
                <Select value={color} onValueChange={setColor}>
                    <SelectTrigger>
                    <div className="flex items-center gap-2">
                        <div className="h-3 w-3 rounded-full" style={{ backgroundColor: color }} />
                        <SelectValue />
                    </div>
                    </SelectTrigger>
                    <SelectContent>
                    {COLORS.map(c => (
                        <SelectItem key={c.value} value={c.value}>
                        <div className="flex items-center gap-2">
                            <div className="h-3 w-3 rounded-full" style={{ backgroundColor: c.value }} />
                            {c.name}
                        </div>
                        </SelectItem>
                    ))}
                    </SelectContent>
                </Select>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                    <Label htmlFor="email">Email (Opcional)</Label>
                    <Input id="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="email@exemplo.com" />
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="phone">Telefone (Opcional)</Label>
                    <Input id="phone" value={phone} onChange={e => setPhone(e.target.value)} placeholder="(00) 00000-0000" />
                </div>
            </div>

          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancelar</Button>
            <Button onClick={handleSubmit}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Visualização Hierárquica Simplificada */}
      <div className="space-y-8">
        {/* Gestão */}
        {managers.length > 0 && (
            <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                    Gestão
                    <Badge variant="outline">{managers.length}</Badge>
                </h3>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    {managers.map(staff => (
                        <StaffCard 
                            key={staff.id} 
                            staff={staff} 
                            onEdit={() => handleOpenDialog(staff)} 
                            onDelete={() => handleDelete(staff.id)} 
                        />
                    ))}
                </div>
            </div>
        )}

        {/* Colaboradores */}
        <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
                Colaboradores
                <Badge variant="outline">{others.length}</Badge>
            </h3>
            {others.length === 0 ? (
                 <div className="text-center py-10 text-muted-foreground border rounded-lg border-dashed">
                    <Users className="mx-auto h-10 w-10 opacity-20 mb-2" />
                    <p>Nenhum colaborador cadastrado</p>
                 </div>
            ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    {others.map(staff => (
                        <StaffCard 
                            key={staff.id} 
                            staff={staff} 
                            onEdit={() => handleOpenDialog(staff)} 
                            onDelete={() => handleDelete(staff.id)} 
                        />
                    ))}
                </div>
            )}
        </div>
      </div>
    </div>
  )
}

function StaffCard({ staff, onEdit, onDelete }: { staff: Staff, onEdit: () => void, onDelete: () => void }) {
    return (
        <Card className="hover:border-primary/50 transition-colors cursor-pointer group relative" onClick={onEdit}>
            <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-muted text-muted-foreground font-bold text-sm" style={{ borderLeft: `3px solid ${staff.color || '#ccc'}` }}>
                        {staff.name.substring(0, 2).toUpperCase()}
                    </div>
                </div>
                <CardTitle className="mt-2 text-base">{staff.name}</CardTitle>
                <CardDescription>{staff.role}</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="text-xs text-muted-foreground space-y-1">
                    {staff.email && <p>{staff.email}</p>}
                    {staff.phone && <p>{staff.phone}</p>}
                </div>
            </CardContent>
            <Button 
                variant="ghost" 
                size="icon" 
                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                onClick={(e) => {
                    e.stopPropagation()
                    onDelete()
                }}
            >
                <Trash2 className="h-4 w-4" />
            </Button>
        </Card>
    )
}
