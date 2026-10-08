import Link from "next/link";
import plant from "@/data/plant.json";
import historial from "@/data/historial.json";
import { HistoryEntry, PlantMachine } from "@/types/machine";
import { machineLinks } from "@/app/components/plant/nav";
import { severityLabel } from "@/app/components/plant/status";

const machines = plant as PlantMachine[];
const listedMachines = machineLinks.flatMap((link) => {
  const machine = machines.find((item) => item.machineId === link.machineId);
  return machine ? [{ ...machine, label: link.label, href: link.href }] : [];
});
const entries = (historial as HistoryEntry[]).slice(0, 4);

const oeeKeys = [
  { key: "availability" as const, label: "Disponibilidad" },
  { key: "performance" as const, label: "Rendimiento" },
  { key: "quality" as const, label: "Calidad" },
];

function plantAverage(key: (typeof oeeKeys)[number]["key"]) {
  const total = machines.reduce((sum, machine) => sum + machine.oee[key], 0);
  return Math.round(total / machines.length);
}

const accent = ["bg-[#e4007c] text-white", "bg-[#eab308] text-slate-900"];

export default function Home() {
  return (
    <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
      <div className="flex flex-col gap-4 xl:col-span-8">
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
          <section className="rounded-3xl bg-[#15803d] p-6 text-white lg:col-span-3">
            <p className="text-sm text-white/70">Planta</p>
            <h1 className="mt-1 text-2xl font-semibold">Eficiencia</h1>
            <div className="mt-8 grid grid-cols-3 gap-3">
              {oeeKeys.map((metric) => (
                <div key={metric.key}>
                  <p className="text-[11px] uppercase tracking-wider text-white/70">{metric.label}</p>
                  <p className="mt-1 text-2xl font-semibold tabular-nums">{plantAverage(metric.key)}%</p>
                </div>
              ))}
            </div>
          </section>

          <div className="flex flex-col gap-4 lg:col-span-2">
            {listedMachines.map((machine, index) => (
              <Link
                key={machine.machineId}
                href={machine.href}
                className={`flex flex-1 flex-col justify-between rounded-3xl px-5 py-4 ${accent[index] ?? accent[0]}`}
              >
                <p className="text-sm opacity-80">{machine.machineId}</p>
                <div>
                  <p className="text-lg font-semibold">{machine.label}</p>
                  <p className="text-sm opacity-80">{severityLabel[machine.ai_insight.severidad]}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {oeeKeys.map((metric) => {
            const value = plantAverage(metric.key);
            return (
              <article key={metric.key} className="rounded-3xl bg-[#f4f6f8] px-4 py-4">
                <p className="text-sm font-medium text-slate-800">{metric.label}</p>
                <p className="mt-3 text-xl font-semibold tabular-nums text-slate-900">{value}%</p>
                <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white">
                  <div className="h-full rounded-full bg-[#15803d]" style={{ width: `${value}%` }} />
                </div>
              </article>
            );
          })}
        </div>
      </div>

      <aside className="xl:col-span-4">
        <div className="mb-3 flex items-baseline justify-between">
          <h2 className="text-sm font-medium text-slate-500">Análisis reciente</h2>
          <Link href="/historial" className="text-sm text-slate-400">
            Ver
          </Link>
        </div>
        <ul className="flex flex-col gap-3">
          {entries.map((entry) => (
            <li key={`${entry.timestamp}-${entry.machineId}`} className="border-b border-slate-100 pb-3">
              <p className="text-sm font-medium text-slate-900">{entry.machineId}</p>
              <p className="mt-1 text-sm text-slate-500">{entry.diagnosis}</p>
            </li>
          ))}
        </ul>
      </aside>
    </div>
  );
}
