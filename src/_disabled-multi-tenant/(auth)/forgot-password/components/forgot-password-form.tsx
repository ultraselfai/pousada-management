"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, ArrowLeft, CheckCircle } from "lucide-react"
import Link from "next/link"

export function ForgotPasswordForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [email, setEmail] = useState("")

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    const formData = new FormData(e.currentTarget)
    const emailValue = formData.get("email") as string
    setEmail(emailValue)

    try {
      // TODO: Implementar envio de email de recuperação
      // Por enquanto, simula sucesso após 1.5s
      await new Promise((resolve) => setTimeout(resolve, 1500))
      
      setSuccess(true)
    } catch {
      setError("Erro ao enviar email de recuperação. Tente novamente.")
    } finally {
      setIsLoading(false)
    }
  }

  if (success) {
    return (
      <div className={cn("flex flex-col gap-6", className)} {...props}>
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="flex size-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
            <CheckCircle className="size-8 text-green-600 dark:text-green-400" />
          </div>
          <h1 className="text-2xl font-bold">Email enviado!</h1>
          <p className="text-muted-foreground text-sm text-balance">
            Enviamos um link de recuperação para <strong>{email}</strong>.
            Verifique sua caixa de entrada e spam.
          </p>
        </div>
        <div className="grid gap-4">
          <Button asChild variant="outline" className="w-full">
            <Link href="/login">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar para o login
            </Link>
          </Button>
          <button
            type="button"
            onClick={() => setSuccess(false)}
            className="text-sm text-muted-foreground hover:text-foreground underline underline-offset-4"
          >
            Não recebeu? Tentar novamente
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        <div className="flex flex-col items-center gap-2 text-center">
          <h1 className="text-2xl font-bold">Esqueceu sua senha?</h1>
          <p className="text-muted-foreground text-sm text-balance">
            Digite seu email e enviaremos um link para redefinir sua senha
          </p>
        </div>

        {error && (
          <div className="bg-destructive/15 text-destructive text-sm p-3 rounded-md text-center">
            {error}
          </div>
        )}

        <div className="grid gap-6">
          <div className="grid gap-3">
            <Label htmlFor="email">Email</Label>
            <Input 
              id="email" 
              name="email"
              type="email" 
              placeholder="seu@email.com" 
              required 
              disabled={isLoading}
            />
          </div>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Enviando...
              </>
            ) : (
              "Enviar Link de Recuperação"
            )}
          </Button>
        </div>
      </form>
      <div className="text-center text-sm">
        Lembrou sua senha?{" "}
        <Link href="/login" className="underline underline-offset-4">
          Voltar para o login
        </Link>
      </div>
    </div>
  )
}
