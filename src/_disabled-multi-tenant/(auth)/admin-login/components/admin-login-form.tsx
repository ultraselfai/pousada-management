"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import Image from "next/image"
import { authClient } from "@/lib/auth-client"
import { Loader2, Eye, EyeOff } from "lucide-react"

export function AdminLoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    const formData = new FormData(e.currentTarget)
    const email = formData.get("email") as string
    const password = formData.get("password") as string
    
    // Obtém callbackUrl da URL (definido pelo proxy ao redirecionar)
    const callbackUrl = searchParams.get('callbackUrl')

    try {
      const result = await authClient.signIn.email({
        email,
        password,
      })

      if (result.error) {
        setError(result.error.message || "Credenciais inválidas")
        return
      }

      const session = await authClient.getSession()
      
      if (!session?.data?.user) {
        setError("Erro ao verificar sessão")
        return
      }

      const user = session.data.user as { role?: string }
      if (user.role !== "admin" && user.role !== "owner") {
        await authClient.signOut()
        setError("Acesso negado. Esta área é restrita a administradores.")
        return
      }

      // Usa callbackUrl se disponível, senão vai para /dashboard
      router.push(callbackUrl || "/dashboard")
      router.refresh()
    } catch (err) {
      console.error("Erro no login:", err)
      setError("Erro ao fazer login. Tente novamente.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="overflow-hidden p-0">
        <CardContent className="grid p-0 md:grid-cols-2">
          <form className="p-6 md:p-8" onSubmit={handleSubmit}>
            <div className="flex flex-col gap-6">
              <div className="flex justify-center mb-2">
                <Link href="/">
                  <Image
                    src="/admin/favicon-blue.png"
                    alt="Decode"
                    width={40}
                    height={40}
                    className="rounded-md"
                  />
                </Link>
              </div>
              <div className="flex flex-col items-center text-center gap-3">
                <Image
                  src="/admin/decode-console.png"
                  alt="Decode Console"
                  width={200}
                  height={40}
                  className="h-auto"
                />
                <p className="text-muted-foreground text-balance">
                  Entre com suas credenciais de administrador
                </p>
              </div>

              {error && (
                <div className="bg-destructive/15 text-destructive text-sm p-3 rounded-md text-center">
                  {error}
                </div>
              )}

              <div className="grid gap-3">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="admin@decode.ink"
                  required
                  disabled={isLoading}
                  autoComplete="email"
                />
              </div>
              <div className="grid gap-3">
                <Label htmlFor="password">Senha</Label>
                <div className="relative">
                  <Input 
                    id="password" 
                    name="password"
                    type={showPassword ? "text" : "password"}
                    required 
                    disabled={isLoading}
                    autoComplete="current-password"
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    tabIndex={-1}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>
              <Button type="submit" className="w-full cursor-pointer" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Entrando...
                  </>
                ) : (
                  "Entrar"
                )}
              </Button>
            </div>
          </form>
          <div className="bg-muted relative hidden md:block">
            <Image
              src="/admin/background-login.png"
              alt="Decode Console Admin"
              fill
              className="object-cover"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
