"use client"

import type { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import type { GuestWithBookingCount } from "@/features/guests/types"
import { origins } from "../data/data"
import { DataTableColumnHeader } from "@/app/(admin)/tasks/components/data-table-column-header"
import { GuestRowActions } from "./guest-row-actions"
import { formatCpf, formatPhone } from "../utils"

export const columns: ColumnDef<GuestWithBookingCount>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Selecionar todos"
        className="translate-y-[2px] cursor-pointer"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Selecionar linha"
        className="translate-y-[2px] cursor-pointer"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Nome" />
    ),
    cell: ({ row }) => {
      return (
        <div className="flex flex-col">
          <span className="font-medium">{row.getValue("name")}</span>
          <span className="text-xs text-muted-foreground">
            {row.original._count.bookings} reserva(s)
          </span>
        </div>
      )
    },
  },
  {
    accessorKey: "cpf",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="CPF" />
    ),
    cell: ({ row }) => {
      return <span className="font-mono">{formatCpf(row.getValue("cpf"))}</span>
    },
  },
  {
    accessorKey: "phone",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Telefone" />
    ),
    cell: ({ row }) => {
      return <span>{formatPhone(row.getValue("phone"))}</span>
    },
  },
  {
    accessorKey: "email",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Email" />
    ),
    cell: ({ row }) => {
      const email = row.getValue("email") as string | null
      return email ? (
        <span className="text-muted-foreground">{email}</span>
      ) : (
        <span className="text-muted-foreground/50 italic">Não informado</span>
      )
    },
  },
  {
    accessorKey: "origin",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Origem" />
    ),
    cell: ({ row }) => {
      const origin = origins.find((o) => o.value === row.getValue("origin"))
      if (!origin) return null

      return (
        <Badge variant="outline" className="gap-1">
          {origin.icon && <origin.icon className="h-3 w-3" />}
          {origin.label}
        </Badge>
      )
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    },
  },
  {
    id: "actions",
    cell: ({ row }) => <GuestRowActions row={row} />,
  },
]
