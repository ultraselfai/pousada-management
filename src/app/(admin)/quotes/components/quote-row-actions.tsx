"use client"

import type { Row } from "@tanstack/react-table"
import {
  Eye,
  MoreHorizontal,
  Pencil,
  Trash2,
  Send,
  RefreshCw,
  FileText,
  Copy,
} from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { toast } from "sonner"
import type { Quote } from "@/features/quotes/types"
import { updateQuoteStatus, convertQuoteToBooking, generateQuotePdf } from "@/features/quotes"

interface QuoteRowActionsProps {
  row: Row<Quote>
}

export function QuoteRowActions({ row }: QuoteRowActionsProps) {
  const router = useRouter()
  const quote = row.original
  const [loading, setLoading] = useState(false)

  const handleMarkAsSent = async () => {
    setLoading(true)
    try {
      const result = await updateQuoteStatus({ id: quote.id, status: "SENT" })
      if (result.success) {
        toast.success("Orçamento marcado como enviado!")
        router.refresh()
      } else {
        toast.error(result.error || "Erro ao atualizar status")
      }
    } catch (error) {
      toast.error("Erro ao atualizar status")
    } finally {
      setLoading(false)
    }
  }

  const handleConvert = async () => {
    if (!confirm("Converter este orçamento em reserva?")) return
    
    setLoading(true)
    try {
      const result = await convertQuoteToBooking(quote.id)
      if (result.success) {
        toast.success("Orçamento convertido em reserva!")
        router.push("/bookings")
      } else {
        toast.error(result.error || "Erro ao converter orçamento")
      }
    } catch (error) {
      toast.error("Erro ao converter orçamento")
    } finally {
      setLoading(false)
    }
  }

  const handleGeneratePdf = async () => {
    setLoading(true)
    try {
      const result = await generateQuotePdf(quote.id)
      if (result.success && result.url) {
        window.open(result.url, "_blank")
        toast.success("PDF gerado com sucesso!")
      } else {
        toast.error(result.error || "Erro ao gerar PDF")
      }
    } catch (error) {
      toast.error("Erro ao gerar PDF")
    } finally {
      setLoading(false)
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="flex h-8 w-8 p-0 data-[state=open]:bg-muted cursor-pointer"
          disabled={loading}
        >
          <MoreHorizontal className="h-4 w-4" />
          <span className="sr-only">Abrir menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[180px]">
        <DropdownMenuItem
          className="cursor-pointer"
          onClick={() => router.push(`/quotes/${quote.id}`)}
        >
          <Eye className="mr-2 h-4 w-4" />
          Ver detalhes
        </DropdownMenuItem>
        <DropdownMenuItem
          className="cursor-pointer"
          onClick={() => router.push(`/quotes/${quote.id}/edit`)}
        >
          <Pencil className="mr-2 h-4 w-4" />
          Editar
        </DropdownMenuItem>
        <DropdownMenuItem
          className="cursor-pointer"
          onClick={handleGeneratePdf}
        >
          <FileText className="mr-2 h-4 w-4" />
          Gerar PDF
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        
        {quote.status === "PENDING" && (
          <DropdownMenuItem
            className="cursor-pointer text-blue-600"
            onClick={handleMarkAsSent}
          >
            <Send className="mr-2 h-4 w-4" />
            Marcar como Enviado
          </DropdownMenuItem>
        )}
        
        {(quote.status === "PENDING" || quote.status === "SENT" || quote.status === "ACCEPTED") && (
          <DropdownMenuItem
            className="cursor-pointer text-purple-600"
            onClick={handleConvert}
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Converter em Reserva
          </DropdownMenuItem>
        )}
        
        <DropdownMenuItem
          className="cursor-pointer"
          onClick={() => router.push(`/quotes/new?copy=${quote.id}`)}
        >
          <Copy className="mr-2 h-4 w-4" />
          Duplicar
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="cursor-pointer text-destructive focus:text-destructive"
        >
          <Trash2 className="mr-2 h-4 w-4" />
          Excluir
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
