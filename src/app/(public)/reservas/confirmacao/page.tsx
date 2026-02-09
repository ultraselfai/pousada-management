"use client"

import { Suspense } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import {
  CheckCircle2,
  Heart,
  Phone,
  Mail,
  Home,
  Loader2,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

function ConfirmacaoContent() {
  const searchParams = useSearchParams()
  const bookingNumber = searchParams.get("booking")

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      {/* Header */}
      <div className="bg-primary py-8 px-4 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <div className="flex justify-center mb-2">
            <Heart className="h-8 w-8" />
          </div>
          <h1 className="text-2xl font-bold">Pousada Dois Corações</h1>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-12">
        <Card className="text-center">
          <CardHeader>
            <div className="flex justify-center mb-4">
              <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle2 className="h-10 w-10 text-green-600" />
              </div>
            </div>
            <CardTitle className="text-2xl">Pré-Reserva Realizada!</CardTitle>
            <CardDescription className="text-base">
              Sua solicitação de reserva foi recebida com sucesso
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {bookingNumber && (
              <div className="bg-muted/50 rounded-lg py-4 px-6 inline-block">
                <p className="text-sm text-muted-foreground mb-1">
                  Número da Reserva
                </p>
                <p className="text-2xl font-mono font-bold text-primary">
                  {bookingNumber}
                </p>
              </div>
            )}

            <div className="text-left bg-primary/5 rounded-lg p-6">
              <h3 className="font-semibold mb-4">Próximos Passos</h3>
              <ol className="space-y-3 text-sm">
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center">
                    1
                  </span>
                  <span>
                    Nossa equipe entrará em contato via WhatsApp em até 2 horas
                    para confirmar sua reserva
                  </span>
                </li>
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center">
                    2
                  </span>
                  <span>
                    Você receberá os dados bancários para pagamento do sinal
                    (50% do valor)
                  </span>
                </li>
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center">
                    3
                  </span>
                  <span>
                    Após confirmação do pagamento, sua reserva será garantida
                  </span>
                </li>
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center">
                    4
                  </span>
                  <span>
                    O restante (50%) pode ser pago no check-in
                  </span>
                </li>
              </ol>
            </div>

            <div className="grid md:grid-cols-2 gap-4 text-left">
              <div className="flex items-start gap-3 p-4 rounded-lg border">
                <Phone className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <p className="font-medium">WhatsApp</p>
                  <p className="text-sm text-muted-foreground">
                    (17) 99999-9999
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-4 rounded-lg border">
                <Mail className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <p className="font-medium">E-mail</p>
                  <p className="text-sm text-muted-foreground">
                    contato@pousadadoiscoracoes.com
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-4">
              <Button asChild>
                <Link href="/reservas">
                  <Home className="mr-2 h-4 w-4" />
                  Voltar ao Início
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default function ConfirmacaoPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    }>
      <ConfirmacaoContent />
    </Suspense>
  )
}
