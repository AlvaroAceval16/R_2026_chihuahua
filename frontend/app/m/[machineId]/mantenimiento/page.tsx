export const instant = false;

import { notFound } from "next/navigation";
import { AppShell } from "@/app/_components/AppShell";
import { requireRole } from "@/lib/auth";
import { getMachineState } from "@/lib/data";

/** PLACEHOLDER — Pantalla de mantenimiento (formulario de registro). */
export default async function MantenimientoPage({
  params,
}: {
  params: Promise<{ machineId: string }>;
}) {
  const { machineId } = await params;
  await requireRole("mantenimiento");

  const state = getMachineState(machineId);
  if (!state) notFound();

  return (
    <AppShell>
      <main className="mx-auto max-w-5xl px-4 py-6">
        <h1 className="text-lg font-semibold text-slate-800">Mantenimiento</h1>
        <p className="mt-1 text-sm text-slate-500">{state.machine.name}</p>

        <div className="mt-4 rounded-xl border border-dashed border-slate-300 bg-white p-6">
          <p className="text-sm text-slate-400">
            🔧 En construcción — aquí se registrará el trabajo realizado, piezas
            cambiadas y observaciones. La API <code>POST /api/maintenance</code>{" "}
            ya está preparada y protegida por rol.
          </p>
        </div>

        <div className="mt-4 rounded-xl border border-slate-200 bg-white p-4 text-sm">
          <p className="text-xs text-slate-400">Estado</p>
          <p className="mt-1 font-medium text-slate-800">{state.machine.status}</p>
        </div>
      </main>
    </AppShell>
  );
}