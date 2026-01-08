import { ForgotPasswordForm } from "./components/forgot-password-form"
import { Logo } from "@/components/logo"
import Link from "next/link"
import Image from "next/image"

export const metadata = {
  title: "Recuperar Senha | Decode Console",
  description: "Recupere sua senha do Decode Console",
}

export default function ForgotPasswordPage() {
  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex justify-center gap-2 md:justify-start">
          <Link href="/" className="flex items-center gap-2 font-medium">
            <div className="bg-primary text-primary-foreground flex size-8 items-center justify-center rounded-md">
              <Logo size={24} />
            </div>
            Decode Console
          </Link>
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-md">
            <ForgotPasswordForm />
          </div>
        </div>
      </div>
      <div className="bg-muted relative hidden lg:block">
        <Image
          src="https://ui.shadcn.com/placeholder.svg"
          alt="Decode Console"
          fill
          className="object-cover dark:brightness-[0.95] dark:invert"
        />
      </div>
    </div>
  )
}
