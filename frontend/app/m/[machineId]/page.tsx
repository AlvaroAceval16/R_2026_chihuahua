export const instant = false;

import { redirect, notFound } from "next/navigation";
import { getMachine } from "@/lib/data";
import { getSession } from "@/lib/auth";

/**
 * Entrada tras escanear el chip NFC.
 * Resuelve la máquina y redirige a la pantalla según el rol de la sesión.
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

  const machine = getMachine(machineId);
  if (!machine) {
    notFound();
  }

  redirect(
    `/m/${machine.nfc_id}/${session.role === "supervisor" ? "panel" : "mantenimiento"}`
  );
}