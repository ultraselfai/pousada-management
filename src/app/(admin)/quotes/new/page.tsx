"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { FileText, ArrowLeft, Calendar, User, Phone, Mail, BedDouble } from "lucide-react"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { CurrencyInput, parseCurrencyToNumber } from "@/components/ui/currency-input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import Link from "next/link"

import { createQuote } from "@/features/quotes"

export default function NewQuotePage() {
  const router = useRouter()
  const [submitting, setSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    guestName: "",
    guestPhone: "",
    guestEmail: "",
    roomName: "",
    checkIn: "",
    checkOut: "",
    basePrice: "",
    discount: "0",
    discountType: "PERCENTAGE" as "PERCENTAGE" | "FIXED",
    adults: 1,
    children: 0,
    notes: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.guestName || !formData.roomName || !formData.checkIn || !formData.checkOut || !formData.basePrice) {
      return
    }

    setSubmitting(true)
    try {
      const result = await createQuote({
        guestName: formData.guestName,
        guestPhone: formData.guestPhone || undefined,
        guestEmail: formData.guestEmail || undefined,
        roomName: formData.roomName,
        checkIn: new Date(formData.checkIn),
        checkOut: new Date(formData.checkOut),
        basePrice: parseCurrencyToNumber(formData.basePrice),
        discount: formData.discountType === "FIXED" ? parseCurrencyToNumber(formData.discount) : (Number(formData.discount) || 0),
        discountType: formData.discountType,
        adults: Number(formData.adults),
        children: Number(formData.children),
        notes: formData.notes || undefined,
        validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 dias
      })

      if (result.success) {
        router.push("/quotes")
      }
    } catch (error) {
      console.error("Erro ao criar orçamento:", error)
    } finally {
      setSubmitting(false)
    }
  }

  // Calculate nights and total
  const nights = formData.checkIn && formData.checkOut
    ? Math.ceil((new Date(formData.checkOut).getTime() - new Date(formData.checkIn).getTime()) / (1000 * 60 * 60 * 24))
    : 0
  
  const baseTotal = Number(formData.basePrice) * nights
  const discount = formData.discountType === "PERCENTAGE"
    ? baseTotal * (Number(formData.discount) / 100)
    : Number(formData.discount)
  const finalTotal = baseTotal - discount

  return (
    <div className="flex flex-1 flex-col px-4 md:px-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/quotes">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <FileText className="h-6 w-6" />
            Novo Orçamento
          </h1>
          <p className="text-muted-foreground">
            Crie um novo orçamento para enviar ao cliente
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid gap-6 md:grid-cols-2">
          {/* Dados do Cliente */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Dados do Cliente
              </CardTitle>
              <CardDescription>Informações de contato do cliente</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="guestName">Nome Completo *</Label>
                <Input
                  id="guestName"
                  placeholder="Nome do cliente"
                  value={formData.guestName}
                  onChange={(e) => setFormData({ ...formData, guestName: e.target.value })}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="guestPhone">Telefone</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="guestPhone"
                    placeholder="(00) 00000-0000"
                    className="pl-10"
                    value={formData.guestPhone}
                    onChange={(e) => setFormData({ ...formData, guestPhone: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="guestEmail">E-mail</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="guestEmail"
                    type="email"
                    placeholder="cliente@email.com"
                    className="pl-10"
                    value={formData.guestEmail}
                    onChange={(e) => setFormData({ ...formData, guestEmail: e.target.value })}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Dados da Hospedagem */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BedDouble className="h-4 w-4" />
                Dados da Hospedagem
              </CardTitle>
              <CardDescription>Período e acomodação</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="roomName">Quarto/Suíte *</Label>
                <Input
                  id="roomName"
                  placeholder="Nome do quarto"
                  value={formData.roomName}
                  onChange={(e) => setFormData({ ...formData, roomName: e.target.value })}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="checkIn">Check-in *</Label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="checkIn"
                      type="date"
                      className="pl-10"
                      value={formData.checkIn}
                      onChange={(e) => setFormData({ ...formData, checkIn: e.target.value })}
                      required
                    />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="checkOut">Check-out *</Label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="checkOut"
                      type="date"
                      className="pl-10"
                      value={formData.checkOut}
                      onChange={(e) => setFormData({ ...formData, checkOut: e.target.value })}
                      required
                    />
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="adults">Adultos</Label>
                  <Input
                    id="adults"
                    type="number"
                    min={1}
                    value={formData.adults}
                    onChange={(e) => setFormData({ ...formData, adults: parseInt(e.target.value) || 0 })}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="children">Crianças</Label>
                  <Input
                    id="children"
                    type="number"
                    min={0}
                    value={formData.children}
                    onChange={(e) => setFormData({ ...formData, children: parseInt(e.target.value) || 0 })}
                    required
                  />
                </div>
              </div>
              {nights > 0 && (
                <p className="text-sm text-muted-foreground">
                  {nights} diária{nights !== 1 ? "s" : ""}
                </p>
              )}
            </CardContent>
          </Card>

          {/* Valores */}
          <Card>
            <CardHeader>
              <CardTitle>Valores</CardTitle>
              <CardDescription>Defina a diária e desconto</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="basePrice">Valor da Diária *</Label>
                <CurrencyInput
                  id="basePrice"
                  value={formData.basePrice}
                  onChange={(value) => setFormData({ ...formData, basePrice: value })}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="discount">Desconto</Label>
                  <Input
                    id="discount"
                    type="number"
                    placeholder="0"
                    value={formData.discount}
                    onChange={(e) => setFormData({ ...formData, discount: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="discountType">Tipo</Label>
                  <Select
                    value={formData.discountType}
                    onValueChange={(value) => setFormData({ ...formData, discountType: value as typeof formData.discountType })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PERCENTAGE">Percentual (%)</SelectItem>
                      <SelectItem value="FIXED">Valor Fixo (R$)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Resumo e Notas */}
          <Card>
            <CardHeader>
              <CardTitle>Resumo</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {nights > 0 && Number(formData.basePrice) > 0 ? (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal ({nights} diárias × R$ {formData.basePrice})</span>
                    <span>
                      {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(baseTotal)}
                    </span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-sm text-red-600">
                      <span>Desconto</span>
                      <span>
                        -{new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(discount)}
                      </span>
                    </div>
                  )}
                  <Separator />
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span className="text-green-600">
                      {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(finalTotal)}
                    </span>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Preencha as datas e valor da diária para ver o resumo
                </p>
              )}

              <div className="grid gap-2 pt-4">
                <Label htmlFor="notes">Observações</Label>
                <Textarea
                  id="notes"
                  placeholder="Observações adicionais..."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-4 mt-6">
          <Button type="button" variant="outline" asChild>
            <Link href="/quotes">Cancelar</Link>
          </Button>
          <Button type="submit" disabled={submitting}>
            {submitting ? "Criando..." : "Criar Orçamento"}
          </Button>
        </div>
      </form>
    </div>
  )
}
