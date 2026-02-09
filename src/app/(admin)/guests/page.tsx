"use client"

import { useEffect, useState, useTransition } from "react"
import { Users } from "lucide-react"

import { GuestsTable, columns } from "./components"
import { fetchGuests } from "./actions"
import type { GuestWithBookingCount } from "@/features/guests/types"
import { Skeleton } from "@/components/ui/skeleton"

export default function GuestsPage() {
  const [guests, setGuests] = useState<GuestWithBookingCount[]>([])
  const [loading, setLoading] = useState(true)
  const [total, setTotal] = useState(0)

  useEffect(() => {
    async function loadGuests() {
      try {
        const result = await fetchGuests()
        if (result.success) {
          setGuests(result.guests as GuestWithBookingCount[])
          setTotal(result.total)
        }
      } catch (error) {
        console.error("Erro ao carregar hóspedes:", error)
      } finally {
        setLoading(false)
      }
    }
    loadGuests()
  }, [])

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
            <Users className="h-6 w-6" />
            Hóspedes
          </h1>
          <p className="text-muted-foreground">
            {total} hóspede{total !== 1 ? "s" : ""} cadastrado{total !== 1 ? "s" : ""}
          </p>
        </div>
      </div>

      <GuestsTable data={guests} columns={columns} />
    </div>
  )
}
