/**
 * Better Auth - Client Configuration
 *
 * Cliente do Better-Auth para uso no frontend.
 * Este arquivo pode ser importado em Client Components.
 *
 * Uso:
 * ```tsx
 * import { authClient } from "@/lib/auth-client";
 *
 * // Login
 * await authClient.signIn.email({ email, password });
 *
 * // Verificar sessão
 * const session = authClient.useSession();
 *
 * // Organizações
 * await authClient.organization.create({ name, slug });
 * ```
 */

import { createAuthClient } from "better-auth/react";
import { organizationClient, twoFactorClient, adminClient } from "better-auth/client/plugins";
import type { Auth } from "./auth";

export const authClient = createAuthClient({
  // URL base da API (usa a mesma origem por padrão)
  baseURL: typeof window !== "undefined" ? window.location.origin : "",

  // Plugins do cliente
  plugins: [
    // Multi-tenancy - permite gerenciar organizações
    organizationClient(),

    // Two-Factor Authentication
    twoFactorClient(),

    // Admin - permite gerenciar usuários e impersonar
    adminClient(),
  ],
});

// Hooks reativos para uso em componentes React
export const {
  useSession,
  useActiveOrganization,
  useListOrganizations,
} = authClient;

// Funções de autenticação
export const {
  signIn,
  signUp,
  signOut,
  useSession: getSession,
} = authClient;

// Funções de organização
export const { organization } = authClient;

// Exporta o cliente completo para casos avançados
export default authClient;
