"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { FileText, ArrowLeft, TrendingUp, TrendingDown, Minus, Settings } from "lucide-react"

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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"

import { getDRE } from "@/features/financial/actions"
import { fetchDRETaxRate, saveDRETaxRate } from "@/app/(admin)/financial/actions"
import type { DRE } from "@/features/financial/types"

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value)
}

export default function DREPage() {
  const [dre, setDre] = useState<DRE | null>(null)
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState(() => {
    const now = new Date()
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`
  })
  
  // Tax Rate State
  const [taxRate, setTaxRate] = useState<number>(0)
  const [tempTaxRate, setTempTaxRate] = useState<string>("0")
  const [openTaxDialog, setOpenTaxDialog] = useState(false)
  const [savingTax, setSavingTax] = useState(false)

  // Carregar Taxa
  useEffect(() => {
    async function loadTax() {
      const rate = await fetchDRETaxRate()
      setTaxRate(rate)
      setTempTaxRate(rate.toString())
    }
    loadTax()
  }, [])

  // Carregar DRE
  useEffect(() => {
    async function loadDRE() {
      setLoading(true)
      try {
        const [year, month] = period.split("-").map(Number)
        const startDate = new Date(year, month - 1, 1)
        const endDate = new Date(year, month, 0)

        const result = await getDRE(startDate, endDate)
        setDre(result)
      } catch (error) {
        console.error("Erro ao carregar DRE:", error)
        toast.error("Erro ao carregar DRE", {
          description: "Não foi possível carregar os dados."
        })
      } finally {
        setLoading(false)
      }
    }
    loadDRE()
  }, [period, taxRate]) // Recarrega se a taxa mudar (update local vai disparar revalidate no server, mas aqui recarregamos pra garantir)

  async function handleSaveTax() {
    setSavingTax(true)
    try {
      const newRate = parseFloat(tempTaxRate)
      if (isNaN(newRate) || newRate < 0) {
        toast.error("Valor inválido", {
            description: "Por favor insira uma taxa válida."
        })
        return
      }
      
      await saveDRETaxRate(newRate)
      setTaxRate(newRate)
      setOpenTaxDialog(false)
      
      toast.success("Taxa atualizada", {
        description: "A taxa de impostos global foi atualizada."
      })
    } catch (error) {
       console.error(error)
       toast.error("Erro", {
        description: "Erro ao salvar taxa."
       })
    } finally {
      setSavingTax(false)
    }
  }

  // Generate last 12 months for select
  const monthOptions = Array.from({ length: 12 }, (_, i) => {
    const date = new Date()
    date.setMonth(date.getMonth() - i)
    return {
      value: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`,
      label: date.toLocaleDateString("pt-BR", { month: "long", year: "numeric" }),
    }
  })

  if (loading && !dre) {
    return (
      <div className="flex flex-1 flex-col px-4 md:px-6 space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10" />
          <div>
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-48 mt-2" />
          </div>
        </div>
        <Skeleton className="h-[600px]" />
      </div>
    )
  }

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
              <FileText className="h-6 w-6" />
              Demonstrativo de Resultado (DRE)
            </h1>
            <p className="text-muted-foreground">
              Análise de receitas e despesas do período
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
            <Dialog open={openTaxDialog} onOpenChange={setOpenTaxDialog}>
                <DialogTrigger asChild>
                    <Button variant="outline" size="sm">
                        <Settings className="mr-2 h-4 w-4" />
                        Configurar Taxas
                    </Button>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Configurar Impostos</DialogTitle>
                        <DialogDescription>
                            Defina a taxa média de impostos (Simples Nacional, etc) a ser deduzida da receita bruta.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="tax-rate" className="text-right">
                                Taxa (%)
                            </Label>
                            <Input
                                id="tax-rate"
                                value={tempTaxRate}
                                onChange={(e) => setTempTaxRate(e.target.value)}
                                className="col-span-3"
                                type="number"
                                step="0.1"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setOpenTaxDialog(false)}>Cancelar</Button>
                        <Button onClick={handleSaveTax} disabled={savingTax}>
                            {savingTax ? "Salvando..." : "Salvar Alterações"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-[200px]">
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
        </div>
      </div>

      {/* DRE Content */}
      <Card>
        <CardHeader>
          <CardTitle>
            DRE - {new Date(period + "-01").toLocaleDateString("pt-BR", { month: "long", year: "numeric" })}
          </CardTitle>
          <CardDescription>
            Período: {dre?.period}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Receita Bruta */}
            <div className="space-y-2">
              <div className="flex items-center justify-between py-2 bg-green-50 dark:bg-green-950/30 px-4 rounded-lg">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                  <span className="font-semibold text-green-800 dark:text-green-300">(=) RECEITA BRUTA</span>
                </div>
                <span className="font-bold text-lg text-green-600">
                  {formatCurrency(dre?.revenue.total || 0)}
                </span>
              </div>
              
              {/* Breakdown */}
              <div className="ml-6 space-y-1 text-sm">
                <div className="flex justify-between text-muted-foreground py-1">
                  <span>Hospedagens</span>
                  <span>{formatCurrency(dre?.revenue.bookings || 0)}</span>
                </div>
                {dre?.revenue.extras ? (
                    <div className="flex justify-between text-muted-foreground py-1">
                    <span>Extras</span>
                    <span>{formatCurrency(dre.revenue.extras)}</span>
                    </div>
                ) : null}
                 <div className="flex justify-between text-muted-foreground py-1">
                  <span>Outros</span>
                  <span>{formatCurrency(dre?.revenue.other || 0)}</span>
                </div>
              </div>
            </div>

            <Separator />

            {/* Deduções (Impostos) */}
            <div className="space-y-2">
              <div className="flex items-center justify-between py-2 bg-orange-50 dark:bg-orange-950/30 px-4 rounded-lg">
                <div className="flex items-center gap-2">
                  <Minus className="h-5 w-5 text-orange-600" />
                  <span className="font-semibold text-orange-800 dark:text-orange-300">(-) DEDUÇÕES (IMPOSTOS - {taxRate}%)</span>
                </div>
                <span className="font-bold text-lg text-orange-600">
                  {formatCurrency(dre?.revenue.taxes || 0)}
                </span>
              </div>
            </div>

            <Separator />

            {/* Receita Líquida */}
            <div className="flex items-center justify-between py-2 bg-blue-50 dark:bg-blue-950/30 px-4 rounded-lg">
              <span className="font-semibold text-blue-800 dark:text-blue-300">(=) RECEITA LÍQUIDA</span>
              <span className="font-bold text-lg text-blue-600">
                {formatCurrency(dre?.revenue.netRevenue || 0)}
              </span>
            </div>

            <Separator />

            {/* Despesas */}
            <div className="space-y-2">
              <div className="flex items-center justify-between py-2 bg-red-50 dark:bg-red-950/30 px-4 rounded-lg">
                <div className="flex items-center gap-2">
                  <TrendingDown className="h-5 w-5 text-red-600" />
                  <span className="font-semibold text-red-800 dark:text-red-300">(-) DESPESAS TOTAIS</span>
                </div>
                <span className="font-bold text-lg text-red-600">
                  {formatCurrency(dre?.expenses.total || 0)}
                </span>
              </div>
              
              {/* Categories breakdown */}
              <div className="ml-6 space-y-1 text-sm">
                {dre?.expenses.byCategory.map((cat) => (
                  <div key={cat.categoryName} className="flex justify-between text-muted-foreground py-1">
                    <span>{cat.categoryName}</span>
                    <span>{formatCurrency(cat.total)}</span>
                  </div>
                ))}
                {(!dre?.expenses.byCategory || dre.expenses.byCategory.length === 0) && (
                    <div className="text-muted-foreground italic text-xs py-1">Nenhuma despesa registrada</div>
                )}
              </div>
            </div>

            <Separator />

            {/* Resultado Líquido */}
            <div className={`flex items-center justify-between py-4 px-4 rounded-lg ${
              (dre?.result || 0) >= 0 
                ? "bg-green-100 dark:bg-green-950/50" 
                : "bg-red-100 dark:bg-red-950/50"
            }`}>
              <span className={`font-bold text-lg ${
                (dre?.result || 0) >= 0 
                  ? "text-green-800 dark:text-green-300" 
                  : "text-red-800 dark:text-red-300"
              }`}>
                (=) RESULTADO LÍQUIDO
              </span>
              <div className="text-right">
                <span className={`font-bold text-2xl ${
                  (dre?.result || 0) >= 0 ? "text-green-600" : "text-red-600"
                }`}>
                  {formatCurrency(dre?.result || 0)}
                </span>
                <p className="text-xs text-muted-foreground">
                  Margem Líquida: {dre?.margin.toFixed(1)}%
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
