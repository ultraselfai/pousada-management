import { notFound } from "next/navigation"
import Link from "next/link"
import {
  ArrowLeft,
  Calendar,
  Mail,
  Pencil,
  Phone,
  User,
  CreditCard,
  History,
  MapPin,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

import { getGuest, getGuestHistory } from "@/features/guests"
import { formatCpf, formatPhone, formatDate, formatCurrency } from "../utils"
import { getOriginLabel, getOriginIcon } from "../data/data"

interface GuestDetailsPageProps {
  params: Promise<{ id: string }>
}

export default async function GuestDetailsPage({ params }: GuestDetailsPageProps) {
  const { id } = await params
  
  const [guestResult, historyResult] = await Promise.all([
    getGuest(id),
    getGuestHistory(id),
  ])

  if (!guestResult.success || !guestResult.guest) {
    notFound()
  }

  const guest = guestResult.guest
  const history = historyResult.success ? historyResult.guest?.bookings || [] : []
  const OriginIcon = getOriginIcon(guest.origin)

  return (
    <div className="flex flex-1 flex-col px-4 md:px-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/guests">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
              <User className="h-6 w-6" />
              {guest.name}
            </h1>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Badge variant="outline" className="gap-1">
                <OriginIcon className="h-3 w-3" />
                {getOriginLabel(guest.origin)}
              </Badge>
              <span>•</span>
              <span>Cadastrado em {formatDate(guest.createdAt)}</span>
            </div>
          </div>
        </div>
        <Button asChild>
          <Link href={`/guests/${id}/edit`}>
            <Pencil className="mr-2 h-4 w-4" />
            Editar
          </Link>
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Informações de Contato */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Contato</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <CreditCard className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">CPF</p>
                <p className="text-sm text-muted-foreground font-mono">
                  {formatCpf(guest.cpf)}
                </p>
              </div>
            </div>
            <Separator />
            <div className="flex items-center gap-3">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Telefone</p>
                <p className="text-sm text-muted-foreground">
                  {formatPhone(guest.phone)}
                </p>
              </div>
            </div>
            <Separator />
            <div className="flex items-center gap-3">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Email</p>
                <p className="text-sm text-muted-foreground">
                  {guest.email || "Não informado"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Estatísticas */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Estatísticas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Total de Estadias</span>
              <span className="text-2xl font-bold">{history.length}</span>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Valor Total</span>
              <span className="text-lg font-semibold text-green-600">
                {formatCurrency(history.reduce((acc, b) => acc + Number(b.totalAmount), 0))}
              </span>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Última Visita</span>
              <span className="text-sm">
                {history.length > 0
                  ? formatDate(history[0].checkOut)
                  : "Nunca hospedou"}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Observações */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Observações</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              {guest.notes || "Nenhuma observação registrada."}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Histórico de Estadias */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Histórico de Estadias
          </CardTitle>
          <CardDescription>
            Todas as reservas deste hóspede
          </CardDescription>
        </CardHeader>
        <CardContent>
          {history.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Este hóspede ainda não possui estadias registradas.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {history.map((booking) => (
                <div
                  key={booking.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex flex-col">
                      <span className="font-medium">{booking.bookingNumber}</span>
                      <span className="text-sm text-muted-foreground">
                        {booking.roomName}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <p className="text-sm">
                        {formatDate(booking.checkIn)} → {formatDate(booking.checkOut)}
                      </p>
                      <Badge variant="outline" className="mt-1">
                        {booking.status}
                      </Badge>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-green-600">
                        {formatCurrency(Number(booking.totalAmount))}
                      </p>
                    </div>
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`/bookings/${booking.id}`}>Ver</Link>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
