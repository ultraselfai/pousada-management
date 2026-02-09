"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { RoomsGrid } from "./rooms-grid";
import { updateRoomStatus } from "@/features/rooms";

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

interface RoomsGridClientProps {
  rooms: RoomWithBooking[];
}

/**
 * Wrapper client-side para RoomsGrid que adiciona funcionalidade de alterar status
 */
import { useState } from "react";
import { CleaningChecklistDialog } from "./cleaning-checklist-dialog";

// ... (imports e types)

export function RoomsGridClient({ rooms }: RoomsGridClientProps) {
  const router = useRouter();
  const [cleaningRoom, setCleaningRoom] = useState<{id: string, name: string} | null>(null);

  const handleStatusChange = async (roomId: string, status: RoomStatus) => {
    try {
      const result = await updateRoomStatus({ id: roomId, status });
      if (result.success) {
        toast.success("Status do quarto atualizado!");
        router.refresh();
      } else {
        toast.error(result.error || "Erro ao atualizar status");
      }
    } catch (error) {
      toast.error("Erro ao atualizar status do quarto");
      console.error(error);
    }
  };

  const handleViewDetails = (roomId: string) => {
    router.push(`/rooms`);
  };

  const handleVerifyCleaning = (room: {id: string, name: string}) => {
    setCleaningRoom(room);
  };

  const handleConfirmCleaning = async () => {
    if (cleaningRoom) {
      await handleStatusChange(cleaningRoom.id, "AVAILABLE");
      setCleaningRoom(null);
    }
  };

  return (
    <>
      <RoomsGrid
        rooms={rooms}
        onViewDetails={handleViewDetails}
        onStatusChange={handleStatusChange}
        onVerifyCleaning={handleVerifyCleaning}
      />
      
      {cleaningRoom && (
        <CleaningChecklistDialog 
          isOpen={!!cleaningRoom}
          onOpenChange={(open) => !open && setCleaningRoom(null)}
          roomName={cleaningRoom.name}
          onConfirm={handleConfirmCleaning}
        />
      )}
    </>
  );
}
