/**
 * Auth Feature - Public API
 *
 * Este arquivo exporta apenas o que deve ser acessível
 * por outras partes da aplicação.
 */

// Types
export type {
  User,
  Session,
  AuthState,
  AuthProvider,
  AuthResult,
} from "./types";

// Schemas & Validation Types
export {
  signInSchema,
  signUpSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from "./schemas";

export type {
  SignInInput,
  SignUpInput,
  ForgotPasswordInput,
  ResetPasswordInput,
} from "./schemas";

// Server Actions
// export { signIn, signOut } from "./actions";
