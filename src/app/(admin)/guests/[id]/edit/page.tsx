"use client"

import { useEffect, useState, use } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, UserPen } from "lucide-react"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Skeleton } from "@/components/ui/skeleton"

import { getGuest, updateGuest } from "@/features/guests"
import type { Guest } from "@/features/guests/types"

interface Props {
  params: Promise<{ id: string }>
}

export default function EditGuestPage({ params }: Props) {
  const { id } = use(params)
  const router = useRouter()
  const [guest, setGuest] = useState<Guest | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    cpf: "",
    notes: "",
  })

  useEffect(() => {
    async function loadGuest() {
      try {
        const result = await getGuest(id)
        if (result.success && result.guest) {
          setGuest(result.guest)
          setFormData({
            name: result.guest.name || "",
            email: result.guest.email || "",
            phone: result.guest.phone || "",
            cpf: result.guest.cpf || "",
            notes: result.guest.notes || "",
          })
        }
      } catch (error) {
        console.error("Erro ao carregar hóspede:", error)
      } finally {
        setLoading(false)
      }
    }
    loadGuest()
  }, [id])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name) return

    setSubmitting(true)
    try {
      const result = await updateGuest({
        id,
        name: formData.name,
        email: formData.email || undefined,
        phone: formData.phone || undefined,
        cpf: formData.cpf || undefined,
        notes: formData.notes || undefined,
      })

      if (result.success) {
        router.push(`/guests/${id}`)
      }
    } catch (error) {
      console.error("Erro ao atualizar hóspede:", error)
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

  if (!guest) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center">
        <p>Hóspede não encontrado</p>
        <Button asChild className="mt-4">
          <Link href="/guests">Voltar</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="flex flex-1 flex-col px-4 md:px-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href={`/guests/${id}`}>
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <UserPen className="h-6 w-6" />
            Editar Hóspede
          </h1>
          <p className="text-muted-foreground">
            {guest.name}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Card className="max-w-2xl">
          <CardHeader>
            <CardTitle>Dados do Hóspede</CardTitle>
            <CardDescription>Atualize as informações do hóspede</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Nome Completo *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="email">E-mail</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="phone">Telefone</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="cpf">CPF</Label>
              <Input
                id="cpf"
                value={formData.cpf}
                onChange={(e) => setFormData({ ...formData, cpf: e.target.value })}
              />
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
                <Link href={`/guests/${id}`}>Cancelar</Link>
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
