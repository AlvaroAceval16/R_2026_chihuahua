export const instant = false;

import { notFound } from "next/navigation";
import { AppShell } from "@/app/_components/AppShell";
import { requireRole } from "@/lib/auth";
import { getMachineState } from "@/lib/data";

/** PLACEHOLDER — Pantalla del supervisor (datos de la máquina + IA). */
export default async function PanelPage({
  params,
}: {
  params: Promise<{ machineId: string }>;
}) {
  const { machineId } = await params;
  await requireRole("supervisor");

  const state = getMachineState(machineId);
  if (!state) notFound();

  const last = state.latest_ai_log;

  return (
    <AppShell>
      <main className="mx-auto max-w-5xl px-4 py-6">
        <h1 className="text-lg font-semibold text-slate-800">
          Panel de monitoreo
        </h1>
        <p className="mt-1 text-sm text-slate-500">{state.machine.name}</p>

        <div className="mt-4 rounded-xl border border-dashed border-slate-300 bg-white p-6">
          <p className="text-sm text-slate-400">
            📐 En construcción — aquí se integrará el dashboard de la máquina
            (telemetría, gemelo digital, OEE y diagnóstico de IA).
          </p>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-3 text-sm sm:grid-cols-3">
          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <p className="text-xs text-slate-400">Estado</p>
            <p className="mt-1 font-medium text-slate-800">{state.machine.status}</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <p className="text-xs text-slate-400">Mantenimientos</p>
            <p className="mt-1 font-medium text-slate-800">
              {state.maintenance_count}
            </p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <p className="text-xs text-slate-400">Último diagnóstico IA</p>
            {last ? (
              <p className="mt-1 font-medium text-slate-800">
                {last.severity}
                <span className="mx-1 text-slate-300">·</span>
                {last.created_at}
              </p>
            ) : (
              <p className="mt-1 text-slate-400">Sin diagnóstico aún</p>
            )}
          </div>
        </div>
      </main>
    </AppShell>
  );
}