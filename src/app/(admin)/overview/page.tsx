import { Suspense } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatsCards, StatusLegend, RoomsGridClient } from "./components";
import { getDailyStats, getRoomsWithBookings, getStatusCounts } from "./actions";

export const dynamic = "force-dynamic";
export const revalidate = 0;

/**
 * Página de Visão Geral do Dia
 * 
 * Exibe o status atual da pousada com:
 * - Cards de estatísticas (ocupação, check-ins, check-outs, receita)
 * - Legenda de status com contagem
 * - Grid de quartos com cores por status
 */
export default async function OverviewPage() {
  const [stats, rooms, statusCounts] = await Promise.all([
    getDailyStats(),
    getRoomsWithBookings(),
    getStatusCounts(),
  ]);

  const today = new Date().toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <>
      {/* Header */}
      <div className="px-4 lg:px-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Visão Geral do Dia</h1>
            <p className="text-muted-foreground flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              {today}
            </p>
          </div>
          <Button variant="outline" size="sm" className="w-fit">
            <RefreshCw className="h-4 w-4 mr-2" />
            Atualizar
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-4 lg:px-6 space-y-6">
        {/* Stats Cards */}
        <Suspense fallback={<StatsCardsSkeleton />}>
          <StatsCards stats={stats} />
        </Suspense>

        {/* Status Legend e Grid de Quartos */}
        <Card>
          <CardHeader className="border-b">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <CardTitle>Quartos</CardTitle>
              <StatusLegend statusCounts={statusCounts} />
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <Suspense fallback={<RoomsGridSkeleton />}>
              <RoomsGridClient rooms={rooms} />
            </Suspense>
          </CardContent>
        </Card>
      </div>
    </>
  );
}

function StatsCardsSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <Card key={i}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-8 w-16 mb-2" />
            <Skeleton className="h-3 w-32" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function RoomsGridSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <Card key={i}>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <Skeleton className="h-5 w-24" />
              <Skeleton className="h-5 w-16" />
            </div>
            <Skeleton className="h-3 w-32 mt-1" />
          </CardHeader>
          <CardContent className="pt-2">
            <Skeleton className="h-16 w-full" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
