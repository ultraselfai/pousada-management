"use client"

import { useEffect, useState, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import Link from "next/link"
import { format, differenceInDays } from "date-fns"
import { ptBR } from "date-fns/locale"
import {
  ArrowLeft,
  Bed,
  Users,
  Baby,
  Calendar,
  Heart,
  Loader2,
  AlertCircle,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { searchAvailableRooms } from "../actions"

interface Room {
  id: string
  name: string
  description: string | null
  basePrice: number
  maxGuests: number
  amenities: string[]
  nights: number
  totalPrice: number
}

function SearchResultsContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [rooms, setRooms] = useState<Room[]>([])
  const [error, setError] = useState<string | null>(null)

  const checkIn = searchParams.get("checkIn")
  const checkOut = searchParams.get("checkOut")
  const adults = searchParams.get("adults") || "2"
  const children = searchParams.get("children") || "0"

  const checkInDate = checkIn ? new Date(checkIn) : null
  const checkOutDate = checkOut ? new Date(checkOut) : null
  const nights = checkInDate && checkOutDate
    ? differenceInDays(checkOutDate, checkInDate)
    : 0

  useEffect(() => {
    async function loadRooms() {
      if (!checkInDate || !checkOutDate) {
        setError("Datas inválidas")
        setLoading(false)
        return
      }

      const result = await searchAvailableRooms(
        checkInDate,
        checkOutDate,
        parseInt(adults),
        parseInt(children)
      )

      if (result.success) {
        setRooms(result.rooms as Room[])
      } else {
        setError(result.error || "Erro ao buscar quartos")
      }
      setLoading(false)
    }

    loadRooms()
  }, [checkIn, checkOut, adults, children])

  const handleSelectRoom = (roomId: string) => {
    const params = new URLSearchParams({
      checkIn: checkIn || "",
      checkOut: checkOut || "",
      adults,
      children,
    })
    router.push(`/reservas/${roomId}?${params.toString()}`)
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Buscando quartos disponíveis...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      {/* Header */}
      <div className="bg-primary py-8 px-4 text-white">
        <div className="max-w-4xl mx-auto">
          <Link href="/reservas" className="inline-flex items-center gap-2 text-white/80 hover:text-white mb-4">
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Link>
          <div className="flex items-center gap-2 mb-2">
            <Heart className="h-6 w-6" />
            <h1 className="text-2xl font-bold">Pousada Dois Corações</h1>
          </div>
          <p className="text-white/80">Resultados da busca</p>
        </div>
      </div>

      {/* Search Summary */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        <Card className="mb-6">
          <CardContent className="py-4">
            <div className="flex flex-wrap gap-4 items-center justify-center text-sm">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>
                  {checkInDate && format(checkInDate, "dd MMM", { locale: ptBR })} -{" "}
                  {checkOutDate && format(checkOutDate, "dd MMM yyyy", { locale: ptBR })}
                </span>
                <Badge variant="secondary">{nights} noite{nights > 1 ? "s" : ""}</Badge>
              </div>
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span>{adults} adulto{parseInt(adults) > 1 ? "s" : ""}</span>
              </div>
              {parseInt(children) > 0 && (
                <div className="flex items-center gap-2">
                  <Baby className="h-4 w-4 text-muted-foreground" />
                  <span>{children} criança{parseInt(children) > 1 ? "s" : ""}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Error */}
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Erro</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Results */}
        {rooms.length === 0 && !error ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Bed className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">Nenhum quarto disponível</h3>
              <p className="text-muted-foreground mb-4">
                Não encontramos quartos disponíveis para as datas selecionadas.
              </p>
              <Button variant="outline" asChild>
                <Link href="/reservas">Alterar datas</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            <p className="text-muted-foreground">
              {rooms.length} quarto{rooms.length > 1 ? "s" : ""} disponíve{rooms.length > 1 ? "is" : "l"}
            </p>

            {rooms.map((room) => (
              <Card key={room.id} className="overflow-hidden">
                <div className="md:flex">
                  {/* Room Image Placeholder */}
                  <div className="md:w-1/3 bg-muted h-48 md:h-auto flex items-center justify-center">
                    <Bed className="h-16 w-16 text-muted-foreground/50" />
                  </div>

                  <div className="flex-1">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle>{room.name}</CardTitle>
                          <CardDescription className="mt-1">
                            {room.description || "Suíte confortável com café da manhã incluso"}
                          </CardDescription>
                        </div>
                        <Badge variant="outline" className="ml-4">
                          <Users className="h-3 w-3 mr-1" />
                          Até {room.maxGuests}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2 mb-4">
                        {(room.amenities?.length > 0 ? room.amenities : ["Wi-Fi", "Ar-condicionado", "TV", "Frigobar"]).map((amenity) => (
                          <Badge key={amenity} variant="secondary" className="text-xs">
                            {amenity}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                    <CardFooter className="flex items-center justify-between border-t pt-4">
                      <div>
                        <p className="text-sm text-muted-foreground">
                          {nights} noite{nights > 1 ? "s" : ""}
                        </p>
                        <p className="text-2xl font-bold text-primary">
                          {formatCurrency(room.totalPrice)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatCurrency(Number(room.basePrice))}/noite
                        </p>
                      </div>
                      <Button onClick={() => handleSelectRoom(room.id)}>
                        Selecionar
                      </Button>
                    </CardFooter>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default function SearchResultsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    }>
      <SearchResultsContent />
    </Suspense>
  )
}
