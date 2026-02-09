"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Receipt, Calendar } from "lucide-react"

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
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Skeleton } from "@/components/ui/skeleton"

import { createExpense, getExpenseCategories } from "@/features/financial"
import type { ExpenseCategory } from "@/features/financial/types"

export default function NewExpensePage() {
  const router = useRouter()
  const [categories, setCategories] = useState<ExpenseCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    description: "",
    categoryId: "",
    amount: "",
    dueDate: new Date().toISOString().split("T")[0],
    isPaid: false,
    isRecurring: false,
    recurrence: "" as "" | "DAILY" | "WEEKLY" | "MONTHLY" | "YEARLY",
    notes: "",
  })

  useEffect(() => {
    async function loadCategories() {
      try {
        const result = await getExpenseCategories()
        setCategories(result)
      } catch (error) {
        console.error("Erro ao carregar categorias:", error)
      } finally {
        setLoading(false)
      }
    }
    loadCategories()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.description || !formData.categoryId || !formData.amount || !formData.dueDate) {
      return
    }

    setSubmitting(true)
    try {
      const result = await createExpense({
        description: formData.description,
        categoryId: formData.categoryId,
        amount: parseCurrencyToNumber(formData.amount),
        dueDate: new Date(formData.dueDate),
        isPaid: formData.isPaid,
        paidAt: formData.isPaid ? new Date() : undefined,
        isRecurring: formData.isRecurring,
        recurrence: formData.isRecurring && formData.recurrence ? formData.recurrence : undefined,
        notes: formData.notes || undefined,
      })

      if (result.success) {
        router.push("/financial/expenses")
      }
    } catch (error) {
      console.error("Erro ao criar despesa:", error)
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
          <Link href="/financial/expenses">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Receipt className="h-6 w-6" />
            Nova Despesa
          </h1>
          <p className="text-muted-foreground">
            Registre uma nova despesa
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Card className="max-w-2xl">
          <CardHeader>
            <CardTitle>Dados da Despesa</CardTitle>
            <CardDescription>Preencha as informações da despesa</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="description">Descrição *</Label>
              <Input
                id="description"
                placeholder="Ex: Conta de luz - Janeiro"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
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
                        {cat.icon} {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="amount">Valor *</Label>
                <CurrencyInput
                  id="amount"
                  value={formData.amount}
                  onChange={(value) => setFormData({ ...formData, amount: value })}
                  required
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="dueDate">Data de Vencimento *</Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="dueDate"
                  type="date"
                  className="pl-10"
                  value={formData.dueDate}
                  onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="flex items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <Label htmlFor="isPaid">Já foi paga?</Label>
                <p className="text-sm text-muted-foreground">Marque se a despesa já foi quitada</p>
              </div>
              <Switch
                id="isPaid"
                checked={formData.isPaid}
                onCheckedChange={(checked) => setFormData({ ...formData, isPaid: checked })}
              />
            </div>

            <div className="flex items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <Label htmlFor="isRecurring">Despesa recorrente?</Label>
                <p className="text-sm text-muted-foreground">Marque se essa despesa se repete</p>
              </div>
              <Switch
                id="isRecurring"
                checked={formData.isRecurring}
                onCheckedChange={(checked) => setFormData({ ...formData, isRecurring: checked })}
              />
            </div>

            {formData.isRecurring && (
              <div className="grid gap-2">
                <Label htmlFor="recurrence">Frequência</Label>
                <Select
                  value={formData.recurrence}
                  onValueChange={(value) => setFormData({ ...formData, recurrence: value as typeof formData.recurrence })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="DAILY">Diária</SelectItem>
                    <SelectItem value="WEEKLY">Semanal</SelectItem>
                    <SelectItem value="MONTHLY">Mensal</SelectItem>
                    <SelectItem value="YEARLY">Anual</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="grid gap-2">
              <Label htmlFor="notes">Observações</Label>
              <Textarea
                id="notes"
                placeholder="Observações adicionais..."
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              />
            </div>

            <div className="flex justify-end gap-4 pt-4">
              <Button type="button" variant="outline" asChild>
                <Link href="/financial/expenses">Cancelar</Link>
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? "Salvando..." : "Criar Despesa"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  )
}
