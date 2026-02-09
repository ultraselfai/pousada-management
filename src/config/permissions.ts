export const PERMISSIONS = [
  { value: "overview", label: "Visão Geral", description: "Acesso à Dashboard e Mapa de Reservas" },
  { value: "management", label: "Gestão", description: "Hóspedes, Reservas e Orçamentos" },
  { value: "operations", label: "Operações", description: "Quartos, Estoque e Manutenção" },
  { value: "financial", label: "Financeiro", description: "Despesas, Receitas, Extrato e DRE" },
  { value: "settings", label: "Configurações", description: "Gestão de Usuários e Sistema" },
] as const;

export type Permission = typeof PERMISSIONS[number]["value"];
