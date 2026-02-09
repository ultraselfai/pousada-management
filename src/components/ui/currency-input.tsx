"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface CurrencyInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value'> {
  value: string | number
  onChange: (value: string) => void
  /** Se true, mostra o símbolo R$ como prefixo dentro do input */
  showPrefix?: boolean
}

/**
 * Formata um valor numérico para o formato de moeda brasileira
 */
function formatCurrency(value: string | number): string {
  // Remove tudo que não é número
  const numericValue = String(value).replace(/\D/g, "")
  
  if (!numericValue) return ""
  
  // Converte para número (centavos)
  const cents = parseInt(numericValue, 10)
  
  // Converte para reais (divide por 100)
  const reais = cents / 100
  
  // Formata como moeda brasileira sem o símbolo
  return reais.toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

/**
 * Extrai o valor numérico de uma string formatada
 */
function parseToNumber(formatted: string): number {
  // Remove tudo que não é número
  const numericValue = formatted.replace(/\D/g, "")
  if (!numericValue) return 0
  return parseInt(numericValue, 10) / 100
}

/**
 * Componente de input para valores monetários com máscara automática.
 * 
 * @example
 * ```tsx
 * const [value, setValue] = useState("")
 * <CurrencyInput value={value} onChange={setValue} />
 * // Ao submeter: const numericValue = parseFloat(value.replace(/\./g, "").replace(",", ".")) || 0
 * ```
 */
const CurrencyInput = React.forwardRef<HTMLInputElement, CurrencyInputProps>(
  ({ className, value, onChange, showPrefix = true, ...props }, ref) => {
    const [displayValue, setDisplayValue] = React.useState("")

    // Atualiza o display quando o value externo muda
    React.useEffect(() => {
      if (value === "" || value === undefined || value === null) {
        setDisplayValue("")
        return
      }
      
      // Se for um número, converte para string formatada
      if (typeof value === "number") {
        const formatted = value.toLocaleString("pt-BR", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })
        setDisplayValue(formatted)
      } else {
        // Se já for string formatada ou valor em string
        const numeric = value.replace(/\D/g, "")
        if (numeric) {
          setDisplayValue(formatCurrency(numeric))
        } else {
          setDisplayValue("")
        }
      }
    }, [value])

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const rawValue = e.target.value
      const formatted = formatCurrency(rawValue)
      setDisplayValue(formatted)
      
      // Retorna o valor formatado (ex: "1.234,56")
      onChange(formatted)
    }

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      // Permite apenas números, backspace, delete, tab, enter, setas
      const allowedKeys = ["Backspace", "Delete", "Tab", "Enter", "ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"]
      const isNumber = /^\d$/.test(e.key)
      
      if (!isNumber && !allowedKeys.includes(e.key) && !e.ctrlKey && !e.metaKey) {
        e.preventDefault()
      }
    }

    return (
      <div className="relative flex items-center">
        {showPrefix && (
          <span className="absolute left-3 text-muted-foreground text-sm pointer-events-none">
            R$
          </span>
        )}
        <input
          type="text"
          inputMode="numeric"
          className={cn(
            "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
            showPrefix && "pl-10",
            className
          )}
          ref={ref}
          value={displayValue}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder="0,00"
          {...props}
        />
      </div>
    )
  }
)
CurrencyInput.displayName = "CurrencyInput"

/**
 * Converte o valor formatado (ex: "1.234,56") para número (ex: 1234.56)
 */
function parseCurrencyToNumber(formatted: string): number {
  if (!formatted) return 0
  // Remove pontos de milhar e troca vírgula por ponto
  const normalized = formatted.replace(/\./g, "").replace(",", ".")
  return parseFloat(normalized) || 0
}

export { CurrencyInput, parseCurrencyToNumber, formatCurrency }
