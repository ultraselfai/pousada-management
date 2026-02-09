"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { format, addDays } from "date-fns"
import { ptBR } from "date-fns/locale"
import {
  CalendarIcon,
  Search,
  Users,
  Baby,
  Heart,
  MapPin,
  Phone,
  Mail,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"

export default function ReservasPage() {
  const router = useRouter()
  const [checkIn, setCheckIn] = useState<Date | undefined>(addDays(new Date(), 1))
  const [checkOut, setCheckOut] = useState<Date | undefined>(addDays(new Date(), 2))
  const [adults, setAdults] = useState("2")
  const [children, setChildren] = useState("0")

  const handleSearch = () => {
    if (!checkIn || !checkOut) return
    
    const params = new URLSearchParams({
      checkIn: checkIn.toISOString(),
      checkOut: checkOut.toISOString(),
      adults,
      children,
    })
    
    router.push(`/reservas/busca?${params.toString()}`)
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-primary/90 to-primary py-20 px-4">
        <div className="absolute inset-0 bg-black/20" />
        <div className="relative max-w-4xl mx-auto text-center text-white">
          <div className="flex justify-center mb-4">
            <Heart className="h-12 w-12" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Pousada Dois Corações
          </h1>
          <p className="text-xl mb-2 flex items-center justify-center gap-2">
            <MapPin className="h-5 w-5" />
            Olímpia, SP
          </p>
          <p className="text-lg opacity-90">
            O melhor da hospedagem com conforto e carinho
          </p>
        </div>
      </div>

      {/* Search Form */}
      <div className="max-w-4xl mx-auto px-4 -mt-8 relative z-10">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Faça sua Reserva</CardTitle>
            <CardDescription>
              Selecione as datas e quantidade de hóspedes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-5">
              {/* Check-in */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Check-in</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !checkIn && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {checkIn ? format(checkIn, "dd/MM/yyyy") : "Selecione"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={checkIn}
                      onSelect={setCheckIn}
                      disabled={(date) => date < new Date()}
                      locale={ptBR}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {/* Check-out */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Check-out</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !checkOut && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {checkOut ? format(checkOut, "dd/MM/yyyy") : "Selecione"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={checkOut}
                      onSelect={setCheckOut}
                      disabled={(date) => date <= (checkIn || new Date())}
                      locale={ptBR}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {/* Adultos */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Adultos</label>
                <Select value={adults} onValueChange={setAdults}>
                  <SelectTrigger>
                    <Users className="mr-2 h-4 w-4" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4, 5, 6].map((n) => (
                      <SelectItem key={n} value={String(n)}>
                        {n} adulto{n > 1 ? "s" : ""}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Crianças */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Crianças</label>
                <Select value={children} onValueChange={setChildren}>
                  <SelectTrigger>
                    <Baby className="mr-2 h-4 w-4" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[0, 1, 2, 3, 4].map((n) => (
                      <SelectItem key={n} value={String(n)}>
                        {n} criança{n !== 1 ? "s" : ""}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Buscar */}
              <div className="flex items-end">
                <Button
                  className="w-full"
                  size="lg"
                  onClick={handleSearch}
                  disabled={!checkIn || !checkOut}
                >
                  <Search className="mr-2 h-4 w-4" />
                  Buscar
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Info Section */}
      <div className="max-w-4xl mx-auto px-4 py-16">
        <div className="grid gap-8 md:grid-cols-3">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                  <MapPin className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">Localização</h3>
                <p className="text-sm text-muted-foreground">
                  Próximo aos principais parques aquáticos de Olímpia
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                  <Heart className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">Conforto</h3>
                <p className="text-sm text-muted-foreground">
                  Suítes aconchegantes com café da manhã incluso
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                  <Phone className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">Contato</h3>
                <p className="text-sm text-muted-foreground">
                  Atendimento via WhatsApp para tirar dúvidas
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
