export const instant = false;

import { AppShell } from "@/app/_components/AppShell";
import { requireSession } from "@/lib/auth";
import { listMaintenanceLogs, listAiLogs } from "@/lib/data";

/** PLACEHOLDER — Historial de mantenimientos + diagnósticos IA. */
export default async function LogsPage() {
  await requireSession();
  const maintenance = listMaintenanceLogs();
  const ai = listAiLogs();

  return (
    <AppShell>
      <main className="mx-auto max-w-5xl px-4 py-6">
        <h1 className="text-lg font-semibold text-slate-800">Logs del sistema</h1>
        <p className="mt-1 text-sm text-slate-500">
          Histórico de mantenimientos y diagnósticos generados por la IA.
        </p>

        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <p className="text-xs text-slate-400">Mantenimientos registrados</p>
            <p className="mt-1 text-2xl font-semibold text-slate-800">
              {maintenance.length}
            </p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <p className="text-xs text-slate-400">Diagnósticos de IA</p>
            <p className="mt-1 text-2xl font-semibold text-slate-800">{ai.length}</p>
          </div>
        </div>

        <div className="mt-4 rounded-xl border border-dashed border-slate-300 bg-white p-6">
          <p className="text-sm text-slate-400">
            📋 En construcción — aquí se mostrarán las tablas con filtros por
            máquina y fecha. Los endpoints{" "}
            <code>GET /api/maintenance</code> y <code>GET /api/logs</code> ya
            están listos.
          </p>
        </div>
      </main>
    </AppShell>
  );
}