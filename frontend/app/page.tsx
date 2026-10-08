export const instant = false;

import Link from "next/link";
import { AppShell } from "@/app/_components/AppShell";
import { requireSession } from "@/lib/auth";
import { listMachines } from "@/lib/data";

/** Selector de máquinas: equivale al escaneo manual/NFC del chip. */
export default async function Home() {
  await requireSession();
  const machines = listMachines();

  return (
    <AppShell>
      <main className="mx-auto max-w-5xl px-4 py-6">
        <h1 className="text-lg font-semibold text-slate-800">Máquinas</h1>
        <p className="mt-1 text-sm text-slate-500">
          Selecciona una máquina (en la demo presencial esto ocurre al escanear
          el chip NFC correspondiente).
        </p>

        <ul className="mt-4 space-y-2">
          {machines.map((m) => (
            <li key={m.id}>
              <Link
                href={`/m/${m.nfc_id}`}
                className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3 hover:border-slate-400"
              >
                <span className="font-medium text-slate-800">{m.name}</span>
                <span className="text-xs text-slate-400">
                  {m.location ?? "—"} · {m.status}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </main>
    </AppShell>
  );
}