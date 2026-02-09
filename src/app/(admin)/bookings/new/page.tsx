import { CalendarPlus } from "lucide-react"
import { BookingWizard } from "./components/booking-wizard"

export default function NewBookingPage() {
  return (
    <div className="flex flex-1 flex-col px-4 md:px-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <CalendarPlus className="h-6 w-6" />
          Nova Reserva
        </h1>
        <p className="text-muted-foreground">
          Siga os passos para criar uma nova reserva
        </p>
      </div>

      <BookingWizard />
    </div>
  )
}
