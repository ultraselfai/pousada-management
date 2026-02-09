"use client"

import { useEffect, useState, useMemo } from "react"
import Link from "next/link"
import { TrendingUp, Plus, ArrowLeft } from "lucide-react"
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

import { fetchRevenues } from "../actions"
import { formatCurrency, formatDate } from "../utils"
import type { Revenue } from "@/features/financial/types"
import { FinancialChart } from "../components/financial-chart"
import { DatePickerWithRange } from "@/components/ui/date-range-picker"
import { Separator } from "@/components/ui/separator"

const sourceLabels: Record<string, string> = {
  BOOKING: "Reserva",
  EXTRA_SERVICE: "Serviço Extra",
  PRODUCT_SALE: "Venda",
  OTHER: "Outro",
}

export default function RevenuesPage() {
  const [revenues, setRevenues] = useState<Revenue[]>([])
  const [loading, setLoading] = useState(true)
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: startOfMonth(new Date()),
    to: endOfMonth(new Date())
  })

  useEffect(() => {
    async function loadData() {
      setLoading(true)
      try {
        const filters = dateRange?.from && dateRange?.to ? {
            startDate: dateRange.from,
            endDate: dateRange.to
        } : undefined

        const result = await fetchRevenues(filters)
        setRevenues(result.revenues)
      } catch (error) {
        console.error("Erro ao carregar receitas:", error)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [dateRange])

  // Chart Data
  const chartData = useMemo(() => {
    if (!dateRange?.from || !dateRange?.to) return []

    const days = eachDayOfInterval({ start: dateRange.from, end: dateRange.to })

    return days.map(day => {
      const receivedAmount = revenues
        .filter(r => isSameDay(new Date(r.receivedAt), day))
        .reduce((sum, r) => sum + Number(r.amount), 0)

      return {
        date: format(day, "dd/MM"),
        actual: receivedAmount,
        projected: 0 // Sem projeção por enquanto nesta view
      }
    })
  }, [revenues, dateRange])


  if (loading && revenues.length === 0) {
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

  const total = revenues.reduce((acc, r) => acc + Number(r.amount), 0)
  const bySource = revenues.reduce((acc, r) => {
    acc[r.source] = (acc[r.source] || 0) + Number(r.amount)
    return acc
  }, {} as Record<string, number>)

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
                <TrendingUp className="h-6 w-6" />
                Receitas
                </h1>
                <p className="text-muted-foreground">
                Entradas financeiras registradas
                </p>
            </div>
            </div>
            <Button asChild>
            <Link href="/financial/revenues/new">
                <Plus className="mr-2 h-4 w-4" />
                Nova Receita
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
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total (no período)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(total)}
            </div>
          </CardContent>
        </Card>

        {Object.entries(bySource).slice(0, 3).map(([source, amount]) => (
          <Card key={source}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">
                {sourceLabels[source] || source}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xl font-bold">
                {formatCurrency(amount)}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Gráfico */}
      <FinancialChart
        title="Evolução de Receitas"
        description="Receitas realizadas ao longo do período"
        data={chartData}
        config={{
            actual: { label: "Recebido", color: "#16a34a" },
            projected: { label: "Projetado", color: "transparent" } // Hide projected
        }}
      />

      {/* Tabela de receitas */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Receitas</CardTitle>
          <CardDescription>Exibindo {revenues.length} registros</CardDescription>
        </CardHeader>
        <CardContent>
          {revenues.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Nenhuma receita encontrada para o período.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Descrição</TableHead>
                  <TableHead>Origem</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {revenues.map((revenue) => (
                  <TableRow key={revenue.id}>
                    <TableCell className="font-medium">
                      {revenue.description}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="bg-green-50 text-green-800 border-green-300">
                        {sourceLabels[revenue.source] || revenue.source}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-semibold text-green-600">
                      {formatCurrency(Number(revenue.amount))}
                    </TableCell>
                    <TableCell>
                      {formatDate(revenue.receivedAt)}
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm" asChild>
                        <Link href={`/financial/revenues/${revenue.id}`}>
                          Editar
                        </Link>
                      </Button>
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
