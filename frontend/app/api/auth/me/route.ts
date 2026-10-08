import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";

/** Devuelve el usuario de la sesión actual (o 401). */
export async function GET() {
  const user = await getSession();
  if (!user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  return NextResponse.json({ user });
}