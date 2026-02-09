/**
 * Script de limpeza do banco de dados financeiro
 * Remove todas as transações órfãs e dados inconsistentes
 */

import { prisma } from "../src/db";

async function cleanDatabase() {
  console.log("🧹 Iniciando limpeza do banco de dados financeiro...\n");

  try {
    // 1. Remover todas as transações (limpar completamente)
    const deletedTransactions = await prisma.transaction.deleteMany({});
    console.log(`✅ ${deletedTransactions.count} transações removidas`);

    // 2. Remover todas as despesas
    const deletedExpenses = await prisma.expense.deleteMany({});
    console.log(`✅ ${deletedExpenses.count} despesas removidas`);

    // 3. Remover todas as receitas manuais
    const deletedRevenues = await prisma.revenue.deleteMany({});
    console.log(`✅ ${deletedRevenues.count} receitas removidas`);

    // 4. Remover todos os itens de compra de estoque
    const deletedPurchaseItems = await prisma.stockPurchaseItem.deleteMany({});
    console.log(`✅ ${deletedPurchaseItems.count} itens de compra removidos`);

    // 5. Remover todas as compras de estoque
    const deletedPurchases = await prisma.stockPurchase.deleteMany({});
    console.log(`✅ ${deletedPurchases.count} compras de estoque removidas`);

    console.log("\n🎉 Limpeza concluída! Banco financeiro zerado.");
  } catch (error) {
    console.error("❌ Erro na limpeza:", error);
  } finally {
    await prisma.$disconnect();
  }
}

cleanDatabase();
