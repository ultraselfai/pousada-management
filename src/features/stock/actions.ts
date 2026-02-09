"use server";

/**
 * Stock Server Actions
 *
 * Server Actions para gerenciamento de estoque.
 * Inclui categorias, itens e compras.
 */

import { revalidatePath } from "next/cache";
import { prisma } from "@/db";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import {
  createCategorySchema,
  createItemSchema,
  updateItemSchema,
  adjustStockSchema,
  createPurchaseSchema,
  type CreateCategoryInput,
  type CreateItemInput,
  type UpdateItemInput,
  type AdjustStockInput,
  type CreatePurchaseInput,
} from "./schemas";
import type {
  StockActionResult,
  CategoriesListResult,
  ItemsListResult,
  PurchasesListResult,
  LowStockAlert,
  DEFAULT_STOCK_CATEGORIES,
} from "./types";
import { TransactionType, Prisma } from "@/generated/prisma/client";

/**
 * Listar categorias de estoque
 */
export async function getCategories(): Promise<CategoriesListResult> {
  try {
    const categories = await prisma.stockCategory.findMany({
      orderBy: { name: "asc" },
      include: {
        _count: {
          select: { items: true },
        },
        items: {
          select: { currentStock: true, minimumStock: true },
        },
      },
    });

    const categoriesWithLowStock = categories.map((cat) => ({
      id: cat.id,
      name: cat.name,
      slug: cat.slug,
      icon: cat.icon,
      color: cat.color,
      createdAt: cat.createdAt,
      updatedAt: cat.updatedAt,
      _count: cat._count,
      lowStockCount: cat.items.filter(
        (item) => item.currentStock.toNumber() < item.minimumStock.toNumber()
      ).length,
    }));

    return {
      success: true,
      categories: categoriesWithLowStock,
    };
  } catch (error) {
    console.error("Erro ao listar categorias:", error);
    return {
      success: false,
      categories: [],
      error: "Erro interno ao listar categorias",
    };
  }
}

/**
 * Criar categoria de estoque
 */
export async function createCategory(
  input: CreateCategoryInput
): Promise<StockActionResult> {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      return { success: false, error: "Não autenticado" };
    }

    const validated = createCategorySchema.safeParse(input);
    if (!validated.success) {
      return {
        success: false,
        error: validated.error.issues[0].message,
      };
    }

    await prisma.stockCategory.create({
      data: validated.data,
    });

    revalidatePath("/stock");

    return {
      success: true,
      message: "Categoria criada com sucesso!",
    };
  } catch (error) {
    console.error("Erro ao criar categoria:", error);
    return { success: false, error: "Erro interno ao criar categoria" };
  }
}

/**
 * Listar itens de uma categoria
 */
export async function getItems(categoryId?: string): Promise<ItemsListResult> {
  try {
    const where: Prisma.StockItemWhereInput = {};
    if (categoryId) {
      where.categoryId = categoryId;
    }

    const [items, total] = await Promise.all([
      prisma.stockItem.findMany({
        where,
        orderBy: { name: "asc" },
      }),
      prisma.stockItem.count({ where }),
    ]);

    return {
      success: true,
      items: items.map((item) => ({
        ...item,
        currentStock: item.currentStock.toNumber(),
        minimumStock: item.minimumStock.toNumber(),
      })),
      total,
    };
  } catch (error) {
    console.error("Erro ao listar itens:", error);
    return {
      success: false,
      items: [],
      total: 0,
      error: "Erro interno ao listar itens",
    };
  }
}

/**
 * Criar item de estoque
 */
export async function createItem(
  input: CreateItemInput
): Promise<StockActionResult> {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      return { success: false, error: "Não autenticado" };
    }

    const validated = createItemSchema.safeParse(input);
    if (!validated.success) {
      return {
        success: false,
        error: validated.error.issues[0].message,
      };
    }

    await prisma.stockItem.create({
      data: validated.data,
    });

    revalidatePath("/stock");

    return {
      success: true,
      message: "Item criado com sucesso!",
    };
  } catch (error) {
    console.error("Erro ao criar item:", error);
    return { success: false, error: "Erro interno ao criar item" };
  }
}

/**
 * Atualizar item de estoque
 */
export async function updateItem(
  input: UpdateItemInput
): Promise<StockActionResult> {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      return { success: false, error: "Não autenticado" };
    }

    const validated = updateItemSchema.safeParse(input);
    if (!validated.success) {
      return {
        success: false,
        error: validated.error.issues[0].message,
      };
    }

    const { id, ...data } = validated.data;

    await prisma.stockItem.update({
      where: { id },
      data,
    });

    revalidatePath("/stock");

    return {
      success: true,
      message: "Item atualizado com sucesso!",
    };
  } catch (error) {
    console.error("Erro ao atualizar item:", error);
    return { success: false, error: "Erro interno ao atualizar item" };
  }
}

/**
 * Excluir item de estoque
 */
export async function deleteItem(id: string): Promise<StockActionResult> {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      return { success: false, error: "Não autenticado" };
    }

    // Buscar todas as compras associadas a este item
    const purchaseItems = await prisma.stockPurchaseItem.findMany({
      where: { itemId: id },
      select: { purchaseId: true },
    });
    const purchaseIds = [...new Set(purchaseItems.map((pi) => pi.purchaseId))];

    // Executar tudo em uma transação para manter consistência
    await prisma.$transaction(async (tx) => {
      // 1. Excluir os itens de compra deste item
      await tx.stockPurchaseItem.deleteMany({
        where: { itemId: id },
      });

      // 2. Para cada compra afetada, verificar se ficou sem itens
      for (const purchaseId of purchaseIds) {
        const remainingItems = await tx.stockPurchaseItem.count({
          where: { purchaseId },
        });

        // Se a compra ficou sem itens, excluir transação e compra
        if (remainingItems === 0) {
          await tx.transaction.deleteMany({
            where: { purchaseId },
          });
          await tx.stockPurchase.delete({
            where: { id: purchaseId },
          });
        }
      }

      // 3. Finalmente, excluir o item
      await tx.stockItem.delete({ where: { id } });
    });

    revalidatePath("/stock");
    revalidatePath("/financial");

    return {
      success: true,
      message: "Item excluído com sucesso!",
    };
  } catch (error) {
    console.error("Erro ao excluir item:", error);
    return { success: false, error: "Erro interno ao excluir item" };
  }
}

/**
 * Ajustar estoque manualmente
 */
export async function adjustStock(
  input: AdjustStockInput
): Promise<StockActionResult> {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      return { success: false, error: "Não autenticado" };
    }

    const validated = adjustStockSchema.safeParse(input);
    if (!validated.success) {
      return {
        success: false,
        error: validated.error.issues[0].message,
      };
    }

    const { id, quantity } = validated.data;

    const item = await prisma.stockItem.findUnique({ where: { id } });
    if (!item) {
      return { success: false, error: "Item não encontrado" };
    }

    const newStock = item.currentStock.toNumber() + quantity;
    if (newStock < 0) {
      return { success: false, error: "Estoque não pode ficar negativo" };
    }

    await prisma.stockItem.update({
      where: { id },
      data: { currentStock: newStock },
    });

    revalidatePath("/stock");

    return {
      success: true,
      message: `Estoque ${quantity > 0 ? "aumentado" : "reduzido"} com sucesso!`,
    };
  } catch (error) {
    console.error("Erro ao ajustar estoque:", error);
    return { success: false, error: "Erro interno ao ajustar estoque" };
  }
}

/**
 * Listar compras
 */
export async function getPurchases(
  page = 1,
  limit = 20
): Promise<PurchasesListResult> {
  try {
    const skip = (page - 1) * limit;

    const [purchases, total] = await Promise.all([
      prisma.stockPurchase.findMany({
        orderBy: { purchaseDate: "desc" },
        skip,
        take: limit,
        include: {
          items: {
            include: {
              item: { select: { name: true } },
            },
          },
        },
      }),
      prisma.stockPurchase.count(),
    ]);

    return {
      success: true,
      purchases: purchases.map((p) => ({
        ...p,
        totalAmount: p.totalAmount.toNumber(),
        items: p.items.map((i) => ({
          ...i,
          quantity: i.quantity.toNumber(),
          unitPrice: i.unitPrice.toNumber(),
          totalPrice: i.totalPrice.toNumber(),
        })),
      })),
      total,
    };
  } catch (error) {
    console.error("Erro ao listar compras:", error);
    return {
      success: false,
      purchases: [],
      total: 0,
      error: "Erro interno ao listar compras",
    };
  }
}

/**
 * Registrar compra de estoque
 */
export async function createPurchase(
  input: CreatePurchaseInput
): Promise<StockActionResult> {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      return { success: false, error: "Não autenticado" };
    }

    const validated = createPurchaseSchema.safeParse(input);
    if (!validated.success) {
      return {
        success: false,
        error: validated.error.issues[0].message,
      };
    }

    const { items, ...purchaseData } = validated.data;

    // Calcular total
    const totalAmount = items.reduce(
      (sum, item) => sum + item.quantity * item.unitPrice,
      0
    );

    // Criar compra e atualizar estoques em transação
    await prisma.$transaction(async (tx) => {
      // Criar compra
      const purchase = await tx.stockPurchase.create({
        data: {
          ...purchaseData,
          totalAmount,
          items: {
            create: items.map((item) => ({
              itemId: item.itemId,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              totalPrice: item.quantity * item.unitPrice,
            })),
          },
        },
      });

      // Atualizar estoque de cada item
      for (const item of items) {
        await tx.stockItem.update({
          where: { id: item.itemId },
          data: {
            currentStock: {
              increment: item.quantity,
            },
          },
        });
      }

      // Registrar transação financeira
      await tx.transaction.create({
        data: {
          type: TransactionType.EXPENSE,
          amount: totalAmount,
          date: purchaseData.purchaseDate,
          description: `Compra de estoque - ${purchaseData.supplier || "Fornecedor não informado"}`,
          purchaseId: purchase.id,
        },
      });
    });

    revalidatePath("/stock");
    revalidatePath("/financial");

    return {
      success: true,
      message: "Compra registrada com sucesso!",
    };
  } catch (error) {
    console.error("Erro ao registrar compra:", error);
    return { success: false, error: "Erro interno ao registrar compra" };
  }
}

/**
 * Obter itens com estoque baixo
 */
export async function getLowStockItems(): Promise<LowStockAlert[]> {
  try {
    const items = await prisma.stockItem.findMany({
      where: {
        currentStock: {
          lt: prisma.stockItem.fields.minimumStock,
        },
      },
      include: {
        category: { select: { name: true } },
      },
      orderBy: { currentStock: "asc" },
    });

    // Filtrar manualmente porque Prisma não suporta comparação entre colunas diretamente
    const lowStockItems = items.filter(
      (item) => item.currentStock.toNumber() < item.minimumStock.toNumber()
    );

    return lowStockItems.map((item) => ({
      id: item.id,
      name: item.name,
      categoryName: item.category.name,
      currentStock: item.currentStock.toNumber(),
      minimumStock: item.minimumStock.toNumber(),
      unit: item.unit,
      deficit: item.minimumStock.toNumber() - item.currentStock.toNumber(),
    }));
  } catch (error) {
    console.error("Erro ao buscar itens com estoque baixo:", error);
    return [];
  }
}

/**
 * Inicializar categorias padrão
 */
export async function initializeDefaultCategories(): Promise<StockActionResult> {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      return { success: false, error: "Não autenticado" };
    }

    const defaultCategories = [
      { name: "Café da Manhã", slug: "cafe-da-manha", icon: "☕", color: "#f59e0b" },
      { name: "Produtos de Piscina", slug: "piscina", icon: "🏊", color: "#0ea5e9" },
      { name: "Produtos de Limpeza", slug: "limpeza", icon: "🧹", color: "#22c55e" },
      { name: "Equipamentos", slug: "equipamentos", icon: "🔧", color: "#6366f1" },
      { name: "Manutenções", slug: "manutencoes", icon: "🛠️", color: "#ef4444" },
    ];

    for (const cat of defaultCategories) {
      await prisma.stockCategory.upsert({
        where: { slug: cat.slug },
        update: {},
        create: cat,
      });
    }

    revalidatePath("/stock");

    return {
      success: true,
      message: "Categorias padrão criadas com sucesso!",
    };
  } catch (error) {
    console.error("Erro ao criar categorias padrão:", error);
    return { success: false, error: "Erro interno ao criar categorias padrão" };
  }
}
