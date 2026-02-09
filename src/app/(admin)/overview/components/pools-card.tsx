"use client"

import { useEffect, useState } from "react"
import { Droplets, CheckCircle2, AlertTriangle, XCircle, Wrench } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

import { getPools, createPool, updatePoolStatus } from "@/features/pools/actions"

interface Pool {
  id: string
  name: string
  status: string // AVAILABLE, MAINTENANCE, CLEANING, CLOSED
}

const STATUS_CONFIG: Record<string, { label: string, color: string, icon: any }> = {
  AVAILABLE: { label: "Disponível", color: "bg-green-500", icon: CheckCircle2 },
  MAINTENANCE: { label: "Manutenção", color: "bg-purple-500", icon: Wrench },
  CLEANING: { label: "Limpeza", color: "bg-yellow-500", icon: Droplets },
  CLOSED: { label: "Fechada", color: "bg-gray-500", icon: XCircle },
}

export function PoolsCard() {
  const [pools, setPools] = useState<Pool[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadPools()
  }, [])

  async function loadPools() {
    try {
      let data = await getPools()
      if (data.length === 0) {
        // Auto-seed se não houver piscinas (conforme solicitado no prompt indiretamente "Piscina 1 e 2")
        await createPool("Piscina Adulto")
        await createPool("Piscina Infantil")
        data = await getPools()
      }
      setPools(data)
    } catch (error) {
      console.error("Erro ao carregar piscinas")
    } finally {
      setLoading(false)
    }
  }

  async function handleStatusChange(id: string, newStatus: string) {
    try {
      await updatePoolStatus(id, newStatus)
      setPools(prev => prev.map(pool => pool.id === id ? { ...pool, status: newStatus } : pool))
      toast.success("Status atualizado!")
    } catch (error) {
      toast.error("Erro ao atualizar status")
    }
  }

  const activePools = pools.filter(p => p.status === "AVAILABLE").length

  if (loading) return (
    <Card className="col-span-2 flex items-center justify-center p-6">
        <div className="animate-pulse flex flex-col items-center">
            <div className="h-4 w-32 bg-muted rounded mb-2"></div>
            <div className="h-8 w-16 bg-muted rounded"></div>
        </div>
    </Card>
  )

  return (
    <Card className="col-span-2">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
            <CardTitle className="text-sm font-medium">Piscinas</CardTitle>
            <CardDescription className="text-xs">
                {activePools} de {pools.length} ativas
            </CardDescription>
        </div>
        <Droplets className="h-4 w-4 text-blue-500" />
      </CardHeader>
      <CardContent className="space-y-4 pt-4">
        {pools.map(pool => {
            const config = STATUS_CONFIG[pool.status] || STATUS_CONFIG.CLOSED
            const Icon = config.icon

            return (
                <div key={pool.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-full bg-muted/20`}>
                            <Icon className={`h-4 w-4 ${pool.status === 'AVAILABLE' ? 'text-green-600' : pool.status === 'MAINTENANCE' ? 'text-purple-600' : 'text-yellow-600'}`} />
                        </div>
                        <div>
                            <p className="text-sm font-medium">{pool.name}</p>
                            <Badge variant="outline" className={`text-[10px] h-5 px-1.5 ${pool.status === 'AVAILABLE' ? 'border-green-500 text-green-600 bg-green-50' : ''}`}>
                                {config.label}
                            </Badge>
                        </div>
                    </div>

                    <div className="flex gap-2">
                        {pool.status === "AVAILABLE" ? (
                             <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button 
                                            size="sm" 
                                            variant="ghost" 
                                            className="h-8 w-8 p-0 text-yellow-600 hover:text-yellow-700 hover:bg-yellow-50"
                                            onClick={() => handleStatusChange(pool.id, "CLEANING")}
                                        >
                                            <Droplets className="h-4 w-4" />
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent><p>Limpeza</p></TooltipContent>
                                </Tooltip>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button 
                                            size="sm" 
                                            variant="ghost" 
                                            className="h-8 w-8 p-0 text-purple-600 hover:text-purple-700 hover:bg-purple-50"
                                            onClick={() => handleStatusChange(pool.id, "MAINTENANCE")}
                                        >
                                            <Wrench className="h-4 w-4" />
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent><p>Manutenção</p></TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        ) : (
                            <Button size="sm" variant="outline" className="h-8 text-xs border-green-500 text-green-600 hover:bg-green-50" onClick={() => handleStatusChange(pool.id, "AVAILABLE")}>
                                <CheckCircle2 className="mr-1.5 h-3 w-3" />
                                Liberar Piscina
                            </Button>
                        )}
                    </div>
                </div>
            )
        })}
      </CardContent>
    </Card>
  )
}
