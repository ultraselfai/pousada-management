"use client"

import { useEffect, useState } from "react"
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  eachDayOfInterval, 
  isSameMonth, 
  isSameDay, 
  addMonths, 
  subMonths, 
  isToday 
} from "date-fns"
import { ptBR } from "date-fns/locale"
import { ChevronLeft, ChevronRight, Clock, Coffee, AlertCircle, Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"

import { getStaff, getShifts, upsertShift } from "@/features/team/actions"

interface Staff {
  id: string
  name: string
  role: string
  color: string | null
}

interface Shift {
  id: string
  staffId: string
  date: Date
  startTime: string
  endTime: string
  isDayOff: boolean
}

export function TeamCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [staffList, setStaffList] = useState<Staff[]>([])
  const [shifts, setShifts] = useState<Shift[]>([])
  const [loading, setLoading] = useState(true)
  
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  
  // Estado local para edição de turnos no modal
  const [editingShifts, setEditingShifts] = useState<Record<string, { startTime: string, endTime: string, isDayOff: boolean }>>({})

  useEffect(() => {
    loadData()
  }, [currentDate])

  async function loadData() {
    try {
      setLoading(true)
      const start = startOfMonth(currentDate)
      const end = endOfMonth(currentDate)

      const [staffResult, shiftsResult] = await Promise.all([
        getStaff(),
        getShifts(start, end)
      ])

      setStaffList(staffResult)
      setShifts(shiftsResult)
    } catch (error) {
      toast.error("Erro ao carregar escalas")
    } finally {
      setLoading(false)
    }
  }

  function handlePrevMonth() {
    setCurrentDate(subMonths(currentDate, 1))
  }

  function handleNextMonth() {
    setCurrentDate(addMonths(currentDate, 1))
  }

  function handleDayClick(day: Date) {
    setSelectedDate(day)
    
    // Preparar estado inicial do form de edição baseado nos turnos existentes
    const initialEdits: Record<string, any> = {}
    
    staffList.forEach(staff => {
      const existingShift = shifts.find(s => s.staffId === staff.id && isSameDay(new Date(s.date), day))
      
      if (existingShift) {
        initialEdits[staff.id] = {
          startTime: existingShift.startTime,
          endTime: existingShift.endTime,
          isDayOff: existingShift.isDayOff
        }
      } else {
        // Default: 08:00 - 17:00
        initialEdits[staff.id] = {
          startTime: "08:00",
          endTime: "17:00",
          isDayOff: false
        }
      }
    })
    
    setEditingShifts(initialEdits)
    setIsDialogOpen(true)
  }

  async function handleSaveShifts() {
    if (!selectedDate) return

    try {
      const promises = staffList.map(staff => {
        const data = editingShifts[staff.id]
        return upsertShift(staff.id, selectedDate, {
          startTime: data.startTime,
          endTime: data.endTime,
          isDayOff: data.isDayOff
        })
      })

      await Promise.all(promises)
      toast.success("Escalas atualizadas com sucesso!")
      setIsDialogOpen(false)
      loadData()
    } catch (error) {
      toast.error("Erro ao salvar escalas")
      console.error(error)
    }
  }

  function updateShiftState(staffId: string, field: string, value: any) {
    setEditingShifts(prev => ({
      ...prev,
      [staffId]: {
        ...prev[staffId],
        [field]: value
      }
    }))
  }

  // Geração da Grid do Calendário
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = monthStart; 
  const endDate = monthEnd;

  const dateFormat = "d";
  const rows = [];
  let days = [];
  let day = startDate;
  let formattedDate = "";

  // Dias do mês
  const daysInMonth = eachDayOfInterval({
    start: monthStart,
    end: monthEnd
  })
  
  // Preencher dias vazios no início da semana para alinhar (Domingo..Sábado)
  const startDayOfWeek = monthStart.getDay() // 0 = Domingo
  const placeholders = Array.from({ length: startDayOfWeek }).map((_, i) => (
    <div key={`empty-${i}`} className="bg-muted/10 h-32 border-b border-r" />
  ))

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold capitalize">
          {format(currentDate, "MMMM yyyy", { locale: ptBR })}
        </h2>
        <div className="flex gap-2">
            <Button variant="outline" size="icon" onClick={handlePrevMonth}>
                <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={handleNextMonth}>
                <ChevronRight className="h-4 w-4" />
            </Button>
        </div>
      </div>

      <div className="border rounded-md overflow-hidden">
        {/* Cabeçalho dias da semana */}
        <div className="grid grid-cols-7 bg-muted/50 border-b">
            {["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"].map(d => (
                <div key={d} className="p-3 text-center text-sm font-medium text-muted-foreground border-r last:border-r-0">
                    {d}
                </div>
            ))}
        </div>

        {/* Grid de Dias */}
        <div className="grid grid-cols-7 bg-card">
            {placeholders}
            {daysInMonth.map(day => {
                const isDayToday = isToday(day)
                const dayShifts = shifts.filter(s => isSameDay(new Date(s.date), day))
                
                return (
                    <div 
                        key={day.toISOString()} 
                        className={`min-h-[140px] border-b border-r p-2 transition-colors hover:bg-muted/20 cursor-pointer relative group ${isDayToday ? 'bg-primary/5' : ''}`}
                        onClick={() => handleDayClick(day)}
                    >
                        <div className="flex justify-between items-start mb-2">
                            <span className={`text-sm font-medium h-7 w-7 flex items-center justify-center rounded-full ${isDayToday ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'}`}>
                                {format(day, "d")}
                            </span>
                        </div>

                        {/* Listagem compacta de escalas */}
                        <div className="space-y-1">
                            {dayShifts.length > 0 ? (
                                dayShifts.slice(0, 4).map(shift => {
                                    const staff = staffList.find(s => s.id === shift.staffId)
                                    if (!staff) return null
                                    
                                    return (
                                        <div key={shift.id} className="text-[10px] flex items-center gap-1 overflow-hidden">
                                           <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0`} style={{ backgroundColor: staff.color || "#ccc" }} />
                                           <span className="truncate font-medium flex-1">{staff.name.split(' ')[0]}</span>
                                           {shift.isDayOff ? (
                                               <span className="text-xs text-muted-foreground px-1 bg-muted rounded">Folga</span>
                                           ) : (
                                               <span className="text-muted-foreground">{shift.startTime}</span>
                                           )}
                                        </div>
                                    )
                                })
                            ) : (
                                <p className="text-[10px] text-muted-foreground italic text-center mt-4 opacity-50">Sem escalas</p>
                            )}
                            {dayShifts.length > 4 && (
                                <p className="text-[10px] text-muted-foreground text-center">e mais {dayShifts.length - 4}...</p>
                            )}
                        </div>

                        {/* Botão Hover Editar */}
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-black/5 pointer-events-none">
                             <Badge variant="secondary" className="pointer-events-auto shadow-sm">Editar Escala</Badge>
                        </div>
                    </div>
                )
            })}
        </div>
      </div>

      {/* Dialogo de Edição de Escala */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
                <DialogTitle>Gerenciar Escala</DialogTitle>
            </DialogHeader>
            <div className="py-2">
                <p className="text-sm font-medium mb-4 flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    {selectedDate && format(selectedDate, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                </p>

                <div className="space-y-4">
                    {staffList.length === 0 ? (
                        <p className="text-muted-foreground text-center py-4">Nenhum funcionário cadastrado. Cadastre no Organograma primeiro.</p>
                    ) : (
                        staffList.map(staff => {
                            const config = editingShifts[staff.id] || { startTime: "08:00", endTime: "17:00", isDayOff: false }
                            
                            return (
                                <div key={staff.id} className="flex items-center gap-4 p-3 border rounded-lg bg-card/50">
                                    <div className="flex-1 min-w-[120px]">
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: staff.color || "#ccc" }} />
                                            <p className="font-medium text-sm">{staff.name}</p>
                                        </div>
                                        <p className="text-xs text-muted-foreground">{staff.role}</p>
                                    </div>

                                    <div className="flex items-center gap-4">
                                        <div className="flex items-center gap-2">
                                            <Switch 
                                                checked={config.isDayOff} 
                                                onCheckedChange={(checked) => updateShiftState(staff.id, 'isDayOff', checked)}
                                                id={`dayoff-${staff.id}`}
                                            />
                                            <Label htmlFor={`dayoff-${staff.id}`} className="text-xs cursor-pointer">
                                                {config.isDayOff ? "Folga" : "Trabalha"}
                                            </Label>
                                        </div>

                                        {!config.isDayOff && (
                                            <div className="flex items-center gap-2">
                                                <Input 
                                                    type="time" 
                                                    className="w-24 h-8 text-sm" 
                                                    value={config.startTime}
                                                    onChange={(e) => updateShiftState(staff.id, 'startTime', e.target.value)}
                                                />
                                                <span className="text-muted-foreground">-</span>
                                                <Input 
                                                    type="time" 
                                                    className="w-24 h-8 text-sm"
                                                    value={config.endTime}
                                                    onChange={(e) => updateShiftState(staff.id, 'endTime', e.target.value)}
                                                />
                                            </div>
                                        )}
                                        {config.isDayOff && (
                                            <div className="w-[216px] h-8 flex items-center justify-center bg-muted/50 rounded text-xs text-muted-foreground">
                                                Folga Remunerada/Descanso
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )
                        })
                    )}
                </div>
            </div>
            <DialogFooter>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancelar</Button>
                <Button onClick={handleSaveShifts}>Salvar Alterações</Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
