import { NextResponse, type NextRequest } from "next/server";
import { getSession } from "@/lib/auth";
import { listMaintenanceLogs, listAiLogs, type LogFilters } from "@/lib/data";

/**
 * Logs del sistema: mantenimientos y diagnósticos de IA.
 * Query params: type=maintenance | ai | (ambos), machine, from, to.
 */
export async function GET(req: NextRequest) {
  const user = await getSession();
  if (!user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const sp = req.nextUrl.searchParams;
  const type = sp.get("type");
  const filters: LogFilters = {
    machine: sp.get("machine") ?? undefined,
    from: sp.get("from") ?? undefined,
    to: sp.get("to") ?? undefined,
  };

  const payload: Record<string, unknown> = {};
  if (!type || type === "maintenance") {
    payload.maintenance = listMaintenanceLogs(filters);
  }
  if (!type || type === "ai") {
    payload.ai = listAiLogs(filters);
  }

  return NextResponse.json(payload);
}