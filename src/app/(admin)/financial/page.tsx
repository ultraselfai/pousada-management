"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  Receipt,
  Wallet,
  FileText,
  Plus,
  ArrowRight,
} from "lucide-react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"

import { fetchCashFlow, fetchCategoriesWithTotals, fetchTransactions, fetchPendingRevenues } from "./actions"
import { formatCurrency } from "./utils"
import type { CashFlow, ExpenseCategory } from "@/features/financial/types"

export default function FinancialPage() {
  const [cashFlow, setCashFlow] = useState<CashFlow | null>(null)
  const [categories, setCategories] = useState<(ExpenseCategory & { total: number })[]>([])
  const [recentTransactions, setRecentTransactions] = useState<any[]>([])
  const [pendingRevenue, setPendingRevenue] = useState<number>(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      try {
        // Buscar dados do mês atual
        const now = new Date()
        const startDate = new Date(now.getFullYear(), now.getMonth(), 1)
        const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0)

        const [cashFlowResult, categoriesResult, transactionsResult, pendingResult] = await Promise.all([
          fetchCashFlow(startDate, endDate),
          fetchCategoriesWithTotals(startDate, endDate),
          fetchTransactions({ limit: 5, page: 1 }), // Buscar últimas 5 transações
          fetchPendingRevenues()
        ])

        setCashFlow(cashFlowResult)
        setCategories(categoriesResult)
        setRecentTransactions(transactionsResult.transactions)
        setPendingRevenue(pendingResult)
      } catch (error) {
        console.error("Erro ao carregar dados financeiros:", error)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  if (loading) {
    return (
      <div className="flex flex-1 flex-col px-4 md:px-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-64 mt-2" />
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </div>
    )
  }

  const balance = (cashFlow?.totalIncome || 0) - (cashFlow?.totalExpenses || 0)

  return (
    <div className="flex flex-1 flex-col px-4 md:px-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <DollarSign className="h-6 w-6" />
            Financeiro
          </h1>
          <p className="text-muted-foreground">
            Visão geral do mês atual
          </p>
        </div>
        <div className="flex gap-2">
          {/* Botões de Ação Rápida no Header */}
          <Button variant="outline" size="sm" asChild className="h-9">
            <Link href="/financial/expenses/new">
              <Receipt className="mr-2 h-4 w-4 text-red-500" />
              Nova Despesa
            </Link>
          </Button>
          <Button variant="outline" size="sm" asChild className="h-9">
            <Link href="/financial/revenues/new">
              <TrendingUp className="mr-2 h-4 w-4 text-green-500" />
              Nova Receita
            </Link>
          </Button>
          <Button variant="outline" size="sm" asChild className="h-9">
            <Link href="/financial/reports">
              <FileText className="mr-2 h-4 w-4" />
              Relatórios
            </Link>
          </Button>
        </div>
      </div>

      {/* Cards de resumo */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receitas</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(cashFlow?.totalIncome || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              {cashFlow?.transactions.filter(t => t.type === "INCOME").length || 0} transações
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receitas em Aberto</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {formatCurrency(pendingRevenue)}
            </div>
            <p className="text-xs text-muted-foreground">
              Previsto em reservas futuras
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Despesas</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {formatCurrency(cashFlow?.totalExpenses || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              {cashFlow?.transactions.filter(t => t.type === "EXPENSE").length || 0} transações
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Saldo</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${balance >= 0 ? "text-green-600" : "text-red-600"}`}>
              {formatCurrency(balance)}
            </div>
            <div className="flex items-center text-xs">
              {balance >= 0 ? (
                <ArrowUpRight className="h-3 w-3 text-green-600 mr-1" />
              ) : (
                <ArrowDownRight className="h-3 w-3 text-red-600 mr-1" />
              )}
              <span className="text-muted-foreground">
                {balance >= 0 ? "Positivo" : "Negativo"}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Grid Principal: Últimas Transações vs Categorias */}
      <div className="grid gap-6 md:grid-cols-2">
        
        {/* Preview do Extrato (Substituindo Ações Rápidas) */}
        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle>Últimas Movimentações</CardTitle>
            <CardDescription>
              Transações recentes
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-1">
            {recentTransactions.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full py-6 text-muted-foreground text-sm">
                    <Receipt className="h-10 w-10 mb-2 opacity-20" />
                    <p>Nenhuma movimentação recente</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {recentTransactions.map((t) => {
                        const isIncome = t.type === "INCOME"
                        return (
                            <div key={t.id} className="flex items-center justify-between border-b pb-2 last:border-0 last:pb-0">
                                <div className="flex items-center gap-3">
                                    <div className={`p-2 rounded-full ${isIncome ? "bg-green-100 dark:bg-green-900/30" : "bg-red-100 dark:bg-red-900/30"}`}>
                                        {isIncome ? (
                                            <ArrowUpRight className={`h-4 w-4 ${isIncome ? "text-green-600" : "text-red-600"}`} />
                                        ) : (
                                            <ArrowDownRight className={`h-4 w-4 ${isIncome ? "text-green-600" : "text-red-600"}`} />
                                        )}
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium">{t.description}</p>
                                        <p className="text-xs text-muted-foreground capitalize">
                                            {format(new Date(t.date), "dd 'de' MMMM", { locale: ptBR })}
                                        </p>
                                    </div>
                                </div>
                                <span className={`text-sm font-bold ${isIncome ? "text-green-600" : "text-red-600"}`}>
                                    {isIncome ? "+" : "-"}{formatCurrency(Number(t.amount))}
                                </span>
                            </div>
                        )
                    })}
                </div>
            )}
          </CardContent>
          <CardFooter className="pt-2 pb-4">
             <Button variant="ghost" className="w-full text-xs" asChild>
                <Link href="/financial/statement" className="flex items-center justify-center gap-1">
                    Ver extrato completo <ArrowRight className="h-3 w-3" />
                </Link>
             </Button>
          </CardFooter>
        </Card>

        {/* Despesas por categoria */}
        <Card className="flex flex-col h-full">
          <CardHeader>
            <CardTitle>Despesas por Categoria</CardTitle>
            <CardDescription>
              Distribuição das despesas do mês
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-1">
            {categories.length === 0 ? (
               <div className="flex flex-col items-center justify-center h-full py-6 text-muted-foreground text-sm">
                 <Wallet className="h-10 w-10 mb-2 opacity-20" />
                 <p>Nenhuma despesa registrada este mês</p>
               </div>
            ) : (
              <div className="space-y-4">
                {categories.slice(0, 9).map((cat) => (
                  <div key={cat.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: cat.color || "#888" }}
                      />
                      <span className="text-sm">{cat.name}</span>
                    </div>
                    <span className="text-sm font-medium">
                      {formatCurrency(cat.total || 0)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Links para páginas */}
      <div className="grid gap-4 md:grid-cols-3">
        <Link href="/financial/expenses">
          <Card className="hover:border-primary transition-colors cursor-pointer bg-muted/20">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <Receipt className="h-8 w-8 text-red-500" />
                <div>
                  <h3 className="font-semibold">Despesas</h3>
                  <p className="text-sm text-muted-foreground">
                    Gerenciar despesas
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/financial/revenues">
            <Card className="hover:border-primary transition-colors cursor-pointer bg-muted/20">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <TrendingUp className="h-8 w-8 text-green-500" />
                <div>
                  <h3 className="font-semibold">Receitas</h3>
                  <p className="text-sm text-muted-foreground">
                    Gerenciar receitas
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/financial/reports">
            <Card className="hover:border-primary transition-colors cursor-pointer bg-muted/20">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <FileText className="h-8 w-8 text-blue-500" />
                <div>
                  <h3 className="font-semibold">Relatórios</h3>
                  <p className="text-sm text-muted-foreground">
                    Visualizar DRE e outros
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  )
}
