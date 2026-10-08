import { SignJWT, jwtVerify } from "jose";
import type { SessionUser } from "@/types/user";

/** Nombre de la cookie httpOnly de sesión. */
export const AUTH_COOKIE = "rf_session";

/** Duración de la sesión de la demo (8 h). */
export const SESSION_MAX_AGE = 8 * 60 * 60;

function secret(): Uint8Array {
  const raw =
    process.env.AUTH_SECRET ??
    "retrofit-demo-secret-2026-cambiar-antes-de-produccion";
  return new TextEncoder().encode(raw);
}

/** Firma un token de sesión con el payload del usuario. */
export async function signSession(user: SessionUser): Promise<string> {
  return new SignJWT({
    username: user.username,
    role: user.role,
    full_name: user.full_name,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(String(user.id))
    .setIssuedAt()
    .setExpirationTime(new Date(Date.now() + SESSION_MAX_AGE * 1000))
    .sign(secret());
}

/** Verifica un token y devuelve el usuario, o null si es inválido/expirado. */
export async function verifySessionToken(
  token: string
): Promise<SessionUser | null> {
  try {
    const { payload } = await jwtVerify(token, secret());
    return {
      id: Number(payload.sub),
      username: String(payload.username),
      role: payload.role as SessionUser["role"],
      full_name: String(payload.full_name),
    };
  } catch {
    return null;
  }
}