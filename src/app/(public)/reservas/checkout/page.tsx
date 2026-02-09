"use client"

import { useEffect, useState, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import Link from "next/link"
import { format, differenceInDays } from "date-fns"
import { ptBR } from "date-fns/locale"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import {
  ArrowLeft,
  Calendar,
  Users,
  Heart,
  Loader2,
  User,
  Mail,
  Phone,
  CreditCard,
  MessageSquare,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { toast } from "sonner"
import { getRoomDetails, createPublicBooking } from "../actions"

const formSchema = z.object({
  name: z.string().min(3, "Nome deve ter pelo menos 3 caracteres"),
  cpf: z.string().min(11, "CPF inválido").max(14, "CPF inválido"),
  email: z.string().email("E-mail inválido").optional().or(z.literal("")),
  phone: z.string().min(10, "Telefone inválido"),
  notes: z.string().optional(),
})

type FormValues = z.infer<typeof formSchema>

interface Room {
  id: string
  name: string
  basePrice: number
  maxGuests: number
}

function formatCpf(value: string): string {
  const numbers = value.replace(/\D/g, "")
  if (numbers.length <= 3) return numbers
  if (numbers.length <= 6) return `${numbers.slice(0, 3)}.${numbers.slice(3)}`
  if (numbers.length <= 9) return `${numbers.slice(0, 3)}.${numbers.slice(3, 6)}.${numbers.slice(6)}`
  return `${numbers.slice(0, 3)}.${numbers.slice(3, 6)}.${numbers.slice(6, 9)}-${numbers.slice(9, 11)}`
}

function formatPhone(value: string): string {
  const numbers = value.replace(/\D/g, "")
  if (numbers.length <= 2) return `(${numbers}`
  if (numbers.length <= 7) return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`
  return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7, 11)}`
}

function CheckoutContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [room, setRoom] = useState<Room | null>(null)

  const roomId = searchParams.get("roomId")
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

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      cpf: "",
      email: "",
      phone: "",
      notes: "",
    },
  })

  useEffect(() => {
    async function loadRoom() {
      if (!roomId) {
        router.push("/reservas")
        return
      }
      const result = await getRoomDetails(roomId)
      if (result.success && result.room) {
        setRoom(result.room as unknown as Room)
      }
      setLoading(false)
    }
    loadRoom()
  }, [roomId, router])

  const onSubmit = async (data: FormValues) => {
    if (!room || !checkInDate || !checkOutDate || !roomId) return

    setSubmitting(true)
    try {
      const result = await createPublicBooking({
        roomId,
        checkIn: checkInDate,
        checkOut: checkOutDate,
        adults: parseInt(adults),
        children: parseInt(children),
        guestName: data.name,
        guestCpf: data.cpf,
        guestEmail: data.email || undefined,
        guestPhone: data.phone,
        notes: data.notes,
      })

      if (result.success && result.booking) {
        router.push(`/reservas/confirmacao?booking=${result.booking.bookingNumber}`)
      } else {
        toast.error(result.error || "Erro ao criar reserva")
      }
    } catch {
      toast.error("Erro ao processar reserva")
    } finally {
      setSubmitting(false)
    }
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
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (!room) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md mx-auto">
          <CardContent className="py-8 text-center">
            <p className="mb-4">Quarto não encontrado</p>
            <Button variant="outline" asChild>
              <Link href="/reservas">Voltar</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      {/* Header */}
      <div className="bg-primary py-8 px-4 text-white">
        <div className="max-w-4xl mx-auto">
          <Link
            href={`/reservas/${roomId}?checkIn=${checkIn}&checkOut=${checkOut}&adults=${adults}&children=${children}`}
            className="inline-flex items-center gap-2 text-white/80 hover:text-white mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Link>
          <div className="flex items-center gap-2 mb-2">
            <Heart className="h-6 w-6" />
            <h1 className="text-2xl font-bold">Finalizar Reserva</h1>
          </div>
          <p className="text-white/80">Preencha seus dados para confirmar</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="grid md:grid-cols-3 gap-6">
          {/* Form */}
          <div className="md:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Dados do Hóspede</CardTitle>
                <CardDescription>
                  Preencha os dados do responsável pela reserva
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nome completo</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                              <Input
                                placeholder="Digite seu nome completo"
                                className="pl-9"
                                {...field}
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="cpf"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>CPF</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <CreditCard className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                              <Input
                                placeholder="000.000.000-00"
                                className="pl-9"
                                {...field}
                                onChange={(e) => {
                                  field.onChange(formatCpf(e.target.value))
                                }}
                                maxLength={14}
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>E-mail (opcional)</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                <Input
                                  type="email"
                                  placeholder="seu@email.com"
                                  className="pl-9"
                                  {...field}
                                />
                              </div>
                            </FormControl>
                            <FormDescription>
                              Para envio de confirmação
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Telefone / WhatsApp</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                <Input
                                  placeholder="(00) 00000-0000"
                                  className="pl-9"
                                  {...field}
                                  onChange={(e) => {
                                    field.onChange(formatPhone(e.target.value))
                                  }}
                                  maxLength={15}
                                />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="notes"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Observações (opcional)</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <MessageSquare className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                              <Textarea
                                placeholder="Algum pedido especial? Horário de chegada?"
                                className="pl-9 min-h-[100px]"
                                {...field}
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Separator />

                    <div className="bg-muted/50 rounded-lg p-4">
                      <h4 className="font-medium mb-2">Importante</h4>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        <li>• Esta é uma pré-reserva sujeita à confirmação</li>
                        <li>• Entraremos em contato para confirmar e informar dados para pagamento</li>
                        <li>• Check-in: 14h | Check-out: 12h</li>
                      </ul>
                    </div>

                    <Button
                      type="submit"
                      size="lg"
                      className="w-full"
                      disabled={submitting}
                    >
                      {submitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Processando...
                        </>
                      ) : (
                        "Confirmar Pré-Reserva"
                      )}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </div>

          {/* Summary */}
          <div>
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle className="text-lg">Resumo</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium">{room.name}</h4>
                  <p className="text-sm text-muted-foreground">
                    Até {room.maxGuests} hóspedes
                  </p>
                </div>

                <Separator />

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

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>{nights} noite{nights > 1 ? "s" : ""}</span>
                    <span>{formatCurrency(totalPrice)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Café da manhã</span>
                    <span className="text-green-600">Incluso</span>
                  </div>
                </div>

                <Separator />

                <div className="flex justify-between font-semibold">
                  <span>Total</span>
                  <span className="text-primary text-xl">{formatCurrency(totalPrice)}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    }>
      <CheckoutContent />
    </Suspense>
  )
}
