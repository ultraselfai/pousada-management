"use client";

import { useState, useEffect, useCallback } from "react";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { pdf } from "@react-pdf/renderer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Trash2, FileDown, Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  bookingReceiptSchema,
  MEAL_OPTIONS,
  PERSON_COUNT_OPTIONS,
  type BookingReceiptFormData,
} from "@/lib/booking-receipt-schema";
import {
  formatCPF,
  formatPhone,
  getAccommodations,
  addCustomAccommodation,
  getNextBookingNumber,
  getCurrentBookingNumber,
  calculateDaysBetween,
  formatCurrencyInput,
  parseCurrencyInput,
} from "@/lib/booking-storage";
import { BookingReceiptPdf } from "@/components/booking/booking-receipt-pdf";

export default function GeradorDeReservasPage() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [accommodations, setAccommodations] = useState<string[]>([]);
  const [accommodationOpen, setAccommodationOpen] = useState(false);
  const [newAccommodation, setNewAccommodation] = useState("");
  const [currentBookingNumber, setCurrentBookingNumber] = useState(0);
  
  // Estados para valores monetários formatados
  const [dailyRateFormatted, setDailyRateFormatted] = useState("");
  const [totalAmount, setTotalAmount] = useState(0);
  const [totalAmountFormatted, setTotalAmountFormatted] = useState("");
  const [isEditingTotal, setIsEditingTotal] = useState(false);
  const [singlePaymentFormatted, setSinglePaymentFormatted] = useState("");
  const [partialPaymentsFormatted, setPartialPaymentsFormatted] = useState<string[]>([""]);
  const [checkInPaymentFormatted, setCheckInPaymentFormatted] = useState("");

  // Carregar dados iniciais
  useEffect(() => {
    setAccommodations(getAccommodations());
    setCurrentBookingNumber(getCurrentBookingNumber());
  }, []);

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<BookingReceiptFormData>({
    resolver: zodResolver(bookingReceiptSchema),
    defaultValues: {
      guest: {
        firstName: "",
        lastName: "",
        cpf: "",
        phone: "",
        email: "",
        observations: "",
      },
      booking: {
        accommodation: "",
        periodStart: "",
        periodEnd: "",
        checkInTime: "14:00",
        checkOutTime: "12:00",
        averageDailyRate: 0,
        totalDays: 1,
        adults: 1,
        children: 0,
        babies: 0,
        meals: [],
      },
      paymentType: "FULL",
      singlePayment: {
        method: "PIX",
        date: "",
        amount: 0,
      },
      partialPayments: [
        {
          method: "PIX",
          date: "",
          amount: 0,
        },
      ],
      checkInPayment: {
        method: "PIX",
        date: "",
        amount: 0,
      },
    },
  });

  const { fields: partialFields, append: appendPartial, remove: removePartial } = useFieldArray({
    control,
    name: "partialPayments",
  });

  const paymentType = watch("paymentType");
  const periodStart = watch("booking.periodStart");
  const periodEnd = watch("booking.periodEnd");
  const accommodation = watch("booking.accommodation");
  const firstName = watch("guest.firstName");
  const averageDailyRate = watch("booking.averageDailyRate");
  const totalDays = watch("booking.totalDays");

  // Calcular dias automaticamente
  useEffect(() => {
    if (periodStart && periodEnd) {
      const days = calculateDaysBetween(periodStart, periodEnd);
      if (days > 0) {
        setValue("booking.totalDays", days);
      }
    }
  }, [periodStart, periodEnd, setValue]);

  // Calcular total automaticamente quando diária ou dias mudam (apenas se não estiver editando o total)
  useEffect(() => {
    if (!isEditingTotal) {
      const total = averageDailyRate * totalDays;
      setTotalAmount(total);
      if (total > 0) {
        setTotalAmountFormatted(formatCurrencyInput(total.toFixed(2).replace(".", ",")));
      }
    }
  }, [averageDailyRate, totalDays, isEditingTotal]);

  // Handler para CPF com máscara
  const handleCPFChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCPF(e.target.value);
    setValue("guest.cpf", formatted);
  }, [setValue]);

  // Handler para telefone com máscara
  const handlePhoneChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhone(e.target.value);
    setValue("guest.phone", formatted);
  }, [setValue]);

  // Handler para diária média com máscara monetária
  const handleDailyRateChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setIsEditingTotal(false); // Ao editar diária, volta ao modo normal
    const formatted = formatCurrencyInput(e.target.value);
    setDailyRateFormatted(formatted);
    const numValue = parseCurrencyInput(formatted);
    setValue("booking.averageDailyRate", numValue);
  }, [setValue]);

  // Handler para valor total com máscara monetária (cálculo reverso -> diária)
  const handleTotalAmountChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setIsEditingTotal(true);
    const formatted = formatCurrencyInput(e.target.value);
    setTotalAmountFormatted(formatted);
    const numValue = parseCurrencyInput(formatted);
    setTotalAmount(numValue);
    
    // Calcular diária média = total / dias
    if (totalDays > 0) {
      const dailyRate = numValue / totalDays;
      setValue("booking.averageDailyRate", dailyRate);
      setDailyRateFormatted(formatCurrencyInput(dailyRate.toFixed(2).replace(".", ",")));
    }
  }, [setValue, totalDays]);

  // Handler para pagamento único com máscara monetária
  const handleSinglePaymentChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCurrencyInput(e.target.value);
    setSinglePaymentFormatted(formatted);
    const numValue = parseCurrencyInput(formatted);
    setValue("singlePayment.amount", numValue);
  }, [setValue]);

  // Handler para pagamentos parciais com máscara monetária
  const handlePartialPaymentChange = useCallback((index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCurrencyInput(e.target.value);
    setPartialPaymentsFormatted(prev => {
      const newArr = [...prev];
      newArr[index] = formatted;
      return newArr;
    });
    const numValue = parseCurrencyInput(formatted);
    setValue(`partialPayments.${index}.amount`, numValue);
  }, [setValue]);

  // Handler para pagamento do check-in com máscara monetária
  const handleCheckInPaymentChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCurrencyInput(e.target.value);
    setCheckInPaymentFormatted(formatted);
    const numValue = parseCurrencyInput(formatted);
    setValue("checkInPayment.amount", numValue);
  }, [setValue]);

  // Adicionar nova ocupação
  const handleAddAccommodation = useCallback(() => {
    if (newAccommodation.trim()) {
      const updated = addCustomAccommodation(newAccommodation.trim());
      setAccommodations(updated);
      setValue("booking.accommodation", newAccommodation.trim());
      setNewAccommodation("");
      setAccommodationOpen(false);
    }
  }, [newAccommodation, setValue]);

  // Gerar descrição do pagamento
  const generatePaymentDescription = useCallback(() => {
    return `${currentBookingNumber} - ${firstName || "Hóspede"} - ${accommodation || "Acomodação"}`;
  }, [currentBookingNumber, firstName, accommodation]);

  const onSubmit = async (data: BookingReceiptFormData) => {
    setIsGenerating(true);
    
    try {
      const bookingNumber = getNextBookingNumber();
      setCurrentBookingNumber(bookingNumber + 1);
      
      const now = new Date();
      const emissionDate = now.toLocaleDateString("pt-BR");
      const emissionTime = now.toLocaleTimeString("pt-BR", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });

      const totalAmount = data.booking.averageDailyRate * data.booking.totalDays;
      const description = `${bookingNumber} - ${data.guest.firstName} - ${data.booking.accommodation}`;

      // Montar array de pagamentos
      let payments: Array<{
        description: string;
        method: string;
        date: string;
        amount: number;
      }> = [];
      let totalPaid = 0;

      if (data.paymentType === "FULL" && data.singlePayment) {
        payments = [
          {
            description,
            method: data.singlePayment.method,
            date: data.singlePayment.date,
            amount: data.singlePayment.amount,
          },
        ];
        totalPaid = data.singlePayment.amount;
      } else if (data.paymentType === "PARTIAL") {
        // Pagamentos parciais
        if (data.partialPayments) {
          payments = data.partialPayments.map((p) => ({
            description,
            method: p.method,
            date: p.date,
            amount: p.amount,
          }));
          totalPaid = data.partialPayments.reduce((sum, p) => sum + p.amount, 0);
        }
        // Adicionar pagamento do check-in se preenchido (pagamento futuro, não soma no totalPaid)
        if (data.checkInPayment && data.checkInPayment.amount > 0) {
          payments.push({
            description,
            method: data.checkInPayment.method,
            date: data.checkInPayment.date,
            amount: data.checkInPayment.amount,
          });
          // NÃO soma no totalPaid - é um pagamento futuro (a ser pago no check-in)
        }
      }

      // O valor restante é o total menos o que já foi pago (parciais)
      // O check-in payment é o valor pendente que aparecerá no PDF
      const remainingAmount = totalAmount - totalPaid;

      // Formatar alimentação
      const mealsText = data.booking.meals
        .map((m) => MEAL_OPTIONS.find((opt) => opt.id === m)?.label)
        .filter(Boolean)
        .join(", ");

      // Obter URL absoluta do logo
      const logoUrl = `${window.location.origin}/logo-pousada-cabecalho.png`;

      const pdfProps = {
        bookingNumber,
        logoUrl,
        guest: data.guest,
        booking: {
          ...data.booking,
          meals: mealsText || "-",
        },
        payments,
        paymentType: data.paymentType,
        totalPaid,
        remainingAmount,
        emissionDate,
        emissionTime,
      };

      // Gerar o PDF
      const blob = await pdf(<BookingReceiptPdf {...pdfProps} />).toBlob();
      
      // Nome do arquivo no formato: [código] - [suíte] - [hóspede]
      const fileName = `${bookingNumber} - ${data.booking.accommodation} - ${data.guest.firstName}.pdf`;
      
      // Criar um File com o nome correto
      const file = new File([blob], fileName, { type: "application/pdf" });
      const url = URL.createObjectURL(file);
      
      // Criar link temporário para download/visualização
      const link = document.createElement("a");
      link.href = url;
      link.download = fileName;
      
      // Simular clique para baixar
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Limpar URL após um tempo
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      
    } catch (error) {
      console.error("Erro ao gerar PDF:", error);
      alert("Erro ao gerar PDF. Tente novamente.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-5xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Gerador de Comprovantes de Reserva</h1>
        <p className="text-muted-foreground mt-2">
          Pousada Dois Corações - Próxima reserva: <strong>N° {currentBookingNumber}</strong>
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Dados do Hóspede */}
        <Card>
          <CardHeader>
            <CardTitle>Dados do Hóspede</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="firstName">Nome *</Label>
                <Input id="firstName" {...register("guest.firstName")} />
                {errors.guest?.firstName && (
                  <p className="text-sm text-red-500 mt-1">
                    {errors.guest.firstName.message}
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="lastName">Sobrenome *</Label>
                <Input id="lastName" {...register("guest.lastName")} />
                {errors.guest?.lastName && (
                  <p className="text-sm text-red-500 mt-1">
                    {errors.guest.lastName.message}
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="email">Email *</Label>
                <Input id="email" type="email" {...register("guest.email")} />
                {errors.guest?.email && (
                  <p className="text-sm text-red-500 mt-1">{errors.guest.email.message}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="cpf">CPF *</Label>
                <Controller
                  name="guest.cpf"
                  control={control}
                  render={({ field }) => (
                    <Input
                      id="cpf"
                      value={field.value}
                      onChange={(e) => {
                        handleCPFChange(e);
                      }}
                      placeholder="000.000.000-00"
                    />
                  )}
                />
                {errors.guest?.cpf && (
                  <p className="text-sm text-red-500 mt-1">{errors.guest.cpf.message}</p>
                )}
              </div>
              <div>
                <Label htmlFor="phone">Telefone *</Label>
                <Controller
                  name="guest.phone"
                  control={control}
                  render={({ field }) => (
                    <Input
                      id="phone"
                      value={field.value}
                      onChange={(e) => {
                        handlePhoneChange(e);
                      }}
                      placeholder="+55 (00) 0 0000-0000"
                    />
                  )}
                />
                {errors.guest?.phone && (
                  <p className="text-sm text-red-500 mt-1">{errors.guest.phone.message}</p>
                )}
              </div>
            </div>

            <div>
              <Label htmlFor="observations">Observações</Label>
              <Textarea id="observations" {...register("guest.observations")} rows={2} />
            </div>
          </CardContent>
        </Card>

        {/* Dados da Reserva */}
        <Card>
          <CardHeader>
            <CardTitle>Informações da Reserva</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Ocupação com Combobox */}
            <div>
              <Label>Ocupação *</Label>
              <Controller
                name="booking.accommodation"
                control={control}
                render={({ field }) => (
                  <Popover open={accommodationOpen} onOpenChange={setAccommodationOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={accommodationOpen}
                        className="w-full justify-between"
                      >
                        {field.value || "Selecione a ocupação..."}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-full p-0" align="start">
                      <Command>
                        <CommandInput
                          placeholder="Buscar ou adicionar..."
                          value={newAccommodation}
                          onValueChange={setNewAccommodation}
                        />
                        <CommandList>
                          <CommandEmpty>
                            <Button
                              type="button"
                              variant="ghost"
                              className="w-full justify-start"
                              onClick={handleAddAccommodation}
                            >
                              <Plus className="mr-2 h-4 w-4" />
                              Adicionar &quot;{newAccommodation}&quot;
                            </Button>
                          </CommandEmpty>
                          <CommandGroup>
                            {accommodations.map((acc) => (
                              <CommandItem
                                key={acc}
                                value={acc}
                                onSelect={() => {
                                  field.onChange(acc);
                                  setAccommodationOpen(false);
                                }}
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    field.value === acc ? "opacity-100" : "opacity-0"
                                  )}
                                />
                                {acc}
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                )}
              />
              {errors.booking?.accommodation && (
                <p className="text-sm text-red-500 mt-1">
                  {errors.booking.accommodation.message}
                </p>
              )}
            </div>

            {/* Período e Horários */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <Label htmlFor="periodStart">Período - Início *</Label>
                <Input id="periodStart" type="date" {...register("booking.periodStart")} />
                {errors.booking?.periodStart && (
                  <p className="text-sm text-red-500 mt-1">
                    {errors.booking.periodStart.message}
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="periodEnd">Período - Fim *</Label>
                <Input id="periodEnd" type="date" {...register("booking.periodEnd")} />
                {errors.booking?.periodEnd && (
                  <p className="text-sm text-red-500 mt-1">
                    {errors.booking.periodEnd.message}
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="checkInTime">Horário Check-in</Label>
                <Input id="checkInTime" type="time" {...register("booking.checkInTime")} />
              </div>
              <div>
                <Label htmlFor="checkOutTime">Horário Check-out</Label>
                <Input id="checkOutTime" type="time" {...register("booking.checkOutTime")} />
              </div>
            </div>

            {/* Valores */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="averageDailyRate">Diária Média (R$) *</Label>
                <Input
                  id="averageDailyRate"
                  type="text"
                  inputMode="numeric"
                  value={dailyRateFormatted}
                  onChange={handleDailyRateChange}
                  placeholder="0,00"
                />
                {errors.booking?.averageDailyRate && (
                  <p className="text-sm text-red-500 mt-1">
                    {errors.booking.averageDailyRate.message}
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="totalDays">Quantidade de Diárias</Label>
                <Input
                  id="totalDays"
                  type="number"
                  {...register("booking.totalDays", { valueAsNumber: true })}
                  readOnly
                  className="bg-muted"
                />
              </div>
              <div>
                <Label htmlFor="totalAmount">Valor Total (R$)</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    R$
                  </span>
                  <Input
                    id="totalAmount"
                    type="text"
                    inputMode="numeric"
                    className="pl-10 text-lg font-semibold"
                    value={totalAmountFormatted}
                    onChange={handleTotalAmountChange}
                    placeholder="0,00"
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Edite para calcular a diária automaticamente
                </p>
              </div>
            </div>

            {/* Hóspedes */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label>N° Adultos *</Label>
                <Controller
                  name="booking.adults"
                  control={control}
                  render={({ field }) => (
                    <Select
                      onValueChange={(v) => field.onChange(parseInt(v))}
                      value={field.value.toString()}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {PERSON_COUNT_OPTIONS.filter((n) => n > 0).map((n) => (
                          <SelectItem key={n} value={n.toString()}>
                            {n}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
              <div>
                <Label>N° Crianças</Label>
                <Controller
                  name="booking.children"
                  control={control}
                  render={({ field }) => (
                    <Select
                      onValueChange={(v) => field.onChange(parseInt(v))}
                      value={field.value.toString()}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {PERSON_COUNT_OPTIONS.map((n) => (
                          <SelectItem key={n} value={n.toString()}>
                            {n}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
              <div>
                <Label>N° Bebês</Label>
                <Controller
                  name="booking.babies"
                  control={control}
                  render={({ field }) => (
                    <Select
                      onValueChange={(v) => field.onChange(parseInt(v))}
                      value={field.value.toString()}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {PERSON_COUNT_OPTIONS.map((n) => (
                          <SelectItem key={n} value={n.toString()}>
                            {n}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
            </div>

            {/* Alimentação - Checkboxes */}
            <div>
              <Label className="mb-3 block">Alimentação</Label>
              <Controller
                name="booking.meals"
                control={control}
                render={({ field }) => (
                  <div className="flex flex-wrap gap-6">
                    {MEAL_OPTIONS.map((meal) => (
                      <div key={meal.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={meal.id}
                          checked={field.value.includes(meal.id)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              field.onChange([...field.value, meal.id]);
                            } else {
                              field.onChange(field.value.filter((v) => v !== meal.id));
                            }
                          }}
                        />
                        <label
                          htmlFor={meal.id}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          {meal.label}
                        </label>
                      </div>
                    ))}
                  </div>
                )}
              />
            </div>
          </CardContent>
        </Card>

        {/* Tipo de Pagamento */}
        <Card>
          <CardHeader>
            <CardTitle>Pagamento</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Tipo de Pagamento *</Label>
              <Controller
                name="paymentType"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="FULL">Pagamento Integral</SelectItem>
                      <SelectItem value="PARTIAL">Pagamento Parcial (50% + Check-in)</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            {/* Descrição automática */}
            <div className="p-3 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">
                <strong>Descrição do pagamento:</strong> {generatePaymentDescription()}
              </p>
            </div>

            {/* Pagamento Integral */}
            {paymentType === "FULL" && (
              <div className="p-4 border rounded-lg space-y-4">
                <h4 className="font-semibold">Pagamento Único</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label>Método *</Label>
                    <Controller
                      name="singlePayment.method"
                      control={control}
                      render={({ field }) => (
                        <Select onValueChange={field.onChange} value={field.value}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="PIX">PIX</SelectItem>
                            <SelectItem value="CARTAO">Cartão</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </div>
                  <div>
                    <Label>Data *</Label>
                    <Input type="date" {...register("singlePayment.date")} />
                  </div>
                  <div>
                    <Label>Valor (R$) *</Label>
                    <Input
                      type="text"
                      inputMode="numeric"
                      value={singlePaymentFormatted}
                      onChange={handleSinglePaymentChange}
                      placeholder="0,00"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Pagamento Parcial */}
            {paymentType === "PARTIAL" && (
              <>
                {/* Pagamentos já realizados */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold">Pagamentos Realizados</h4>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        appendPartial({
                          method: "PIX",
                          date: "",
                          amount: 0,
                        });
                        setPartialPaymentsFormatted(prev => [...prev, ""]);
                      }}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Adicionar
                    </Button>
                  </div>

                  {partialFields.map((field, index) => (
                    <div key={field.id} className="p-4 border rounded-lg space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Pagamento {index + 1}</span>
                        {partialFields.length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              removePartial(index);
                              setPartialPaymentsFormatted(prev => prev.filter((_, i) => i !== index));
                            }}
                          >
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </Button>
                        )}
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <Label>Método *</Label>
                          <Controller
                            name={`partialPayments.${index}.method`}
                            control={control}
                            render={({ field }) => (
                              <Select onValueChange={field.onChange} value={field.value}>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="PIX">PIX</SelectItem>
                                  <SelectItem value="CARTAO">Cartão</SelectItem>
                                </SelectContent>
                              </Select>
                            )}
                          />
                        </div>
                        <div>
                          <Label>Data *</Label>
                          <Input
                            type="date"
                            {...register(`partialPayments.${index}.date`)}
                          />
                        </div>
                        <div>
                          <Label>Valor (R$) *</Label>
                          <Input
                            type="text"
                            inputMode="numeric"
                            value={partialPaymentsFormatted[index] || ""}
                            onChange={(e) => handlePartialPaymentChange(index, e)}
                            placeholder="0,00"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pagamento do Check-in */}
                <div className="p-4 border rounded-lg space-y-4">
                  <h4 className="font-semibold">
                    Pagamento no Check-in (Restante)
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label>Método</Label>
                      <Controller
                        name="checkInPayment.method"
                        control={control}
                        render={({ field }) => (
                          <Select onValueChange={field.onChange} value={field.value}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="PIX">PIX</SelectItem>
                              <SelectItem value="CARTAO">Cartão</SelectItem>
                            </SelectContent>
                          </Select>
                        )}
                      />
                    </div>
                    <div>
                      <Label>Data</Label>
                      <Input type="date" {...register("checkInPayment.date")} />
                    </div>
                    <div>
                      <Label>Valor (R$)</Label>
                      <Input
                        type="text"
                        inputMode="numeric"
                        value={checkInPaymentFormatted}
                        onChange={handleCheckInPaymentChange}
                        placeholder="0,00"
                      />
                    </div>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Botão */}
        <div className="flex gap-4">
          <Button type="submit" size="lg" disabled={isGenerating} className="gap-2">
            <FileDown className="w-5 h-5" />
            {isGenerating ? "Gerando PDF..." : "Gerar e Abrir PDF"}
          </Button>
        </div>
      </form>
    </div>
  );
}
