"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  BedDouble,
  Users,
  LogIn,
  LogOut,
  MoreVertical,
  Phone,
  CheckCircle,
  Wrench,
  Ban,
  Sparkles,
  ClipboardCheck,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { ROOM_STATUS_COLORS, ROOM_STATUS_LABELS } from "../constants";

// Tipos locais para evitar import do Prisma no client
type RoomStatus = "AVAILABLE" | "OCCUPIED" | "CLEANING" | "MAINTENANCE" | "BLOCKED";
type RoomCategory = "STANDARD" | "LUXO" | "LUXO_SUPERIOR";

interface RoomWithBooking {
  id: string;
  name: string;
  category: RoomCategory;
  status: RoomStatus;
  maxGuests: number;
  hasCheckInToday: boolean;
  hasCheckOutToday: boolean;
  currentBooking?: {
    id: string;
    guestName: string;
    guestPhone: string | null;
    checkIn: Date;
    checkOut: Date;
    totalGuests: number;
    totalAmount: number;
    paidAmount: number;
  } | null;
}

interface RoomCardProps {
  room: RoomWithBooking;
  onCheckIn?: () => void;
  onCheckOut?: () => void;
  onViewDetails?: () => void;
  onStatusChange?: (status: RoomStatus) => void;
  onVerifyCleaning?: () => void;
}

const CATEGORY_LABELS: Record<RoomCategory, string> = {
  STANDARD: "Standard",
  LUXO: "Luxo",
  LUXO_SUPERIOR: "Luxo Superior",
};

export function RoomCard({
  room,
  onCheckIn,
  onCheckOut,
  onViewDetails,
  onStatusChange,
  onVerifyCleaning,
}: RoomCardProps) {
  const colors = ROOM_STATUS_COLORS[room.status];
  const statusLabel = ROOM_STATUS_LABELS[room.status];
  const categoryLabel = CATEGORY_LABELS[room.category];
  const hasGuest = room.currentBooking !== null;

  // Calcular dias restantes se ocupado
  const daysRemaining = room.currentBooking
    ? Math.ceil(
        (new Date(room.currentBooking.checkOut).getTime() - new Date().getTime()) /
          (1000 * 60 * 60 * 24)
      )
    : 0;

  // Calcular saldo pendente
  const pendingAmount = room.currentBooking
    ? room.currentBooking.totalAmount - room.currentBooking.paidAmount
    : 0;

  // Determinar badge especial para check-in/out hoje
  const specialBadge = room.hasCheckOutToday
    ? { label: "Checkout Hoje", color: "bg-amber-500 text-white" }
    : room.hasCheckInToday
      ? { label: "Check-in Hoje", color: "bg-purple-500 text-white" }
      : null;

  return (
    <Card
      className={cn(
        "relative transition-all hover:shadow-md",
        colors.bg,
        colors.border,
        "border-2"
      )}
    >
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BedDouble className={cn("h-5 w-5", colors.text)} />
            <CardTitle className="text-lg font-bold">
              {room.name}
            </CardTitle>
          </div>
          <div className="flex items-center gap-2">
            {specialBadge ? (
              <Badge className={specialBadge.color}>
                {specialBadge.label}
              </Badge>
            ) : (
              <Badge
                variant="outline"
                className={cn("text-xs", colors.text, colors.border)}
              >
                {statusLabel}
              </Badge>
            )}
            <DropdownMenu>
              <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={onViewDetails}>
                  Ver Detalhes
                </DropdownMenuItem>
                {room.hasCheckInToday && (
                  <DropdownMenuItem onClick={onCheckIn}>
                    <LogIn className="h-4 w-4 mr-2" />
                    Fazer Check-in
                  </DropdownMenuItem>
                )}
                {room.hasCheckOutToday && (
                  <DropdownMenuItem onClick={onCheckOut}>
                    <LogOut className="h-4 w-4 mr-2" />
                    Fazer Check-out
                  </DropdownMenuItem>
                )}
                {onStatusChange && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuSub>
                      <DropdownMenuSubTrigger>
                        <Wrench className="h-4 w-4 mr-2" />
                        Alterar Status
                      </DropdownMenuSubTrigger>
                      <DropdownMenuSubContent>
                        <DropdownMenuItem 
                          onClick={() => onStatusChange("AVAILABLE")}
                          disabled={room.status === "AVAILABLE" || room.status === "OCCUPIED"}
                        >
                          <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
                          Disponível
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => onStatusChange("CLEANING")}
                          disabled={room.status === "CLEANING" || room.status === "OCCUPIED"}
                        >
                          <Sparkles className="h-4 w-4 mr-2 text-yellow-600" />
                          Limpeza
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => onStatusChange("MAINTENANCE")}
                          disabled={room.status === "MAINTENANCE" || room.status === "OCCUPIED"}
                        >
                          <Wrench className="h-4 w-4 mr-2 text-orange-600" />
                          Manutenção
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => onStatusChange("BLOCKED")}
                          disabled={room.status === "BLOCKED" || room.status === "OCCUPIED"}
                        >
                          <Ban className="h-4 w-4 mr-2 text-red-600" />
                          Bloqueado
                        </DropdownMenuItem>
                      </DropdownMenuSubContent>
                    </DropdownMenuSub>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        <p className="text-xs text-muted-foreground">
          {categoryLabel} • Até {room.maxGuests} hóspedes
        </p>
      </CardHeader>

      <CardContent className="pt-2">
        {hasGuest && room.currentBooking ? (
          <div className="space-y-2">
            {/* Nome do hóspede */}
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium truncate">
                {room.currentBooking.guestName}
              </span>
            </div>

            {/* Telefone */}
            {room.currentBooking.guestPhone && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Phone className="h-3.5 w-3.5" />
                <span>{room.currentBooking.guestPhone}</span>
              </div>
            )}

            {/* Informações de estadia */}
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">
                {room.currentBooking.totalGuests} hóspede(s)
              </span>
              <span className={cn("font-medium", colors.text)}>
                {daysRemaining > 0
                  ? `${daysRemaining} dia(s) restante(s)`
                  : "Checkout hoje"}
              </span>
            </div>

            {/* Saldo */}
            {pendingAmount > 0 && (
              <div className="flex justify-between text-sm pt-1 border-t">
                <span className="text-muted-foreground">Saldo pendente:</span>
                <span className="font-medium text-orange-600 dark:text-orange-400">
                  {new Intl.NumberFormat("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  }).format(pendingAmount)}
                </span>
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-16 text-muted-foreground text-sm gap-2">
            {room.status === "MAINTENANCE" && "Em manutenção"}
            {room.status === "CLEANING" && (
                <>
                    <span>Aguardando limpeza</span>
                    {onVerifyCleaning && (
                        <Button size="sm" variant="outline" onClick={onVerifyCleaning} className="h-7 text-xs bg-white/50 hover:bg-white/80 border-dashed">
                           <ClipboardCheck className="mr-2 h-3 w-3" />
                           Conferir
                        </Button>
                    )}
                </>
            )}
            {room.status === "BLOCKED" && "Bloqueado"}
            {room.status === "AVAILABLE" && "Disponível para reserva"}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
