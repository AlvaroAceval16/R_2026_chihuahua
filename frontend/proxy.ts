import { NextResponse, type NextRequest } from "next/server";
import { AUTH_COOKIE, verifySessionToken } from "@/lib/auth-core";
import type { SessionUser } from "@/types/user";

/**
 * Proxy (antes "middleware") de Next 16.
 * Controla acceso: sin sesión válida → login (páginas) o 401 (API);
 * rol incorrecto para una ruta de máquina → /prohibido.
 */
export async function proxy(request: NextRequest): Promise<NextResponse> {
  const { pathname } = request.nextUrl;
  const user = await currentUser(request);

  // Páginas públicas
  if (pathname === "/login" || pathname === "/prohibido") {
    if (pathname === "/login" && user) {
      return NextResponse.redirect(new URL("/", request.url));
    }
    return NextResponse.next();
  }

  const isApi = pathname.startsWith("/api");

  // Endpoints públicos de sesión (login/logout) se validan dentro del handler
  if (pathname === "/api/auth/login" || pathname === "/api/auth/logout") {
    return NextResponse.next();
  }

  if (!user) {
    if (isApi) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Control de rol en rutas de máquina
  if (/^\/m\/[^/]+\/mantenimiento/.test(pathname) && user.role !== "mantenimiento") {
    return NextResponse.redirect(new URL("/prohibido", request.url));
  }
  if (/^\/m\/[^/]+\/panel/.test(pathname) && user.role !== "supervisor") {
    return NextResponse.redirect(new URL("/prohibido", request.url));
  }

  return NextResponse.next();
}

async function currentUser(request: NextRequest): Promise<SessionUser | null> {
  const token = request.cookies.get(AUTH_COOKIE)?.value;
  if (!token) return null;
  return verifySessionToken(token);
}

export const config = {
  matcher: ["/login", "/", "/prohibido", "/m/:path*", "/logs", "/api/:path*"],
};