/**
 * Auth Types
 *
 * Tipos TypeScript para a feature de autenticação.
 * Separados dos schemas Zod para melhor organização.
 */

export interface User {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Session {
  user: User;
  tenantId: string;
  expiresAt: Date;
}

export interface AuthState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
}

export type AuthProvider = "credentials" | "google" | "github";

export interface AuthResult {
  success: boolean;
  message?: string;
  user?: User;
  redirectUrl?: string;
}
