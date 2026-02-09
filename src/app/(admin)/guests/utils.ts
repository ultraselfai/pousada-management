/**
 * Utilitários para formatação de dados de hóspedes
 */

/**
 * Formata CPF para exibição (000.000.000-00)
 */
export function formatCpf(cpf: string): string {
  const cleaned = cpf.replace(/\D/g, "")
  if (cleaned.length !== 11) return cpf
  return cleaned.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4")
}

/**
 * Formata telefone para exibição
 */
export function formatPhone(phone: string): string {
  const cleaned = phone.replace(/\D/g, "")
  
  if (cleaned.length === 11) {
    return cleaned.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3")
  }
  if (cleaned.length === 10) {
    return cleaned.replace(/(\d{2})(\d{4})(\d{4})/, "($1) $2-$3")
  }
  
  return phone
}

/**
 * Formata data para exibição
 */
export function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date
  return d.toLocaleDateString("pt-BR")
}

/**
 * Formata valor monetário
 */
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value)
}
