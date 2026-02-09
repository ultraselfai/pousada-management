"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Plus } from "lucide-react";
import type { MapRoom, MapBooking } from "../constants";
import {
  BOOKING_STATUS_COLORS,
  BOOKING_STATUS_LABELS,
  generateDateRange,
  formatDateHeader,
  calculateBookingPosition,
  formatCurrency,
} from "../constants";

interface ReservationTimelineProps {
  rooms: MapRoom[];
  bookings: MapBooking[];
  startDate: Date;
  days?: number;
  cellWidth?: number;
  onBookingClick?: (bookingId: string) => void;
  onCellClick?: (roomId: string, date: Date) => void;
}

export function ReservationTimeline({
  rooms,
  bookings,
  startDate,
  days = 30,
  cellWidth = 50,
  onBookingClick,
  onCellClick,
}: ReservationTimelineProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [hoveredBooking, setHoveredBooking] = useState<string | null>(null);
  const [hoveredCell, setHoveredCell] = useState<string | null>(null);

  // Gerar datas para o cabeçalho
  const dates = useMemo(() => generateDateRange(startDate, days), [startDate, days]);

  // Calcular largura total do grid
  const gridWidth = dates.length * cellWidth;

  // Fim do período
  const endDate = useMemo(() => {
    const end = new Date(startDate);
    end.setDate(end.getDate() + days);
    return end;
  }, [startDate, days]);

  // Agrupar reservas por quarto
  const bookingsByRoom = useMemo(() => {
    const map = new Map<string, MapBooking[]>();
    for (const booking of bookings) {
      if (!map.has(booking.roomId)) {
        map.set(booking.roomId, []);
      }
      map.get(booking.roomId)!.push(booking);
    }
    return map;
  }, [bookings]);

  const handleCellClick = useCallback(
    (roomId: string, date: Date) => {
      onCellClick?.(roomId, date);
    },
    [onCellClick]
  );

  // Verificar se uma célula tem reserva
  const isCellOccupied = useCallback(
    (roomId: string, date: Date) => {
      const roomBookings = bookingsByRoom.get(roomId) || [];
      const dateTime = date.getTime();
      
      return roomBookings.some((booking) => {
        const checkIn = new Date(booking.checkIn);
        checkIn.setHours(0, 0, 0, 0);
        const checkOut = new Date(booking.checkOut);
        checkOut.setHours(0, 0, 0, 0);
        
        return dateTime >= checkIn.getTime() && dateTime < checkOut.getTime();
      });
    },
    [bookingsByRoom]
  );

  if (rooms.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground">
        Nenhum quarto cadastrado. Adicione quartos nas configurações.
      </div>
    );
  }

  return (
    <TooltipProvider delayDuration={200}>
      <div className="flex border rounded-lg overflow-hidden">
        {/* Coluna fixa dos quartos */}
        <div className="flex-shrink-0 bg-muted/50 border-r z-10 min-w-[140px]">
          {/* Header vazio para alinhar com datas */}
          <div className="h-14 border-b flex items-center justify-center px-4 bg-muted font-medium text-sm">
            Quartos
          </div>
          {/* Lista de quartos */}
          {rooms.map((room) => (
            <div
              key={room.id}
              className="h-12 border-b flex items-center px-3 gap-2 hover:bg-muted/80 transition-colors"
            >
              <span className="font-semibold text-sm truncate">{room.name}</span>
              <Badge variant="outline" className="text-xs shrink-0">
                {room.category}
              </Badge>
            </div>
          ))}
        </div>

        {/* Área scrollável do timeline */}
        <ScrollArea className="flex-1" ref={containerRef}>
          <div style={{ width: gridWidth }}>
            {/* Header com datas */}
            <div className="h-14 border-b flex sticky top-0 bg-background z-10">
              {dates.map((date, i) => {
                const { day, weekday, month, isToday, isWeekend } = formatDateHeader(date);
                return (
                  <div
                    key={i}
                    className={cn(
                      "flex flex-col items-center justify-center border-r text-xs",
                      isToday && "bg-primary/10",
                      isWeekend && !isToday && "bg-muted/50"
                    )}
                    style={{ width: cellWidth }}
                  >
                    <span className="uppercase text-muted-foreground text-[10px]">{weekday}</span>
                    <span
                      className={cn(
                        "font-bold text-sm",
                        isToday && "text-primary"
                      )}
                    >
                      {day}
                    </span>
                    {/* Mostrar mês no primeiro dia ou quando mudar */}
                    {(i === 0 || date.getDate() === 1) && (
                      <span className="text-[9px] text-muted-foreground uppercase">{month}</span>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Linhas dos quartos com reservas */}
            {rooms.map((room) => {
              const roomBookings = bookingsByRoom.get(room.id) || [];

              return (
                <div key={room.id} className="h-12 border-b relative flex">
                  {/* Células de fundo */}
                  {dates.map((date, i) => {
                    const { isToday, isWeekend } = formatDateHeader(date);
                    const cellKey = `${room.id}-${i}`;
                    const isOccupied = isCellOccupied(room.id, date);
                    const isHovered = hoveredCell === cellKey && !isOccupied;
                    
                    return (
                      <div
                        key={i}
                        className={cn(
                          "border-r h-full cursor-pointer transition-colors relative group",
                          isToday && "bg-primary/5",
                          isWeekend && !isToday && "bg-muted/30",
                          !isOccupied && "hover:bg-primary/10"
                        )}
                        style={{ width: cellWidth }}
                        onClick={() => !isOccupied && handleCellClick(room.id, date)}
                        onMouseEnter={() => setHoveredCell(cellKey)}
                        onMouseLeave={() => setHoveredCell(null)}
                      >
                        {/* Ícone + ao passar o mouse em célula vazia */}
                        {!isOccupied && isHovered && (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center">
                              <Plus className="h-4 w-4 text-muted-foreground" />
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}

                  {/* Reservas posicionadas absolutamente */}
                  {roomBookings.map((booking) => {
                    const { left, width, visible } = calculateBookingPosition(
                      booking.checkIn,
                      booking.checkOut,
                      startDate,
                      endDate,
                      cellWidth
                    );

                    if (!visible) return null;

                    const isHovered = hoveredBooking === booking.id;

                    return (
                      <Tooltip key={booking.id}>
                        <TooltipTrigger asChild>
                          <div
                            className={cn(
                              "absolute top-1 h-10 rounded-md cursor-pointer",
                              "flex items-center px-2 overflow-hidden",
                              "border-2 text-white text-xs font-medium",
                              "transition-all duration-150 shadow-sm",
                              BOOKING_STATUS_COLORS[booking.status],
                              isHovered && "ring-2 ring-offset-1 ring-primary z-20 scale-[1.02]"
                            )}
                            style={{
                              left: left + 2,
                              width: Math.max(width - 4, 30),
                            }}
                            onClick={(e) => {
                              e.stopPropagation();
                              onBookingClick?.(booking.id);
                            }}
                            onMouseEnter={() => setHoveredBooking(booking.id)}
                            onMouseLeave={() => setHoveredBooking(null)}
                          >
                            <span className="truncate">{booking.guestName}</span>
                          </div>
                        </TooltipTrigger>
                        <TooltipContent side="top" className="max-w-xs">
                          <div className="space-y-2">
                            <p className="font-semibold text-base">{booking.guestName}</p>
                            <p className="text-sm">
                              {new Date(booking.checkIn).toLocaleDateString("pt-BR")} →{" "}
                              {new Date(booking.checkOut).toLocaleDateString("pt-BR")}
                            </p>
                            <div className="flex items-center gap-2 flex-wrap">
                              <Badge variant="secondary" className="text-xs">
                                {BOOKING_STATUS_LABELS[booking.status]}
                              </Badge>
                              <span className="text-xs text-muted-foreground">
                                {booking.totalGuests} hóspede(s)
                              </span>
                            </div>
                            {booking.totalAmount && (
                              <p className="text-sm font-medium text-green-600">
                                {formatCurrency(booking.totalAmount)}
                              </p>
                            )}
                            <p className="text-xs text-muted-foreground italic">
                              Clique para ver detalhes
                            </p>
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    );
                  })}
                </div>
              );
            })}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </div>
    </TooltipProvider>
  );
}
