"use client"

import type { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import type { Quote } from "@/features/quotes/types"
import { quoteStatuses } from "../data/data"
import { DataTableColumnHeader } from "@/app/(admin)/tasks/components/data-table-column-header"
import { QuoteRowActions } from "./quote-row-actions"
import { formatDate, formatCurrency, calculateNights, isExpired } from "../utils"

export const columns: ColumnDef<Quote>[] = [
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
    accessorKey: "quoteNumber",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Número" />
    ),
    cell: ({ row }) => {
      return (
        <span className="font-mono font-medium">
          {row.getValue("quoteNumber")}
        </span>
      )
    },
  },
  {
    accessorKey: "guestName",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Cliente" />
    ),
    cell: ({ row }) => {
      return (
        <div className="flex flex-col">
          <span className="font-medium">{row.getValue("guestName")}</span>
          {row.original.guestPhone && (
            <span className="text-xs text-muted-foreground">
              {row.original.guestPhone}
            </span>
          )}
        </div>
      )
    },
  },
  {
    accessorKey: "roomName",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Quarto" />
    ),
    cell: ({ row }) => {
      return <span>{row.getValue("roomName")}</span>
    },
  },
  {
    accessorKey: "checkIn",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Período" />
    ),
    cell: ({ row }) => {
      const nights = calculateNights(row.original.checkIn, row.original.checkOut)
      return (
        <div className="flex flex-col">
          <span>
            {formatDate(row.original.checkIn)} → {formatDate(row.original.checkOut)}
          </span>
          <span className="text-xs text-muted-foreground">{nights} noite(s)</span>
        </div>
      )
    },
  },
  {
    accessorKey: "totalPrice",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Valor" />
    ),
    cell: ({ row }) => {
      const discount = Number(row.original.discount)
      return (
        <div className="flex flex-col">
          <span className="font-medium">
            {formatCurrency(Number(row.getValue("totalPrice")))}
          </span>
          {discount > 0 && (
            <span className="text-xs text-green-600">
              {row.original.discountType === "PERCENTAGE"
                ? `-${discount}%`
                : `-${formatCurrency(discount)}`}
            </span>
          )}
        </div>
      )
    },
  },
  {
    accessorKey: "validUntil",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Validade" />
    ),
    cell: ({ row }) => {
      const expired = isExpired(row.original.validUntil)
      return (
        <span className={expired ? "text-red-500" : ""}>
          {formatDate(row.getValue("validUntil"))}
          {expired && " (expirado)"}
        </span>
      )
    },
  },
  {
    accessorKey: "status",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Status" />
    ),
    cell: ({ row }) => {
      const status = quoteStatuses.find(
        (s) => s.value === row.getValue("status")
      )
      if (!status) return null

      const colorClasses = {
        gray: "bg-gray-100 text-gray-800 border-gray-300",
        blue: "bg-blue-100 text-blue-800 border-blue-300",
        green: "bg-green-100 text-green-800 border-green-300",
        red: "bg-red-100 text-red-800 border-red-300",
        orange: "bg-orange-100 text-orange-800 border-orange-300",
        purple: "bg-purple-100 text-purple-800 border-purple-300",
      }

      return (
        <Badge
          variant="outline"
          className={`gap-1 ${colorClasses[status.color as keyof typeof colorClasses]}`}
        >
          {status.icon && <status.icon className="h-3 w-3" />}
          {status.label}
        </Badge>
      )
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    },
  },
  {
    id: "actions",
    cell: ({ row }) => <QuoteRowActions row={row} />,
  },
]
