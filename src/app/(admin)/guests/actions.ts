"use server"

import { getGuests } from "@/features/guests"

/**
 * Action para buscar hóspedes para a página de listagem
 */
export async function fetchGuests(search?: string, origin?: string) {
  const result = await getGuests({
    search,
    origin: origin as any,
  })
  
  return result
}
