"use client";

import { RoomCard } from "./room-card";

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

interface RoomsGridProps {
  rooms: RoomWithBooking[];
  onCheckIn?: (roomId: string) => void;
  onCheckOut?: (roomId: string) => void;
  onViewDetails?: (roomId: string) => void;
  onStatusChange?: (roomId: string, status: RoomStatus) => void;
  onVerifyCleaning?: (room: {id: string, name: string}) => void;
}

export function RoomsGrid({
  rooms,
  onViewDetails,
  onCheckIn,
  onCheckOut,
  onStatusChange,
  onVerifyCleaning,
}: RoomsGridProps) {
  // Ordenar quartos por nome
  const sortedRooms = [...rooms].sort((a, b) => {
    return a.name.localeCompare(b.name, "pt-BR", { numeric: true });
  });

  if (rooms.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-muted-foreground">
        <p>Nenhum quarto cadastrado. Adicione quartos nas configurações.</p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {sortedRooms.map((room) => (
        <RoomCard
          key={room.id}
          room={room}
          onCheckIn={() => onCheckIn?.(room.id)}
          onCheckOut={() => onCheckOut?.(room.id)}
          onViewDetails={() => onViewDetails?.(room.id)}
          onStatusChange={onStatusChange ? (status) => onStatusChange(room.id, status) : undefined}
          onVerifyCleaning={onVerifyCleaning ? () => onVerifyCleaning({id: room.id, name: room.name}) : undefined}
        />
      ))}
    </div>
  );
}
