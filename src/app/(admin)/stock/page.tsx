"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import {
  Package,
  Coffee,
  Waves,
  SprayCan,
  Wrench,
  Settings,
  AlertTriangle,
  ShoppingCart,
  Plus,
  Folder,
  Utensils,
  Droplets,
  Zap,
  Boxes,
} from "lucide-react"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { toast } from "sonner"
import { fetchCategories, fetchLowStockItems, createStockCategory } from "./actions"
import type { StockCategoryWithCount, LowStockAlert } from "@/features/stock/types"

// Ícones disponíveis para categorias
const availableIcons = [
  { id: "coffee", icon: Coffee, label: "Café" },
  { id: "waves", icon: Waves, label: "Piscina" },
  { id: "spray-can", icon: SprayCan, label: "Limpeza" },
  { id: "settings", icon: Settings, label: "Configurações" },
  { id: "wrench", icon: Wrench, label: "Ferramentas" },
  { id: "utensils", icon: Utensils, label: "Cozinha" },
  { id: "droplets", icon: Droplets, label: "Água" },
  { id: "zap", icon: Zap, label: "Energia" },
  { id: "boxes", icon: Boxes, label: "Geral" },
  { id: "folder", icon: Folder, label: "Pasta" },
]

const categoryIcons: Record<string, React.ElementType> = {
  "cafe-da-manha": Coffee,
  "piscina": Waves,
  "limpeza": SprayCan,
  "equipamentos": Settings,
  "manutencoes": Wrench,
  "coffee": Coffee,
  "waves": Waves,
  "spray-can": SprayCan,
  "settings": Settings,
  "wrench": Wrench,
  "utensils": Utensils,
  "droplets": Droplets,
  "zap": Zap,
  "boxes": Boxes,
  "folder": Folder,
}

const categoryColors: Record<string, string> = {
  "cafe-da-manha": "bg-orange-100 text-orange-800 border-orange-300",
  "piscina": "bg-blue-100 text-blue-800 border-blue-300",
  "limpeza": "bg-green-100 text-green-800 border-green-300",
  "equipamentos": "bg-purple-100 text-purple-800 border-purple-300",
  "manutencoes": "bg-gray-100 text-gray-800 border-gray-300",
}

// Cores disponíveis para novas categorias
const availableColors = [
  { id: "orange", class: "bg-orange-100 text-orange-800 border-orange-300" },
  { id: "blue", class: "bg-blue-100 text-blue-800 border-blue-300" },
  { id: "green", class: "bg-green-100 text-green-800 border-green-300" },
  { id: "purple", class: "bg-purple-100 text-purple-800 border-purple-300" },
  { id: "gray", class: "bg-gray-100 text-gray-800 border-gray-300" },
  { id: "red", class: "bg-red-100 text-red-800 border-red-300" },
  { id: "yellow", class: "bg-yellow-100 text-yellow-800 border-yellow-300" },
  { id: "teal", class: "bg-teal-100 text-teal-800 border-teal-300" },
]

export default function StockPage() {
  const [categories, setCategories] = useState<StockCategoryWithCount[]>([])
  const [lowStockItems, setLowStockItems] = useState<LowStockAlert[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [creating, setCreating] = useState(false)
  const [newCategory, setNewCategory] = useState({
    name: "",
    icon: "boxes",
    color: "gray",
  })

  const loadData = async () => {
    try {
      const [categoriesResult, lowStockResult] = await Promise.all([
        fetchCategories(),
        fetchLowStockItems(),
      ])
      if (categoriesResult.success) {
        setCategories(categoriesResult.categories as StockCategoryWithCount[])
      }
      if (Array.isArray(lowStockResult)) {
        setLowStockItems(lowStockResult)
      }
    } catch (error) {
      console.error("Erro ao carregar estoque:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleCreateCategory = async () => {
    if (!newCategory.name.trim()) {
      toast.error("Digite um nome para a categoria")
      return
    }

    setCreating(true)
    try {
      const result = await createStockCategory({
        name: newCategory.name,
        icon: newCategory.icon,
        color: newCategory.color,
      })
      
      if (result.success) {
        toast.success("Categoria criada com sucesso!")
        setDialogOpen(false)
        setNewCategory({ name: "", icon: "boxes", color: "gray" })
        await loadData()
      } else {
        toast.error(result.error || "Erro ao criar categoria")
      }
    } catch (error) {
      toast.error("Erro ao criar categoria")
    } finally {
      setCreating(false)
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
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-1 flex-col px-4 md:px-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Package className="h-6 w-6" />
            Estoque
          </h1>
          <p className="text-muted-foreground">
            Gerencie os itens de estoque da pousada
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href="/stock/purchases">
              <ShoppingCart className="mr-2 h-4 w-4" />
              Compras
            </Link>
          </Button>
          <Button onClick={() => setDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Novo Estoque
          </Button>
        </div>
      </div>

      {/* Alerta de estoque baixo */}
      {lowStockItems.length > 0 && (
        <Card className="border-orange-300 bg-orange-50">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-orange-800">
              <AlertTriangle className="h-5 w-5" />
              Estoque Baixo
            </CardTitle>
            <CardDescription className="text-orange-700">
              {lowStockItems.length} item(ns) abaixo do mínimo
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {lowStockItems.slice(0, 5).map((item) => (
                <Badge
                  key={item.id}
                  variant="outline"
                  className="border-orange-300 bg-orange-100 text-orange-800"
                >
                  {item.name}: {Number(item.currentStock)} {item.unit}
                </Badge>
              ))}
              {lowStockItems.length > 5 && (
                <Badge variant="secondary">
                  +{lowStockItems.length - 5} mais
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Grid de categorias */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {categories.map((category) => {
          const Icon = categoryIcons[category.icon || category.slug] || Package
          const colorClass = category.color 
            ? availableColors.find(c => c.id === category.color)?.class 
            : categoryColors[category.slug] || "bg-gray-100 text-gray-800"

          return (
            <Link key={category.id} href={`/stock/category/${category.slug}`}>
              <Card className="hover:border-primary transition-colors cursor-pointer">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div className={`p-2 rounded-lg ${colorClass}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    {category.lowStockCount > 0 && (
                      <Badge variant="destructive" className="text-xs">
                        {category.lowStockCount} baixo
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <h3 className="font-semibold">{category.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {category._count.items} item(ns)
                  </p>
                </CardContent>
              </Card>
            </Link>
          )
        })}
      </div>

      {/* Dialog para criar categoria */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Novo Estoque</DialogTitle>
            <DialogDescription>
              Crie uma nova categoria de estoque para organizar seus itens
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Nome */}
            <div className="space-y-2">
              <Label htmlFor="name">Nome da Categoria</Label>
              <Input
                id="name"
                placeholder="Ex: Materiais de Escritório"
                value={newCategory.name}
                onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
              />
            </div>

            {/* Ícone */}
            <div className="space-y-2">
              <Label>Ícone</Label>
              <div className="grid grid-cols-5 gap-2">
                {availableIcons.map((item) => {
                  const IconComponent = item.icon
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setNewCategory({ ...newCategory, icon: item.id })}
                      className={`p-3 rounded-lg border-2 transition-all ${
                        newCategory.icon === item.id
                          ? "border-primary bg-primary/10"
                          : "border-muted hover:border-primary/50"
                      }`}
                      title={item.label}
                    >
                      <IconComponent className="h-5 w-5 mx-auto" />
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Cor */}
            <div className="space-y-2">
              <Label>Cor</Label>
              <div className="flex flex-wrap gap-2">
                {availableColors.map((color) => (
                  <button
                    key={color.id}
                    type="button"
                    onClick={() => setNewCategory({ ...newCategory, color: color.id })}
                    className={`w-8 h-8 rounded-full border-2 transition-all ${color.class} ${
                      newCategory.color === color.id
                        ? "ring-2 ring-primary ring-offset-2"
                        : ""
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Preview */}
            <div className="space-y-2">
              <Label>Preview</Label>
              <Card className="w-fit">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${availableColors.find(c => c.id === newCategory.color)?.class || "bg-gray-100"}`}>
                      {(() => {
                        const IconPreview = categoryIcons[newCategory.icon] || Package
                        return <IconPreview className="h-5 w-5" />
                      })()}
                    </div>
                    <span className="font-medium">
                      {newCategory.name || "Nome da Categoria"}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleCreateCategory} disabled={creating}>
              {creating ? "Criando..." : "Criar Categoria"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
