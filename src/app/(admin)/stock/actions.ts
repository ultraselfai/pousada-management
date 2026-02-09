"use server"

import { getCategories, getLowStockItems, getItems, createCategory } from "@/features/stock"

/**
 * Action para buscar categorias de estoque
 */
export async function fetchCategories() {
  const result = await getCategories()
  return result
}

/**
 * Action para buscar itens com estoque baixo
 */
export async function fetchLowStockItems() {
  const result = await getLowStockItems()
  return result
}

/**
 * Action para buscar itens de uma categoria
 */
export async function fetchCategoryItems(categoryId: string) {
  const result = await getItems(categoryId)
  return result
}

/**
 * Action para criar categoria de estoque
 */
export async function createStockCategory(data: { name: string; icon: string; color: string }) {
  // Gerar slug
  const slug = data.name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")

  const result = await createCategory({
    name: data.name,
    slug,
    icon: data.icon,
    color: data.color,
  })
  return result
}
