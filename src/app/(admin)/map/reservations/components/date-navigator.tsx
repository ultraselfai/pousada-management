"use client";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface DateNavigatorProps {
  currentDate: Date;
  onDateChange: (date: Date) => void;
  days?: number;
}

export function DateNavigator({
  currentDate,
  onDateChange,
  days = 14,
}: DateNavigatorProps) {
  const goToPrevious = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() - days);
    onDateChange(newDate);
  };

  const goToNext = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + days);
    onDateChange(newDate);
  };

  const goToToday = () => {
    onDateChange(new Date());
  };

  const endDate = new Date(currentDate);
  endDate.setDate(endDate.getDate() + days - 1);

  return (
    <div className="flex items-center gap-2">
      <Button variant="outline" size="icon" onClick={goToPrevious}>
        <ChevronLeft className="h-4 w-4" />
      </Button>

      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "min-w-[240px] justify-start text-left font-normal"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {format(currentDate, "dd MMM", { locale: ptBR })} -{" "}
            {format(endDate, "dd MMM yyyy", { locale: ptBR })}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={currentDate}
            onSelect={(date) => date && onDateChange(date)}
            locale={ptBR}
            initialFocus
          />
        </PopoverContent>
      </Popover>

      <Button variant="outline" size="icon" onClick={goToNext}>
        <ChevronRight className="h-4 w-4" />
      </Button>

      <Button variant="ghost" size="sm" onClick={goToToday}>
        Hoje
      </Button>
    </div>
  );
}
