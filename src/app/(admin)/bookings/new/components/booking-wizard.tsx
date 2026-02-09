"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import {
  Loader2,
  ArrowLeft,
  ArrowRight,
  Save,
  Search,
  UserPlus,
  BedDouble,
  Calendar,
  CreditCard,
  Check,
} from "lucide-react"
import Link from "next/link"
import { format, differenceInDays, addDays } from "date-fns"
import { ptBR } from "date-fns/locale"

import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { CurrencyInput, parseCurrencyToNumber } from "@/components/ui/currency-input"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

import { createBookingSchema, type CreateBookingInput } from "@/features/bookings/schemas"
import { createBooking } from "@/features/bookings"
import { checkAvailability } from "@/features/rooms"
import { getGuests, getGuestByCpf } from "@/features/guests"
import { getRooms } from "@/features/rooms"
import { paymentMethods, paymentTypes } from "../../data/data"
import { formatCurrency } from "../../utils"

type Step = "guest" | "room" | "dates" | "payment" | "confirm"

const steps: { id: Step; title: string; icon: React.ElementType }[] = [
  { id: "guest", title: "Hóspede", icon: UserPlus },
  { id: "room", title: "Quarto", icon: BedDouble },
  { id: "dates", title: "Datas", icon: Calendar },
  { id: "payment", title: "Pagamento", icon: CreditCard },
  { id: "confirm", title: "Confirmar", icon: Check },
]

export function BookingWizard() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [currentStep, setCurrentStep] = useState<Step>("guest")
  
  // Dados auxiliares
  const [guests, setGuests] = useState<any[]>([])
  const [rooms, setRooms] = useState<any[]>([])
  const [selectedGuest, setSelectedGuest] = useState<any>(null)
  const [selectedRoom, setSelectedRoom] = useState<any>(null)
  const [cpfSearch, setCpfSearch] = useState("")
  const [searchingCpf, setSearchingCpf] = useState(false)
  const [guestMode, setGuestMode] = useState<"search" | "new">("search")

  const form = useForm<CreateBookingInput>({
    resolver: zodResolver(createBookingSchema) as any,
    defaultValues: {
      guestId: "",
      roomId: "",
      checkIn: addDays(new Date(), 1),
      checkOut: addDays(new Date(), 2),
      adults: 2,
      children: 0,
      mealsIncluded: true,
      paymentMethod: "PIX",
      paymentType: "FULL_UPFRONT",
      totalAmount: 0,
      paidAmount: 0,
      notes: "",
    },
  })

  // Carregar dados
  useEffect(() => {
    async function loadData() {
      const [guestsResult, roomsResult] = await Promise.all([
        getGuests({ limit: 100 }),
        getRooms(),
      ])
      if (guestsResult.success) setGuests(guestsResult.guests)
      if (roomsResult.success) setRooms(roomsResult.rooms)
    }
    loadData()
  }, [])

  // Calcular preço quando datas ou quarto mudam
  const checkIn = form.watch("checkIn")
  const checkOut = form.watch("checkOut")
  const roomId = form.watch("roomId")

  useEffect(() => {
    if (checkIn && checkOut && selectedRoom) {
      const nights = differenceInDays(checkOut, checkIn)
      if (nights > 0) {
        const total = nights * Number(selectedRoom.basePrice)
        form.setValue("totalAmount", total)
      }
    }
  }, [checkIn, checkOut, selectedRoom])

  // Buscar hóspede por CPF
  const handleCpfSearch = async () => {
    if (!cpfSearch) return
    setSearchingCpf(true)
    try {
      const result = await getGuestByCpf(cpfSearch)
      if (result.success && result.guest) {
        setSelectedGuest(result.guest)
        form.setValue("guestId", result.guest.id)
        toast.success("Hóspede encontrado!")
      } else {
        toast.info("Hóspede não encontrado. Cadastre um novo.")
        setGuestMode("new")
      }
    } catch (error) {
      toast.error("Erro ao buscar hóspede")
    } finally {
      setSearchingCpf(false)
    }
  }

  // Selecionar quarto
  const handleRoomSelect = async (room: any) => {
    setSelectedRoom(room)
    form.setValue("roomId", room.id)
    
    // Verificar disponibilidade
    if (checkIn && checkOut) {
      const result = await checkAvailability({
        roomId: room.id,
        checkIn,
        checkOut,
      })
      if (!result.available) {
        toast.warning("Este quarto pode ter conflito de datas. Verifique o mapa de reservas.")
      }
    }
  }

  // Navegação entre steps
  const currentStepIndex = steps.findIndex((s) => s.id === currentStep)
  
  const canAdvance = () => {
    switch (currentStep) {
      case "guest":
        return !!form.getValues("guestId")
      case "room":
        return !!form.getValues("roomId")
      case "dates":
        return form.getValues("checkIn") && form.getValues("checkOut")
      case "payment":
        return form.getValues("paymentMethod") && form.getValues("totalAmount") > 0
      default:
        return true
    }
  }

  const nextStep = () => {
    if (currentStepIndex < steps.length - 1) {
      setCurrentStep(steps[currentStepIndex + 1].id)
    }
  }

  const prevStep = () => {
    if (currentStepIndex > 0) {
      setCurrentStep(steps[currentStepIndex - 1].id)
    }
  }

  // Submit
  async function onSubmit(data: CreateBookingInput) {
    setLoading(true)
    try {
      const result = await createBooking(data)
      if (result.success) {
        toast.success("Reserva criada com sucesso!")
        router.push("/bookings")
      } else {
        toast.error(result.error || "Erro ao criar reserva")
      }
    } catch (error) {
      toast.error("Erro ao criar reserva")
    } finally {
      setLoading(false)
    }
  }

  const nights = checkIn && checkOut ? differenceInDays(checkOut, checkIn) : 0

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Progress Steps */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {steps.map((step, index) => {
            const isActive = step.id === currentStep
            const isCompleted = index < currentStepIndex
            const Icon = step.icon
            
            return (
              <div key={step.id} className="flex items-center">
                <button
                  type="button"
                  onClick={() => index <= currentStepIndex && setCurrentStep(step.id)}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-lg transition-colors",
                    isActive && "bg-primary text-primary-foreground",
                    isCompleted && "bg-primary/20 text-primary",
                    !isActive && !isCompleted && "bg-muted text-muted-foreground"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <span className="hidden md:inline">{step.title}</span>
                </button>
                {index < steps.length - 1 && (
                  <div className={cn(
                    "w-8 h-0.5 mx-1",
                    isCompleted ? "bg-primary" : "bg-muted"
                  )} />
                )}
              </div>
            )
          })}
        </div>

        {/* Step: Guest */}
        {currentStep === "guest" && (
          <Card>
            <CardHeader>
              <CardTitle>Selecionar Hóspede</CardTitle>
              <CardDescription>
                Busque por CPF ou selecione da lista
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex gap-4">
                <div className="flex-1">
                  <Label>Buscar por CPF</Label>
                  <div className="flex gap-2 mt-2">
                    <Input
                      placeholder="000.000.000-00"
                      value={cpfSearch}
                      onChange={(e) => setCpfSearch(e.target.value)}
                    />
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={handleCpfSearch}
                      disabled={searchingCpf}
                    >
                      {searchingCpf ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Search className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </div>

              <Separator />

              {selectedGuest ? (
                <div className="p-4 border rounded-lg bg-muted/50">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{selectedGuest.name}</p>
                      <p className="text-sm text-muted-foreground">
                        CPF: {selectedGuest.cpf} • Tel: {selectedGuest.phone}
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setSelectedGuest(null)
                        form.setValue("guestId", "")
                      }}
                    >
                      Alterar
                    </Button>
                  </div>
                </div>
              ) : (
                <FormField
                  control={form.control}
                  name="guestId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Selecionar da lista</FormLabel>
                      <Select
                        onValueChange={(value) => {
                          field.onChange(value)
                          const guest = guests.find((g) => g.id === value)
                          setSelectedGuest(guest)
                        }}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione um hóspede" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {guests.map((guest) => (
                            <SelectItem key={guest.id} value={guest.id}>
                              {guest.name} - {guest.cpf}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              <div className="text-center">
                <Button type="button" variant="link" asChild>
                  <Link href="/guests/new" target="_blank">
                    <UserPlus className="mr-2 h-4 w-4" />
                    Cadastrar novo hóspede
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step: Room */}
        {currentStep === "room" && (
          <Card>
            <CardHeader>
              <CardTitle>Selecionar Quarto</CardTitle>
              <CardDescription>
                Escolha o quarto para a reserva
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {rooms.map((room) => {
                  const isUnavailable = room.status === "MAINTENANCE" || room.status === "BLOCKED" || room.status === "OCCUPIED";
                  const statusLabels: Record<string, { label: string; color: string }> = {
                    AVAILABLE: { label: "Disponível", color: "text-green-600" },
                    OCCUPIED: { label: "Ocupado", color: "text-blue-600" },
                    CLEANING: { label: "Em limpeza", color: "text-yellow-600" },
                    MAINTENANCE: { label: "Manutenção", color: "text-orange-600" },
                    BLOCKED: { label: "Bloqueado", color: "text-red-600" },
                  };
                  const statusInfo = statusLabels[room.status] || statusLabels.AVAILABLE;
                  
                  return (
                    <div
                      key={room.id}
                      onClick={() => !isUnavailable && handleRoomSelect(room)}
                      className={cn(
                        "p-4 border rounded-lg transition-all",
                        isUnavailable 
                          ? "opacity-50 cursor-not-allowed bg-muted" 
                          : "cursor-pointer hover:border-primary",
                        selectedRoom?.id === room.id && !isUnavailable && "border-primary bg-primary/5"
                      )}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">{room.name}</span>
                        <span className={cn("text-xs font-medium", statusInfo.color)}>
                          {statusInfo.label}
                        </span>
                      </div>
                      <div className="text-sm text-muted-foreground mb-1">
                        {room.category}
                      </div>
                      <div className="text-lg font-bold text-primary">
                        {formatCurrency(Number(room.basePrice))}/noite
                      </div>
                      <div className="text-sm text-muted-foreground mt-1">
                        Máx: {room.maxGuests} hóspedes
                      </div>
                      {isUnavailable && (
                        <div className="text-xs text-destructive mt-2">
                          Este quarto não está disponível para reserva
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step: Dates */}
        {currentStep === "dates" && (
          <Card>
            <CardHeader>
              <CardTitle>Datas e Detalhes</CardTitle>
              <CardDescription>
                Defina as datas e informações da estadia
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6 md:grid-cols-2">
              <FormField
                control={form.control}
                name="checkIn"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Check-in</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP", { locale: ptBR })
                            ) : (
                              <span>Selecione a data</span>
                            )}
                            <Calendar className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <CalendarComponent
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) => date < new Date()}
                          locale={ptBR}
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="checkOut"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Check-out</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP", { locale: ptBR })
                            ) : (
                              <span>Selecione a data</span>
                            )}
                            <Calendar className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <CalendarComponent
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) => date <= (checkIn || new Date())}
                          locale={ptBR}
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {nights > 0 && (
                <div className="md:col-span-2 p-4 bg-muted rounded-lg">
                  <p className="text-center text-lg">
                    <span className="font-bold">{nights}</span> noite{nights !== 1 && "s"}
                  </p>
                </div>
              )}

              <FormField
                control={form.control}
                name="adults"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Adultos</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={1}
                        max={20}
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="children"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Crianças</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={0}
                        max={20}
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="mealsIncluded"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between rounded-lg border p-4 md:col-span-2">
                    <div>
                      <FormLabel>Café da Manhã Incluso</FormLabel>
                      <FormDescription>
                        Incluir café da manhã na reserva
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>
        )}

        {/* Step: Payment */}
        {currentStep === "payment" && (
          <Card>
            <CardHeader>
              <CardTitle>Pagamento</CardTitle>
              <CardDescription>
                Defina a forma de pagamento
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <FormField
                control={form.control}
                name="paymentMethod"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Método de Pagamento</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="grid grid-cols-2 md:grid-cols-5 gap-4"
                      >
                        {paymentMethods.map((method) => (
                          <div key={method.value}>
                            <RadioGroupItem
                              value={method.value}
                              id={method.value}
                              className="peer sr-only"
                            />
                            <Label
                              htmlFor={method.value}
                              className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
                            >
                              {method.label}
                            </Label>
                          </div>
                        ))}
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="paymentType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo de Pagamento</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="grid gap-4 md:grid-cols-2"
                      >
                        {paymentTypes.map((type) => (
                          <div key={type.value}>
                            <RadioGroupItem
                              value={type.value}
                              id={type.value}
                              className="peer sr-only"
                            />
                            <Label
                              htmlFor={type.value}
                              className="flex items-center justify-center rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
                            >
                              {type.label}
                            </Label>
                          </div>
                        ))}
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="totalAmount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Valor Total</FormLabel>
                      <FormControl>
                        <CurrencyInput
                          value={field.value}
                          onChange={(value) => field.onChange(parseCurrencyToNumber(value))}
                        />
                      </FormControl>
                      <FormDescription>
                        Calculado: {nights} noites × {selectedRoom ? formatCurrency(Number(selectedRoom.basePrice)) : "R$ 0,00"}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="paidAmount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Valor Pago</FormLabel>
                      <FormControl>
                        <CurrencyInput
                          value={field.value}
                          onChange={(value) => field.onChange(parseCurrencyToNumber(value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="paymentDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Data do Pagamento</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              className={cn(
                                "w-full pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? (
                                format(field.value, "PPP", { locale: ptBR })
                              ) : (
                                <span>Hoje (Automático)</span>
                              )}
                              <Calendar className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <CalendarComponent
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) => date > new Date()}
                            locale={ptBR}
                          />
                        </PopoverContent>
                      </Popover>
                      <FormDescription>
                        Para pagamentos retroativos
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step: Confirm */}
        {currentStep === "confirm" && (
          <Card>
            <CardHeader>
              <CardTitle>Confirmar Reserva</CardTitle>
              <CardDescription>
                Revise os dados antes de confirmar
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-2">Hóspede</h4>
                  <p>{selectedGuest?.name}</p>
                  <p className="text-sm text-muted-foreground">{selectedGuest?.phone}</p>
                </div>
                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-2">Quarto</h4>
                  <p>{selectedRoom?.name}</p>
                  <p className="text-sm text-muted-foreground">{selectedRoom?.category}</p>
                </div>
                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-2">Período</h4>
                  <p>
                    {checkIn && format(checkIn, "dd/MM/yyyy")} →{" "}
                    {checkOut && format(checkOut, "dd/MM/yyyy")}
                  </p>
                  <p className="text-sm text-muted-foreground">{nights} noite(s)</p>
                </div>
                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-2">Hóspedes</h4>
                  <p>
                    {form.getValues("adults")} adulto(s), {form.getValues("children")} criança(s)
                  </p>
                </div>
              </div>

              <Separator />

              <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                <span className="text-lg font-medium">Total</span>
                <span className="text-2xl font-bold text-primary">
                  {formatCurrency(form.getValues("totalAmount"))}
                </span>
              </div>

              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Observações</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Observações sobre a reserva..."
                        {...field}
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>
        )}

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <div>
            {currentStepIndex > 0 ? (
              <Button type="button" variant="outline" onClick={prevStep}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Voltar
              </Button>
            ) : (
              <Button type="button" variant="outline" asChild>
                <Link href="/bookings">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Cancelar
                </Link>
              </Button>
            )}
          </div>
          <div>
            {currentStep !== "confirm" ? (
              <Button
                type="button"
                onClick={nextStep}
                disabled={!canAdvance()}
              >
                Próximo
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            ) : (
              <Button type="submit" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Criando...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Criar Reserva
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </form>
    </Form>
  )
}
