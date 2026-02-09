"use client"

import type { Table } from "@tanstack/react-table"
import { Plus, Search, X, Calendar } from "lucide-react"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DataTableViewOptions } from "@/app/(admin)/tasks/components/data-table-view-options"
import { DataTableFacetedFilter } from "@/app/(admin)/tasks/components/data-table-faceted-filter"
import { bookingStatuses } from "../data/data"

interface BookingsTableToolbarProps<TData> {
  table: Table<TData>
  globalFilter: string
  setGlobalFilter: (value: string) => void
}

export function BookingsTableToolbar<TData>({
  table,
  globalFilter,
  setGlobalFilter,
}: BookingsTableToolbarProps<TData>) {
  const isFiltered =
    table.getState().columnFilters.length > 0 || globalFilter.length > 0

  return (
    <div className="flex items-center justify-between gap-4 flex-wrap">
      <div className="flex flex-1 items-center space-x-2">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar reserva, hóspede..."
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            className="h-9 w-[180px] pl-8 lg:w-[280px]"
          />
        </div>
        {table.getColumn("status") && (
          <DataTableFacetedFilter
            column={table.getColumn("status")}
            title="Status"
            options={bookingStatuses}
          />
        )}
        {isFiltered && (
          <Button
            variant="ghost"
            onClick={() => {
              table.resetColumnFilters()
              setGlobalFilter("")
            }}
            className="h-9 px-2 lg:px-3 cursor-pointer"
          >
            Limpar
            <X className="ml-2 h-4 w-4" />
          </Button>
        )}
      </div>
      <div className="flex items-center space-x-2">
        <DataTableViewOptions table={table} />
        <Button asChild variant="outline" size="sm" className="h-9">
          <Link href="/map/reservations">
            <Calendar className="mr-2 h-4 w-4" />
            Mapa
          </Link>
        </Button>
        <Button asChild size="sm" className="h-9">
          <Link href="/bookings/new">
            <Plus className="mr-2 h-4 w-4" />
            Nova Reserva
          </Link>
        </Button>
      </div>
    </div>
  )
}
