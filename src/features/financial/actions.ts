"use server";

/**
 * Financial Server Actions
 *
 * Server Actions para gestão financeira.
 * Inclui despesas, receitas, fluxo de caixa e relatórios.
 */

import { revalidatePath } from "next/cache";
import { prisma } from "@/db";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import {
  createExpenseCategorySchema,
  createExpenseSchema,
  updateExpenseSchema,
  createRevenueSchema,
  updateRevenueSchema,
  type CreateExpenseCategoryInput,
  type CreateExpenseInput,
  type UpdateExpenseInput,
  type CreateRevenueInput,
  type UpdateRevenueInput,
} from "./schemas";
import type {
  FinancialActionResult,
  ExpenseCategory,
  ExpenseCategoryWithTotal,
  ExpenseWithCategory,
  Revenue,
  CashFlow,
  DRE,
  PeriodFilters,
} from "./types";
import { TransactionType, Prisma, RevenueSource } from "@/generated/prisma/client";

// ========== CATEGORIAS DE DESPESAS ==========

/**
 * Listar categorias de despesa
 */
export async function getExpenseCategories(): Promise<ExpenseCategory[]> {
  try {
    const categories = await prisma.expenseCategory.findMany({
      orderBy: { name: "asc" },
    });

    return categories;
  } catch (error) {
    console.error("Erro ao listar categorias:", error);
    return [];
  }
}

/**
 * Listar categorias com totais do período
 */
export async function getExpenseCategoriesWithTotals(
  startDate: Date,
  endDate: Date
): Promise<ExpenseCategoryWithTotal[]> {
  try {
    const categories = await prisma.expenseCategory.findMany({
      include: {
        expenses: {
          where: {
            dueDate: { gte: startDate, lte: endDate },
          },
          select: { amount: true },
        },
      },
      orderBy: { name: "asc" },
    });

    return categories.map((cat) => ({
      ...cat,
      total: cat.expenses.reduce((sum, e) => sum + e.amount.toNumber(), 0),
      count: cat.expenses.length,
    }));
  } catch (error) {
    console.error("Erro ao listar categorias com totais:", error);
    return [];
  }
}

/**
 * Criar categoria de despesa
 */
export async function createExpenseCategory(
  input: CreateExpenseCategoryInput
): Promise<FinancialActionResult> {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      return { success: false, error: "Não autenticado" };
    }

    const validated = createExpenseCategorySchema.safeParse(input);
    if (!validated.success) {
      return {
        success: false,
        error: validated.error.issues[0].message,
      };
    }

    await prisma.expenseCategory.create({
      data: validated.data,
    });

    revalidatePath("/financial");

    return {
      success: true,
      message: "Categoria criada com sucesso!",
    };
  } catch (error) {
    console.error("Erro ao criar categoria:", error);
    return { success: false, error: "Erro interno ao criar categoria" };
  }
}

// ========== DESPESAS ==========

/**
 * Listar despesas
 */
/**
 * Listar despesas (unificado: despesas + compras de estoque)
 */
export async function getExpenses(
  filters?: PeriodFilters & { categoryId?: string; isPaid?: boolean },
  page = 1,
  limit = 20
): Promise<{ expenses: ExpenseWithCategory[]; total: number }> {
  try {
    const skip = (page - 1) * limit;

    const where: Prisma.TransactionWhereInput = {
      type: TransactionType.EXPENSE,
    };

    if (filters?.startDate && filters?.endDate) {
      where.date = {
        gte: filters.startDate,
        lte: filters.endDate,
      };
    }

    // Filtros específicos
    if (filters?.categoryId) {
      // Se filtrar por categoria, traz apenas despesas dessa categoria
      // TODO: Se tivermos categoria de estoque no futuro, incluir aqui
      where.expense = { categoryId: filters.categoryId };
    }

    if (filters?.isPaid !== undefined) {
      if (filters.isPaid) {
        // Se quer pagos: despesas pagas OU compras (que são consideradas pagas ao criar transação)
        where.OR = [
          { expense: { isPaid: true } },
          { purchase: { isNot: null } },
        ];
      } else {
        // Se quer não pagos: apenas despesas não pagas
        where.expense = { isPaid: false };
      }
    }

    const [transactions, total] = await Promise.all([
      prisma.transaction.findMany({
        where,
        orderBy: { date: "desc" },
        skip,
        take: limit,
        include: {
          expense: {
            include: { category: true },
          },
          purchase: true,
        },
      }),
      prisma.transaction.count({ where }),
    ]);

    // Categoria virtual para compras de estoque
    const stockCategory: ExpenseCategory = {
      id: "stock-category",
      name: "Compra de Estoque",
      slug: "estoque",
      color: "bg-orange-100 text-orange-800",
      icon: "shopping-cart",
      createdAt: new Date(),
    };

    const expenses: ExpenseWithCategory[] = transactions.map((t) => {
      // Se for despesa padrão
      if (t.expense) {
        return {
          id: t.expense.id,
          description: t.expense.description,
          categoryId: t.expense.categoryId,
          amount: t.expense.amount.toNumber(),
          dueDate: t.expense.dueDate,
          paidAt: t.expense.paidAt,
          isPaid: t.expense.isPaid,
          isRecurring: t.expense.isRecurring,
          recurrence: t.expense.recurrence,
          receiptUrl: t.expense.receiptUrl,
          notes: t.expense.notes,
          createdAt: t.expense.createdAt,
          updatedAt: t.expense.updatedAt,
          category: {
            id: t.expense.category.id,
            name: t.expense.category.name,
            slug: t.expense.category.slug,
            color: t.expense.category.color,
            icon: t.expense.category.icon,
            createdAt: t.expense.category.createdAt,
          },
        };
      }

      // Se for compra de estoque
      if (t.purchase) {
        return {
          id: t.purchase.id, // ID da compra
          description: t.description || `Compra de Estoque`,
          categoryId: stockCategory.id,
          amount: t.amount.toNumber(),
          dueDate: t.date,
          paidAt: t.date,
          isPaid: true, // Compras geram transação, então consideramos pagas/contabilizadas
          isRecurring: false,
          recurrence: null,
          receiptUrl: t.purchase.receiptUrl || null,
          notes: t.purchase.notes || null,
          createdAt: t.createdAt,
          updatedAt: t.createdAt,
          category: stockCategory,
        };
      }

      // Outras despesas (fallback)
      return {
        id: t.id,
        description: t.description,
        categoryId: "other",
        amount: t.amount.toNumber(),
        dueDate: t.date,
        paidAt: t.date,
        isPaid: true,
        isRecurring: false,
        recurrence: null,
        receiptUrl: null,
        notes: null,
        createdAt: t.createdAt,
        updatedAt: t.createdAt,
        category: {
          id: "other",
          name: "Outras Despesas",
          slug: "outros",
          color: "bg-gray-100 text-gray-800",
          icon: "help-circle",
          createdAt: new Date(),
        },
      };
    });

    return { expenses, total };
  } catch (error) {
    console.error("Erro ao listar despesas:", error);
    return { expenses: [], total: 0 };
  }
}

/**
 * Buscar despesa por ID
 */
export async function getExpenseById(
  id: string
): Promise<ExpenseWithCategory | null> {
  try {
    const expense = await prisma.expense.findUnique({
      where: { id },
      include: { category: true },
    });

    if (!expense) {
      return null;
    }

    return {
      ...expense,
      amount: expense.amount.toNumber(),
    };
  } catch (error) {
    console.error("Erro ao buscar despesa:", error);
    return null;
  }
}

/**
 * Criar despesa
 */
export async function createExpense(
  input: CreateExpenseInput
): Promise<FinancialActionResult> {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      return { success: false, error: "Não autenticado" };
    }

    const validated = createExpenseSchema.safeParse(input);
    if (!validated.success) {
      return {
        success: false,
        error: validated.error.issues[0].message,
      };
    }

    const data = validated.data;

    // Criar despesa e transação em transação
    await prisma.$transaction(async (tx) => {
      const expense = await tx.expense.create({
        data: {
          description: data.description,
          categoryId: data.categoryId,
          amount: data.amount,
          dueDate: data.dueDate,
          isPaid: data.isPaid,
          paidAt: data.paidAt || (data.isPaid ? new Date() : null),
          isRecurring: data.isRecurring,
          recurrence: data.recurrence,
          receiptUrl: data.receiptUrl,
          notes: data.notes,
        },
      });

      // Se já foi pago, registrar transação
      if (data.isPaid) {
        await tx.transaction.create({
          data: {
            type: TransactionType.EXPENSE,
            amount: data.amount,
            date: data.paidAt || new Date(),
            description: data.description,
            expenseId: expense.id,
          },
        });
      }
    });

    revalidatePath("/financial");

    return {
      success: true,
      message: "Despesa criada com sucesso!",
    };
  } catch (error) {
    console.error("Erro ao criar despesa:", error);
    return { success: false, error: "Erro interno ao criar despesa" };
  }
}

/**
 * Atualizar despesa
 */
export async function updateExpense(
  input: UpdateExpenseInput
): Promise<FinancialActionResult> {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      return { success: false, error: "Não autenticado" };
    }

    const validated = updateExpenseSchema.safeParse(input);
    if (!validated.success) {
      return {
        success: false,
        error: validated.error.issues[0].message,
      };
    }

    const { id, ...data } = validated.data;

    await prisma.expense.update({
      where: { id },
      data,
    });

    revalidatePath("/financial");

    return {
      success: true,
      message: "Despesa atualizada com sucesso!",
    };
  } catch (error) {
    console.error("Erro ao atualizar despesa:", error);
    return { success: false, error: "Erro interno ao atualizar despesa" };
  }
}

/**
 * Marcar despesa como paga
 */
export async function markExpenseAsPaid(
  id: string
): Promise<FinancialActionResult> {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      return { success: false, error: "Não autenticado" };
    }

    const expense = await prisma.expense.findUnique({ where: { id } });
    if (!expense) {
      return { success: false, error: "Despesa não encontrada" };
    }

    if (expense.isPaid) {
      return { success: false, error: "Despesa já foi paga" };
    }

    await prisma.$transaction([
      prisma.expense.update({
        where: { id },
        data: { isPaid: true, paidAt: new Date() },
      }),
      prisma.transaction.create({
        data: {
          type: TransactionType.EXPENSE,
          amount: expense.amount,
          date: new Date(),
          description: expense.description,
          expenseId: id,
        },
      }),
    ]);

    revalidatePath("/financial");

    return {
      success: true,
      message: "Despesa marcada como paga!",
    };
  } catch (error) {
    console.error("Erro ao marcar despesa como paga:", error);
    return { success: false, error: "Erro interno ao marcar despesa como paga" };
  }
}

/**
 * Excluir despesa
 */
export async function deleteExpense(id: string): Promise<FinancialActionResult> {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      return { success: false, error: "Não autenticado" };
    }

    // Excluir transação associada e despesa
    await prisma.$transaction([
      prisma.transaction.deleteMany({ where: { expenseId: id } }),
      prisma.expense.delete({ where: { id } }),
    ]);

    revalidatePath("/financial");

    return {
      success: true,
      message: "Despesa excluída com sucesso!",
    };
  } catch (error) {
    console.error("Erro ao excluir despesa:", error);
    return { success: false, error: "Erro interno ao excluir despesa" };
  }
}

// ========== RECEITAS ==========

/**
 * Listar receitas
 */
/**
 * Listar receitas (unificado: manuais + reservas)
 */
export async function getRevenues(
  filters?: PeriodFilters & { source?: string },
  page = 1,
  limit = 20
): Promise<{ revenues: Revenue[]; total: number }> {
  try {
    const skip = (page - 1) * limit;

    const where: Prisma.TransactionWhereInput = {
      type: TransactionType.INCOME,
    };

    if (filters?.startDate && filters?.endDate) {
      where.date = {
        gte: filters.startDate,
        lte: filters.endDate,
      };
    }

    // Filtro por origem (source) é mais complexo pois depende de relacionamentos
    // Se o filtro existir, precisaremos filtrar em memória ou fazer queries separadas
    // Por simplificação, se houver filtro de source, buscamos apenas Revenue
    // TODO: Implementar filtro de source unificado no banco se necessário

    const [transactions, total] = await Promise.all([
      prisma.transaction.findMany({
        where,
        orderBy: { date: "desc" },
        skip,
        take: limit,
        include: {
          revenue: true,
          booking: {
            select: { id: true, checkIn: true, checkOut: true },
          },
        },
      }),
      prisma.transaction.count({ where }),
    ]);

    const revenues: Revenue[] = transactions.map((t) => {
      // Se tiver registro de Revenue (receita manual), usa os dados dele
      if (t.revenue) {
        return {
          id: t.revenue.id,
          description: t.revenue.description,
          source: t.revenue.source,
          amount: t.amount.toNumber(),
          receivedAt: t.date,
          bookingId: t.revenue.bookingId,
          notes: t.revenue.notes,
          createdAt: t.revenue.createdAt,
          updatedAt: t.revenue.updatedAt,
        };
      }

      // Se for transação de reserva
      if (t.booking) {
        return {
          id: t.id, // Usa ID da transação se não tiver revenue
          description: t.description,
          source: "BOOKING" as RevenueSource,
          amount: t.amount.toNumber(),
          receivedAt: t.date,
          bookingId: t.bookingId,
          notes: `Reserva gerada automaticamente`,
          createdAt: t.createdAt,
          updatedAt: t.createdAt,
        };
      }

      // Outras transações de entrada
      return {
        id: t.id,
        description: t.description,
        source: "OTHER" as RevenueSource,
        amount: t.amount.toNumber(),
        receivedAt: t.date,
        bookingId: null,
        notes: null,
        createdAt: t.createdAt,
        updatedAt: t.createdAt,
      };
    });

    // Se houver filtro de source, aplicar em memória (fallback)
    if (filters?.source) {
      const filtered = revenues.filter(r => r.source === filters.source);
      return { revenues: filtered, total: filtered.length };
    }

    return { revenues, total };
  } catch (error) {
    console.error("Erro ao listar receitas:", error);
    return { revenues: [], total: 0 };
  }
}

/**
 * Listar todas as transações (Extrato)
 */
export async function getTransactions(
  filters?: PeriodFilters & { type?: TransactionType },
  page = 1,
  limit = 50
): Promise<{ transactions: any[]; total: number }> {
  try {
    const skip = (page - 1) * limit;

    const where: Prisma.TransactionWhereInput = {};

    if (filters?.startDate && filters?.endDate) {
      where.date = {
        gte: filters.startDate,
        lte: filters.endDate,
      };
    }

    if (filters?.type) {
      where.type = filters.type;
    }

    const [transactions, total] = await Promise.all([
      prisma.transaction.findMany({
        where,
        orderBy: { date: "desc" },
        skip,
        take: limit,
        include: {
          booking: {
            select: { bookingNumber: true, guest: { select: { name: true } } }
          },
          revenue: { select: { description: true, source: true } },
          expense: { 
            include: { category: { select: { name: true, color: true, icon: true } } } 
          },
          purchase: { select: { supplier: true } },
        },
      }),
      prisma.transaction.count({ where }),
    ]);

    return { transactions, total };
  } catch (error) {
    console.error("Erro ao listar transações:", error);
    return { transactions: [], total: 0 };
  }
}

/**
 * Criar receita manual
 */
export async function createRevenue(
  input: CreateRevenueInput
): Promise<FinancialActionResult> {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      return { success: false, error: "Não autenticado" };
    }

    const validated = createRevenueSchema.safeParse(input);
    if (!validated.success) {
      return {
        success: false,
        error: validated.error.issues[0].message,
      };
    }

    const data = validated.data;

    await prisma.$transaction(async (tx) => {
      const revenue = await tx.revenue.create({
        data: {
          description: data.description,
          source: data.source,
          amount: data.amount,
          receivedAt: data.receivedAt,
          bookingId: data.bookingId,
          notes: data.notes,
        },
      });

      await tx.transaction.create({
        data: {
          type: TransactionType.INCOME,
          amount: data.amount,
          date: data.receivedAt,
          description: data.description,
          revenueId: revenue.id,
        },
      });
    });

    revalidatePath("/financial");

    return {
      success: true,
      message: "Receita criada com sucesso!",
    };
  } catch (error) {
    console.error("Erro ao criar receita:", error);
    return { success: false, error: "Erro interno ao criar receita" };
  }
}

/**
 * Buscar receita por ID
 */
export async function getRevenueById(id: string): Promise<{ success: boolean; revenue?: Revenue; error?: string }> {
  try {
    const revenue = await prisma.revenue.findUnique({
      where: { id },
    });

    if (!revenue) {
      return { success: false, error: "Receita não encontrada" };
    }

    return {
      success: true,
      revenue: {
        ...revenue,
        amount: revenue.amount.toNumber(),
      },
    };
  } catch (error) {
    console.error("Erro ao buscar receita:", error);
    return { success: false, error: "Erro interno ao buscar receita" };
  }
}

/**
 * Atualizar receita
 */
export async function updateRevenue(input: UpdateRevenueInput): Promise<FinancialActionResult> {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      return { success: false, error: "Não autenticado" };
    }

    const validated = updateRevenueSchema.safeParse(input);
    if (!validated.success) {
      return {
        success: false,
        error: validated.error.issues[0].message,
      };
    }

    const { id, ...data } = validated.data;

    // Atualizar receita e possivelmente a transação
    // Se mudar valor ou data, transação também deve mudar
    await prisma.$transaction(async (tx) => {
      const updatedRevenue = await tx.revenue.update({
        where: { id },
        data,
      });

      // Atualizar transação associada
      // Assumindo 1:1, buscamos pela revenueId
      await tx.transaction.updateMany({
        where: { revenueId: id },
        data: {
          description: data.description, // Se mudou descrição
          amount: data.amount, // Se mudou valor
          date: data.receivedAt, // Se mudou data
        },
      });
    });

    revalidatePath("/financial");

    return {
      success: true,
      message: "Receita atualizada com sucesso!",
    };
  } catch (error) {
    console.error("Erro ao atualizar receita:", error);
    return { success: false, error: "Erro interno ao atualizar receita" };
  }
}

/**
 * Excluir receita
 */
export async function deleteRevenue(id: string): Promise<FinancialActionResult> {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      return { success: false, error: "Não autenticado" };
    }

    // Ao excluir receita, excluir transação (cascade geralmente cuida disso, mas explícito é melhor se não tiver cascade)
    // Mas Transaction -> Revenue (optional)
    // Se Revenue for deletada, Transaction pode ficar órfã ou ser deletada.
    // Melhor deletar a transação explicitamente se ela foi criada para esta receita.
    await prisma.$transaction([
      prisma.transaction.deleteMany({ where: { revenueId: id } }),
      prisma.revenue.delete({ where: { id } }),
    ]);

    revalidatePath("/financial");

    return {
      success: true,
      message: "Receita excluída com sucesso!",
    };
  } catch (error) {
    console.error("Erro ao excluir receita:", error);
    return { success: false, error: "Erro interno ao excluir receita" };
  }
}

// ========== FLUXO DE CAIXA ==========

/**
 * Obter fluxo de caixa do período
 */
export async function getCashFlow(
  startDate: Date,
  endDate: Date
): Promise<CashFlow> {
  try {
    const transactions = await prisma.transaction.findMany({
      where: {
        date: { gte: startDate, lte: endDate },
      },
      orderBy: { date: "desc" },
    });

    const totalIncome = transactions
      .filter((t) => t.type === TransactionType.INCOME)
      .reduce((sum, t) => sum + t.amount.toNumber(), 0);

    const totalExpenses = transactions
      .filter((t) => t.type === TransactionType.EXPENSE)
      .reduce((sum, t) => sum + t.amount.toNumber(), 0);

    return {
      currentBalance: totalIncome - totalExpenses,
      totalIncome,
      totalExpenses,
      periodStart: startDate,
      periodEnd: endDate,
      transactions: transactions.map((t) => ({
        ...t,
        amount: t.amount.toNumber(),
      })),
    };
  } catch (error) {
    console.error("Erro ao buscar fluxo de caixa:", error);
    return {
      currentBalance: 0,
      totalIncome: 0,
      totalExpenses: 0,
      periodStart: startDate,
      periodEnd: endDate,
      transactions: [],
    };
  }
}

// ========== DRE ==========

/**
 * Gerar DRE do período
 */
// ========== CONFIGURAÇÕES SISTEMA (TAXAS) ==========

/**
 * Obter taxa de imposto do DRE (%)
 */
export async function getDRETaxRate(): Promise<number> {
  try {
    const config = await prisma.systemConfig.findUnique({
      where: { key: "dre_tax_rate" },
    });

    if (!config) return 6; // Valor default 6% (Simples Nacional aprox)

    return (config.value as any).rate || 0;
  } catch (error) {
    console.error("Erro ao buscar taxa DRE:", error);
    return 0;
  }
}

/**
 * Atualizar taxa de imposto do DRE
 */
export async function updateDRETaxRate(rate: number): Promise<FinancialActionResult> {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      return { success: false, error: "Não autenticado" };
    }

    await prisma.systemConfig.upsert({
      where: { key: "dre_tax_rate" },
      create: { key: "dre_tax_rate", value: { rate } },
      update: { value: { rate } },
    });

    revalidatePath("/financial/dre");

    return { success: true, message: "Taxa atualizada com sucesso!" };
  } catch (error) {
    console.error("Erro ao atualizar taxa DRE:", error);
    return { success: false, error: "Erro ao atualizar taxa" };
  }
}

// ========== DRE ==========

/**
 * Gerar DRE do período (unificado com impostos)
 */
export async function getDRE(startDate: Date, endDate: Date): Promise<DRE> {
  try {
    // Buscar taxa de imposto configurada
    const taxRate = await getDRETaxRate();

    // Buscar todas as transações do período com os detalhes necessários
    const transactions = await prisma.transaction.findMany({
      where: {
        date: { gte: startDate, lte: endDate },
      },
      include: {
        booking: true,
        revenue: true,
        expense: {
          include: { category: true },
        },
        purchase: true,
      },
    });

    // Separar Receitas e Despesas
    const incomeTransactions = transactions.filter(t => t.type === TransactionType.INCOME);
    const expenseTransactions = transactions.filter(t => t.type === TransactionType.EXPENSE);

    // 1. Processar Receitas
    let revenueBookings = 0;
    let revenueExtras = 0; // Futuro: se tivermos serviços extras
    let revenueOther = 0;

    incomeTransactions.forEach(t => {
      const amount = t.amount.toNumber();
      
      if (t.bookingId) {
        revenueBookings += amount;
      } else if (t.revenue?.source === "EXTRA_SERVICE") {
        revenueExtras += amount;
      } else {
        revenueOther += amount;
      }
    });

    const totalRevenue = revenueBookings + revenueExtras + revenueOther;
    
    // Calcular impostos e receita líquida
    const taxes = totalRevenue * (taxRate / 100);
    const netRevenue = totalRevenue - taxes;

    // 2. Processar Despesas por Categoria
    const expensesMap = new Map<string, number>();
    
    expenseTransactions.forEach(t => {
      const amount = t.amount.toNumber();
      let categoryName = "Outras Despesas";

      if (t.expense) {
        categoryName = t.expense.category.name;
      } else if (t.purchaseId) {
        categoryName = "Compra de Estoque";
      }

      expensesMap.set(categoryName, (expensesMap.get(categoryName) || 0) + amount);
    });

    const expenseCategories = Array.from(expensesMap.entries())
      .map(([categoryName, total]) => ({
        categoryName,
        total,
      }))
      .sort((a, b) => b.total - a.total); // Ordenar por valor decrescente

    const totalExpenses = expenseCategories.reduce((sum, e) => sum + e.total, 0);

    // 3. Resultado (Baseado na Receita Líquida)
    const result = netRevenue - totalExpenses;
    const margin = netRevenue > 0 ? (result / netRevenue) * 100 : 0;

    const period = `${startDate.toLocaleDateString("pt-BR")} - ${endDate.toLocaleDateString("pt-BR")}`;

    return {
      period,
      revenue: {
        bookings: revenueBookings,
        extras: revenueExtras,
        other: revenueOther,
        total: totalRevenue,
        taxes,
        netRevenue,
      },
      expenses: {
        byCategory: expenseCategories,
        total: totalExpenses,
      },
      result,
      margin,
    };
  } catch (error) {
    console.error("Erro ao gerar DRE:", error);
    return {
      period: "",
      revenue: { bookings: 0, extras: 0, other: 0, total: 0, taxes: 0, netRevenue: 0 },
      expenses: { byCategory: [], total: 0 },
      result: 0,
      margin: 0,
    };
  }
}

// ========== INICIALIZAÇÃO ==========

/**
 * Inicializar categorias de despesas padrão
 */
export async function initializeDefaultExpenseCategories(): Promise<FinancialActionResult> {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      return { success: false, error: "Não autenticado" };
    }

    const defaultCategories = [
      { name: "Folha Salarial", slug: "folha-salarial", icon: "👷", color: "#3b82f6" },
      { name: "Despesas Fixas", slug: "despesas-fixas", icon: "🏠", color: "#6366f1" },
      { name: "Despensa/Estoque", slug: "despensa", icon: "🛒", color: "#f59e0b" },
      { name: "Equipamentos", slug: "equipamentos", icon: "🔧", color: "#8b5cf6" },
      { name: "Variáveis", slug: "variaveis", icon: "📊", color: "#ec4899" },
      { name: "Imprevistos", slug: "imprevistos", icon: "⚠️", color: "#ef4444" },
      { name: "Manutenções", slug: "manutencoes", icon: "🔨", color: "#f97316" },
      { name: "Pró-labore", slug: "pro-labore", icon: "💼", color: "#10b981" },
    ];

    for (const cat of defaultCategories) {
      await prisma.expenseCategory.upsert({
        where: { slug: cat.slug },
        update: {},
        create: cat,
      });
    }

    revalidatePath("/financial");

    return {
      success: true,
      message: "Categorias padrão criadas com sucesso!",
    };
  } catch (error) {
    console.error("Erro ao criar categorias padrão:", error);
    return { success: false, error: "Erro interno ao criar categorias padrão" };
  }
}

/**
 * Buscar total de receitas pendentes (reservas com saldo devedor)
 */
export async function fetchPendingRevenues() {
  try {
    const bookings = await prisma.booking.findMany({
      where: {
        status: {
          notIn: ["CANCELLED", "NO_SHOW", "CHECKED_OUT"],
        },
      },
      select: {
        totalAmount: true,
        paidAmount: true,
      },
    });

    const totalPending = bookings.reduce((acc, booking) => {
      const remaining = booking.totalAmount.toNumber() - booking.paidAmount.toNumber();
      return acc + (remaining > 0 ? remaining : 0);
    }, 0);

    return totalPending;
  } catch (error) {
    console.error("Erro ao buscar receitas pendentes:", error);
    return 0;
  }
}
