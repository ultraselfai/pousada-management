// Armazenamento local para dados persistentes do gerador de reservas

const STORAGE_KEYS = {
  LAST_BOOKING_NUMBER: "pousada_last_booking_number",
  CUSTOM_ACCOMMODATIONS: "pousada_custom_accommodations",
};

// Número inicial da sequência
const INITIAL_BOOKING_NUMBER = 57463839;

// Ocupações padrão
const DEFAULT_ACCOMMODATIONS = ["Suíte Casal", "Suíte Família"];

/**
 * Obtém o próximo número de reserva e incrementa o contador
 */
export function getNextBookingNumber(): number {
  if (typeof window === "undefined") return INITIAL_BOOKING_NUMBER + 1;

  const stored = localStorage.getItem(STORAGE_KEYS.LAST_BOOKING_NUMBER);
  const lastNumber = stored ? parseInt(stored, 10) : INITIAL_BOOKING_NUMBER;
  const nextNumber = lastNumber + 1;

  localStorage.setItem(STORAGE_KEYS.LAST_BOOKING_NUMBER, nextNumber.toString());

  return nextNumber;
}

/**
 * Obtém o número de reserva atual (sem incrementar)
 */
export function getCurrentBookingNumber(): number {
  if (typeof window === "undefined") return INITIAL_BOOKING_NUMBER + 1;

  const stored = localStorage.getItem(STORAGE_KEYS.LAST_BOOKING_NUMBER);
  const lastNumber = stored ? parseInt(stored, 10) : INITIAL_BOOKING_NUMBER;

  return lastNumber + 1;
}

/**
 * Obtém todas as ocupações (padrão + personalizadas)
 */
export function getAccommodations(): string[] {
  if (typeof window === "undefined") return DEFAULT_ACCOMMODATIONS;

  const stored = localStorage.getItem(STORAGE_KEYS.CUSTOM_ACCOMMODATIONS);
  const custom = stored ? JSON.parse(stored) : [];

  return [...DEFAULT_ACCOMMODATIONS, ...custom];
}

/**
 * Adiciona uma nova ocupação personalizada
 */
export function addCustomAccommodation(name: string): string[] {
  if (typeof window === "undefined") return DEFAULT_ACCOMMODATIONS;

  const stored = localStorage.getItem(STORAGE_KEYS.CUSTOM_ACCOMMODATIONS);
  const custom: string[] = stored ? JSON.parse(stored) : [];

  if (!custom.includes(name) && !DEFAULT_ACCOMMODATIONS.includes(name)) {
    custom.push(name);
    localStorage.setItem(
      STORAGE_KEYS.CUSTOM_ACCOMMODATIONS,
      JSON.stringify(custom)
    );
  }

  return [...DEFAULT_ACCOMMODATIONS, ...custom];
}

/**
 * Formata CPF: 49684071817 → 496.840.718-17
 */
export function formatCPF(value: string): string {
  const numbers = value.replace(/\D/g, "").slice(0, 11);

  if (numbers.length <= 3) return numbers;
  if (numbers.length <= 6) return `${numbers.slice(0, 3)}.${numbers.slice(3)}`;
  if (numbers.length <= 9)
    return `${numbers.slice(0, 3)}.${numbers.slice(3, 6)}.${numbers.slice(6)}`;

  return `${numbers.slice(0, 3)}.${numbers.slice(3, 6)}.${numbers.slice(6, 9)}-${numbers.slice(9)}`;
}

/**
 * Formata telefone: +5511998989898 → +55 (11) 9 9898-9898
 */
export function formatPhone(value: string): string {
  // Remove tudo exceto números e +
  let cleaned = value.replace(/[^\d+]/g, "");

  // Se começa com +, mantém
  const hasPlus = cleaned.startsWith("+");
  const numbers = cleaned.replace(/\D/g, "");

  if (numbers.length === 0) return hasPlus ? "+" : "";

  // Telefone brasileiro com código do país (13 dígitos: 55 + 11 + 9 + 8 dígitos)
  if (numbers.length >= 12 && numbers.startsWith("55")) {
    const country = numbers.slice(0, 2);
    const ddd = numbers.slice(2, 4);
    const firstDigit = numbers.slice(4, 5);
    const firstPart = numbers.slice(5, 9);
    const secondPart = numbers.slice(9, 13);

    if (numbers.length >= 13) {
      return `+${country} (${ddd}) ${firstDigit} ${firstPart}-${secondPart}`;
    }
  }

  // Telefone brasileiro sem código do país (11 dígitos: 11 + 9 + 8 dígitos)
  if (numbers.length >= 10 && !numbers.startsWith("55")) {
    const ddd = numbers.slice(0, 2);
    const rest = numbers.slice(2);

    if (rest.length === 9) {
      // Celular com 9
      return `(${ddd}) ${rest.slice(0, 1)} ${rest.slice(1, 5)}-${rest.slice(5)}`;
    } else if (rest.length === 8) {
      // Fixo
      return `(${ddd}) ${rest.slice(0, 4)}-${rest.slice(4)}`;
    }
  }

  // Retorna como está se não se encaixa nos padrões
  return hasPlus ? `+${numbers}` : numbers;
}

/**
 * Formata data ISO para exibição: 2025-01-14 → 14/01/2025
 */
export function formatDateBR(isoDate: string): string {
  if (!isoDate) return "";
  const [year, month, day] = isoDate.split("-");
  return `${day}/${month}/${year}`;
}

/**
 * Calcula número de dias entre duas datas
 */
export function calculateDaysBetween(startDate: string, endDate: string): number {
  if (!startDate || !endDate) return 0;

  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = end.getTime() - start.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return diffDays > 0 ? diffDays : 0;
}

/**
 * Formata valor em reais: 1064 → R$ 1.064,00
 */
export function formatCurrency(value: number): string {
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

/**
 * Formata valor monetário para input: 1234.56 → "1.234,56"
 * Aceita string ou number e retorna string formatada
 */
export function formatCurrencyInput(value: string | number): string {
  // Se for número, converte para string com 2 decimais
  if (typeof value === "number") {
    return value.toLocaleString("pt-BR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }

  // Remove tudo exceto números
  const numbers = value.replace(/\D/g, "");
  
  if (numbers.length === 0) return "";
  
  // Converte para centavos e depois para reais
  const cents = parseInt(numbers, 10);
  const reais = cents / 100;
  
  return reais.toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

/**
 * Converte string formatada para número: "1.234,56" → 1234.56
 */
export function parseCurrencyInput(value: string): number {
  if (!value) return 0;
  
  // Remove pontos de milhar e substitui vírgula por ponto
  const cleaned = value
    .replace(/\./g, "")
    .replace(",", ".");
  
  const num = parseFloat(cleaned);
  return isNaN(num) ? 0 : num;
}
