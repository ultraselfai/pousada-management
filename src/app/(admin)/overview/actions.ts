"use server";

/**
 * Server Actions para a página de Visão Geral
 */

import { prisma } from "@/db";
import { RoomStatus, BookingStatus, TransactionType } from "@/generated/prisma/client";

export interface DailyOverviewStats {
  totalRooms: number;
  occupiedRooms: number;
  availableRooms: number;
  checkinsToday: number;
  checkoutsToday: number;
  occupancyRate: number;
  revenueToday: number;
  pendingPayments: number;
}

export interface RoomWithCurrentBooking {
  id: string;
  name: string;
  category: "STANDARD" | "LUXO" | "LUXO_SUPERIOR";
  status: RoomStatus;
  maxGuests: number;
  hasCheckInToday: boolean;
  hasCheckOutToday: boolean;
  currentBooking: {
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

/**
 * Obter estatísticas do dia
 */
/**
 * Obter estatísticas do dia
 */
export async function getDailyStats(): Promise<DailyOverviewStats> {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Buscar todos os quartos com reservas ativas/hoje
    const rooms = await prisma.room.findMany({
      select: { 
        id: true,
        status: true,
        bookings: {
          where: {
            status: { in: [BookingStatus.CONFIRMED, BookingStatus.CHECKED_IN] },
            checkIn: { lte: new Date() }, // Check-in já passou ou é hoje
            checkOut: { gt: new Date() }   // Check-out ainda não passou
          },
          select: { id: true }
        }
      },
    });

    const totalRooms = rooms.length;

    // Quartos ocupados: Status Ocupado OU tem reserva ativa agora (Check-in feito ou confirmado para hoje)
    // Para ser mais preciso com a "realidade":
    // - Ocupado (Físico): Status OCCUPIED
    // - Ocupado (Lógico): Tem reserva check-in hoje rodando
    
    // Vamos contar como "Ocupado" se tiver status OCCUPIED ou se tiver reserva em andamento (CHECKED_IN).
    // Reservas CONFIRMED que ainda não deram check-in contam como "Reservado" mas tiram da disponibilidade.
    
    // Definição de "Quartos Livres" (Available Rooms):
    // - Status deve ser AVAILABLE
    // - NÃO pode ter reserva ativa (Checked-in ou Confirmed para agora)
    
    const availableRooms = rooms.filter(r => {
      // Se não for AVAILABLE (ex: BLOCKED, MAINTENANCE, CLEANING, OCCUPIED), não está livre.
      if (r.status !== RoomStatus.AVAILABLE) return false;
      
      // Se tiver reserva correndo agora, não está livre
      if (r.bookings.length > 0) return false;
      
      return true;
    }).length;

    const occupiedRooms = rooms.filter(r => 
      r.status === RoomStatus.OCCUPIED || 
      r.bookings.some(b => true) // Simplesmente ter uma reserva ativa conta como ocupação na visão macro? 
      // User quer "Realidade Prática".
      // Se tem gente no quarto, é ocupado. Se o sistema diz Ocupado, é ocupado.
      // Se tem reserva CHECKED_IN, é ocupado.
    ).length;
    
    // Ajuste: occupiedRooms deve refletir a taxa de ocupação real.
    // Vamos usar a contagem de quartos que NÃO estão livres e NÃO estão em manutenção/bloqueados/limpeza?
    // Ou especificamente hóspedes na casa.
    // Melhor manter: Ocupados = Status OCCUPIED + Reservas CHECKED_IN (deduplicando)
    
    const realOccupiedCount = rooms.filter(r => {
        if (r.status === RoomStatus.OCCUPIED) return true;
        // Se status estiver como disponível mas tem reserva rodando (inconsistência ou atraso no update), conta como ocupado
        if (r.bookings.length > 0) return true;
        return false;
    }).length;
    
    // Check-ins hoje
    const checkinsToday = await prisma.booking.count({
      where: {
        checkIn: { gte: today, lt: tomorrow },
        status: { in: [BookingStatus.CONFIRMED, BookingStatus.CHECKED_IN] },
      },
    });

    // Check-outs hoje
    const checkoutsToday = await prisma.booking.count({
      where: {
        checkOut: { gte: today, lt: tomorrow },
        status: BookingStatus.CHECKED_IN,
      },
    });

    // Receita do dia (transações de entrada)
    const revenueResult = await prisma.transaction.aggregate({
      where: {
        date: { gte: today, lt: tomorrow },
        type: TransactionType.INCOME,
      },
      _sum: { amount: true },
    });

    // Pagamentos pendentes (reservas ativas com saldo)
    const activeBookings = await prisma.booking.findMany({
      where: {
        status: { in: [BookingStatus.CONFIRMED, BookingStatus.CHECKED_IN] },
      },
      select: { totalAmount: true, paidAmount: true },
    });

    const pendingPayments = activeBookings.reduce(
      (sum, b) => sum + (b.totalAmount.toNumber() - b.paidAmount.toNumber()),
      0
    );

    return {
      totalRooms,
      occupiedRooms: realOccupiedCount,
      availableRooms,
      checkinsToday,
      checkoutsToday,
      occupancyRate: totalRooms > 0 ? (realOccupiedCount / totalRooms) * 100 : 0,
      revenueToday: revenueResult._sum.amount?.toNumber() || 0,
      pendingPayments,
    };
  } catch (error) {
    console.error("Erro ao buscar estatísticas:", error);
    return {
      totalRooms: 0,
      occupiedRooms: 0,
      availableRooms: 0,
      checkinsToday: 0,
      checkoutsToday: 0,
      occupancyRate: 0,
      revenueToday: 0,
      pendingPayments: 0,
    };
  }
}

/**
 * Obter quartos com reservas atuais
 */
export async function getRoomsWithBookings(): Promise<RoomWithCurrentBooking[]> {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const rooms = await prisma.room.findMany({
      include: {
        bookings: {
          where: {
            status: { in: [BookingStatus.CONFIRMED, BookingStatus.CHECKED_IN] },
            checkIn: { lte: new Date() },
            checkOut: { gte: today },
          },
          include: {
            guest: {
              select: { name: true, phone: true },
            },
          },
          take: 1,
          orderBy: { checkIn: "desc" },
        },
      },
      orderBy: { name: "asc" },
    });

    return rooms.map((room) => {
      const currentBooking = room.bookings[0] || null;

      // Verificar se há check-in ou check-out hoje
      const hasCheckInToday = currentBooking
        ? new Date(currentBooking.checkIn) >= today &&
          new Date(currentBooking.checkIn) < tomorrow
        : false;
      const hasCheckOutToday = currentBooking
        ? new Date(currentBooking.checkOut) >= today &&
          new Date(currentBooking.checkOut) < tomorrow
        : false;

      // Lógica de Status Dinâmico:
      // Se tiver uma reserva válida rodando (BookingStatus.CHECKED_IN), o quarto ESTÁ ocupado.
      // E se tiver Check-in HOJE com status Confirmado, também tratamos como ocupação iminente (ou ocupação de fato na UI).
      
      let displayStatus = room.status;

      if (currentBooking) {
        // Se a reserva já está check-in, visualmente é OCUPADO.
        if (currentBooking.status === BookingStatus.CHECKED_IN) {
             displayStatus = RoomStatus.OCCUPIED;
        } 
        // Se é confirmado e check-in é hoje, pode mostrar como ocupado se quisermos ser preemptivos.
        // O usuário reclamou: "se eu reservo... no check-in tem que mudar para ocupado automaticamente".
        // Se o status for CONFIRMED, tecnicamente o hospede pode não ter chegado. 
        // Mas se a reserva cobre o periodo atual e não é futuro...
        // Vamos forçar OCCUPIED se tiver currentBooking, pois a query já filtra por active bookings.
        else if (currentBooking.status === BookingStatus.CONFIRMED && new Date(currentBooking.checkIn) <= new Date()) {
             // Opcional: Manter AVAILABLE até o check-in real? 
             // O user disse: "Ali esta mostrando o hospede... mas com card verde".
             // Se mostra o hóspede, tem que mostrar Ocupado.
             displayStatus = RoomStatus.OCCUPIED;
        }
      }

      return {
        id: room.id,
        name: room.name,
        category: room.category,
        status: displayStatus, // Use the dynamic status
        maxGuests: room.maxGuests,
        hasCheckInToday,
        hasCheckOutToday,
        currentBooking: currentBooking
          ? {
              id: currentBooking.id,
              guestName: currentBooking.guest.name,
              guestPhone: currentBooking.guest.phone,
              checkIn: currentBooking.checkIn,
              checkOut: currentBooking.checkOut,
              totalGuests: currentBooking.adults + currentBooking.children,
              totalAmount: currentBooking.totalAmount.toNumber(),
              paidAmount: currentBooking.paidAmount.toNumber(),
            }
          : null,
      };
    });
  } catch (error) {
    console.error("Erro ao buscar quartos:", error);
    return [];
  }
}

/**
 * Contar quartos por status
 */
export async function getStatusCounts(): Promise<Record<RoomStatus, number>> {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Buscar todos os quartos e suas reservas ativas para determinar status real
    const rooms = await prisma.room.findMany({
      select: {
        id: true,
        status: true,
        bookings: {
          where: {
            status: { in: [BookingStatus.CONFIRMED, BookingStatus.CHECKED_IN] },
            checkIn: { lte: new Date() },
            checkOut: { gt: new Date() } // Deve estar no intervalo
          },
          select: { id: true, status: true, checkIn: true }
        }
      }
    });

    const result: Record<RoomStatus, number> = {
      AVAILABLE: 0,
      OCCUPIED: 0,
      CLEANING: 0,
      MAINTENANCE: 0,
      BLOCKED: 0,
    };

    for (const room of rooms) {
      let effectiveStatus = room.status;
      const currentBooking = room.bookings[0];

      if (currentBooking) {
        // Mesma lógica do card: Se tem check-in ou confirmado para hoje, é ocupado
        if (currentBooking.status === BookingStatus.CHECKED_IN) {
            effectiveStatus = RoomStatus.OCCUPIED;
        } else if (currentBooking.status === BookingStatus.CONFIRMED && new Date(currentBooking.checkIn) <= new Date()) {
            effectiveStatus = RoomStatus.OCCUPIED;
        }
      }

      // Incrementa o contador do status EFEITO
      if (result[effectiveStatus] !== undefined) {
        result[effectiveStatus]++;
      } else {
        // Fallback para segurança, embora os tipos garantam
        result[effectiveStatus] = (result[effectiveStatus] || 0) + 1;
      }
    }

    return result;
  } catch (error) {
    console.error("Erro ao contar status:", error);
    return {
      AVAILABLE: 0,
      OCCUPIED: 0,
      CLEANING: 0,
      MAINTENANCE: 0,
      BLOCKED: 0,
    };
  }
}
