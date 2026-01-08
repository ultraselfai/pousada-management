/**
 * Better Auth API Route Handler
 *
 * Este arquivo monta o handler do Better-Auth na rota /api/auth/*
 * Todas as requisições de autenticação passam por aqui.
 */

import { auth } from "@/lib/auth";
import { toNextJsHandler } from "better-auth/next-js";

export const { GET, POST } = toNextJsHandler(auth.handler);
