"use client"

import * as React from "react"
import { format, parse, isValid } from "date-fns"
import { ptBR } from "date-fns/locale"
import { Calendar as CalendarIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Input } from "@/components/ui/input"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

interface DatePickerProps {
  date?: Date
  onDateChange: (date: Date | undefined) => void
  placeholder?: string
  disabled?: boolean
}

export function DatePicker({ date, onDateChange, placeholder = "dd/mm/aaaa", disabled }: DatePickerProps) {
  const [open, setOpen] = React.useState(false)
  const [inputValue, setInputValue] = React.useState("")

  // Sincronizar input com a data selecionada
  React.useEffect(() => {
    if (date) {
      setInputValue(format(date, "dd/MM/yyyy"))
    } else {
      setInputValue("")
    }
  }, [date])

  const formatDateInput = (value: string) => {
    // Remove tudo que não é número
    const numbers = value.replace(/\D/g, "")
    
    // Aplica a máscara dd/mm/yyyy
    let formatted = numbers
    if (numbers.length >= 2) {
      formatted = numbers.substring(0, 2) + "/" + numbers.substring(2)
    }
    if (numbers.length >= 4) {
      formatted = numbers.substring(0, 2) + "/" + numbers.substring(2, 4) + "/" + numbers.substring(4, 8)
    }
    
    return formatted
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    const formatted = formatDateInput(value)
    setInputValue(formatted)

    // Tentar fazer parse quando completar a data (dd/mm/yyyy = 10 caracteres)
    if (formatted.length === 10) {
      const parsedDate = parse(formatted, "dd/MM/yyyy", new Date())
      
      if (isValid(parsedDate)) {
        onDateChange(parsedDate)
      }
    } else if (formatted.length === 0) {
      // Se apagar tudo, limpar a data
      onDateChange(undefined)
    }
  }

  const handleInputBlur = () => {
    // Se o input estiver vazio, limpar a data
    if (!inputValue.trim()) {
      onDateChange(undefined)
    }
  }

  const handleCalendarSelect = (selectedDate: Date | undefined) => {
    onDateChange(selectedDate)
    setOpen(false)
  }

  return (
    <div className="flex gap-2">
      <Input
        type="text"
        placeholder={placeholder}
        value={inputValue}
        onChange={handleInputChange}
        onBlur={handleInputBlur}
        disabled={disabled}
        className="flex-1"
        maxLength={10}
      />
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            disabled={disabled}
            className="px-3"
          >
            <CalendarIcon className="h-4 w-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="end">
          <Calendar
            mode="single"
            selected={date}
            onSelect={handleCalendarSelect}
            initialFocus
            locale={ptBR}
            captionLayout="dropdown"
            fromYear={1900}
            toYear={new Date().getFullYear()}
          />
        </PopoverContent>
      </Popover>
    </div>
  )
}
