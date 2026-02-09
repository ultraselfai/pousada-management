"use client";

import { useState, useTransition, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Loader2 } from "lucide-react";
import { ReservationTimeline, MapLegend, DateNavigator } from "./components";
import type { ReservationMapData } from "./constants";
import { getReservationMapData } from "./actions";

interface ReservationMapClientProps {
  initialData: ReservationMapData;
}

export function ReservationMapClient({ initialData }: ReservationMapClientProps) {
  const router = useRouter();
  const [data, setData] = useState(initialData);
  const [currentDate, setCurrentDate] = useState(new Date(initialData.startDate));
  const [isPending, startTransition] = useTransition();

  // Usar 30 dias para visão mensal
  const DAYS_TO_SHOW = 30;

  const handleDateChange = useCallback((date: Date) => {
    setCurrentDate(date);
    startTransition(async () => {
      const newData = await getReservationMapData(date, DAYS_TO_SHOW);
      setData(newData);
    });
  }, []);

  // Navegar para página de detalhes da reserva
  const handleBookingClick = useCallback((bookingId: string) => {
    router.push(`/bookings/${bookingId}`);
  }, [router]);

  // Navegar para criar reserva com quarto e data pré-selecionados
  const handleCellClick = useCallback((roomId: string, date: Date) => {
    const checkIn = date.toISOString().split("T")[0];
    router.push(`/bookings/new?roomId=${roomId}&checkIn=${checkIn}`);
  }, [router]);

  return (
    <Card>
      <CardHeader className="border-b">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <CardTitle>Mapa de Reservas</CardTitle>
            {isPending && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
          </div>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <DateNavigator
              currentDate={currentDate}
              onDateChange={handleDateChange}
              days={DAYS_TO_SHOW}
            />
            <Button size="sm" asChild>
              <Link href="/bookings/new">
                <Plus className="h-4 w-4 mr-2" />
                Nova Reserva
              </Link>
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-4 space-y-4">
        {/* Legenda */}
        <MapLegend />

        {/* Timeline */}
        <ReservationTimeline
          rooms={data.rooms}
          bookings={data.bookings}
          startDate={currentDate}
          days={DAYS_TO_SHOW}
          cellWidth={50}
          onBookingClick={handleBookingClick}
          onCellClick={handleCellClick}
        />
      </CardContent>
    </Card>
  );
}
