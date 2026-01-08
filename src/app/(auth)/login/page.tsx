import { UserAuthForm } from "./components/user-auth-form"
import { Logo } from "@/components/logo"
import Link from "next/link"
import Image from "next/image"
import { Suspense } from "react"

export const metadata = {
  title: "Login | Decode Console",
  description: "Entre ou crie sua conta no Decode Console",
}

export default function LoginPage() {
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
            <Suspense fallback={<div className="flex items-center justify-center"><span className="animate-pulse">Carregando...</span></div>}>
              <UserAuthForm />
            </Suspense>
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
