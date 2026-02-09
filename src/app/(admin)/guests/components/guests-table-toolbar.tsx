"use client"

import type { Table } from "@tanstack/react-table"
import { Plus, Search, X } from "lucide-react"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DataTableViewOptions } from "@/app/(admin)/tasks/components/data-table-view-options"
import { DataTableFacetedFilter } from "@/app/(admin)/tasks/components/data-table-faceted-filter"
import { origins } from "../data/data"

interface GuestsTableToolbarProps<TData> {
  table: Table<TData>
  globalFilter: string
  setGlobalFilter: (value: string) => void
}

export function GuestsTableToolbar<TData>({
  table,
  globalFilter,
  setGlobalFilter,
}: GuestsTableToolbarProps<TData>) {
  const isFiltered =
    table.getState().columnFilters.length > 0 || globalFilter.length > 0

  return (
    <div className="flex items-center justify-between">
      <div className="flex flex-1 items-center space-x-2">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome, CPF, telefone..."
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            className="h-9 w-[200px] pl-8 lg:w-[300px]"
          />
        </div>
        {table.getColumn("origin") && (
          <DataTableFacetedFilter
            column={table.getColumn("origin")}
            title="Origem"
            options={origins}
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
        <Button asChild size="sm" className="h-9">
          <Link href="/guests/new">
            <Plus className="mr-2 h-4 w-4" />
            Novo Hóspede
          </Link>
        </Button>
      </div>
    </div>
  )
}
