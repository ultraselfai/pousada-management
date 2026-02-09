"use client"

import { useEffect, useState } from "react"
import { FileText } from "lucide-react"

import { QuotesTable, columns } from "./components"
import { fetchQuotes } from "./actions"
import type { Quote } from "@/features/quotes/types"
import { Skeleton } from "@/components/ui/skeleton"

export default function QuotesPage() {
  const [quotes, setQuotes] = useState<Quote[]>([])
  const [loading, setLoading] = useState(true)
  const [total, setTotal] = useState(0)

  useEffect(() => {
    async function loadQuotes() {
      try {
        const result = await fetchQuotes()
        if (result.success) {
          setQuotes(result.quotes)
          setTotal(result.total)
        }
      } catch (error) {
        console.error("Erro ao carregar orçamentos:", error)
      } finally {
        setLoading(false)
      }
    }
    loadQuotes()
  }, [])

  if (loading) {
    return (
      <div className="flex flex-1 flex-col px-4 md:px-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-64 mt-2" />
          </div>
          <Skeleton className="h-9 w-32" />
        </div>
        <div className="rounded-md border">
          <div className="p-4 space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-1 flex-col px-4 md:px-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <FileText className="h-6 w-6" />
            Orçamentos
          </h1>
          <p className="text-muted-foreground">
            {total} orçamento{total !== 1 ? "s" : ""} encontrado{total !== 1 ? "s" : ""}
          </p>
        </div>
      </div>

      <QuotesTable data={quotes} columns={columns} />
    </div>
  )
}
