"use server"

import { getBookings } from "@/features/bookings"
import type { BookingFilters } from "@/features/bookings/types"

/**
 * Action para buscar reservas para a página de listagem
 */
export async function fetchBookings(filters?: BookingFilters) {
  const result = await getBookings(filters)
  return result
}
