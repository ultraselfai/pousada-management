"use client"

import { useEffect, useState } from "react"
import { format, isToday, isSameDay, addDays, subDays } from "date-fns"
import { ptBR } from "date-fns/locale"
import { 
  CheckSquare, 
  Plus, 
  Trash2, 
  Clock, 
  User, 
  ChevronLeft, 
  ChevronRight,
  MoreVertical,
  Calendar as CalendarIcon
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { toast } from "sonner"

import { getStaff, getTasks, createTask, toggleChecklistItem, toggleTaskCompletion } from "@/features/team/actions"

interface Staff {
  id: string
  name: string
  role: string
  color: string | null
}

interface Task {
  id: string
  title: string
  description: string | null
  date: Date
  startTime: string | null
  endTime: string | null
  completed: boolean
  staffId: string | null
  staff: Staff | null
  checklist: ChecklistItem[]
}

interface ChecklistItem {
  id: string
  text: string
  checked: boolean
}

export function TeamTasks() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [tasks, setTasks] = useState<Task[]>([])
  const [staffList, setStaffList] = useState<Staff[]>([])
  const [loading, setLoading] = useState(true)

  // Dialog States
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)

  // Form States
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [startTime, setStartTime] = useState("")
  const [endTime, setEndTime] = useState("")
  const [selectedStaffId, setSelectedStaffId] = useState<string>("none") // "none" | staffId
  const [newChecklistItems, setNewChecklistItems] = useState<string[]>([])
  const [checklistItemInput, setChecklistItemInput] = useState("")

  useEffect(() => {
    loadData()
  }, [currentDate])

  async function loadData() {
    try {
      setLoading(true)
      const [staffResult, tasksResult] = await Promise.all([
        getStaff(),
        getTasks(currentDate)
      ])
      setStaffList(staffResult)
      setTasks(tasksResult as any) // Type assertion devido à serialização de data do server component
    } catch (error) {
      toast.error("Erro ao carregar tarefas")
    } finally {
      setLoading(false)
    }
  }

  function handleAddChecklistItem() {
    if (checklistItemInput.trim()) {
      setNewChecklistItems([...newChecklistItems, checklistItemInput.trim()])
      setChecklistItemInput("")
    }
  }

  function handleRemoveChecklistItem(index: number) {
    setNewChecklistItems(newChecklistItems.filter((_, i) => i !== index))
  }

  async function handleCreateTask() {
    if (!title) {
      toast.error("Título é obrigatório")
      return
    }

    try {
      await createTask({
        title,
        date: currentDate,
        description,
        staffId: selectedStaffId === "none" ? undefined : selectedStaffId,
        checklist: newChecklistItems.length > 0 ? newChecklistItems : undefined
      })
      
      toast.success("Tarefa criada!")
      setIsCreateOpen(false)
      resetForm()
      loadData()
    } catch (error) {
      toast.error("Erro ao criar tarefa")
    }
  }

  function resetForm() {
    setTitle("")
    setDescription("")
    setStartTime("")
    setEndTime("")
    setSelectedStaffId("none")
    setNewChecklistItems([])
    setChecklistItemInput("")
  }

  async function handleToggleChecklemItem(itemId: string, checked: boolean) {
    // Otimistic update local
    if (selectedTask) {
        const updatedChecklist = selectedTask.checklist.map(item => 
            item.id === itemId ? { ...item, checked } : item
        )
        setSelectedTask({ ...selectedTask, checklist: updatedChecklist })
    }

    // Server update
    try {
        await toggleChecklistItem(itemId, checked)
    } catch(err) {
        toast.error("Erro ao atualizar item")
    }
  }

  async function handleCompleteTask(task: Task, completed: boolean) {
     try {
         await toggleTaskCompletion(task.id, completed)
         toast.success(completed ? "Tarefa concluída!" : "Tarefa reaberta")
         loadData()
         if (selectedTask && selectedTask.id === task.id) {
             setSelectedTask({ ...selectedTask, completed })
         }
     } catch(err) {
         toast.error("Erro ao atualizar status")
     }
  }

  return (
    <div className="space-y-6">
      {/* Date Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
            <Button variant="outline" size="icon" onClick={() => setCurrentDate(subDays(currentDate, 1))}>
                <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="text-center min-w-[200px]">
                 <Popover>
                    <PopoverTrigger asChild>
                        <Button variant="ghost" className="font-semibold text-lg capitalize">
                            {format(currentDate, "EEEE, dd 'de' MMMM", { locale: ptBR })}
                            <CalendarIcon className="ml-2 h-4 w-4 opacity-50" />
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                        <Calendar
                            mode="single"
                            selected={currentDate}
                            onSelect={(date) => date && setCurrentDate(date)}
                            initialFocus
                        />
                    </PopoverContent>
                 </Popover>
            </div>
            <Button variant="outline" size="icon" onClick={() => setCurrentDate(addDays(currentDate, 1))}>
                <ChevronRight className="h-4 w-4" />
            </Button>
        </div>
        <Button onClick={() => setIsCreateOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Nova Tarefa
        </Button>
      </div>

      {/* Task List */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {tasks.length === 0 ? (
            <div className="col-span-full text-center py-12 text-muted-foreground border rounded-lg border-dashed">
                <CheckSquare className="mx-auto h-12 w-12 opacity-20 mb-3" />
                <p>Nenhuma tarefa agendada para este dia</p>
                <Button variant="link" onClick={() => setIsCreateOpen(true)}>Criar primeira tarefa</Button>
            </div>
        ) : (
            tasks.map(task => (
                <Card 
                    key={task.id} 
                    className={`cursor-pointer hover:border-primary/50 transition-colors ${task.completed ? 'opacity-60 bg-muted/50' : ''}`}
                    onClick={() => {
                        setSelectedTask(task)
                        setIsDetailsOpen(true)
                    }}
                >
                    <CardHeader className="pb-2 flex flex-row items-start justify-between space-y-0">
                        <div>
                            <CardTitle className={`text-base ${task.completed ? 'line-through decoration-muted-foreground' : ''}`}>
                                {task.title}
                            </CardTitle>
                            {task.startTime && (
                                <CardDescription className="flex items-center mt-1">
                                    <Clock className="h-3 w-3 mr-1" />
                                    {task.startTime} {task.endTime ? `- ${task.endTime}` : ''}
                                </CardDescription>
                            )}
                        </div>
                        <div className="text-right">
                             {task.staff ? (
                                 <Badge variant="outline" className="text-xs" style={{ borderColor: task.staff.color || undefined, color: task.staff.color || undefined }}>
                                     {task.staff.name.split(' ')[0]}
                                 </Badge>
                             ) : (
                                 <Badge variant="secondary" className="text-xs">Geral</Badge>
                             )}
                        </div>
                    </CardHeader>
                    <CardContent className="pb-2">
                        {task.checklist.length > 0 && (
                            <div className="text-xs text-muted-foreground flex items-center gap-1">
                                <CheckSquare className="h-3 w-3" />
                                {task.checklist.filter(i => i.checked).length}/{task.checklist.length} itens
                            </div>
                        )}
                        {task.description && (
                            <p className="text-xs text-muted-foreground mt-2 line-clamp-2">{task.description}</p>
                        )}
                    </CardContent>
                    <CardFooter className="pt-2">
                         <div className={`w-full h-1 rounded-full ${task.completed ? 'bg-green-500' : 'bg-muted'}`} />
                    </CardFooter>
                </Card>
            ))
        )}
      </div>

      {/* Create Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="max-w-md">
            <DialogHeader>
                <DialogTitle>Nova Tarefa</DialogTitle>
                <DialogDescription>Crie uma tarefa ou checklist para a equipe.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-2">
                <div className="grid gap-2">
                    <Label htmlFor="title">Título</Label>
                    <Input id="title" value={title} onChange={e => setTitle(e.target.value)} placeholder="Ex: Café da Manhã, Limpeza Piscina..." />
                </div>

                <div className="grid gap-2">
                    <Label>Responsável (Opcional)</Label>
                    <Select value={selectedStaffId} onValueChange={setSelectedStaffId}>
                        <SelectTrigger>
                            <SelectValue placeholder="Selecione..." />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="none">Nenhum (Geral)</SelectItem>
                            {staffList.map(s => (
                                <SelectItem key={s.id} value={s.id}>{s.name} - {s.role}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                        <Label>Início (Opcional)</Label>
                        <Input type="time" value={startTime} onChange={e => setStartTime(e.target.value)} />
                    </div>
                    <div className="grid gap-2">
                        <Label>Fim (Opcional)</Label>
                        <Input type="time" value={endTime} onChange={e => setEndTime(e.target.value)} />
                    </div>
                </div>

                <div className="grid gap-2">
                    <Label>Descrição</Label>
                    <Textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Detalhes da tarefa..." />
                </div>

                <div className="space-y-2 border rounded-md p-3 bg-muted/20">
                    <Label className="text-xs uppercase text-muted-foreground font-bold">Checklist (Opcional)</Label>
                    <div className="flex gap-2">
                        <Input 
                            value={checklistItemInput} 
                            onChange={e => setChecklistItemInput(e.target.value)} 
                            placeholder="Novo item..." 
                            className="h-8 text-sm"
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    e.preventDefault()
                                    handleAddChecklistItem()
                                }
                            }}
                        />
                        <Button size="sm" variant="secondary" onClick={handleAddChecklistItem} disabled={!checklistItemInput.trim()}>
                            <Plus className="h-4 w-4" />
                        </Button>
                    </div>
                    {newChecklistItems.length > 0 && (
                        <div className="space-y-1 mt-2 max-h-[100px] overflow-y-auto">
                            {newChecklistItems.map((item, index) => (
                                <div key={index} className="flex items-center justify-between text-sm bg-card p-1.5 rounded border">
                                    <span>{item}</span>
                                    <Button variant="ghost" size="icon" className="h-5 w-5 text-muted-foreground hover:text-red-500" onClick={() => handleRemoveChecklistItem(index)}>
                                        <Trash2 className="h-3 w-3" />
                                    </Button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
            <DialogFooter>
                <Button variant="outline" onClick={() => setIsCreateOpen(false)}>Cancelar</Button>
                <Button onClick={handleCreateTask}>Criar Tarefa</Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Detail/Check Dialog */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="max-w-lg">
            {selectedTask && (
                <>
                    <DialogHeader>
                        <div className="flex items-center justify-between pr-8">
                            <DialogTitle className={`text-xl ${selectedTask.completed ? 'text-muted-foreground line-through' : ''}`}>
                                {selectedTask.title}
                            </DialogTitle>
                            {selectedTask.staff && (
                                <Badge>{selectedTask.staff.name}</Badge>
                            )}
                        </div>
                        <DialogDescription className="flex items-center gap-2">
                            <Clock className="h-3 w-3" />
                            {selectedTask.startTime || "Sem horário definido"} 
                            {selectedTask.date && ` - ${format(new Date(selectedTask.date), "dd/MM/yyyy")}`}
                        </DialogDescription>
                    </DialogHeader>

                    {selectedTask.description && (
                        <div className="text-sm text-muted-foreground py-2 border-b">
                            {selectedTask.description}
                        </div>
                    )}

                    <div className="py-4 space-y-3">
                        <Label>Checklist</Label>
                        {selectedTask.checklist.length === 0 ? (
                            <p className="text-sm text-muted-foreground italic">Sem itens de checklist.</p>
                        ) : (
                            <div className="space-y-2">
                                {selectedTask.checklist.map(item => (
                                    <div key={item.id} className="flex items-center space-x-2 p-2 rounded hover:bg-muted/50 transition-colors">
                                        <Checkbox 
                                            id={`item-${item.id}`} 
                                            checked={item.checked} 
                                            onCheckedChange={(checked) => handleToggleChecklemItem(item.id, checked as boolean)}
                                        />
                                        <label
                                            htmlFor={`item-${item.id}`}
                                            className={`text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer w-full ${item.checked ? 'line-through text-muted-foreground' : ''}`}
                                        >
                                            {item.text}
                                        </label>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <DialogFooter className="flex justify-between items-center w-full sm:justify-between">
                         <div className="text-xs text-muted-foreground">
                             {selectedTask.checklist.length > 0 && (
                                 <span>
                                     {selectedTask.checklist.filter(i => i.checked).length} de {selectedTask.checklist.length} concluídos
                                 </span>
                             )}
                         </div>
                         <Button 
                            variant={selectedTask.completed ? "outline" : "default"}
                            className={selectedTask.completed ? "" : "bg-green-600 hover:bg-green-700"}
                            onClick={() => handleCompleteTask(selectedTask, !selectedTask.completed)}
                        >
                            {selectedTask.completed ? "Reabrir Tarefa" : "Concluir Tarefa"}
                         </Button>
                    </DialogFooter>
                </>
            )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
