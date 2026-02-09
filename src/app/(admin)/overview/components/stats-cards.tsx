"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { 
  BedDouble, 
  Users, 
  LogIn, 
  LogOut, 
  DollarSign,
  AlertTriangle,
} from "lucide-react";
import { PoolsCard } from "./pools-card";

interface StatsCardsProps {
  stats: {
    totalRooms: number;
    occupiedRooms: number;
    availableRooms: number;
    checkinsToday: number;
    checkoutsToday: number;
    occupancyRate: number;
    revenueToday: number;
    pendingPayments: number;
  };
}

export function StatsCards({ stats }: StatsCardsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {/* Taxa de Ocupação */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Taxa de Ocupação</CardTitle>
          <BedDouble className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.occupancyRate.toFixed(0)}%</div>
          <p className="text-xs text-muted-foreground">
            {stats.occupiedRooms} de {stats.totalRooms} quartos ocupados
          </p>
        </CardContent>
      </Card>

      {/* Quartos Disponíveis */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Quartos Livres</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600 dark:text-green-400">
            {stats.availableRooms}
          </div>
          <p className="text-xs text-muted-foreground">
            Disponíveis para reserva
          </p>
        </CardContent>
      </Card>

      {/* Check-ins Hoje */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Check-ins Hoje</CardTitle>
          <LogIn className="h-4 w-4 text-purple-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
            {stats.checkinsToday}
          </div>
          <p className="text-xs text-muted-foreground">
            Chegadas previstas
          </p>
        </CardContent>
      </Card>

      {/* Check-outs Hoje */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Check-outs Hoje</CardTitle>
          <LogOut className="h-4 w-4 text-amber-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">
            {stats.checkoutsToday}
          </div>
          <p className="text-xs text-muted-foreground">
            Saídas previstas
          </p>
        </CardContent>
      </Card>

      {/* Receita do Dia */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Receita Hoje</CardTitle>
          <DollarSign className="h-4 w-4 text-green-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600 dark:text-green-400">
            {new Intl.NumberFormat("pt-BR", {
              style: "currency",
              currency: "BRL",
            }).format(stats.revenueToday)}
          </div>
          <p className="text-xs text-muted-foreground">
            Pagamentos recebidos
          </p>
        </CardContent>
      </Card>

      {/* Pagamentos Pendentes */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Pendências</CardTitle>
          <AlertTriangle className="h-4 w-4 text-orange-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
            {new Intl.NumberFormat("pt-BR", {
              style: "currency",
              currency: "BRL",
            }).format(stats.pendingPayments)}
          </div>
          <p className="text-xs text-muted-foreground">
            A receber
          </p>
        </CardContent>
      </Card>

      {/* Card de Piscinas (Ocupa espaço restante) */}
      <PoolsCard />
    </div>
  );
}
