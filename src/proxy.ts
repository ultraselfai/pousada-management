import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const url = request.nextUrl;
  const hostname = request.headers.get("host") || "";

  // Domínios
  // Ajuste conforme necessário para produção e desenvolvimento
  const isConsole = 
    hostname.includes("console.pousadadoiscoracoes.com.br") || 
    hostname.includes("console.localhost");

  // Se estiver no subdomínio 'console'
  if (isConsole) {
    // Redireciona a raiz para /admin-login
    if (url.pathname === "/") {
      return NextResponse.redirect(new URL("/admin-login", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (images, etc)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)",
  ],
};
