import { NextResponse, type NextRequest } from "next/server";
import { getDb } from "@/lib/db";
import { AUTH_COOKIE, SESSION_MAX_AGE, signSession } from "@/lib/auth-core";
import type { SessionUser } from "@/types/user";

/**
 * Login sin contraseña (demo): basta el nombre de usuario.
 * Cualquier credencial inexistente es rechazada.
 */
export async function POST(req: NextRequest) {
  let body: { username?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  const username = String(body.username ?? "").trim().toLowerCase();
  if (!username) {
    return NextResponse.json({ error: "El usuario es requerido" }, { status: 400 });
  }

  const row = getDb()
    .prepare("SELECT id, username, role, full_name FROM users WHERE username = ?")
    .get(username) as Pick<SessionUser, "id" | "username" | "role" | "full_name"> | undefined;

  if (!row) {
    return NextResponse.json({ error: "Credencial inválida" }, { status: 401 });
  }

  const user: SessionUser = row;
  const token = await signSession(user);

  const res = NextResponse.json({ user }, { status: 200 });
  res.cookies.set(AUTH_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });
  return res;
}