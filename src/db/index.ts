/**
 * Database Client - Prisma 7 com Adapter PostgreSQL
 *
 * Prisma 7 requer um adapter obrigatório para conexão com o banco.
 * Usa singleton para evitar múltiplas conexões em desenvolvimento (hot reload).
 *
 * IMPORTANTE: Importamos do generated client para ter tipagens completas.
 * Usamos import relativo porque o Turbopack tem problemas com aliases para arquivos gerados.
 *
 * @see https://www.prisma.io/docs/orm/more/upgrade-guides/upgrading-versions/upgrading-to-prisma-7
 */

import { PrismaClient, Prisma } from "../generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

/**
 * Cria o adapter PostgreSQL para Prisma 7
 */
function createPrismaClient() {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error("DATABASE_URL environment variable is required");
  }

  const adapter = new PrismaPg({ connectionString });

  return new PrismaClient({
    adapter,
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
  });
}

const globalForPrisma = globalThis as unknown as {
  prisma: ReturnType<typeof createPrismaClient> | undefined;
};

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

// Exporta como default também para conveniência
export default prisma;

// Re-exporta tipos úteis do Prisma
export type { Prisma };
