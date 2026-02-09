"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, TrendingUp, Calendar } from "lucide-react"

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

import { createRevenue } from "@/features/financial"

const sourceLabels: Record<string, string> = {
  BOOKING: "Hospedagem",
  EXTRA_SERVICE: "Serviço Extra",
  PRODUCT_SALE: "Venda de Produto",
  OTHER: "Outros",
}

export default function NewRevenuePage() {
  const router = useRouter()
  const [submitting, setSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    description: "",
    source: "BOOKING" as "BOOKING" | "EXTRA_SERVICE" | "PRODUCT_SALE" | "OTHER",
    amount: "",
    receivedAt: new Date().toISOString().split("T")[0],
    notes: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.description || !formData.source || !formData.amount || !formData.receivedAt) {
      return
    }

    setSubmitting(true)
    try {
      const result = await createRevenue({
        description: formData.description,
        source: formData.source,
        amount: parseCurrencyToNumber(formData.amount),
        receivedAt: new Date(formData.receivedAt),
        notes: formData.notes || undefined,
      })

      if (result.success) {
        router.push("/financial/revenues")
      }
    } catch (error) {
      console.error("Erro ao criar receita:", error)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="flex flex-1 flex-col px-4 md:px-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/financial/revenues">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <TrendingUp className="h-6 w-6 text-green-600" />
            Nova Receita
          </h1>
          <p className="text-muted-foreground">
            Registre uma nova entrada de receita
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Card className="max-w-2xl">
          <CardHeader>
            <CardTitle>Dados da Receita</CardTitle>
            <CardDescription>Preencha as informações da receita</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="description">Descrição *</Label>
              <Input
                id="description"
                placeholder="Ex: Diárias - João Silva"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="source">Fonte *</Label>
                <Select
                  value={formData.source}
                  onValueChange={(value) => setFormData({ ...formData, source: value as typeof formData.source })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(sourceLabels).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
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
              <Label htmlFor="receivedAt">Data de Recebimento *</Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="receivedAt"
                  type="date"
                  className="pl-10"
                  value={formData.receivedAt}
                  onChange={(e) => setFormData({ ...formData, receivedAt: e.target.value })}
                  required
                />
              </div>
            </div>

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
                <Link href="/financial/revenues">Cancelar</Link>
              </Button>
              <Button type="submit" disabled={submitting} className="bg-green-600 hover:bg-green-700">
                {submitting ? "Salvando..." : "Criar Receita"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  )
}
