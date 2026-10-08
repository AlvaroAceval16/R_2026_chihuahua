import { NextResponse, type NextRequest } from "next/server";
import { getSession } from "@/lib/auth";
import { getMachine, createMaintenance, listMaintenanceLogs } from "@/lib/data";
import type { LogFilters } from "@/lib/data";

/** GET: histórico de mantenimientos (ambos roles). */
export async function GET(req: NextRequest) {
  const user = await getSession();
  if (!user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const filters: LogFilters = {
    machine: req.nextUrl.searchParams.get("machine") ?? undefined,
    from: req.nextUrl.searchParams.get("from") ?? undefined,
    to: req.nextUrl.searchParams.get("to") ?? undefined,
  };

  return NextResponse.json({ maintenance: listMaintenanceLogs(filters) });
}

/** POST: registrar mantenimiento (solo rol mantenimiento). */
export async function POST(req: NextRequest) {
  const user = await getSession();
  if (!user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  if (user.role !== "mantenimiento") {
    return NextResponse.json(
      { error: "Solo el rol de mantenimiento puede registrar" },
      { status: 403 }
    );
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  const machineNfc = String(body.machineNfc ?? body.machine_id ?? "").trim();
  const workDone = String(body.workDone ?? "").trim();
  if (!machineNfc || !workDone) {
    return NextResponse.json(
      { error: "Faltan campos: machineNfc y workDone son obligatorios" },
      { status: 400 }
    );
  }

  const machine = getMachine(machineNfc);
  if (!machine) {
    return NextResponse.json({ error: "Máquina no encontrada" }, { status: 400 });
  }

  const partsReplaced = body.partsReplaced
    ? String(body.partsReplaced).trim()
    : null;
  const observations = body.observations ? String(body.observations).trim() : null;
  const durationMin =
    body.durationMin != null && body.durationMin !== ""
      ? Number(body.durationMin)
      : null;

  const log = createMaintenance({
    machineId: machine.id,
    userId: user.id,
    machineNfc,
    workDone,
    partsReplaced,
    observations,
    durationMin,
  });

  return NextResponse.json({ maintenance: log }, { status: 201 });
}