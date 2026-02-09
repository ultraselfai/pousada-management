"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { ArrowLeft, FileBarChart, TrendingUp, TrendingDown, Calendar, Download } from "lucide-react"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"

import { getCashFlow, getDRE } from "@/features/financial"
import type { CashFlow, DRE } from "@/features/financial/types"

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value)
}

export default function FinancialReportsPage() {
  const [loading, setLoading] = useState(true)
  const [cashFlow, setCashFlow] = useState<CashFlow | null>(null)
  const [dre, setDre] = useState<DRE | null>(null)
  const [period, setPeriod] = useState(() => {
    const now = new Date()
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`
  })

  useEffect(() => {
    async function loadData() {
      setLoading(true)
      try {
        const [year, month] = period.split("-").map(Number)
        const startDate = new Date(year, month - 1, 1)
        const endDate = new Date(year, month, 0)

        const [cashFlowResult, dreResult] = await Promise.all([
          getCashFlow(startDate, endDate),
          getDRE(startDate, endDate),
        ])

        setCashFlow(cashFlowResult)
        setDre(dreResult)
      } catch (error) {
        console.error("Erro ao carregar relatórios:", error)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [period])

  // Generate last 12 months for select
  const monthOptions = Array.from({ length: 12 }, (_, i) => {
    const date = new Date()
    date.setMonth(date.getMonth() - i)
    return {
      value: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`,
      label: date.toLocaleDateString("pt-BR", { month: "long", year: "numeric" }),
    }
  })

  if (loading) {
    return (
      <div className="flex flex-1 flex-col px-4 md:px-6 space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10" />
          <div>
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-48 mt-2" />
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <Skeleton className="h-[400px]" />
          <Skeleton className="h-[400px]" />
        </div>
      </div>
    )
  }

  const netProfit = (dre?.grossProfit || 0) - (dre?.operationalExpenses || 0)

  return (
    <div className="flex flex-1 flex-col px-4 md:px-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/financial">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
              <FileBarChart className="h-6 w-6" />
              Relatórios Financeiros
            </h1>
            <p className="text-muted-foreground">
              Análise consolidada de receitas e despesas
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-[200px]">
              <Calendar className="mr-2 h-4 w-4" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {monthOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Exportar
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Receitas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(cashFlow?.totalRevenue || 0)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Despesas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {formatCurrency(cashFlow?.totalExpense || 0)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Saldo</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${(cashFlow?.balance || 0) >= 0 ? "text-green-600" : "text-red-600"}`}>
              {formatCurrency(cashFlow?.balance || 0)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Lucro Líquido</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${netProfit >= 0 ? "text-green-600" : "text-red-600"}`}>
              {formatCurrency(netProfit)}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Receitas por Fonte */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              Receitas por Fonte
            </CardTitle>
            <CardDescription>
              Distribuição das receitas do período
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {dre?.revenuesBySource?.map((source) => (
                <div key={source.source} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{source.source}</span>
                    <span className="text-sm text-green-600 font-medium">
                      {formatCurrency(source.total)}
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full bg-green-500"
                      style={{
                        width: `${dre?.grossRevenue ? (source.total / dre.grossRevenue) * 100 : 0}%`,
                      }}
                    />
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {source.count} transações
                  </div>
                </div>
              ))}
              {(!dre?.revenuesBySource || dre.revenuesBySource.length === 0) && (
                <div className="text-center py-4 text-muted-foreground">
                  Nenhuma receita no período
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Despesas por Categoria */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingDown className="h-5 w-5 text-red-600" />
              Despesas por Categoria
            </CardTitle>
            <CardDescription>
              Distribuição das despesas do período
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {dre?.expensesByCategory?.slice(0, 6).map((cat) => (
                <div key={cat.category} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{cat.category}</span>
                    <span className="text-sm text-red-600 font-medium">
                      {formatCurrency(cat.total)}
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full bg-red-500"
                      style={{
                        width: `${dre?.operationalExpenses ? (cat.total / dre.operationalExpenses) * 100 : 0}%`,
                      }}
                    />
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {cat.count} transações
                  </div>
                </div>
              ))}
              {(!dre?.expensesByCategory || dre.expensesByCategory.length === 0) && (
                <div className="text-center py-4 text-muted-foreground">
                  Nenhuma despesa no período
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Separator />
      <div className="flex gap-4">
        <Button asChild variant="outline">
          <Link href="/financial/dre">
            Ver DRE Completo
          </Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/financial/expenses">
            Gerenciar Despesas
          </Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/financial/revenues">
            Gerenciar Receitas
          </Link>
        </Button>
      </div>
    </div>
  )
}
