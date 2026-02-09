"use client"

import type { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Progress } from "@/components/ui/progress"
import type { BookingWithDetails } from "@/features/bookings/types"
import { bookingStatuses, getPaymentMethodLabel } from "../data/data"
import { DataTableColumnHeader } from "@/app/(admin)/tasks/components/data-table-column-header"
import { BookingRowActions } from "./booking-row-actions"
import { formatDate, formatCurrency, calculateNights, calculatePaidPercentage } from "../utils"

export function createColumns(onRefresh?: () => void): ColumnDef<BookingWithDetails>[] {
  return [
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
      accessorKey: "bookingNumber",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Reserva" />
      ),
      cell: ({ row }) => {
        return (
          <span className="font-mono font-medium">
            {row.getValue("bookingNumber")}
          </span>
        )
      },
    },
    {
      accessorKey: "guest",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Hóspede" />
      ),
      cell: ({ row }) => {
        const guest = row.original.guest
        return (
          <div className="flex flex-col">
            <span className="font-medium">{guest.name}</span>
            <span className="text-xs text-muted-foreground">{guest.phone}</span>
          </div>
        )
      },
      filterFn: (row, id, value) => {
        const guest = row.original.guest
        return guest.name.toLowerCase().includes(value.toLowerCase())
      },
    },
    {
      accessorKey: "room",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Quarto" />
      ),
      cell: ({ row }) => {
        const room = row.original.room
        return (
          <div className="flex flex-col">
            <span className="font-medium">{room.name}</span>
            <span className="text-xs text-muted-foreground">{room.category}</span>
          </div>
        )
      },
    },
    {
      accessorKey: "checkIn",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Check-in" />
      ),
      cell: ({ row }) => {
        return <span>{formatDate(row.getValue("checkIn"))}</span>
      },
    },
    {
      accessorKey: "checkOut",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Check-out" />
      ),
      cell: ({ row }) => {
        const nights = calculateNights(row.original.checkIn, row.original.checkOut)
        return (
          <div className="flex flex-col">
            <span>{formatDate(row.getValue("checkOut"))}</span>
            <span className="text-xs text-muted-foreground">{nights} noite(s)</span>
          </div>
        )
      },
    },
    {
      accessorKey: "status",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Status" />
      ),
      cell: ({ row }) => {
        const status = bookingStatuses.find(
          (s) => s.value === row.getValue("status")
        )
        if (!status) return null

        const colorClasses = {
          yellow: "bg-yellow-100 text-yellow-800 border-yellow-300",
          green: "bg-green-100 text-green-800 border-green-300",
          blue: "bg-blue-100 text-blue-800 border-blue-300",
          gray: "bg-gray-100 text-gray-800 border-gray-300",
          red: "bg-red-100 text-red-800 border-red-300",
          orange: "bg-orange-100 text-orange-800 border-orange-300",
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
      accessorKey: "totalAmount",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Valor" />
      ),
      cell: ({ row }) => {
        const total = Number(row.original.totalAmount)
        const paid = Number(row.original.paidAmount)
        const percentage = calculatePaidPercentage(paid, total)

        return (
          <div className="flex flex-col gap-1 min-w-[100px]">
            <span className="font-medium">{formatCurrency(total)}</span>
            <div className="flex items-center gap-2">
              <Progress value={percentage} className="h-1.5 flex-1" />
              <span className="text-xs text-muted-foreground">{percentage}%</span>
            </div>
          </div>
        )
      },
    },
    {
      id: "actions",
      cell: ({ row }) => <BookingRowActions row={row} onRefresh={onRefresh} />,
    },
  ]
}

// Export para retrocompatibilidade
export const columns = createColumns()
