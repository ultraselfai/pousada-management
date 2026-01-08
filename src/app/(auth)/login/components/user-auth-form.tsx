"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Image from "next/image"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { authClient } from "@/lib/auth-client"
import { Loader2, Eye, EyeOff } from "lucide-react"

type AuthMode = "login" | "register"

export function UserAuthForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [mode, setMode] = useState<AuthMode>("login")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  async function handleLoginSubmit(e: React.FormEvent<HTMLFormElement>) {
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
        setError(result.error.message || "Email ou senha inválidos")
        return
      }

      // Se há um callbackUrl, usa ele diretamente
      if (callbackUrl) {
        router.push(callbackUrl)
        router.refresh()
        return
      }

      // Obtém sessão para verificar role do usuário
      const session = await authClient.getSession()
      const userRole = session?.data?.user?.role

      // PRIMEIRO verifica se pertence a alguma organização
      // Usuários de organização sempre vão para o painel do tenant
      try {
        const orgsResult = await authClient.organization.list()
        if (orgsResult.data && orgsResult.data.length > 0) {
          // Tem organização - vai para o dashboard dela (prioridade sobre admin)
          const org = orgsResult.data[0]
          router.push(`/${org.slug}/dashboard`)
          router.refresh()
          return
        }
      } catch (orgError) {
        // Falha ao listar organizações - continua com fluxo normal
        console.warn("Falha ao listar organizações:", orgError)
      }

      // Sem organização - verifica se é admin do sistema
      if (userRole === "admin" || userRole === "owner") {
        router.push("/dashboard")
        router.refresh()
        return
      }

      // Usuário comum sem organização - vai para onboarding
      router.push("/onboarding")
      router.refresh()
    } catch (err) {
      console.error("Erro no login:", err)
      setError("Erro ao fazer login. Tente novamente.")
    } finally {
      setIsLoading(false)
    }
  }

  async function handleRegisterSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    setSuccess(null)

    const formData = new FormData(e.currentTarget)
    const firstName = formData.get("firstName") as string
    const lastName = formData.get("lastName") as string
    const email = formData.get("email") as string
    const password = formData.get("password") as string
    const confirmPassword = formData.get("confirmPassword") as string

    if (password !== confirmPassword) {
      setError("As senhas não coincidem")
      setIsLoading(false)
      return
    }

    if (password.length < 8) {
      setError("A senha deve ter pelo menos 8 caracteres")
      setIsLoading(false)
      return
    }

    try {
      const result = await authClient.signUp.email({
        email,
        password,
        name: `${firstName} ${lastName}`.trim(),
      })

      if (result.error) {
        setError(result.error.message || "Erro ao criar conta")
        return
      }

      setSuccess("Conta criada com sucesso! Redirecionando...")
      
      // Novo usuário - vai para onboarding para criar sua organização
      setTimeout(() => {
        router.push("/onboarding")
        router.refresh()
      }, 1500)
    } catch {
      setError("Erro ao criar conta. Tente novamente.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      {/* Toggle Entrar/Registrar */}
      <div className="flex justify-center">
        <div className="inline-flex rounded-lg border border-border p-1 bg-muted/50">
          <button
            type="button"
            onClick={() => {
              setMode("login")
              setError(null)
              setSuccess(null)
            }}
            className={cn(
              "px-4 py-2 text-sm font-medium rounded-md transition-all",
              mode === "login"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            Entrar
          </button>
          <button
            type="button"
            onClick={() => {
              setMode("register")
              setError(null)
              setSuccess(null)
            }}
            className={cn(
              "px-4 py-2 text-sm font-medium rounded-md transition-all",
              mode === "register"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            Registrar
          </button>
        </div>
      </div>

      {/* Mensagens de erro/sucesso */}
      {error && (
        <div className="bg-destructive/15 text-destructive text-sm p-3 rounded-md text-center">
          {error}
        </div>
      )}
      {success && (
        <div className="bg-green-500/15 text-green-600 dark:text-green-400 text-sm p-3 rounded-md text-center">
          {success}
        </div>
      )}

      {/* Formulário de Login */}
      {mode === "login" && (
        <form onSubmit={handleLoginSubmit} className="flex flex-col gap-6">
          <div className="flex flex-col items-center gap-2 text-center">
            <h1 className="text-2xl font-bold">Entre na sua conta</h1>
            <p className="text-muted-foreground text-sm text-balance">
              Digite seu email e senha para acessar
            </p>
          </div>
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
            <div className="grid gap-3">
              <div className="flex items-center">
                <Label htmlFor="password">Senha</Label>
                <a
                  href="/forgot-password"
                  className="ml-auto text-sm underline-offset-4 hover:underline"
                >
                  Esqueceu a senha?
                </a>
              </div>
              <div className="relative">
                <Input 
                  id="password" 
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required 
                  disabled={isLoading}
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Entrando...
                </>
              ) : (
                "Entrar"
              )}
            </Button>
            <div className="after:border-border relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t">
              <span className="bg-background text-muted-foreground relative z-10 px-2">
                Ou continue com
              </span>
            </div>
            <Button variant="outline" type="button" className="w-full" disabled={isLoading}>
              <img src="/google.png" alt="Google" className="h-4 w-4" />
              Entrar com Google
            </Button>
          </div>
        </form>
      )}

      {/* Formulário de Registro */}
      {mode === "register" && (
        <form onSubmit={handleRegisterSubmit} className="flex flex-col gap-6">
          <div className="flex flex-col items-center gap-2 text-center">
            <h1 className="text-2xl font-bold">Crie sua conta</h1>
            <p className="text-muted-foreground text-sm text-balance">
              Preencha as informações para criar uma nova conta
            </p>
          </div>
          <div className="grid gap-6">
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-3">
                <Label htmlFor="firstName">Nome</Label>
                <Input 
                  id="firstName" 
                  name="firstName"
                  placeholder="João" 
                  required 
                  disabled={isLoading}
                />
              </div>
              <div className="grid gap-3">
                <Label htmlFor="lastName">Sobrenome</Label>
                <Input 
                  id="lastName" 
                  name="lastName"
                  placeholder="Silva" 
                  required 
                  disabled={isLoading}
                />
              </div>
            </div>
            <div className="grid gap-3">
              <Label htmlFor="register-email">Email</Label>
              <Input 
                id="register-email" 
                name="email"
                type="email" 
                placeholder="seu@email.com" 
                required 
                disabled={isLoading}
              />
            </div>
            <div className="grid gap-3">
              <Label htmlFor="register-password">Senha</Label>
              <div className="relative">
                <Input 
                  id="register-password" 
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required 
                  disabled={isLoading}
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <div className="grid gap-3">
              <Label htmlFor="confirmPassword">Confirmar Senha</Label>
              <div className="relative">
                <Input 
                  id="confirmPassword" 
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  required 
                  disabled={isLoading}
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  tabIndex={-1}
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox id="terms" name="terms" required disabled={isLoading} />
              <Label htmlFor="terms" className="text-xs leading-none">
                Concordo com os{" "}
                <a href="#" className="underline underline-offset-4 hover:text-primary">
                  Termos
                </a>{" "}
                e{" "}
                <a href="#" className="underline underline-offset-4 hover:text-primary">
                  Política de Privacidade
                </a>
              </Label>
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Criando conta...
                </>
              ) : (
                "Criar Conta"
              )}
            </Button>
            <div className="after:border-border relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t">
              <span className="bg-background text-muted-foreground relative z-10 px-2">
                Ou continue com
              </span>
            </div>
            <Button variant="outline" type="button" className="w-full" disabled={isLoading}>
              <Image src="/google.png" alt="Google" width={20} height={20} className="mr-2" />
              Registrar com Google
            </Button>
          </div>
        </form>
      )}
    </div>
  )
}
