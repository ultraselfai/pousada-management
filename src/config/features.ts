/**
 * Feature Registry - DEC-19
 * 
 * Registro central de todas as features do sistema.
 * Define quais features existem, seus labels e status.
 * 
 * Status:
 * - 'dev': Apenas visível no Decode Lab (sandbox de desenvolvimento)
 * - 'beta': Em fase de testes, pode ser ativada para clientes selecionados
 * - 'stable': Produção, pode ser ativada para qualquer cliente
 * 
 * Regra de Ouro:
 * - Features 'dev' só aparecem no Decode Lab
 * - Features 'stable' podem ser gerenciadas no Admin UI
 * - O Admin não vê features 'dev' na lista de ativação
 */

export type FeatureStatus = 'dev' | 'beta' | 'stable'

export interface Feature {
  /** Identificador único da feature (slug) */
  key: string
  /** Nome amigável para exibição */
  label: string
  /** Descrição curta da feature */
  description: string
  /** Status atual da feature */
  status: FeatureStatus
  /** Ícone da feature (Lucide icon name) */
  icon?: string
  /** Categoria da feature */
  category?: 'core' | 'productivity' | 'analytics' | 'integration' | 'experimental'
  /** Rota associada à feature (para sidebar dinâmico) */
  route?: string
  /** Se deve aparecer no sidebar do cliente */
  showInSidebar?: boolean
}

/**
 * Registry de Features
 * 
 * Adicione novas features aqui conforme forem desenvolvidas.
 * Comece sempre com status 'dev' até a feature estar pronta.
 */
export const featureRegistry: Feature[] = [
  // ===== CORE FEATURES =====
  {
    key: 'dashboard',
    label: 'Dashboard',
    description: 'Painel principal com métricas e visão geral',
    status: 'stable',
    icon: 'LayoutDashboard',
    category: 'core',
    route: '/dashboard',
    showInSidebar: true,
  },
  {
    key: 'users',
    label: 'Gestão de Usuários',
    description: 'Gerenciar usuários e permissões da organização',
    status: 'stable',
    icon: 'Users',
    category: 'core',
    route: '/users',
    showInSidebar: true,
  },
  {
    key: 'settings',
    label: 'Configurações',
    description: 'Configurações da conta e organização',
    status: 'stable',
    icon: 'Settings',
    category: 'core',
    route: '/settings',
    showInSidebar: true,
  },

  // ===== PRODUCTIVITY FEATURES =====
  {
    key: 'calendar',
    label: 'Calendário',
    description: 'Agendamento e gestão de eventos',
    status: 'stable',
    icon: 'Calendar',
    category: 'productivity',
    route: '/calendar',
    showInSidebar: true,
  },
  {
    key: 'tasks',
    label: 'Tarefas',
    description: 'Gestão de tarefas e projetos',
    status: 'stable',
    icon: 'CheckSquare',
    category: 'productivity',
    route: '/tasks',
    showInSidebar: true,
  },
  {
    key: 'mail',
    label: 'Email',
    description: 'Caixa de entrada integrada',
    status: 'beta',
    icon: 'Mail',
    category: 'productivity',
    route: '/mail',
    showInSidebar: true,
  },
  {
    key: 'chat',
    label: 'Chat',
    description: 'Comunicação em tempo real',
    status: 'beta',
    icon: 'MessageSquare',
    category: 'productivity',
    route: '/chat',
    showInSidebar: true,
  },

  // ===== ANALYTICS FEATURES =====
  {
    key: 'analytics',
    label: 'Analytics',
    description: 'Relatórios e métricas avançadas',
    status: 'dev',
    icon: 'BarChart3',
    category: 'analytics',
    route: '/analytics',
    showInSidebar: true,
  },

  // ===== INTEGRATION FEATURES =====
  {
    key: 'r2-upload',
    label: 'Upload de Arquivos',
    description: 'Upload de arquivos para Cloudflare R2',
    status: 'stable',
    icon: 'Upload',
    category: 'integration',
    route: '/upload',
    showInSidebar: true,
  },

  // ===== EXPERIMENTAL FEATURES (Decode Lab only) =====
  {
    key: 'projects',
    label: 'Projetos',
    description: 'Formulários personalizados para briefings (DEC-28)',
    status: 'dev',
    icon: 'FolderKanban',
    category: 'experimental',
    route: '/projects',
    showInSidebar: true,
  },
  {
    key: 'financeiro',
    label: 'Módulo Financeiro',
    description: 'Gestão financeira completa (em desenvolvimento)',
    status: 'dev',
    icon: 'DollarSign',
    category: 'experimental',
    route: '/financeiro',
    showInSidebar: true,
  },
  {
    key: 'ai-assistant',
    label: 'Assistente IA',
    description: 'Assistente virtual com IA (em desenvolvimento)',
    status: 'dev',
    icon: 'Bot',
    category: 'experimental',
    route: '/ai',
    showInSidebar: true,
  },
]

// ===== HELPERS =====

/**
 * Busca uma feature pelo key
 */
export function getFeature(key: string): Feature | undefined {
  return featureRegistry.find(f => f.key === key)
}

/**
 * Retorna features por status
 */
export function getFeaturesByStatus(status: FeatureStatus): Feature[] {
  return featureRegistry.filter(f => f.status === status)
}

/**
 * Retorna features que podem ser ativadas para clientes (não dev)
 */
export function getActivatableFeatures(): Feature[] {
  return featureRegistry.filter(f => f.status !== 'dev')
}

/**
 * Retorna features de desenvolvimento (apenas Decode Lab)
 */
export function getDevFeatures(): Feature[] {
  return featureRegistry.filter(f => f.status === 'dev')
}

/**
 * Retorna todas as features por categoria
 */
export function getFeaturesByCategory(category: Feature['category']): Feature[] {
  return featureRegistry.filter(f => f.category === category)
}

/**
 * Verifica se uma feature key existe no registry
 */
export function isValidFeatureKey(key: string): boolean {
  return featureRegistry.some(f => f.key === key)
}

/**
 * Retorna features para exibir no sidebar baseado nas features ativas da organização
 */
export function getSidebarFeatures(allowedFeatures: string[]): Feature[] {
  return featureRegistry.filter(f => 
    f.showInSidebar && 
    f.route && 
    allowedFeatures.includes(f.key)
  )
}
