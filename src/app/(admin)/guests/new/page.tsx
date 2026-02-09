import { UserPlus } from "lucide-react"
import Link from "next/link"
import { GuestForm } from "../components/guest-form"

export default function NewGuestPage() {
  return (
    <div className="flex flex-1 flex-col px-4 md:px-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <UserPlus className="h-6 w-6" />
          Novo Hóspede
        </h1>
        <p className="text-muted-foreground">
          Preencha os dados do novo hóspede
        </p>
      </div>

      <GuestForm />
    </div>
  )
}
