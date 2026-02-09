"use client"

import { useEffect, useState, use, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import Link from "next/link"
import { format, differenceInDays } from "date-fns"
import { ptBR } from "date-fns/locale"
import {
  ArrowLeft,
  Bed,
  Users,
  Calendar,
  Heart,
  Loader2,
  Check,
  Wifi,
  Tv,
  Wind,
  UtensilsCrossed,
  Car,
  Waves,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { getRoomDetails } from "../actions"

interface Room {
  id: string
  name: string
  description: string | null
  basePrice: number
  maxGuests: number
  amenities: string[]
}

const amenityIcons: Record<string, any> = {
  "Wi-Fi": Wifi,
  "TV": Tv,
  "Ar-condicionado": Wind,
  "Café da manhã": UtensilsCrossed,
  "Estacionamento": Car,
  "Piscina": Waves,
}

function RoomDetailsContent({ roomId }: { roomId: string }) {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [room, setRoom] = useState<Room | null>(null)

  const checkIn = searchParams.get("checkIn")
  const checkOut = searchParams.get("checkOut")
  const adults = searchParams.get("adults") || "2"
  const children = searchParams.get("children") || "0"

  const checkInDate = checkIn ? new Date(checkIn) : null
  const checkOutDate = checkOut ? new Date(checkOut) : null
  const nights = checkInDate && checkOutDate
    ? differenceInDays(checkOutDate, checkInDate)
    : 0
  const totalPrice = room ? Number(room.basePrice) * nights : 0

  useEffect(() => {
    async function loadRoom() {
      const result = await getRoomDetails(roomId)
      if (result.success && result.room) {
        setRoom(result.room as unknown as Room)
      }
      setLoading(false)
    }
    loadRoom()
  }, [roomId])

  const handleReserve = () => {
    const params = new URLSearchParams({
      roomId,
      checkIn: checkIn || "",
      checkOut: checkOut || "",
      adults,
      children,
    })
    router.push(`/reservas/checkout?${params.toString()}`)
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value)
  }

  const defaultAmenities = [
    "Wi-Fi",
    "Ar-condicionado",
    "TV",
    "Frigobar",
    "Café da manhã",
    "Toalhas",
  ]

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (!room) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md mx-auto">
          <CardContent className="py-8 text-center">
            <Bed className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">Quarto não encontrado</h3>
            <Button variant="outline" asChild>
              <Link href="/reservas">Voltar</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const amenities = room.amenities?.length > 0 ? room.amenities : defaultAmenities

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      {/* Header */}
      <div className="bg-primary py-8 px-4 text-white">
        <div className="max-w-4xl mx-auto">
          <Link
            href={`/reservas/busca?checkIn=${checkIn}&checkOut=${checkOut}&adults=${adults}&children=${children}`}
            className="inline-flex items-center gap-2 text-white/80 hover:text-white mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar aos resultados
          </Link>
          <div className="flex items-center gap-2 mb-2">
            <Heart className="h-6 w-6" />
            <h1 className="text-2xl font-bold">Pousada Dois Corações</h1>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="grid md:grid-cols-3 gap-6">
          {/* Room Details */}
          <div className="md:col-span-2 space-y-6">
            {/* Image Placeholder */}
            <Card className="overflow-hidden">
              <div className="aspect-video bg-muted flex items-center justify-center">
                <Bed className="h-24 w-24 text-muted-foreground/30" />
              </div>
            </Card>

            {/* Info */}
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-2xl">{room.name}</CardTitle>
                    <CardDescription className="mt-2">
                      {room.description || "Suíte confortável e aconchegante, perfeita para suas férias em Olímpia."}
                    </CardDescription>
                  </div>
                  <Badge variant="outline" className="text-base">
                    <Users className="h-4 w-4 mr-1" />
                    Até {room.maxGuests} hóspedes
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <h4 className="font-semibold mb-4">O que está incluso</h4>
                <div className="grid grid-cols-2 gap-3">
                  {amenities.map((amenity) => {
                    const Icon = amenityIcons[amenity] || Check
                    return (
                      <div key={amenity} className="flex items-center gap-2">
                        <Icon className="h-4 w-4 text-primary" />
                        <span className="text-sm">{amenity}</span>
                      </div>
                    )
                  })}
                </div>

                <Separator className="my-6" />

                <h4 className="font-semibold mb-4">Regras da Pousada</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Check-in: 14h | Check-out: 12h</li>
                  <li>• Não é permitido fumar nos quartos</li>
                  <li>• Animais de estimação sob consulta</li>
                  <li>• Café da manhã servido das 7h às 10h</li>
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* Booking Summary */}
          <div className="space-y-4">
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle className="text-lg">Resumo da Reserva</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>
                    {checkInDate && format(checkInDate, "dd MMM", { locale: ptBR })} -{" "}
                    {checkOutDate && format(checkOutDate, "dd MMM", { locale: ptBR })}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-sm">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span>
                    {adults} adulto{parseInt(adults) > 1 ? "s" : ""}
                    {parseInt(children) > 0 && `, ${children} criança${parseInt(children) > 1 ? "s" : ""}`}
                  </span>
                </div>

                <Separator />

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>{formatCurrency(Number(room.basePrice))} x {nights} noite{nights > 1 ? "s" : ""}</span>
                    <span>{formatCurrency(totalPrice)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Taxas</span>
                    <span className="text-green-600">Incluso</span>
                  </div>
                </div>

                <Separator />

                <div className="flex justify-between font-semibold">
                  <span>Total</span>
                  <span className="text-primary text-xl">{formatCurrency(totalPrice)}</span>
                </div>

                <Button className="w-full" size="lg" onClick={handleReserve}>
                  Reservar Agora
                </Button>

                <p className="text-xs text-center text-muted-foreground">
                  Você não será cobrado agora
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function RoomDetailsPage({
  params,
}: {
  params: Promise<{ roomId: string }>
}) {
  const { roomId } = use(params)
  
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    }>
      <RoomDetailsContent roomId={roomId} />
    </Suspense>
  )
}
