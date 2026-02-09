"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { ArrowLeft, ShoppingCart, Plus, Trash2, Calendar } from "lucide-react"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { CurrencyInput, parseCurrencyToNumber } from "@/components/ui/currency-input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

import { getPurchases, getItems, getCategories, createPurchase } from "@/features/stock"

interface StockItem {
  id: string
  name: string
  unit: string
}

interface Purchase {
  id: string
  purchaseDate: Date
  supplier: string | null
  totalAmount: number
  items: { item: { name: string }; quantity: number; unitPrice: number }[]
}

interface PurchaseItem {
  itemId: string
  itemName: string
  quantity: number
  unitPrice: number
  unit: string
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value)
}

export default function PurchasesPage() {
  const [purchases, setPurchases] = useState<Purchase[]>([])
  const [items, setItems] = useState<StockItem[]>([])
  const [loading, setLoading] = useState(true)
  const [isCreating, setIsCreating] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  // Form state
  const [purchaseDate, setPurchaseDate] = useState(new Date().toISOString().split("T")[0])
  const [supplier, setSupplier] = useState("")
  const [purchaseItems, setPurchaseItems] = useState<PurchaseItem[]>([])
  const [selectedItemId, setSelectedItemId] = useState("")
  const [quantity, setQuantity] = useState("")
  const [unitPrice, setUnitPrice] = useState("")

  useEffect(() => {
    async function loadData() {
      try {
        const [purchasesResult, itemsResult] = await Promise.all([
          getPurchases(),
          getItems(),
        ])
        
        if (purchasesResult.success) {
          setPurchases(purchasesResult.purchases as unknown as Purchase[])
        }
        if (itemsResult.success) {
          setItems(itemsResult.items as unknown as StockItem[])
        }
      } catch (error) {
        console.error("Erro ao carregar dados:", error)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  const addItem = () => {
    if (!selectedItemId || !quantity || !unitPrice) return
    
    const item = items.find(i => i.id === selectedItemId)
    if (!item) return

    setPurchaseItems([
      ...purchaseItems,
      {
        itemId: selectedItemId,
        itemName: item.name,
        quantity: Number(quantity),
        unitPrice: parseCurrencyToNumber(unitPrice),
        unit: item.unit,
      },
    ])

    setSelectedItemId("")
    setQuantity("")
    setUnitPrice("")
  }

  const removeItem = (index: number) => {
    setPurchaseItems(purchaseItems.filter((_, i) => i !== index))
  }

  const handleSubmit = async () => {
    if (purchaseItems.length === 0 || !purchaseDate) return

    setSubmitting(true)
    try {
      const result = await createPurchase({
        purchaseDate: new Date(purchaseDate),
        supplier: supplier || undefined,
        items: purchaseItems.map(item => ({
          itemId: item.itemId,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
        })),
      })

      if (result.success) {
        setIsCreating(false)
        setPurchaseItems([])
        setSupplier("")
        // Reload purchases
        const purchasesResult = await getPurchases()
        if (purchasesResult.success) {
          setPurchases(purchasesResult.purchases as unknown as Purchase[])
        }
      }
    } catch (error) {
      console.error("Erro ao criar compra:", error)
    } finally {
      setSubmitting(false)
    }
  }

  const total = purchaseItems.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0)

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
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/stock">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
              <ShoppingCart className="h-6 w-6" />
              Compras de Estoque
            </h1>
            <p className="text-muted-foreground">
              Registre compras e atualize o estoque automaticamente
            </p>
          </div>
        </div>
        {!isCreating && (
          <Button onClick={() => setIsCreating(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Nova Compra
          </Button>
        )}
      </div>

      {isCreating && (
        <Card>
          <CardHeader>
            <CardTitle>Nova Compra</CardTitle>
            <CardDescription>
              Adicione os itens da compra. O estoque será atualizado automaticamente.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="purchaseDate">Data da Compra *</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="purchaseDate"
                    type="date"
                    className="pl-10"
                    value={purchaseDate}
                    onChange={(e) => setPurchaseDate(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="supplier">Fornecedor</Label>
                <Input
                  id="supplier"
                  placeholder="Nome do fornecedor"
                  value={supplier}
                  onChange={(e) => setSupplier(e.target.value)}
                />
              </div>
            </div>

            {/* Add item row */}
            <div className="flex gap-4 items-end">
              <div className="flex-1 grid gap-2">
                <Label>Item</Label>
                <Select value={selectedItemId} onValueChange={setSelectedItemId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o item" />
                  </SelectTrigger>
                  <SelectContent>
                    {items.map((item) => (
                      <SelectItem key={item.id} value={item.id}>
                        {item.name} ({item.unit})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="w-24 grid gap-2">
                <Label>Qtd</Label>
                <Input
                  type="number"
                  min="0.01"
                  step="0.01"
                  placeholder="0"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                />
              </div>
              <div className="w-32 grid gap-2">
                <Label>Preço Unit.</Label>
                <CurrencyInput
                  value={unitPrice}
                  onChange={setUnitPrice}
                />
              </div>
              <Button type="button" onClick={addItem} disabled={!selectedItemId || !quantity || !unitPrice}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            {/* Items list */}
            {purchaseItems.length > 0 && (
              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Item</TableHead>
                      <TableHead className="text-right">Qtd</TableHead>
                      <TableHead className="text-right">Preço Unit.</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                      <TableHead className="w-10"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {purchaseItems.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell>{item.itemName}</TableCell>
                        <TableCell className="text-right">
                          {item.quantity} {item.unit}
                        </TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(item.unitPrice)}
                        </TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(item.quantity * item.unitPrice)}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-red-600"
                            onClick={() => removeItem(index)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                    <TableRow className="bg-muted/50">
                      <TableCell colSpan={3} className="font-semibold">
                        Total da Compra
                      </TableCell>
                      <TableCell className="text-right font-bold text-lg">
                        {formatCurrency(total)}
                      </TableCell>
                      <TableCell></TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            )}

            <div className="flex justify-end gap-4">
              <Button variant="outline" onClick={() => { setIsCreating(false); setPurchaseItems([]) }}>
                Cancelar
              </Button>
              <Button 
                onClick={handleSubmit} 
                disabled={purchaseItems.length === 0 || submitting}
              >
                {submitting ? "Salvando..." : "Registrar Compra"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Purchases list */}
      <Card>
        <CardHeader>
          <CardTitle>Histórico de Compras</CardTitle>
          <CardDescription>Últimas compras registradas</CardDescription>
        </CardHeader>
        <CardContent>
          {purchases.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Nenhuma compra registrada ainda.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Fornecedor</TableHead>
                  <TableHead>Itens</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {purchases.map((purchase) => (
                  <TableRow key={purchase.id}>
                    <TableCell>
                      {new Date(purchase.purchaseDate).toLocaleDateString("pt-BR")}
                    </TableCell>
                    <TableCell>{purchase.supplier || "-"}</TableCell>
                    <TableCell>
                      <div className="flex gap-1 flex-wrap">
                        {purchase.items.slice(0, 3).map((item, i) => (
                          <Badge key={i} variant="secondary" className="text-xs">
                            {item.item.name}
                          </Badge>
                        ))}
                        {purchase.items.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{purchase.items.length - 3}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {formatCurrency(purchase.totalAmount)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
