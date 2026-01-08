"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { toast } from "sonner"
import { Loader2, Eye, EyeOff } from "lucide-react"
import { authClient, useSession } from "@/lib/auth-client"

// Schema para informações pessoais
const profileFormSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  email: z.string().email("Email inválido"),
})

// Schema para alteração de senha
const passwordFormSchema = z.object({
  currentPassword: z.string().min(1, "Senha atual é obrigatória"),
  newPassword: z.string()
    .min(8, "Nova senha deve ter no mínimo 8 caracteres")
    .regex(/[A-Z]/, "Nova senha deve conter pelo menos uma letra maiúscula")
    .regex(/[a-z]/, "Nova senha deve conter pelo menos uma letra minúscula")
    .regex(/[0-9]/, "Nova senha deve conter pelo menos um número")
    .regex(/[^A-Za-z0-9]/, "Nova senha deve conter pelo menos um caractere especial"),
  confirmPassword: z.string().min(1, "Confirmação de senha é obrigatória"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "As senhas não coincidem",
  path: ["confirmPassword"],
}).refine((data) => data.newPassword !== data.currentPassword, {
  message: "A nova senha deve ser diferente da senha atual",
  path: ["newPassword"],
})

type ProfileFormValues = z.infer<typeof profileFormSchema>
type PasswordFormValues = z.infer<typeof passwordFormSchema>

export default function AccountSettings() {
  const { data: session, isPending: isLoadingSession } = useSession()
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false)
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false)
  const [isDeletingAccount, setIsDeletingAccount] = useState(false)
  
  // Estados para visibilidade das senhas
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const profileForm = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      name: "",
      email: "",
    },
  })

  const passwordForm = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordFormSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  })

  // Preencher formulário com dados do usuário
  useEffect(() => {
    if (session?.user) {
      profileForm.reset({
        name: session.user.name || "",
        email: session.user.email || "",
      })
    }
  }, [session, profileForm])

  async function onProfileSubmit(data: ProfileFormValues) {
    setIsUpdatingProfile(true)
    try {
      const { error } = await authClient.updateUser({
        name: data.name,
      })

      if (error) {
        toast.error("Erro ao atualizar perfil", {
          description: error.message || "Tente novamente mais tarde.",
        })
        return
      }

      toast.success("Perfil atualizado com sucesso!")
    } catch {
      toast.error("Erro ao atualizar perfil", {
        description: "Ocorreu um erro inesperado. Tente novamente.",
      })
    } finally {
      setIsUpdatingProfile(false)
    }
  }

  async function onPasswordSubmit(data: PasswordFormValues) {
    setIsUpdatingPassword(true)
    try {
      const { error } = await authClient.changePassword({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
        revokeOtherSessions: true,
      })

      if (error) {
        toast.error("Erro ao alterar senha", {
          description: error.message || "Verifique sua senha atual e tente novamente.",
        })
        return
      }

      toast.success("Senha alterada com sucesso!", {
        description: "Todas as outras sessões foram encerradas.",
      })
      passwordForm.reset()
    } catch {
      toast.error("Erro ao alterar senha", {
        description: "Ocorreu um erro inesperado. Tente novamente.",
      })
    } finally {
      setIsUpdatingPassword(false)
    }
  }

  async function handleDeleteAccount() {
    if (!confirm("Tem certeza que deseja excluir sua conta? Esta ação é irreversível.")) {
      return
    }

    const password = prompt("Digite sua senha para confirmar:")
    if (!password) return

    setIsDeletingAccount(true)
    try {
      const { error } = await authClient.deleteUser({
        password,
      })

      if (error) {
        toast.error("Erro ao excluir conta", {
          description: error.message || "Verifique sua senha e tente novamente.",
        })
        return
      }

      toast.success("Conta excluída com sucesso")
      // Redirecionar para home após exclusão
      window.location.href = "/"
    } catch {
      toast.error("Erro ao excluir conta", {
        description: "Ocorreu um erro inesperado. Tente novamente.",
      })
    } finally {
      setIsDeletingAccount(false)
    }
  }

  if (isLoadingSession) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-6 px-4 lg:px-6">
      <div>
        <h1 className="text-3xl font-bold">Configurações da Conta</h1>
        <p className="text-muted-foreground">
          Gerencie suas configurações de conta e preferências.
        </p>
      </div>

      {/* Formulário de Perfil */}
      <Form {...profileForm}>
        <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Informações Pessoais</CardTitle>
              <CardDescription>
                Atualize suas informações pessoais que serão exibidas no seu perfil.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={profileForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome</FormLabel>
                    <FormControl>
                      <Input placeholder="Digite seu nome" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={profileForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input 
                        type="email" 
                        placeholder="Digite seu email" 
                        {...field} 
                        disabled 
                        className="bg-muted"
                      />
                    </FormControl>
                    <FormMessage />
                    <p className="text-xs text-muted-foreground">
                      O email não pode ser alterado.
                    </p>
                  </FormItem>
                )}
              />
              <div className="flex justify-end">
                <Button type="submit" disabled={isUpdatingProfile}>
                  {isUpdatingProfile && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Salvar Alterações
                </Button>
              </div>
            </CardContent>
          </Card>
        </form>
      </Form>

      {/* Formulário de Senha */}
      <Form {...passwordForm}>
        <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Alterar Senha</CardTitle>
              <CardDescription>
                Atualize sua senha para manter sua conta segura.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={passwordForm.control}
                name="currentPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Senha Atual</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input 
                          type={showCurrentPassword ? "text" : "password"} 
                          placeholder="Digite sua senha atual" 
                          {...field} 
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        >
                          {showCurrentPassword ? (
                            <EyeOff className="h-4 w-4 text-muted-foreground" />
                          ) : (
                            <Eye className="h-4 w-4 text-muted-foreground" />
                          )}
                          <span className="sr-only">
                            {showCurrentPassword ? "Ocultar senha" : "Mostrar senha"}
                          </span>
                        </Button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={passwordForm.control}
                name="newPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nova Senha</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input 
                          type={showNewPassword ? "text" : "password"} 
                          placeholder="Digite a nova senha" 
                          {...field} 
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                        >
                          {showNewPassword ? (
                            <EyeOff className="h-4 w-4 text-muted-foreground" />
                          ) : (
                            <Eye className="h-4 w-4 text-muted-foreground" />
                          )}
                          <span className="sr-only">
                            {showNewPassword ? "Ocultar senha" : "Mostrar senha"}
                          </span>
                        </Button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={passwordForm.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirmar Nova Senha</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input 
                          type={showConfirmPassword ? "text" : "password"} 
                          placeholder="Confirme a nova senha" 
                          {...field} 
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        >
                          {showConfirmPassword ? (
                            <EyeOff className="h-4 w-4 text-muted-foreground" />
                          ) : (
                            <Eye className="h-4 w-4 text-muted-foreground" />
                          )}
                          <span className="sr-only">
                            {showConfirmPassword ? "Ocultar senha" : "Mostrar senha"}
                          </span>
                        </Button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex justify-end">
                <Button type="submit" disabled={isUpdatingPassword}>
                  {isUpdatingPassword && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Alterar Senha
                </Button>
              </div>
            </CardContent>
          </Card>
        </form>
      </Form>

      {/* Zona de Perigo */}
      <Card>
        <CardHeader>
          <CardTitle>Zona de Perigo</CardTitle>
          <CardDescription>
            Ações irreversíveis e destrutivas.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Separator />
          <div className="flex flex-wrap gap-2 items-center justify-between">
            <div>
              <h4 className="font-semibold">Excluir Conta</h4>
              <p className="text-sm text-muted-foreground">
                Exclui permanentemente sua conta e todos os dados associados.
              </p>
            </div>
            <Button 
              variant="destructive" 
              type="button" 
              onClick={handleDeleteAccount}
              disabled={isDeletingAccount}
            >
              {isDeletingAccount && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Excluir Conta
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
