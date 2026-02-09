"use client"

import { useState } from "react"
import { Check, ClipboardCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"

interface CleaningChecklistDialogProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  roomName: string
  onConfirm: () => void
}

const CHECKLIST_ITEMS = [
  "Trocar roupas de cama",
  "Trocar toalhas de banho e rosto",
  "Limpar e higienizar banheiro",
  "Aspirar e passar pano no chão",
  "Repor itens do frigobar",
  "Retirar lixo",
  "Verificar funcionamento (TV, Ar, Luzes)"
]

export function CleaningChecklistDialog({
  isOpen,
  onOpenChange,
  roomName,
  onConfirm
}: CleaningChecklistDialogProps) {
  const [checkedItems, setCheckedItems] = useState<string[]>([])

  const handleToggle = (item: string) => {
    setCheckedItems(prev => 
      prev.includes(item) 
        ? prev.filter(i => i !== item)
        : [...prev, item]
    )
  }

  const allChecked = CHECKLIST_ITEMS.every(item => checkedItems.includes(item))

  const handleConfirm = () => {
    onConfirm()
    onOpenChange(false)
    setCheckedItems([]) // Reset
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ClipboardCheck className="h-5 w-5" />
            Conferência de Limpeza - {roomName}
          </DialogTitle>
          <DialogDescription>
            Confira os itens abaixo para liberar o quarto.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          {CHECKLIST_ITEMS.map((item) => (
            <div key={item} className="flex items-center space-x-2 p-2 rounded hover:bg-muted/50 transition-colors cursor-pointer" onClick={() => handleToggle(item)}>
              <Checkbox 
                id={item} 
                checked={checkedItems.includes(item)}
                onCheckedChange={() => handleToggle(item)}
              />
              <Label
                htmlFor={item}
                className={`text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer flex-1 ${checkedItems.includes(item) ? 'line-through text-muted-foreground' : ''}`}
              >
                {item}
              </Label>
            </div>
          ))}
        </div>

        <DialogFooter className="sm:justify-between">
           <div className="text-xs text-muted-foreground flex items-center">
             {checkedItems.length} de {CHECKLIST_ITEMS.length} itens verificados
           </div>
          <Button type="button" onClick={handleConfirm} disabled={!allChecked} className="bg-green-600 hover:bg-green-700">
            <Check className="mr-2 h-4 w-4" />
            Aprovar Quarto
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
