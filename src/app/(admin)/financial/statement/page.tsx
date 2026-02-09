"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { ArrowLeft, Download, Filter, Search } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { fetchTransactions } from "@/app/(admin)/financial/actions"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

// Helper para formatar moeda
const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value)
}

export default function FinancialStatementPage() {
  const [loading, setLoading] = useState(true)
  const [transactions, setTransactions] = useState<any[]>([])
  const [filters, setFilters] = useState<{
      type: "ALL" | "INCOME" | "EXPENSE"
      startDate: string
      endDate: string
  }>({
    type: "ALL", // ALL, INCOME, EXPENSE
    startDate: "",
    endDate: "",
  })

  // Carregar dados
  useEffect(() => {
    async function loadData() {
      setLoading(true)
      try {
        const typeFilter = filters.type
        const result = await fetchTransactions({
          type: typeFilter,
          // TODO: adicionar filtros de data
        })
        setTransactions(result.transactions)
      } catch (error) {
        console.error("Erro ao carregar extrato:", error)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [filters.type])

  // Calcular totais
  const totalIncome = transactions
    .filter((t) => t.type === "INCOME")
    .reduce((sum, t) => sum + Number(t.amount), 0)

  const totalExpense = transactions
    .filter((t) => t.type === "EXPENSE")
    .reduce((sum, t) => sum + Number(t.amount), 0)

  const balance = totalIncome - totalExpense

  return (
    <div className="flex flex-1 flex-col px-4 md:px-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/financial">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Extrato Detalhado</h1>
          <p className="text-muted-foreground">
            Visualização completa de todas as transações financeiras
          </p>
        </div>
        <div className="ml-auto flex gap-2">
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Exportar CSV
          </Button>
        </div>
      </div>

      {/* Cards de Resumo */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Entradas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(totalIncome)}
            </div>
            <p className="text-xs text-muted-foreground">
              Total de receitas no período
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Saídas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {formatCurrency(totalExpense)}
            </div>
            <p className="text-xs text-muted-foreground">
              Total de despesas no período
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Saldo</CardTitle>
          </CardHeader>
          <CardContent>
            <div
              className={`text-2xl font-bold ${
                balance >= 0 ? "text-blue-600" : "text-red-600"
              }`}
            >
              {formatCurrency(balance)}
            </div>
            <p className="text-xs text-muted-foreground">
              Resultado líquido do período
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filtros e Tabela */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Transações</CardTitle>
              <CardDescription>
                Lista de movimentações por ordem cronológica
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Select
                value={filters.type}
                onValueChange={(val) => setFilters({ ...filters, type: val as "ALL" | "INCOME" | "EXPENSE" })}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filtrar por tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">Todas</SelectItem>
                  <SelectItem value="INCOME">Receitas</SelectItem>
                  <SelectItem value="EXPENSE">Despesas</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Descrição</TableHead>
                <TableHead>Categoria / Origem</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead className="text-right">Valor</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-40" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-20 ml-auto" /></TableCell>
                  </TableRow>
                ))
              ) : transactions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    Nenhuma transação encontrada.
                  </TableCell>
                </TableRow>
              ) : (
                transactions.map((t) => {
                  const isIncome = t.type === "INCOME"
                  let categoryLabel = "-"
                  
                  if (t.expense?.category) {
                    categoryLabel = t.expense.category.name
                  } else if (t.purchase) {
                    categoryLabel = "Compra de Estoque"
                  } else if (t.revenue?.source) {
                    categoryLabel = t.revenue.source
                  } else if (t.booking) {
                    categoryLabel = "Reserva"
                  } else {
                     categoryLabel = "Outros"
                  }

                  let details = ""
                  if (t.booking) {
                    details = `Guest: ${t.booking.guest.name}`
                  } else if (t.purchase) {
                    details = `Forn: ${t.purchase.supplier || "N/A"}`
                  }

                  return (
                    <TableRow key={t.id}>
                      <TableCell>
                        <div className="flex flex-col">
                          <span>{format(new Date(t.date), "dd/MM/yyyy")}</span>
                          <span className="text-xs text-muted-foreground">
                            {format(new Date(t.date), "HH:mm")}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium">{t.description}</span>
                          {details && (
                            <span className="text-xs text-muted-foreground">
                              {details}
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{categoryLabel}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={isIncome ? "default" : "destructive"}
                          className={isIncome ? "bg-green-600 hover:bg-green-700" : ""}
                        >
                          {isIncome ? "Entrada" : "Saída"}
                        </Badge>
                      </TableCell>
                      <TableCell className={`text-right font-medium ${isIncome ? "text-green-600" : "text-red-600"}`}>
                        {isIncome ? "+" : "-"}{formatCurrency(Number(t.amount))}
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
