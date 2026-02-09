import { notFound } from "next/navigation"
import Link from "next/link"
import {
  ArrowLeft,
  Package,
  Plus,
  AlertTriangle,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Progress } from "@/components/ui/progress"

import { prisma } from "@/db"

interface CategoryPageProps {
  params: Promise<{ slug: string }>
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = await params

  // Buscar categoria pelo slug
  const category = await prisma.stockCategory.findUnique({
    where: { slug },
    include: {
      items: {
        orderBy: { name: "asc" },
      },
    },
  })

  if (!category) {
    notFound()
  }

  const items = category.items.map((item) => ({
    ...item,
    currentStock: item.currentStock.toNumber(),
    minimumStock: item.minimumStock.toNumber(),
  }))

  return (
    <div className="flex flex-1 flex-col px-4 md:px-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/stock">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
              <Package className="h-6 w-6" />
              {category.name}
            </h1>
            <p className="text-muted-foreground">
              {items.length} item(ns) cadastrado(s)
            </p>
          </div>
        </div>
        <Button asChild>
          <Link href={`/stock/items/new?category=${category.id}`}>
            <Plus className="mr-2 h-4 w-4" />
            Novo Item
          </Link>
        </Button>
      </div>

      {/* Tabela de itens */}
      <Card>
        <CardHeader>
          <CardTitle>Itens</CardTitle>
          <CardDescription>
            Lista de itens nesta categoria
          </CardDescription>
        </CardHeader>
        <CardContent>
          {items.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Nenhum item cadastrado nesta categoria.</p>
              <Button variant="link" asChild className="mt-2">
                <Link href={`/stock/items/new?category=${category.id}`}>
                  Adicionar primeiro item
                </Link>
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Estoque Atual</TableHead>
                  <TableHead>Estoque Mínimo</TableHead>
                  <TableHead>Nível</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item) => {
                  const current = Number(item.currentStock)
                  const minimum = Number(item.minimumStock)
                  const percentage = minimum > 0 ? Math.min((current / minimum) * 100, 100) : 100
                  const isLow = current < minimum

                  return (
                    <TableRow key={item.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{item.name}</span>
                          {isLow && (
                            <AlertTriangle className="h-4 w-4 text-orange-500" />
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={isLow ? "destructive" : "secondary"}>
                          {current} {item.unit}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {minimum} {item.unit}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 min-w-[100px]">
                          <Progress
                            value={percentage}
                            className={`h-2 ${isLow ? "[&>div]:bg-orange-500" : ""}`}
                          />
                          <span className="text-xs text-muted-foreground w-10">
                            {Math.round(percentage)}%
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm" asChild>
                          <Link href={`/stock/items/${item.id}`}>
                            Editar
                          </Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
