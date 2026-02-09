"use client"

import { useEffect, useState, useMemo } from "react"
import Link from "next/link"
import { Receipt, Plus, ArrowLeft, Check, X } from "lucide-react"
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay } from "date-fns"
import { ptBR } from "date-fns/locale"
import { DateRange } from "react-day-picker"

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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

import { fetchExpenses } from "../actions"
import { formatCurrency, formatDate } from "../utils"
import type { ExpenseWithCategory } from "@/features/financial/types"
import { markExpenseAsPaid } from "@/features/financial"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { FinancialChart } from "../components/financial-chart"
import { DatePickerWithRange } from "@/components/ui/date-range-picker"
import { Separator } from "@/components/ui/separator"

export default function ExpensesPage() {
  const router = useRouter()
  const [expenses, setExpenses] = useState<ExpenseWithCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: startOfMonth(new Date()),
    to: endOfMonth(new Date())
  })

  // Carregar dados
  useEffect(() => {
    async function loadData() {
      setLoading(true)
      try {
        // Se tiver datas selecionadas, filtrar. Caso contrário busca tudo (ou padrão)
        const filters = dateRange?.from && dateRange?.to ? {
            startDate: dateRange.from,
            endDate: dateRange.to
        } : undefined

        const result = await fetchExpenses(filters)
        setExpenses(result.expenses)
      } catch (error) {
        console.error("Erro ao carregar despesas:", error)
        toast.error("Erro ao carregar dados")
      } finally {
        setLoading(false)
      }
    }
    
    // Debounce na chamada poderia ser bom, mas vamos simplificar
    loadData()
  }, [dateRange]) // Recarregar quando mudar a data

  const handleMarkAsPaid = async (id: string) => {
    try {
      const result = await markExpenseAsPaid(id)
      if (result.success) {
        toast.success("Despesa marcada como paga!")
        router.refresh()
        // Atualizar lista localmente
        setExpenses(prev => prev.map(e => 
          e.id === id ? { ...e, isPaid: true, paidAt: new Date() } : e
        ))
      } else {
        toast.error(result.error || "Erro ao marcar como pago")
      }
    } catch (error) {
      toast.error("Erro ao marcar como pago")
    }
  }

  // Processar dados para o gráfico
  const chartData = useMemo(() => {
    if (!dateRange?.from || !dateRange?.to) return []

    const days = eachDayOfInterval({ start: dateRange.from, end: dateRange.to })

    return days.map(day => {
      // Gastos PAGOS neste dia (paidAt matches day)
      // Se paidAt for null, usa dueDate pra projeção de UNPAID
      
      const paidAmount = expenses
        .filter(e => e.isPaid && e.paidAt && isSameDay(new Date(e.paidAt), day))
        .reduce((sum, e) => sum + Number(e.amount), 0)

      const projectedAmount = expenses
         .filter(e => !e.isPaid && isSameDay(new Date(e.dueDate), day))
         .reduce((sum, e) => sum + Number(e.amount), 0)

      return {
        date: format(day, "dd/MM"),
        actual: paidAmount, // Pago
        projected: projectedAmount // Previsto (Vencendo)
      }
    })
  }, [expenses, dateRange])

  if (loading && expenses.length === 0) {
    return (
      <div className="flex flex-1 flex-col px-4 md:px-6 space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-9 w-32" />
        </div>
        <Skeleton className="h-96" />
      </div>
    )
  }

  const pendingTotal = expenses
    .filter(e => !e.isPaid)
    .reduce((acc, e) => acc + Number(e.amount), 0)
  
  const paidTotal = expenses
    .filter(e => e.isPaid)
    .reduce((acc, e) => acc + Number(e.amount), 0)

  return (
    <div className="flex flex-1 flex-col px-4 md:px-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild>
                <Link href="/financial">
                <ArrowLeft className="h-4 w-4" />
                </Link>
            </Button>
            <div>
                <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                <Receipt className="h-6 w-6" />
                Despesas
                </h1>
                <p className="text-muted-foreground">
                Gerencie todos os gastos e saídas
                </p>
            </div>
            </div>
            <Button asChild>
            <Link href="/financial/expenses/new">
                <Plus className="mr-2 h-4 w-4" />
                Nova Despesa
            </Link>
            </Button>
        </div>

        {/* Filtros */}
        <div className="flex items-center gap-2">
            <DatePickerWithRange date={dateRange} setDate={setDateRange} />
        </div>
      </div>
      
      <Separator />

      {/* Cards de resumo */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Pendentes (no período)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {formatCurrency(pendingTotal)}
            </div>
            <p className="text-xs text-muted-foreground">
              {expenses.filter(e => !e.isPaid).length} despesas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Pagas (no período)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(paidTotal)}
            </div>
            <p className="text-xs text-muted-foreground">
              {expenses.filter(e => e.isPaid).length} despesas
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Gráfico */}
      <FinancialChart
        title="Fluxo de Despesas"
        description="Comparativo: Pagos (Pago em) vs Futuros (Vence em)"
        data={chartData}
        config={{
            actual: { label: "Pago", color: "#16a34a" },
            projected: { label: "A Vencer", color: "#ea580c" }
        }}
      />

      {/* Tabela de despesas */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Despesas</CardTitle>
          <CardDescription>Exibindo {expenses.length} registros</CardDescription>
        </CardHeader>
        <CardContent>
          {expenses.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Receipt className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Nenhuma despesa encontrada para o período.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Descrição</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Vencimento</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {expenses.map((expense) => (
                  <TableRow key={expense.id}>
                    <TableCell className="font-medium">
                      {expense.description}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {expense.category?.name || "Sem categoria"}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-semibold">
                      {formatCurrency(Number(expense.amount))}
                    </TableCell>
                    <TableCell>
                      {formatDate(expense.dueDate)}
                    </TableCell>
                    <TableCell>
                      {expense.isPaid ? (
                        <Badge className="bg-green-100 text-green-800 border-green-300">
                          <Check className="mr-1 h-3 w-3" />
                          Pago
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-orange-100 text-orange-800 border-orange-300">
                          Pendente
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        {!expense.isPaid && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleMarkAsPaid(expense.id)}
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                        )}
                        <Button variant="ghost" size="sm" asChild>
                          <Link href={`/financial/expenses/${expense.id}`}>
                            Editar
                          </Link>
                        </Button>
                      </div>
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
