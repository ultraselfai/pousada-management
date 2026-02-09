import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Button } from "@/components/ui/button"
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
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { createUserSchema, type CreateUserInput } from "../schemas"
import { PERMISSIONS } from "@/config/permissions"
import { createUser, updateUser } from "../actions"
import { toast } from "sonner"
import { useState } from "react"
import { Loader2, Eye, EyeOff } from "lucide-react"

// Define a unified schema for the form state
const formSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(2, "Nome deve ter no mínimo 2 caracteres"),
  email: z.string().email("Email inválido"),
  role: z.enum(["admin", "user"]),
  permissions: z.array(z.string()),
  // Password is optional for edit, required (with min 6) for create if not provided via some other way
  // We'll validate manually or via superRefine
  password: z.string().optional(),
}).superRefine((data, ctx) => {
  if (!data.id) {
    // Creating: password required
    if (!data.password || data.password.length < 6) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Senha deve ter no mínimo 6 caracteres para novos usuários",
        path: ["password"],
      })
    }
  } else {
    // Editing: if provided, must be >= 6
    if (data.password && data.password.length > 0 && data.password.length < 6) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Senha deve ter no mínimo 6 caracteres",
        path: ["password"],
      })
    }
  }
})

type FormValues = z.infer<typeof formSchema>

interface UserFormProps {
  user?: any
  onSuccess: () => void
}

export function UserForm({ user, onSuccess }: UserFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const isEditing = !!user

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: user?.name || "",
      email: user?.email || "",
      role: user?.role || "user",
      permissions: user?.permissions || [],
      password: "", 
    },
  })

  async function onSubmit(data: any) {
    setIsLoading(true)
    try {
      if (isEditing) {
        // Update
        const res = await updateUser({
          id: user.id,
          name: data.name,
          email: data.email,
          role: data.role,
          permissions: data.permissions,
          password: data.password || undefined,
        })
        if (res.success) {
          toast.success("Usuário atualizado com sucesso")
          onSuccess()
        } else {
          toast.error(res.error)
        }
      } else {
        // Create
        const res = await createUser(data as CreateUserInput)
        if (res.success) {
          toast.success("Usuário criado com sucesso")
          onSuccess()
        } else {
          toast.error(res.error)
        }
      }
    } catch (error) {
      toast.error("Erro ao salvar usuário")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome</FormLabel>
              <FormControl>
                <Input placeholder="Nome do usuário" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email (Login)</FormLabel>
              <FormControl>
                <Input type="email" placeholder="email@exemplo.com" {...field} disabled={isEditing} />
              </FormControl>
              <FormDescription>
                Utilizado para login no sistema.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{isEditing ? "Nova Senha (Opcional)" : "Senha"}</FormLabel>
              <FormControl>
                <div className="relative">
                  <Input 
                    type={showPassword ? "text" : "password"} 
                    placeholder={isEditing ? "Deixe em branco para manter" : "Senha segura"} 
                    {...field} 
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                    <span className="sr-only">
                      {showPassword ? "Ocultar senha" : "Mostrar senha"}
                    </span>
                  </Button>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="role"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Função</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a função" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="user">Usuário Comum</SelectItem>
                  <SelectItem value="admin">Administrador</SelectItem>
                </SelectContent>
              </Select>
              <FormDescription>
                Administradores têm acesso total independente das permissões marcadas.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="space-y-4">
          <FormLabel>Permissões de Acesso</FormLabel>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border p-4 rounded-md">
            {PERMISSIONS.map((permission) => (
              <FormField
                key={permission.value}
                control={form.control}
                name="permissions"
                render={({ field }) => {
                  return (
                    <FormItem
                      key={permission.value}
                      className="flex flex-row items-start space-x-3 space-y-0"
                    >
                      <FormControl>
                        <Checkbox
                          checked={field.value?.includes(permission.value)}
                          onCheckedChange={(checked) => {
                            return checked
                              ? field.onChange([...field.value, permission.value])
                              : field.onChange(
                                  field.value?.filter(
                                    (value: string) => value !== permission.value
                                  )
                                )
                          }}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel className="font-normal cursor-pointer">
                          {permission.label}
                        </FormLabel>
                        <FormDescription>
                          {permission.description}
                        </FormDescription>
                      </div>
                    </FormItem>
                  )
                }}
              />
            ))}
          </div>
          <p className="text-sm text-muted-foreground">
            Selecione as áreas que este usuário pode acessar.
          </p>
        </div>

        <div className="flex justify-end gap-2">
           <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEditing ? "Salvar Alterações" : "Criar Usuário"}
           </Button>
        </div>
      </form>
    </Form>
  )
}
