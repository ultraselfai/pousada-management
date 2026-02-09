"use client"

import { useEffect, useState, useCallback } from "react"
import { Calendar } from "lucide-react"

import { BookingsTable } from "./components"
import { fetchBookings } from "./actions"
import type { BookingWithDetails } from "@/features/bookings/types"
import { Skeleton } from "@/components/ui/skeleton"

export default function BookingsPage() {
  const [bookings, setBookings] = useState<BookingWithDetails[]>([])
  const [loading, setLoading] = useState(true)
  const [total, setTotal] = useState(0)

  const loadBookings = useCallback(async () => {
    try {
      const result = await fetchBookings()
      if (result.success) {
        setBookings(result.bookings)
        setTotal(result.total)
      }
    } catch (error) {
      console.error("Erro ao carregar reservas:", error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadBookings()
  }, [loadBookings])

  // Callback para atualizar a lista quando uma ação é realizada
  const handleRefresh = useCallback(async () => {
    await loadBookings()
  }, [loadBookings])

  if (loading) {
    return (
      <div className="flex flex-1 flex-col px-4 md:px-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-64 mt-2" />
          </div>
          <Skeleton className="h-9 w-32" />
        </div>
        <div className="rounded-md border">
          <div className="p-4 space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-1 flex-col px-4 md:px-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Calendar className="h-6 w-6" />
            Reservas
          </h1>
          <p className="text-muted-foreground">
            {total} reserva{total !== 1 ? "s" : ""} encontrada{total !== 1 ? "s" : ""}
          </p>
        </div>
      </div>

      <BookingsTable data={bookings} onRefresh={handleRefresh} />
    </div>
  )
}
