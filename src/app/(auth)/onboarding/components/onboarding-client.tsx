"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { Logo } from "@/components/logo"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { authClient } from "@/lib/auth-client"
import { Loader2, Sparkles, AlertCircle, Check } from "lucide-react"
import { cn } from "@/lib/utils"

interface OnboardingClientProps {
  userName: string
}

/**
 * Sanitiza o nome da organização para criar um slug válido
 * - Remove espaços
 * - Converte para minúsculas
 * - Remove caracteres especiais (mantém apenas letras e números)
 * - Remove acentos
 */
function sanitizeSlug(name: string): string {
  return name
    .normalize("NFD") // Normaliza para decompor acentos
    .replace(/[\u0300-\u036f]/g, "") // Remove diacríticos (acentos)
    .toLowerCase() // Converte para minúsculas
    .replace(/[^a-z0-9]/g, "") // Remove tudo exceto letras e números
    .substring(0, 50) // Limita a 50 caracteres
}

type OnboardingStep = "loading" | "welcome"

export function OnboardingClient({ userName }: OnboardingClientProps) {
  const router = useRouter()
  const [step, setStep] = useState<OnboardingStep>("loading")
  const [orgName, setOrgName] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isSlugAvailable, setIsSlugAvailable] = useState<boolean | null>(null)
  const [isCheckingSlug, setIsCheckingSlug] = useState(false)

  const slug = sanitizeSlug(orgName)

  // Loading screen por 2.5 segundos
  useEffect(() => {
    const timer = setTimeout(() => {
      setStep("welcome")
    }, 2500)

    return () => clearTimeout(timer)
  }, [])

  // Debounce para verificar disponibilidade do slug
  const checkSlugAvailability = useCallback(async (slugToCheck: string) => {
    if (!slugToCheck || slugToCheck.length < 2) {
      setIsSlugAvailable(null)
      return
    }

    setIsCheckingSlug(true)
    try {
      const result = await authClient.organization.checkSlug({
        slug: slugToCheck,
      })
      // Se não retornar erro, o slug está disponível
      // O Better-Auth retorna { data: { status: true } } se disponível
      setIsSlugAvailable(!result.error && !!result.data)
    } catch {
      setIsSlugAvailable(null)
    } finally {
      setIsCheckingSlug(false)
    }
  }, [])

  // Effect para verificar slug com debounce
  useEffect(() => {
    if (!slug || slug.length < 2) {
      setIsSlugAvailable(null)
      return
    }

    const timer = setTimeout(() => {
      checkSlugAvailability(slug)
    }, 500) // 500ms debounce

    return () => clearTimeout(timer)
  }, [slug, checkSlugAvailability])

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    
    if (!orgName.trim()) {
      setError("Por favor, digite um nome para sua organização")
      return
    }

    if (slug.length < 2) {
      setError("O nome precisa gerar um identificador de pelo menos 2 caracteres")
      return
    }

    if (isSlugAvailable === false) {
      setError("Este nome já está em uso. Por favor, escolha outro.")
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      // Cria a organização via Better-Auth
      const result = await authClient.organization.create({
        name: orgName.trim(),
        slug: slug,
      })

      if (result.error) {
        if (result.error.message?.includes("already exists") || result.error.message?.includes("slug")) {
          setError("Este nome já está em uso. Por favor, escolha outro.")
        } else {
          setError(result.error.message || "Erro ao criar organização")
        }
        return
      }

      // Sucesso! Redireciona para o dashboard da organização
      router.push(`/${slug}/dashboard`)
      router.refresh()
    } catch {
      setError("Erro ao criar organização. Tente novamente.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-muted/30">
      <AnimatePresence mode="wait">
        {step === "loading" && (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col items-center justify-center gap-6"
          >
            {/* Logo com animação de pulse */}
            <motion.div
              animate={{ 
                scale: [1, 1.1, 1],
              }}
              transition={{ 
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="bg-primary text-primary-foreground flex size-20 items-center justify-center rounded-2xl shadow-lg"
            >
              <Logo size={48} />
            </motion.div>

            {/* Texto de loading */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex flex-col items-center gap-3"
            >
              <div className="flex items-center gap-2 text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-lg">Preparando sua experiência...</span>
              </div>
              
              {/* Barra de progresso animada */}
              <div className="w-48 h-1 bg-muted rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-primary rounded-full"
                  initial={{ width: "0%" }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 2.5, ease: "easeInOut" }}
                />
              </div>
            </motion.div>
          </motion.div>
        )}

        {step === "welcome" && (
          <motion.div
            key="welcome"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="w-full max-w-md mx-4"
          >
            <div className="bg-card rounded-2xl shadow-xl border p-8">
              {/* Header com ícone */}
              <div className="flex flex-col items-center mb-8">
                <div className="bg-primary/10 p-4 rounded-2xl mb-4">
                  <Sparkles className="h-8 w-8 text-primary" />
                </div>
                <h1 className="text-2xl font-bold text-center">
                  Seja bem-vindo(a) ao Decode Manager
                </h1>
                <p className="text-muted-foreground text-center mt-2">
                  Olá, {userName}! Para iniciar, defina um nome para sua organização.
                </p>
              </div>

              {/* Formulário */}
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="orgName">Nome da Organização</Label>
                  <Input
                    id="orgName"
                    placeholder="Ex: Decode Ink"
                    value={orgName}
                    onChange={(e) => {
                      setOrgName(e.target.value)
                      setError(null)
                    }}
                    disabled={isSubmitting}
                    className="text-lg h-12"
                    autoFocus
                  />
                  
                  {/* Preview do slug e status */}
                  {orgName.trim() && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      className="pt-2"
                    >
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">
                          Seu link será:{" "}
                          <code className="bg-muted px-1.5 py-0.5 rounded text-foreground">
                            decode.app/{slug || "..."}
                          </code>
                        </span>
                        
                        {/* Status de disponibilidade */}
                        <div className="flex items-center gap-1">
                          {isCheckingSlug && (
                            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                          )}
                          {!isCheckingSlug && isSlugAvailable === true && (
                            <span className="flex items-center gap-1 text-green-600 dark:text-green-400">
                              <Check className="h-4 w-4" />
                              Disponível
                            </span>
                          )}
                          {!isCheckingSlug && isSlugAvailable === false && (
                            <span className="flex items-center gap-1 text-destructive">
                              <AlertCircle className="h-4 w-4" />
                              Indisponível
                            </span>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </div>

                {/* Erro */}
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-2 text-destructive text-sm bg-destructive/10 p-3 rounded-lg"
                  >
                    <AlertCircle className="h-4 w-4 flex-shrink-0" />
                    {error}
                  </motion.div>
                )}

                {/* Botão de submit */}
                <Button
                  type="submit"
                  className="w-full h-12 text-base"
                  disabled={isSubmitting || !orgName.trim() || isSlugAvailable === false}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Criando...
                    </>
                  ) : (
                    "Criar Organização"
                  )}
                </Button>
              </form>

              {/* Dica */}
              <p className="text-xs text-muted-foreground text-center mt-6">
                Você poderá alterar o nome da sua organização depois nas configurações.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
