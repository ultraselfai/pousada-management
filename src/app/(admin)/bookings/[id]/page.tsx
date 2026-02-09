import { notFound } from "next/navigation"
import Link from "next/link"
import {
  ArrowLeft,
  Calendar,
  User,
  BedDouble,
  CreditCard,
  Clock,
  CheckCircle2,
  XCircle,
  Pencil,
  FileText,
} from "lucide-react"

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"

import { getBooking } from "@/features/bookings"
import { BOOKING_STATUS_LABELS } from "@/features/bookings/types"

interface Props {
  params: Promise<{ id: string }>
}

const statusColors: Record<string, string> = {
  PRE_BOOKING: "bg-yellow-100 text-yellow-800 border-yellow-300",
  CONFIRMED: "bg-blue-100 text-blue-800 border-blue-300",
  CHECKED_IN: "bg-green-100 text-green-800 border-green-300",
  CHECKED_OUT: "bg-gray-100 text-gray-800 border-gray-300",
  CANCELLED: "bg-red-100 text-red-800 border-red-300",
  NO_SHOW: "bg-orange-100 text-orange-800 border-orange-300",
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value)
}

function formatDate(date: Date) {
  return new Date(date).toLocaleDateString("pt-BR", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "numeric",
  })
}

function calculateNights(checkIn: Date, checkOut: Date) {
  const msPerDay = 1000 * 60 * 60 * 24
  return Math.round((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / msPerDay)
}

export default async function BookingDetailsPage({ params }: Props) {
  const { id } = await params
  const result = await getBooking(id)

  if (!result.success || !result.booking) {
    notFound()
  }

  const booking = result.booking
  const nights = calculateNights(booking.checkIn, booking.checkOut)

  return (
    <div className="flex flex-1 flex-col px-4 md:px-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/bookings">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
              <Calendar className="h-6 w-6" />
              Reserva #{booking.bookingNumber}
            </h1>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="outline" className={statusColors[booking.status]}>
                {BOOKING_STATUS_LABELS[booking.status] || booking.status}
              </Badge>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <a href={`/api/bookings/${id}/receipt`} target="_blank" rel="noopener noreferrer">
              <FileText className="mr-2 h-4 w-4" />
              Ver Comprovante
            </a>
          </Button>
          <Button variant="outline" asChild>
            <Link href={`/bookings/${id}/edit`}>
              <Pencil className="mr-2 h-4 w-4" />
              Editar
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Guest Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Hóspede
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-lg font-semibold">{booking.guest?.name || "N/A"}</p>
              <p className="text-sm text-muted-foreground">{booking.guest?.email}</p>
              <p className="text-sm text-muted-foreground">{booking.guest?.phone}</p>
            </div>
            {booking.guest && (
              <Button variant="outline" size="sm" asChild>
                <Link href={`/guests/${booking.guest.id}`}>
                  Ver Perfil do Hóspede
                </Link>
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Room Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BedDouble className="h-5 w-5" />
              Acomodação
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-lg font-semibold">{booking.room?.name || "N/A"}</p>
              <p className="text-sm text-muted-foreground">{booking.room?.category}</p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary">
                {booking.adults} adulto{booking.adults !== 1 ? "s" : ""}
              </Badge>
              {booking.children > 0 && (
                <Badge variant="secondary">
                  {booking.children} criança{booking.children !== 1 ? "s" : ""}
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Dates */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Período
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Check-in</p>
                <p className="font-medium">{formatDate(booking.checkIn)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Check-out</p>
                <p className="font-medium">{formatDate(booking.checkOut)}</p>
              </div>
            </div>
            <Badge variant="outline" className="text-sm">
              {nights} noite{nights !== 1 ? "s" : ""}
            </Badge>
          </CardContent>
        </Card>

        {/* Payment */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Pagamento
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Total</span>
              <span className="text-2xl font-bold">
                {formatCurrency(Number(booking.totalAmount))}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Pago</span>
              <span className="font-medium text-green-600">
                {formatCurrency(Number(booking.paidAmount || 0))}
              </span>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Restante</span>
              <span className="font-medium text-orange-600">
                {formatCurrency(Number(booking.totalAmount) - Number(booking.paidAmount || 0))}
              </span>
            </div>
            <div className="flex items-center gap-2 pt-2">
              {Number(booking.paidAmount || 0) >= Number(booking.totalAmount) ? (
                <Badge className="bg-green-100 text-green-800">
                  <CheckCircle2 className="mr-1 h-3 w-3" />
                  Pago
                </Badge>
              ) : (
                <Badge className="bg-orange-100 text-orange-800">
                  <XCircle className="mr-1 h-3 w-3" />
                  Pendente
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Notes */}
      {booking.notes && (
        <Card>
          <CardHeader>
            <CardTitle>Observações</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground whitespace-pre-wrap">{booking.notes}</p>
          </CardContent>
        </Card>
      )}

      {/* Actions */}
      <div className="flex gap-4">
        <Button variant="outline" asChild>
          <Link href="/bookings">Voltar</Link>
        </Button>
      </div>
    </div>
  )
}
