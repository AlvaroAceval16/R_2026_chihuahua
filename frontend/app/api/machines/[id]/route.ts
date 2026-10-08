import { NextResponse, type NextRequest } from "next/server";
import { getSession } from "@/lib/auth";
import { getMachineState } from "@/lib/data";

/**
 * Estado de una máquina por nfc_id o id:
 * catálogo + último diagnóstico de IA + conteo de mantenimientos.
 */
export async function GET(
  _req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  const user = await getSession();
  if (!user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { id } = await ctx.params;
  const state = getMachineState(id);
  if (!state) {
    return NextResponse.json({ error: "Máquina no encontrada" }, { status: 404 });
  }
  return NextResponse.json(state);
}