"use client"

import { useEffect, useState, use } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, CalendarCog, Calendar as CalendarIcon } from "lucide-react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { CurrencyInput, parseCurrencyToNumber } from "@/components/ui/currency-input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Skeleton } from "@/components/ui/skeleton"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"

import { getBooking, updateBooking } from "@/features/bookings"

interface Props {
  params: Promise<{ id: string }>
}

export default function EditBookingPage({ params }: Props) {
  const { id } = use(params)
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    checkIn: "",
    checkOut: "",
    adults: "1",
    children: "0",
    totalAmount: "",
    paidAmount: "",
    paymentDate: undefined as Date | undefined,
    notes: "",
  })

  useEffect(() => {
    async function loadBooking() {
      try {
        const result = await getBooking(id)
        if (result.success && result.booking) {
          setFormData({
            checkIn: new Date(result.booking.checkIn).toISOString().split("T")[0],
            checkOut: new Date(result.booking.checkOut).toISOString().split("T")[0],
            adults: String(result.booking.adults),
            children: String(result.booking.children),
            totalAmount: String(result.booking.totalAmount),
            paidAmount: String(result.booking.paidAmount || 0),
            paymentDate: undefined, // Default to undefined (or could be last payment date if we fetched transactions)
            notes: result.booking.notes || "",
          })
        }
      } catch (error) {
        console.error("Erro ao carregar reserva:", error)
      } finally {
        setLoading(false)
      }
    }
    loadBooking()
  }, [id])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    setSubmitting(true)
    try {
      const result = await updateBooking({
        id,
        checkIn: new Date(formData.checkIn),
        checkOut: new Date(formData.checkOut),
        adults: Number(formData.adults),
        children: Number(formData.children),
        totalAmount: parseCurrencyToNumber(formData.totalAmount),
        paidAmount: parseCurrencyToNumber(formData.paidAmount),
        paymentDate: formData.paymentDate,
        notes: formData.notes || undefined,
      })

      if (result.success) {
        router.push(`/bookings/${id}`)
      }
    } catch (error) {
      console.error("Erro ao atualizar reserva:", error)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex flex-1 flex-col px-4 md:px-6 space-y-6">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-[500px]" />
      </div>
    )
  }

  return (
    <div className="flex flex-1 flex-col px-4 md:px-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href={`/bookings/${id}`}>
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <CalendarCog className="h-6 w-6" />
            Editar Reserva
          </h1>
          <p className="text-muted-foreground">
            Atualize os dados da reserva
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Card className="max-w-2xl">
          <CardHeader>
            <CardTitle>Dados da Reserva</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="checkIn">Check-in</Label>
                <Input
                  id="checkIn"
                  type="date"
                  value={formData.checkIn}
                  onChange={(e) => setFormData({ ...formData, checkIn: e.target.value })}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="checkOut">Check-out</Label>
                <Input
                  id="checkOut"
                  type="date"
                  value={formData.checkOut}
                  onChange={(e) => setFormData({ ...formData, checkOut: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="adults">Adultos</Label>
                <Input
                  id="adults"
                  type="number"
                  min="1"
                  value={formData.adults}
                  onChange={(e) => setFormData({ ...formData, adults: e.target.value })}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="children">Crianças</Label>
                <Input
                  id="children"
                  type="number"
                  min="0"
                  value={formData.children}
                  onChange={(e) => setFormData({ ...formData, children: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="totalAmount">Valor Total</Label>
                <CurrencyInput
                  id="totalAmount"
                  value={formData.totalAmount}
                  onChange={(value) => setFormData({ ...formData, totalAmount: value })}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="paidAmount">Valor Pago</Label>
                <CurrencyInput
                  id="paidAmount"
                  value={formData.paidAmount}
                  onChange={(value) => setFormData({ ...formData, paidAmount: value })}
                />
              </div>
            </div>

            <div className="grid gap-2">
                <Label>Data do Pagamento (para novos pagamentos)</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full pl-3 text-left font-normal",
                        !formData.paymentDate && "text-muted-foreground"
                      )}
                    >
                      {formData.paymentDate ? (
                        format(formData.paymentDate, "PPP", { locale: ptBR })
                      ) : (
                        <span>Hoje (Automático)</span>
                      )}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={formData.paymentDate}
                      onSelect={(date) => setFormData({ ...formData, paymentDate: date })}
                      disabled={(date) => date > new Date()}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <p className="text-[0.8rem] text-muted-foreground">
                    Se você aumentar o valor pago, esta data será usada na transação.
                </p>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="notes">Observações</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              />
            </div>

            <div className="flex justify-end gap-4 pt-4">
              <Button type="button" variant="outline" asChild>
                <Link href={`/bookings/${id}`}>Cancelar</Link>
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? "Salvando..." : "Salvar Alterações"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  )
}
