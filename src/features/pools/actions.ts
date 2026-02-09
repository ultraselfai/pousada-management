"use server"

import { prisma } from "@/db"
import { revalidatePath } from "next/cache"

export async function getPools() {
  return await prisma.pool.findMany({
    orderBy: { name: "asc" },
  })
}

export async function createPool(name: string) {
  const pool = await prisma.pool.create({
    data: { name },
  })
  revalidatePath("/overview")
  return pool
}

export async function updatePoolStatus(id: string, status: string) {
  const pool = await prisma.pool.update({
    where: { id },
    data: { status },
  })
  revalidatePath("/overview")
  return pool
}
