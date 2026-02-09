import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { ReservationMapClient } from "./client";
import { getReservationMapData } from "./actions";

export const dynamic = "force-dynamic";
export const revalidate = 0;

/**
 * Página do Mapa de Reservas
 *
 * Timeline visual com:
 * - Quartos na vertical
 * - Datas na horizontal (30 dias - visão mensal)
 * - Reservas como barras coloridas por status
 * - Navegação por período
 * - Clique na célula para criar reserva
 * - Clique na reserva para ver detalhes
 */
export default async function ReservationMapPage() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Carregar 30 dias para visão mensal
  const initialData = await getReservationMapData(today, 30);

  return (
    <>
      {/* Header */}
      <div className="px-4 lg:px-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-bold tracking-tight">Mapa de Reservas</h1>
          <p className="text-muted-foreground">
            Visualize todas as reservas em um timeline interativo. Clique em uma célula vazia para criar uma nova reserva.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-4 lg:px-6">
        <Suspense fallback={<MapSkeleton />}>
          <ReservationMapClient initialData={initialData} />
        </Suspense>
      </div>
    </>
  );
}

function MapSkeleton() {
  return (
    <Card>
      <CardHeader className="border-b">
        <div className="flex items-center justify-between">
          <Skeleton className="h-6 w-40" />
          <div className="flex items-center gap-2">
            <Skeleton className="h-9 w-9" />
            <Skeleton className="h-9 w-60" />
            <Skeleton className="h-9 w-9" />
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-4 space-y-4">
        {/* Legend skeleton */}
        <div className="flex gap-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-2">
              <Skeleton className="h-4 w-4" />
              <Skeleton className="h-4 w-20" />
            </div>
          ))}
        </div>

        {/* Timeline skeleton */}
        <div className="border rounded-lg">
          <div className="h-14 border-b flex">
            <Skeleton className="w-32 h-full" />
            <div className="flex-1 flex">
              {Array.from({ length: 30 }).map((_, i) => (
                <Skeleton key={i} className="flex-1 h-full border-r" />
              ))}
            </div>
          </div>
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-12 border-b flex">
              <Skeleton className="w-32 h-full" />
              <Skeleton className="flex-1 h-full" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
