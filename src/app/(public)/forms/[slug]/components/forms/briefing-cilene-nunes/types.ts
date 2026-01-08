/**
 * Types for Briefing DNA da Marca Form (DEC-29)
 */

export interface BriefingFormData {
  // Step 1: Ponto Zero
  pontoZero: string;

  // Step 2: Conquistas
  conquistas: string;

  // Step 3: DNA da Marca
  brandKeywords: string[];
  customKeywords: string[];

  // Step 4: Perfil do Cliente
  clientConcern: string | null;
  clientConcernCustom: string;

  // Step 5: Transição de Carreira
  careerPositioning: string | null;

  // Step 6 & 7: Referências Visuais
  logoReferences: {
    id: string;
    liked: boolean | null;
  }[];
  logoRanking: string[]; // IDs ordenados

  // Step 8 & 9: Tipografia
  typographyReferences: {
    id: string;
    liked: boolean | null;
  }[];
  typographyRanking: string[];

  // Step 10: Paleta de Cores (até 2)
  selectedPalettes: string[];

  // Step 11: Ranking de Elementos
  elementsRanking: string[];

  // Step 12: O "Não" Absoluto
  absoluteNo: string;

  // Step 13: Referências Extras
  extraBrandReferences: string;
  uploadedFiles: File[];
  uploadedFilesUrls: UploadedFileInfo[]; // URLs dos arquivos já uploadados
}

export interface UploadedFileInfo {
  name: string;
  publicUrl: string;
  key: string;
  size: number;
  type: string;
}

export interface StepConfig {
  id: number;
  title: string;
  description?: string;
}

export const BRAND_KEYWORDS = [
  { id: "acolhedora", label: "Acolhedora", subtitle: "Essência" },
  { id: "cientifica", label: "Científica", subtitle: "Lado Neuro" },
  { id: "ludica", label: "Lúdica", subtitle: "Lado Criança" },
  { id: "segura", label: "Segura", subtitle: "Confiança" },
  { id: "transformadora", label: "Transformadora", subtitle: "Resultado" },
  { id: "empatica", label: "Empática", subtitle: "Atendimento" },
  { id: "seria", label: "Séria", subtitle: "Profissionalismo" },
  { id: "alegre", label: "Alegre", subtitle: "Ambiente" },
  { id: "organizada", label: "Organizada", subtitle: "Processo" },
  { id: "moderna", label: "Moderna", subtitle: "Atualizada" },
  { id: "calma", label: "Calma", subtitle: "Sensorial" },
  { id: "estrategica", label: "Estratégica", subtitle: "Intervenção" },
  { id: "clara", label: "Clara", subtitle: "Comunicação" },
  { id: "proxima", label: "Próxima", subtitle: "Relacionamento" },
  { id: "sofisticada", label: "Sofisticada", subtitle: "Valor percebido" },
] as const;

export const CLIENT_CONCERNS = [
  {
    id: "diagnostico",
    label: "O Diagnóstico",
    description:
      'Pais angustiados que querem entender o que o filho tem (Buscam autoridade técnica/neuro).',
  },
  {
    id: "desempenho",
    label: "O Desempenho Escolar",
    description:
      "Pais preocupados com notas e alfabetização (Buscam a experiência pedagógica dela).",
  },
  {
    id: "comportamento",
    label: "O Comportamento/Emoção",
    description:
      "Pais que buscam acolhimento e inteligência emocional para a criança (Buscam a parte afetiva/psico).",
  },
] as const;

export const CAREER_POSITIONS = [
  {
    id: "destacar",
    label: "Quero destacar muito",
    description:
      '"Sou a especialista que conhece a realidade da sala de aula na prática." (Posicionamento Prático).',
  },
  {
    id: "neutra",
    label: "Quero ser neutra",
    description:
      "Minha experiência ajuda, mas quero focar 100% na minha nova identidade clínica e científica. (Posicionamento Clínico/Médico).",
  },
  {
    id: "distanciar",
    label: "Quero me distanciar",
    description:
      'Quero que me vejam como Doutora/Terapeuta, e não mais como "Tia/Professora". (Posicionamento de Autoridade Elevada).',
  },
] as const;

export const COLOR_PALETTES = [
  {
    id: "candy",
    name: "Candy Colors",
    description: "Calma e infantil",
    colors: ["#FFB6C1", "#87CEEB", "#FFFACD", "#DDA0DD"],
  },
  {
    id: "vibrante",
    name: "Vibrante",
    description: "Energia e estímulo",
    colors: ["#FF6B35", "#0066FF", "#FFD700", "#32CD32"],
  },
  {
    id: "natureza",
    name: "Natureza/Acolhimento",
    description: "Orgânico e maduro",
    colors: ["#CD5C5C", "#556B2F", "#DAA520", "#D2B48C"],
  },
  {
    id: "confianca",
    name: "Confiança",
    description: "Clínico e sério",
    colors: ["#000080", "#808080", "#20B2AA", "#FFFFFF"],
  },
  {
    id: "terroso",
    name: "Terroso/Aconchegante",
    description: "Acolhedor e elegante",
    colors: ["#8B4513", "#D2691E", "#F5DEB3", "#FFF8DC"],
  },
  {
    id: "suave",
    name: "Suave/Delicado",
    description: "Leveza e tranquilidade",
    colors: ["#E6E6FA", "#FFF0F5", "#F0FFF0", "#FAFAD2"],
  },
] as const;

export const BRAND_ELEMENTS = [
  { id: "cerebro", label: "Cérebro", icon: "🧠" },
  { id: "mao", label: "Mão/Braço", icon: "🤲" },
  { id: "borboletas", label: "Borboletas", icon: "🦋" },
  { id: "quebracabeca", label: "Peça de Quebra-cabeça", icon: "🧩" },
  { id: "livro", label: "Livro", icon: "📖" },
] as const;

export const ELEMENT_POSITIONS = [
  { position: 1, label: "O Protagonista", description: "Vai ser o destaque do Logo." },
  { position: 2, label: "O Coadjuvante", description: "Pode aparecer integrado ao logo de forma sutil." },
  { position: 3, label: "O Cenário", description: "Vai virar estampa ou ícone de apoio (papelaria)." },
  { position: 4, label: "O Cenário", description: "Vai virar estampa ou ícone de apoio." },
  { position: 5, label: "Eliminado", description: "Não é essencial neste momento." },
] as const;

// Logo reference images (Step 4/5)
export const LOGO_REFERENCES = [
  { id: "logo-1", src: "/form-step-5/ref1.jpeg", alt: "Referência de logo 1" },
  { id: "logo-2", src: "/form-step-5/ref2.jpeg", alt: "Referência de logo 2" },
  { id: "logo-3", src: "/form-step-5/ref3.jpeg", alt: "Referência de logo 3" },
  { id: "logo-4", src: "/form-step-5/ref4.jpg", alt: "Referência de logo 4" },
  { id: "logo-5", src: "/form-step-5/ref5.png", alt: "Referência de logo 5" },
  { id: "logo-6", src: "/form-step-5/ref6.jpg", alt: "Referência de logo 6" },
  { id: "logo-7", src: "/form-step-5/ref7.jpg", alt: "Referência de logo 7" },
  { id: "logo-8", src: "/form-step-5/ref8.jpg", alt: "Referência de logo 8" },
  { id: "logo-9", src: "/form-step-5/ref9.jpg", alt: "Referência de logo 9" },
  { id: "logo-10", src: "/form-step-5/ref10.jpg", alt: "Referência de logo 10" },
  { id: "logo-11", src: "/form-step-5/ref11.jpg", alt: "Referência de logo 11" },
  { id: "logo-12", src: "/form-step-5/ref12.jpg", alt: "Referência de logo 12" },
];

// Typography reference images (Step 6/7)
export const TYPOGRAPHY_REFERENCES = [
  { id: "typo-1", src: "/form-step-7/reftipograf.jpg", alt: "Tipografia 1" },
  { id: "typo-2", src: "/form-step-7/reftipograf2.jpg", alt: "Tipografia 2" },
  { id: "typo-3", src: "/form-step-7/tipograf3.jpg", alt: "Tipografia 3" },
  { id: "typo-4", src: "/form-step-7/tipograf4.jpg", alt: "Tipografia 4" },
  { id: "typo-5", src: "/form-step-7/ref7.jpg", alt: "Tipografia 5" },
  { id: "typo-6", src: "/form-step-7/ref8.jpg", alt: "Tipografia 6" },
  { id: "typo-7", src: "/form-step-7/ref9.jpg", alt: "Tipografia 7" },
  { id: "typo-8", src: "/form-step-7/ref10.jpg", alt: "Tipografia 8" },
];

// Theme colors from PRD
export const FORM_THEME = {
  background: "#FAF9F5",
  progressBar: "#D97757",
  badgeBackground: "#F0EEE6",
  badgeText: "#3D3D3A",
  title: "#3D3D3A",
  description: "#545450",
  footerBackground: "#F0EEE6",
  buttonBackground: "#D97757",
  buttonText: "#FAF9F5",
  fontBody: "'Manrope', sans-serif",
  fontTitle: "'Crimson Text', serif",
} as const;
