import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { listMachines } from "@/lib/data";

/** Catálogo de máquinas (requiere sesión). */
export async function GET() {
  const user = await getSession();
  if (!user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  return NextResponse.json({ machines: listMachines() });
}