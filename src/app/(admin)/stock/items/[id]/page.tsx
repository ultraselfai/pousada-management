"use client"

import { useEffect, useState, use } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Package, Pencil, Save, Trash2, AlertTriangle } from "lucide-react"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Separator } from "@/components/ui/separator"

import { getItems, updateItem, adjustStock, deleteItem } from "@/features/stock"

interface StockItem {
  id: string
  name: string
  categoryId: string
  unit: string
  currentStock: number
  minimumStock: number
}

interface Props {
  params: Promise<{ id: string }>
}

export default function StockItemDetailsPage({ params }: Props) {
  const { id } = use(params)
  const router = useRouter()
  const [item, setItem] = useState<StockItem | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [editing, setEditing] = useState(false)
  const [adjustQuantity, setAdjustQuantity] = useState("")
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    unit: "",
    minimumStock: "",
  })

  useEffect(() => {
    async function loadItem() {
      try {
        const result = await getItems()
        if (result.success) {
          const found = result.items.find((i: StockItem) => i.id === id)
          if (found) {
            setItem(found)
            setFormData({
              name: found.name,
              unit: found.unit,
              minimumStock: String(found.minimumStock),
            })
          }
        }
      } catch (error) {
        console.error("Erro ao carregar item:", error)
      } finally {
        setLoading(false)
      }
    }
    loadItem()
  }, [id])

  const handleUpdate = async () => {
    if (!formData.name || !item) return

    setSubmitting(true)
    try {
      const result = await updateItem({
        id,
        name: formData.name,
        unit: formData.unit,
        minimumStock: Number(formData.minimumStock) || 5,
      })

      if (result.success) {
        setEditing(false)
        setItem({
          ...item,
          name: formData.name,
          unit: formData.unit,
          minimumStock: Number(formData.minimumStock) || 5,
        })
      }
    } catch (error) {
      console.error("Erro ao atualizar item:", error)
    } finally {
      setSubmitting(false)
    }
  }

  const handleAdjust = async (type: "add" | "remove") => {
    if (!adjustQuantity || !item) return

    const quantity = type === "add" 
      ? Math.abs(Number(adjustQuantity)) 
      : -Math.abs(Number(adjustQuantity))

    setSubmitting(true)
    try {
      const result = await adjustStock({ id, quantity })
      if (result.success) {
        setItem({
          ...item,
          currentStock: item.currentStock + quantity,
        })
        setAdjustQuantity("")
      }
    } catch (error) {
      console.error("Erro ao ajustar estoque:", error)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex flex-1 flex-col px-4 md:px-6 space-y-6">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-[400px]" />
      </div>
    )
  }

  if (!item) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center">
        <p>Item não encontrado</p>
        <Button asChild className="mt-4">
          <Link href="/stock">Voltar</Link>
        </Button>
      </div>
    )
  }

  const isLowStock = item.currentStock < item.minimumStock

  return (
    <div className="flex flex-1 flex-col px-4 md:px-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/stock">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
              <Package className="h-6 w-6" />
              {item.name}
            </h1>
            <div className="flex items-center gap-2 mt-1">
              {isLowStock && (
                <Badge variant="destructive">Estoque Baixo</Badge>
              )}
            </div>
          </div>
        </div>
        <Button variant="outline" onClick={() => setEditing(!editing)}>
          <Pencil className="mr-2 h-4 w-4" />
          {editing ? "Cancelar" : "Editar"}
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Stock Status */}
        <Card>
          <CardHeader>
            <CardTitle>Estoque Atual</CardTitle>
            <CardDescription>Quantidade disponível</CardDescription>
          </CardHeader>
          <CardContent>
            <div className={`text-4xl font-bold ${isLowStock ? "text-red-600" : "text-green-600"}`}>
              {item.currentStock} {item.unit}
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              Mínimo recomendado: {item.minimumStock} {item.unit}
            </p>
          </CardContent>
        </Card>

        {/* Quick Adjust */}
        <Card>
          <CardHeader>
            <CardTitle>Ajuste Rápido</CardTitle>
            <CardDescription>Adicione ou remova do estoque</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                type="number"
                min="0.01"
                step="0.01"
                placeholder="Quantidade"
                value={adjustQuantity}
                onChange={(e) => setAdjustQuantity(e.target.value)}
              />
              <span className="flex items-center text-muted-foreground">
                {item.unit}
              </span>
            </div>
            <div className="flex gap-2">
              <Button
                className="flex-1 bg-green-600 hover:bg-green-700"
                disabled={!adjustQuantity || submitting}
                onClick={() => handleAdjust("add")}
              >
                + Adicionar
              </Button>
              <Button
                variant="destructive"
                className="flex-1"
                disabled={!adjustQuantity || submitting}
                onClick={() => handleAdjust("remove")}
              >
                - Remover
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Edit Form */}
      {editing && (
        <Card>
          <CardHeader>
            <CardTitle>Editar Item</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Nome</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="unit">Unidade</Label>
                <Input
                  id="unit"
                  value={formData.unit}
                  onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="minimumStock">Estoque Mínimo</Label>
                <Input
                  id="minimumStock"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.minimumStock}
                  onChange={(e) => setFormData({ ...formData, minimumStock: e.target.value })}
                />
              </div>
            </div>
            <div className="flex justify-end">
              <Button onClick={handleUpdate} disabled={submitting}>
                <Save className="mr-2 h-4 w-4" />
                {submitting ? "Salvando..." : "Salvar"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Delete Confirmation */}
      <Card className="border-destructive/50">
        <CardHeader>
          <CardTitle className="text-destructive flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Zona de Perigo
          </CardTitle>
          <CardDescription>
            Ações irreversíveis para este item
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!showDeleteConfirm ? (
            <Button
              variant="destructive"
              onClick={() => {
                setDeleteError(null)
                setShowDeleteConfirm(true)
              }}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Excluir Item
            </Button>
          ) : (
            <div className="space-y-4">
              <p className="text-sm text-destructive font-medium">
                Tem certeza que deseja excluir "{item.name}"? Esta ação não pode ser desfeita.
              </p>
              {deleteError && (
                <p className="text-sm text-destructive bg-destructive/10 p-3 rounded-md border border-destructive/30">
                  {deleteError}
                </p>
              )}
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowDeleteConfirm(false)
                    setDeleteError(null)
                  }}
                  disabled={deleting}
                >
                  Cancelar
                </Button>
                <Button
                  variant="destructive"
                  disabled={deleting}
                  onClick={async () => {
                    setDeleting(true)
                    setDeleteError(null)
                    try {
                      const result = await deleteItem(id)
                      if (result.success) {
                        router.push("/stock")
                      } else {
                        setDeleteError(result.error || "Erro ao excluir item")
                      }
                    } catch (error) {
                      console.error("Erro ao excluir item:", error)
                      setDeleteError("Erro inesperado ao excluir item")
                    } finally {
                      setDeleting(false)
                    }
                  }}
                >
                  {deleting ? "Excluindo..." : "Sim, Excluir"}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
