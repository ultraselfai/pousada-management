"use client"

import { useEffect, useState, use } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Receipt, Pencil, Save, Trash2 } from "lucide-react"

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
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
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

import { getExpenseById, updateExpense, deleteExpense, markExpenseAsPaid } from "@/features/financial"
import type { Expense } from "@/features/financial/types"

interface Props {
  params: Promise<{ id: string }>
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value)
}

export default function ExpenseDetailsPage({ params }: Props) {
  const { id } = use(params)
  const router = useRouter()
  const [expense, setExpense] = useState<Expense | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [editing, setEditing] = useState(false)
  const [formData, setFormData] = useState({
    description: "",
    amount: "",
    notes: "",
  })

  useEffect(() => {
    async function loadExpense() {
      try {
        const result = await getExpenseById(id)
        if (result) {
          setExpense(result as Expense)
          setFormData({
            description: result.description || "",
            amount: String(result.amount) || "",
            notes: result.notes || "",
          })
        }
      } catch (error) {
        console.error("Erro ao carregar despesa:", error)
      } finally {
        setLoading(false)
      }
    }
    loadExpense()
  }, [id])

  const handleUpdate = async () => {
    if (!formData.description || !expense) return

    setSubmitting(true)
    try {
      const result = await updateExpense({
        id,
        description: formData.description,
        amount: parseCurrencyToNumber(formData.amount),
        notes: formData.notes || undefined,
      })

      if (result.success) {
        setEditing(false)
        setExpense({
          ...expense,
          description: formData.description,
          amount: parseCurrencyToNumber(formData.amount),
          notes: formData.notes,
        })
      }
    } catch (error) {
      console.error("Erro ao atualizar despesa:", error)
    } finally {
      setSubmitting(false)
    }
  }

  const handleMarkAsPaid = async () => {
    if (!expense) return

    setSubmitting(true)
    try {
      const result = await markExpenseAsPaid(id)
      if (result.success) {
        setExpense({
          ...expense,
          isPaid: true,
          paidAt: new Date(),
        })
      }
    } catch (error) {
      console.error("Erro ao marcar como paga:", error)
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async () => {
    setSubmitting(true)
    try {
      const result = await deleteExpense(id)
      if (result.success) {
        router.push("/financial/expenses")
      }
    } catch (error) {
      console.error("Erro ao excluir despesa:", error)
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

  if (!expense) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center">
        <p>Despesa não encontrada</p>
        <Button asChild className="mt-4">
          <Link href="/financial/expenses">Voltar</Link>
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
            <Link href="/financial/expenses">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
              <Receipt className="h-6 w-6" />
              {expense.description}
            </h1>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="outline" className={expense.isPaid ? "bg-green-100 text-green-800" : "bg-orange-100 text-orange-800"}>
                {expense.isPaid ? "Paga" : "Pendente"}
              </Badge>
              {expense.isRecurring && (
                <Badge variant="secondary">Recorrente</Badge>
              )}
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
                <AlertDialogTitle>Excluir despesa?</AlertDialogTitle>
                <AlertDialogDescription>
                  Esta ação não pode ser desfeita. A despesa será removida permanentemente.
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
            <div className="text-3xl font-bold text-red-600">
              {formatCurrency(Number(expense.amount))}
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              Vencimento: {new Date(expense.dueDate).toLocaleDateString("pt-BR")}
            </p>
          </CardContent>
        </Card>

        {/* Status Card */}
        <Card>
          <CardHeader>
            <CardTitle>Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {expense.isPaid ? (
              <div>
                <p className="text-green-600 font-semibold">✓ Paga</p>
                {expense.paidAt && (
                  <p className="text-sm text-muted-foreground">
                    em {new Date(expense.paidAt).toLocaleDateString("pt-BR")}
                  </p>
                )}
              </div>
            ) : (
              <div className="space-y-2">
                <p className="text-orange-600 font-semibold">⏳ Aguardando Pagamento</p>
                <Button onClick={handleMarkAsPaid} disabled={submitting}>
                  Marcar como Paga
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Notes */}
      {expense.notes && !editing && (
        <Card>
          <CardHeader>
            <CardTitle>Observações</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground whitespace-pre-wrap">{expense.notes}</p>
          </CardContent>
        </Card>
      )}

      {/* Edit Form */}
      {editing && (
        <Card>
          <CardHeader>
            <CardTitle>Editar Despesa</CardTitle>
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
            <div className="grid gap-2">
              <Label htmlFor="amount">Valor</Label>
              <CurrencyInput
                id="amount"
                value={formData.amount}
                onChange={(value) => setFormData({ ...formData, amount: value })}
              />
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
