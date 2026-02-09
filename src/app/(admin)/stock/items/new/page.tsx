"use client"

import { useState, useEffect, useMemo } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Package } from "lucide-react"

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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"

import { getCategories, createItem } from "@/features/stock"

interface Category {
  id: string
  name: string
  slug: string
  icon: string | null
}

// Unidades que requerem números inteiros
const INTEGER_UNITS = ["un", "pct", "cx"]
// Unidades que permitem decimais
const DECIMAL_UNITS = ["kg", "g", "L", "ml"]

export default function NewStockItemPage() {
  const router = useRouter()
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    categoryId: "",
    unit: "un",
    currentStock: "0",
    minimumStock: "5",
  })

  // Determina se a unidade atual requer inteiros
  const isIntegerUnit = useMemo(() => INTEGER_UNITS.includes(formData.unit), [formData.unit])

  useEffect(() => {
    async function loadCategories() {
      try {
        const result = await getCategories()
        if (result.success) {
          setCategories(result.categories)
        }
      } catch (error) {
        console.error("Erro ao carregar categorias:", error)
      } finally {
        setLoading(false)
      }
    }
    loadCategories()
  }, [])

  // Handler para validar entrada de estoque
  const handleStockChange = (field: "currentStock" | "minimumStock", value: string) => {
    if (isIntegerUnit) {
      // Para unidades inteiras, só permitir números inteiros
      const numValue = value.replace(/[^0-9]/g, "")
      setFormData({ ...formData, [field]: numValue })
    } else {
      // Para unidades decimais, permitir números e vírgula/ponto
      const numValue = value.replace(/[^0-9.,]/g, "").replace(",", ".")
      setFormData({ ...formData, [field]: numValue })
    }
  }

  // Quando mudar a unidade, ajustar os valores para o novo formato
  const handleUnitChange = (newUnit: string) => {
    const newIsInteger = INTEGER_UNITS.includes(newUnit)
    
    let newCurrentStock = formData.currentStock
    let newMinimumStock = formData.minimumStock

    if (newIsInteger) {
      // Arredondar para inteiro
      newCurrentStock = String(Math.round(Number(formData.currentStock.replace(",", ".")) || 0))
      newMinimumStock = String(Math.round(Number(formData.minimumStock.replace(",", ".")) || 5))
    }

    setFormData({
      ...formData,
      unit: newUnit,
      currentStock: newCurrentStock,
      minimumStock: newMinimumStock,
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name || !formData.categoryId) {
      return
    }

    setSubmitting(true)
    try {
      const currentStockNum = Number(formData.currentStock.replace(",", ".")) || 0
      const minimumStockNum = Number(formData.minimumStock.replace(",", ".")) || 5

      const result = await createItem({
        name: formData.name,
        categoryId: formData.categoryId,
        unit: formData.unit,
        currentStock: isIntegerUnit ? Math.round(currentStockNum) : currentStockNum,
        minimumStock: isIntegerUnit ? Math.round(minimumStockNum) : minimumStockNum,
      })

      if (result.success) {
        router.push("/stock")
      }
    } catch (error) {
      console.error("Erro ao criar item:", error)
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

  return (
    <div className="flex flex-1 flex-col px-4 md:px-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/stock">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Package className="h-6 w-6" />
            Novo Item de Estoque
          </h1>
          <p className="text-muted-foreground">
            Cadastre um novo item no estoque
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Card className="max-w-2xl">
          <CardHeader>
            <CardTitle>Dados do Item</CardTitle>
            <CardDescription>Preencha as informações do item</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Nome do Item *</Label>
              <Input
                id="name"
                placeholder="Ex: Café em pó 500g"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="categoryId">Categoria *</Label>
                <Select
                  value={formData.categoryId}
                  onValueChange={(value) => setFormData({ ...formData, categoryId: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.icon || "📦"} {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="unit">Unidade</Label>
                <Select
                  value={formData.unit}
                  onValueChange={handleUnitChange}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="un">Unidade (un)</SelectItem>
                    <SelectItem value="kg">Quilograma (kg)</SelectItem>
                    <SelectItem value="g">Grama (g)</SelectItem>
                    <SelectItem value="L">Litro (L)</SelectItem>
                    <SelectItem value="ml">Mililitro (ml)</SelectItem>
                    <SelectItem value="pct">Pacote (pct)</SelectItem>
                    <SelectItem value="cx">Caixa (cx)</SelectItem>
                  </SelectContent>
                </Select>
                {isIntegerUnit && (
                  <p className="text-xs text-muted-foreground">
                    Esta unidade aceita apenas números inteiros
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="currentStock">Estoque Atual</Label>
                <Input
                  id="currentStock"
                  type={isIntegerUnit ? "number" : "text"}
                  min="0"
                  step={isIntegerUnit ? "1" : "0.01"}
                  placeholder="0"
                  value={formData.currentStock}
                  onChange={(e) => handleStockChange("currentStock", e.target.value)}
                  inputMode={isIntegerUnit ? "numeric" : "decimal"}
                  pattern={isIntegerUnit ? "[0-9]*" : "[0-9]*[.,]?[0-9]*"}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="minimumStock">Estoque Mínimo</Label>
                <Input
                  id="minimumStock"
                  type={isIntegerUnit ? "number" : "text"}
                  min="0"
                  step={isIntegerUnit ? "1" : "0.01"}
                  placeholder="5"
                  value={formData.minimumStock}
                  onChange={(e) => handleStockChange("minimumStock", e.target.value)}
                  inputMode={isIntegerUnit ? "numeric" : "decimal"}
                  pattern={isIntegerUnit ? "[0-9]*" : "[0-9]*[.,]?[0-9]*"}
                />
                <p className="text-xs text-muted-foreground">
                  Alerta quando o estoque ficar abaixo deste valor
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-4 pt-4">
              <Button type="button" variant="outline" asChild>
                <Link href="/stock">Cancelar</Link>
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? "Salvando..." : "Criar Item"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  )
}
