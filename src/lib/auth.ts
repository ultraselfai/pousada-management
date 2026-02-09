/**
 * Better Auth - Server Configuration
 *
 * Configuração principal do Better-Auth para o Decode Console.
 * Este arquivo roda apenas no servidor.
 *
 * Plugins habilitados:
 * - organization: Multi-tenancy (subdomínios por tenant)
 * - twoFactor: Autenticação de dois fatores
 * - admin: Gerenciamento de usuários e impersonação
 * - nextCookies: Integração com Next.js cookies
 */

import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { organization, twoFactor, admin } from "better-auth/plugins";
import { nextCookies } from "better-auth/next-js";
import { prisma } from "@/db";

export const auth = betterAuth({
  // Configuração do banco de dados via Prisma
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),

  // Autenticação por email/senha habilitada
  emailAndPassword: {
    enabled: true,
  },

  user: {
    additionalFields: {
      permissions: {
        type: "string[]",
        required: false,
        defaultValue: []
      }
    }
  },

  // Plugins
  plugins: [
    // Multi-tenancy via Organizations
    organization({
      // Permite qualquer usuário criar organização (ajustar depois para planos)
      allowUserToCreateOrganization: true,

      // Limite de organizações por usuário (ajustar para planos)
      organizationLimit: 5,

      // Schema customizado para usar nossa tabela "organizations" existente
      schema: {
        organization: {
          modelName: "organization", // Mapeia para tabela organizations
        },
      },

      // Roles padrão
      // owner: Dono da organização, pode tudo
      // admin: Administrador, pode gerenciar membros
      // member: Membro comum, apenas acesso
    }),

    // Two-Factor Authentication
    twoFactor({
      issuer: "Decode Console",
      // Métodos de 2FA disponíveis
      otpOptions: {
        // TOTP (Google Authenticator, etc)
        async sendOTP({ user, otp }) {
          // TODO: Enviar OTP por email quando configurar serviço de email
          console.log(`[DEV] OTP para ${user.email}: ${otp}`);
        },
      },
    }),

    // Admin Plugin - Gerenciamento de usuários e impersonação
    // IMPORTANTE: Para impersonar, o usuário precisa ter role: "admin" no banco
    // ou estar na lista adminUserIds. A verificação usa o campo user.role.
    admin({
      // Roles que são consideradas admin (podem impersonar, ban, etc)
      adminRoles: ["admin", "owner"],
      // Duração da sessão de impersonação: 1 hora
      impersonationSessionDuration: 60 * 60,
    }),

    // Integração com Next.js (deve ser o último plugin)
    nextCookies(),
  ],

  callbacks: {
    session: async ({ session, user }: { session: any, user: any }) => {
      return {
        ...session,
        user: {
          ...session.user,
          permissions: (user as any).permissions,
          role: (user as any).role // Ensure role is also passed if needed (admin plugin usually handles, but safe to add)
        },
      };
    },
  },

  // Configurações de sessão
  session: {
    // Tempo de expiração: 7 dias
    expiresIn: 60 * 60 * 24 * 7, // 7 days in seconds
    // Atualizar sessão quando faltar 1 dia para expirar
    updateAge: 60 * 60 * 24, // 1 day in seconds
    // Cookie cross-domain para funcionar com múltiplos subdomínios
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60, // 5 minutes
    },
  },

  // URL base para produção (obrigatório para callbacks de auth)
  baseURL: process.env.BETTER_AUTH_URL || process.env.NEXT_PUBLIC_APP_URL,
  
  // Origens confiáveis para requests de auth
  trustedOrigins: [
    "https://pousadadoiscoracoes.com.br",
    "https://console.pousadadoiscoracoes.com.br",
    "https://reservas.pousadadoiscoracoes.com.br",
    // Wildcards para subdomínios
    "https://*.pousadadoiscoracoes.com.br",
    // Desenvolvimento local
    "http://localhost:3000",
    "http://localhost:3001",
  ],
  
  // Configuração avançada de cookies para multi-domínio
  // Permite que o cookie de sessão seja compartilhado entre subdomínios
  advanced: {
    // Define o domínio do cookie para permitir compartilhamento entre subdomínios
    // Em produção: .pousadadoiscoracoes.com.br
    // Em desenvolvimento: não define domínio (localhost funciona automaticamente)
    cookieDomain: process.env.NODE_ENV === "production" ? ".pousadadoiscoracoes.com.br" : undefined,
    // Usa secure cookies em produção
    useSecureCookies: process.env.NODE_ENV === "production",
    // Cross-site cookies para funcionar com diferentes origens
    crossSubDomainCookies: {
      enabled: true,
      domain: process.env.NODE_ENV === "production" ? ".pousadadoiscoracoes.com.br" : undefined,
    },
  },
});

// Exporta o tipo do auth para inferência no cliente
export type Auth = typeof auth;
