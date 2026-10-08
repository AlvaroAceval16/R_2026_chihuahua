import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { AUTH_COOKIE, verifySessionToken } from "@/lib/auth-core";
import type { Role, SessionUser } from "@/types/user";

export { AUTH_COOKIE };

/** Lee la sesión actual desde la cookie (solo servidor). */
export async function getSession(): Promise<SessionUser | null> {
  const store = await cookies();
  const token = store.get(AUTH_COOKIE)?.value;
  if (!token) return null;
  return verifySessionToken(token);
}

/** Para páginas: exige sesión y redirige a /login si no hay. */
export async function requireSession(): Promise<SessionUser> {
  const user = await getSession();
  if (!user) redirect("/login");
  return user;
}

/** Para páginas: exige sesión + rol y redirige a /prohibido si el rol no coincide. */
export async function requireRole(role: Role): Promise<SessionUser> {
  const user = await requireSession();
  if (user.role !== role) redirect("/prohibido");
  return user;
}