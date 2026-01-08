"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { 
  Building2, 
  User, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  Save, 
  UserCog, 
  Shield,
  X,
  Plus,
  Ban,
  UserCheck,
  Loader2,
  Copy,
  Link
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { toast } from "sonner"

import { 
  updateClient, 
  updateClientUser, 
  impersonateUser,
  deleteClient 
} from "@/features/admin/client-actions"
import { toggleFeatureForOrg } from "@/features/admin/actions"
import type { Feature } from "@/config/features"

// Schemas de validação
const orgFormSchema = z.object({
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  plan: z.string().min(1, "Selecione um plano"),
})

const userFormSchema = z.object({
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  email: z.string().email("Email inválido"),
  password: z.string().optional(),
})

type OrgFormValues = z.infer<typeof orgFormSchema>
type UserFormValues = z.infer<typeof userFormSchema>

interface ClientMember {
  id: string
  userId: string
  role: string
  user: {
    id: string
    name: string
    email: string
    image: string | null
    role: string
    banned: boolean
    createdAt: string
  }
}

interface ClientData {
  id: string
  name: string
  slug: string
  logo: string | null
  plan: string
  status: string
  allowedFeatures: string[]
  isSandbox: boolean
  createdAt: string
  updatedAt: string
  members: ClientMember[]
}

interface ClientDetailsFormProps {
  client: ClientData
  owner: ClientMember | undefined
  availableFeatures: Feature[]
}

export function ClientDetailsForm({ client, owner, availableFeatures }: ClientDetailsFormProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [showPassword, setShowPassword] = useState(false)
  const [features, setFeatures] = useState(client.allowedFeatures)
  const [isDeleting, setIsDeleting] = useState(false)

  // Form da organização
  const orgForm = useForm<OrgFormValues>({
    resolver: zodResolver(orgFormSchema),
    defaultValues: {
      name: client.name,
      plan: client.plan,
    },
  })

  // Form do usuário
  const userForm = useForm<UserFormValues>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      name: owner?.user.name || "",
      email: owner?.user.email || "",
      password: "",
    },
  })

  // Salvar dados da organização
  async function onOrgSubmit(data: OrgFormValues) {
    startTransition(async () => {
      const result = await updateClient({
        id: client.id,
        name: data.name,
        plan: data.plan,
      })

      if (result.success) {
        toast.success(result.message)
        router.refresh()
      } else {
        toast.error(result.message)
      }
    })
  }

  // Salvar dados do usuário
  async function onUserSubmit(data: UserFormValues) {
    if (!owner) return

    startTransition(async () => {
      const result = await updateClientUser({
        userId: owner.user.id,
        name: data.name,
        email: data.email,
        password: data.password || undefined,
      })

      if (result.success) {
        toast.success(result.message)
        userForm.setValue("password", "")
        router.refresh()
      } else {
        toast.error(result.message)
      }
    })
  }

  // Toggle feature
  async function handleToggleFeature(featureKey: string) {
    startTransition(async () => {
      const result = await toggleFeatureForOrg(client.id, featureKey)

      if (result.success && result.allowedFeatures) {
        setFeatures(result.allowedFeatures)
        toast.success(result.message)
      } else {
        toast.error(result.message)
      }
    })
  }

  // Impersonar usuário
  async function handleImpersonate() {
    if (!owner) return

    startTransition(async () => {
      const result = await impersonateUser(owner.user.id)

      if (result.success && result.data?.redirectUrl) {
        toast.success(result.message)
        window.location.href = result.data.redirectUrl
      } else {
        toast.error(result.message)
      }
    })
  }

  // Excluir cliente
  async function handleDelete() {
    setIsDeleting(true)
    const result = await deleteClient(client.id)

    if (result.success) {
      toast.success(result.message)
      router.push("/organizations")
    } else {
      toast.error(result.message)
      setIsDeleting(false)
    }
  }

  // Toggle ban do usuário
  async function handleToggleBan() {
    if (!owner) return

    startTransition(async () => {
      const result = await updateClientUser({
        userId: owner.user.id,
        banned: !owner.user.banned,
      })

      if (result.success) {
        toast.success(owner.user.banned ? "Usuário desbloqueado" : "Usuário bloqueado")
        router.refresh()
      } else {
        toast.error(result.message)
      }
    })
  }

  const getFeatureStatusColor = (status: string) => {
    switch (status) {
      case "stable":
        return "bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400"
      case "beta":
        return "bg-yellow-50 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400"
      case "dev":
        return "bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400"
      default:
        return "bg-gray-50 text-gray-700"
    }
  }

  return (
    <div className="space-y-6">
      {/* Ações rápidas */}
      <div className="flex flex-wrap gap-2">
        <Button 
          variant="outline" 
          onClick={handleImpersonate}
          disabled={isPending || !owner}
        >
          <Eye className="mr-2 size-4" />
          Visualizar como Cliente
        </Button>
        
        {owner && (
          <Button 
            variant={owner.user.banned ? "default" : "outline"} 
            onClick={handleToggleBan}
            disabled={isPending}
          >
            {owner.user.banned ? (
              <>
                <UserCheck className="mr-2 size-4" />
                Desbloquear Acesso
              </>
            ) : (
              <>
                <Ban className="mr-2 size-4" />
                Bloquear Acesso
              </>
            )}
          </Button>
        )}

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" disabled={client.isSandbox || isPending}>
              Excluir Cliente
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Tem certeza?</AlertDialogTitle>
              <AlertDialogDescription>
                Esta ação não pode ser desfeita. Isso excluirá permanentemente a organização
                &quot;{client.name}&quot; e todos os seus dados associados.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction 
                onClick={handleDelete}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="mr-2 size-4 animate-spin" />
                    Excluindo...
                  </>
                ) : (
                  "Excluir"
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Dados da Organização */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="size-5" />
              Dados da Organização
            </CardTitle>
            <CardDescription>
              Informações básicas do cliente
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...orgForm}>
              <form onSubmit={orgForm.handleSubmit(onOrgSubmit)} className="space-y-4">
                <FormField
                  control={orgForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome da Empresa</FormLabel>
                      <FormControl>
                        <Input placeholder="Nome da empresa" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* ID da Organização - Read Only */}
                <div className="space-y-2">
                  <Label>ID da Organização</Label>
                  <div className="flex gap-2">
                    <Input 
                      value={client.id} 
                      readOnly 
                      className="bg-muted text-muted-foreground font-mono text-sm"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => {
                        navigator.clipboard.writeText(client.id)
                        toast.success("ID copiado!")
                      }}
                    >
                      <Copy className="size-4" />
                    </Button>
                  </div>
                </div>

                {/* URL do Painel - Read Only */}
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Link className="size-4" />
                    URL do Painel
                  </Label>
                  <div className="flex gap-2">
                    <div className="flex flex-1">
                      <span className="flex items-center px-3 bg-muted border border-r-0 rounded-l-md text-muted-foreground text-sm">
                        app.decode.ink/
                      </span>
                      <Input 
                        value={client.id} 
                        readOnly 
                        className="rounded-l-none bg-muted text-muted-foreground font-mono text-sm"
                      />
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => {
                        navigator.clipboard.writeText(`app.decode.ink/${client.id}`)
                        toast.success("URL copiada!")
                      }}
                    >
                      <Copy className="size-4" />
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    URL de acesso do cliente ao painel
                  </p>
                </div>

                <FormField
                  control={orgForm.control}
                  name="plan"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Plano</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione um plano" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Free">Free</SelectItem>
                          <SelectItem value="Professional">Professional</SelectItem>
                          <SelectItem value="Enterprise">Enterprise</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit" disabled={isPending}>
                  {isPending ? (
                    <Loader2 className="mr-2 size-4 animate-spin" />
                  ) : (
                    <Save className="mr-2 size-4" />
                  )}
                  Salvar Organização
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        {/* Dados do Usuário */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserCog className="size-5" />
              Usuário Principal
              {owner?.user.banned && (
                <Badge variant="destructive" className="ml-2">
                  Bloqueado
                </Badge>
              )}
            </CardTitle>
            <CardDescription>
              Dados de acesso do responsável
            </CardDescription>
          </CardHeader>
          <CardContent>
            {owner ? (
              <Form {...userForm}>
                <form onSubmit={userForm.handleSubmit(onUserSubmit)} className="space-y-4">
                  <FormField
                    control={userForm.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nome</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                            <Input placeholder="Nome completo" className="pl-9" {...field} />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={userForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                            <Input placeholder="email@exemplo.com" className="pl-9" {...field} />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={userForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nova Senha</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                            <Input 
                              type={showPassword ? "text" : "password"}
                              placeholder="Deixe em branco para manter" 
                              className="pl-9 pr-9" 
                              {...field} 
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                            >
                              {showPassword ? (
                                <EyeOff className="size-4" />
                              ) : (
                                <Eye className="size-4" />
                              )}
                            </button>
                          </div>
                        </FormControl>
                        <FormDescription>
                          Preencha apenas se quiser alterar a senha
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button type="submit" disabled={isPending}>
                    {isPending ? (
                      <Loader2 className="mr-2 size-4 animate-spin" />
                    ) : (
                      <Save className="mr-2 size-4" />
                    )}
                    Salvar Usuário
                  </Button>
                </form>
              </Form>
            ) : (
              <p className="text-muted-foreground">Nenhum usuário encontrado</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Features */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="size-5" />
            Disponibilizar Features
          </CardTitle>
          <CardDescription>
            Gerencie os módulos disponíveis para este cliente. Os módulos ativos aparecerão no sidebar do painel do cliente.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Aviso para Sandbox */}
          {client.isSandbox && (
            <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-4">
              <p className="text-sm text-amber-600 dark:text-amber-400 font-medium">
                🧪 Este é o ambiente Sandbox (Decode Lab)
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Todas as features estão permanentemente habilitadas para testes e demonstrações.
              </p>
            </div>
          )}

          {/* Features ativas - resumo */}
          <div>
            <Label className="text-sm font-medium mb-3 block">
              Módulos Ativos ({client.isSandbox ? availableFeatures.length : features.length})
            </Label>
            <div className="flex flex-wrap gap-2">
              {client.isSandbox ? (
                // Sandbox: mostra todas as features sem botão de remover
                availableFeatures.map(feature => (
                  <Badge 
                    key={feature.key} 
                    variant="secondary" 
                    className={`${getFeatureStatusColor(feature.status)} px-3 py-1`}
                  >
                    {feature.label}
                  </Badge>
                ))
              ) : features.length > 0 ? (
                features.map(featureKey => {
                  const feature = availableFeatures.find(f => f.key === featureKey)
                  return (
                    <Badge 
                      key={featureKey} 
                      variant="secondary" 
                      className={`${getFeatureStatusColor(feature?.status || '')} flex items-center gap-1 px-3 py-1`}
                    >
                      {feature?.label || featureKey}
                      <button
                        onClick={() => handleToggleFeature(featureKey)}
                        disabled={isPending}
                        className="ml-1 hover:bg-black/10 dark:hover:bg-white/10 rounded-full p-0.5"
                      >
                        <X className="size-3" />
                      </button>
                    </Badge>
                  )
                })
              ) : (
                <span className="text-sm text-muted-foreground">Nenhum módulo ativo</span>
              )}
            </div>
          </div>

          {/* Só mostra grid de toggle se NÃO for sandbox */}
          {!client.isSandbox && (
            <>
              <Separator />

              {/* Grid de todas as features com toggle */}
              <div>
                <Label className="text-sm font-medium mb-3 block">Todos os Módulos Disponíveis</Label>
                <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                  {availableFeatures.map(feature => {
                    const isActive = features.includes(feature.key)
                    return (
                      <div 
                        key={feature.key}
                        className={`flex items-center justify-between p-3 rounded-lg border ${
                          isActive ? 'bg-primary/5 border-primary/20' : 'bg-muted/50'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm">{feature.label}</span>
                          <Badge 
                            variant="outline" 
                            className={`text-xs ${getFeatureStatusColor(feature.status)}`}
                          >
                            {feature.status}
                          </Badge>
                        </div>
                        <Button
                          variant={isActive ? "default" : "outline"}
                          size="sm"
                          onClick={() => handleToggleFeature(feature.key)}
                          disabled={isPending}
                        >
                          {isActive ? (
                            <>
                              <X className="size-3 mr-1" />
                              Remover
                            </>
                          ) : (
                            <>
                              <Plus className="size-3 mr-1" />
                              Ativar
                            </>
                          )}
                        </Button>
                      </div>
                    )
                  })}
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
