import { redirect } from "next/navigation"
import { headers } from "next/headers"
import { auth } from "@/lib/auth"
import { OnboardingClient } from "./components/onboarding-client"

export const metadata = {
  title: "Bem-vindo | Decode Manager",
  description: "Configure sua organização para começar",
}

export default async function OnboardingPage() {
  // Verifica se usuário está autenticado
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session?.user) {
    redirect("/login")
  }

  // Verifica se já tem organização
  const organizations = await auth.api.listOrganizations({
    headers: await headers(),
  })

  if (organizations && organizations.length > 0) {
    // Já tem organização, redireciona para o dashboard dela
    const org = organizations[0]
    redirect(`/${org.slug}/dashboard`)
  }

  return <OnboardingClient userName={session.user.name || "usuário"} />
}
