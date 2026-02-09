"use client"

import { useEffect, useState, use } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, TrendingUp, Pencil, Save, Trash2 } from "lucide-react"

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
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

import { getRevenueById, updateRevenue, deleteRevenue } from "@/features/financial"
import type { Revenue } from "@/features/financial/types"

interface Props {
  params: Promise<{ id: string }>
}

const sourceLabels: Record<string, string> = {
  BOOKING: "Hospedagem",
  EXTRA_SERVICE: "Serviço Extra",
  PRODUCT_SALE: "Venda de Produto",
  OTHER: "Outros",
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value)
}

export default function RevenueDetailsPage({ params }: Props) {
  const { id } = use(params)
  const router = useRouter()
  const [revenue, setRevenue] = useState<Revenue | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [editing, setEditing] = useState(false)
  const [formData, setFormData] = useState({
    description: "",
    source: "BOOKING" as string,
    amount: "",
    notes: "",
  })

  useEffect(() => {
    async function loadRevenue() {
      try {
        const result = await getRevenueById(id)
        if (result.success && result.revenue) {
          setRevenue(result.revenue as Revenue)
          setFormData({
            description: result.revenue.description || "",
            source: result.revenue.source || "BOOKING",
            amount: String(result.revenue.amount) || "",
            notes: result.revenue.notes || "",
          })
        }
      } catch (error) {
        console.error("Erro ao carregar receita:", error)
      } finally {
        setLoading(false)
      }
    }
    loadRevenue()
  }, [id])

  const handleUpdate = async () => {
    if (!formData.description || !revenue) return

    setSubmitting(true)
    try {
      const result = await updateRevenue({
        id,
        description: formData.description,
        source: formData.source as "BOOKING" | "EXTRA_SERVICE" | "PRODUCT_SALE" | "OTHER",
        amount: parseCurrencyToNumber(formData.amount),
        notes: formData.notes || undefined,
      })

      if (result.success) {
        setEditing(false)
        setRevenue({
          ...revenue,
          description: formData.description,
          source: formData.source as "BOOKING" | "EXTRA_SERVICE" | "PRODUCT_SALE" | "OTHER",
          amount: parseCurrencyToNumber(formData.amount),
          notes: formData.notes,
        })
      }
    } catch (error) {
      console.error("Erro ao atualizar receita:", error)
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async () => {
    setSubmitting(true)
    try {
      const result = await deleteRevenue(id)
      if (result.success) {
        router.push("/financial/revenues")
      }
    } catch (error) {
      console.error("Erro ao excluir receita:", error)
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

  if (!revenue) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center">
        <p>Receita não encontrada</p>
        <Button asChild className="mt-4">
          <Link href="/financial/revenues">Voltar</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="flex flex-1 flex-col px-4 md:px-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/financial/revenues">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
              <TrendingUp className="h-6 w-6 text-green-600" />
              {revenue.description}
            </h1>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="secondary">
                {sourceLabels[revenue.source] || revenue.source}
              </Badge>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setEditing(!editing)}>
            <Pencil className="mr-2 h-4 w-4" />
            {editing ? "Cancelar" : "Editar"}
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive">
                <Trash2 className="mr-2 h-4 w-4" />
                Excluir
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Excluir receita?</AlertDialogTitle>
                <AlertDialogDescription>
                  Esta ação não pode ser desfeita. A receita será removida permanentemente.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
                  Excluir
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Amount Card */}
        <Card>
          <CardHeader>
            <CardTitle>Valor</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">
              {formatCurrency(Number(revenue.amount))}
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              Recebido em: {new Date(revenue.receivedAt).toLocaleDateString("pt-BR")}
            </p>
          </CardContent>
        </Card>

        {/* Source Card */}
        <Card>
          <CardHeader>
            <CardTitle>Fonte</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg font-semibold">
              {sourceLabels[revenue.source] || revenue.source}
            </div>
            {revenue.bookingId && (
              <Button variant="link" asChild className="px-0 mt-2">
                <Link href={`/bookings/${revenue.bookingId}`}>
                  Ver Reserva Associada
                </Link>
              </Button>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Notes */}
      {revenue.notes && !editing && (
        <Card>
          <CardHeader>
            <CardTitle>Observações</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground whitespace-pre-wrap">{revenue.notes}</p>
          </CardContent>
        </Card>
      )}

      {/* Edit Form */}
      {editing && (
        <Card>
          <CardHeader>
            <CardTitle>Editar Receita</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="description">Descrição</Label>
              <Input
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="source">Fonte</Label>
                <Select
                  value={formData.source}
                  onValueChange={(value) => setFormData({ ...formData, source: value })}
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
                <Label htmlFor="amount">Valor</Label>
                <CurrencyInput
                  id="amount"
                  value={formData.amount}
                  onChange={(value) => setFormData({ ...formData, amount: value })}
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="notes">Observações</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              />
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
    </div>
  )
}
