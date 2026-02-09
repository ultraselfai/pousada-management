/**
 * Stock Types
 *
 * Tipos TypeScript para a feature de Estoque.
 */

/**
 * Categoria de estoque
 */
export interface StockCategory {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
  color: string | null;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Categoria com contagem de itens
 */
export interface StockCategoryWithCount extends StockCategory {
  _count: {
    items: number;
  };
  lowStockCount: number;
}

/**
 * Item de estoque
 */
export interface StockItem {
  id: string;
  name: string;
  categoryId: string;
  unit: string;
  currentStock: number;
  minimumStock: number;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Item com categoria
 */
export interface StockItemWithCategory extends StockItem {
  category: StockCategory;
}

/**
 * Item de compra
 */
export interface PurchaseItem {
  itemId: string;
  itemName?: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

/**
 * Compra de estoque
 */
export interface StockPurchase {
  id: string;
  purchaseDate: Date;
  supplier: string | null;
  totalAmount: number;
  receiptUrl: string | null;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Compra com itens
 */
export interface StockPurchaseWithItems extends StockPurchase {
  items: {
    id: string;
    itemId: string;
    item: { name: string };
    quantity: number;
    unitPrice: number;
    totalPrice: number;
  }[];
}

/**
 * Resultado de ação genérico
 */
export interface StockActionResult {
  success: boolean;
  error?: string;
  message?: string;
}

/**
 * Resultado de listagem de categorias
 */
export interface CategoriesListResult {
  success: boolean;
  categories: StockCategoryWithCount[];
  error?: string;
}

/**
 * Resultado de listagem de itens
 */
export interface ItemsListResult {
  success: boolean;
  items: StockItem[];
  total: number;
  error?: string;
}

/**
 * Resultado de listagem de compras
 */
export interface PurchasesListResult {
  success: boolean;
  purchases: StockPurchaseWithItems[];
  total: number;
  error?: string;
}

/**
 * Alertas de estoque baixo
 */
export interface LowStockAlert {
  id: string;
  name: string;
  categoryName: string;
  currentStock: number;
  minimumStock: number;
  unit: string;
  deficit: number;
}

/**
 * Categorias padrão
 */
export const DEFAULT_STOCK_CATEGORIES = [
  { name: "Café da Manhã", slug: "cafe-da-manha", icon: "☕", color: "#f59e0b" },
  { name: "Produtos de Piscina", slug: "piscina", icon: "🏊", color: "#0ea5e9" },
  { name: "Produtos de Limpeza", slug: "limpeza", icon: "🧹", color: "#22c55e" },
  { name: "Equipamentos", slug: "equipamentos", icon: "🔧", color: "#6366f1" },
  { name: "Manutenções", slug: "manutencoes", icon: "🛠️", color: "#ef4444" },
] as const;
