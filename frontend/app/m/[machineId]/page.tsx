export const instant = false;

import { redirect, notFound } from "next/navigation";
import { getMachine } from "@/lib/data";
import { getSession } from "@/lib/auth";
import plant from "@/data/plant.json";
import type { PlantMachine } from "@/types/machine";

const plantMachines = plant as PlantMachine[];

/**
 * Mapa nfc_id (catálogo de la BD) → machineId de la UI de planta (plant.json).
 * El chip NFC conserva su URL histórica; el supervisor aterriza en la
 * pantalla nueva de la planta y mantenimiento en su registro.
 */
const NFC_TO_PLANT: Record<string, string> = {
  "motor-01": "CNC-02",
  "cnc-01": "CNC-01",
  "compresor-01": "CNC-03",
};

/** Resuelve el id de plant.json aceptando mayúsculas/minúsculas. */
function toPlantId(ref: string): string | undefined {
  const lower = ref.toLowerCase();
  const mapped = NFC_TO_PLANT[lower];
  if (mapped) return mapped;
  return plantMachines.find((m) => m.machineId.toLowerCase() === lower)
    ?.machineId;
}

/**
 * Entrada tras escanear el chip NFC.
 * Resuelve la máquina (BD o plant.json) y redirige según el rol:
 *  - supervisor    → UI de planta (/maquinas/<id>)
 *  - mantenimiento → pantalla de registro (/m/<nfc_id>/mantenimiento)
 */
export default async function MachineLanding({
  params,
}: {
  params: Promise<{ machineId: string }>;
}) {
  const { machineId } = await params;
  const session = await getSession();

  if (!session) {
    redirect(`/login?next=/m/${encodeURIComponent(machineId)}`);
  }

  const machine = getMachine(machineId.toLowerCase()) ?? getMachine(machineId);
  const plantId =
    toPlantId(machineId) ?? (machine ? toPlantId(machine.nfc_id) : undefined);

  if (!machine && !plantId) {
    notFound();
  }

  if (session.role === "mantenimiento") {
    // Sin ficha en la BD no hay pantalla de registro → dashboard de planta.
    if (!machine) redirect("/");
    redirect(`/m/${machine.nfc_id}/mantenimiento`);
  }

  // Supervisor → pantalla nueva de la planta cuando existe el mapeo.
  if (plantId) redirect(`/maquinas/${plantId}`);
  if (machine) redirect(`/m/${machine.nfc_id}/panel`);
  redirect("/");
}
