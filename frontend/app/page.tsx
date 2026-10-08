import Link from "next/link";
import { ArrowRight } from "lucide-react";
import plant from "@/data/plant.json";
import historial from "@/data/historial.json";
import { HistoryEntry, PlantMachine } from "@/types/machine";
import HistoryTable from "@/app/components/plant/HistoryTable";
import { cardClass, oeeBarClass, severityLabel, severityText } from "@/app/components/plant/status";

const machines = plant as PlantMachine[];
const entries = historial as HistoryEntry[];

const oeeKeys = [
  { key: "availability" as const, label: "Disponibilidad" },
  { key: "performance" as const, label: "Rendimiento" },
  { key: "quality" as const, label: "Calidad" },
];

function plantAverage(key: (typeof oeeKeys)[number]["key"]) {
  const total = machines.reduce((sum, machine) => sum + machine.oee[key], 0);
  return Math.round(total / machines.length);
}

export default function Home() {
  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-4 px-6 pb-10">
      <h1 className="mb-2 text-2xl font-semibold tracking-tight text-slate-900">Planta General</h1>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
        <section className={`${cardClass} lg:col-span-3`}>
          <h2 className="text-sm font-medium text-slate-500">Eficiencia de planta</h2>
          <div className="mt-6 flex flex-col gap-5">
            {oeeKeys.map((metric) => {
              const value = plantAverage(metric.key);
              return (
                <div key={metric.key}>
                  <div className="mb-2 flex items-baseline justify-between">
                    <p className="text-sm text-slate-600">{metric.label}</p>
                    <p className="text-2xl font-semibold tabular-nums text-slate-900">{value}%</p>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                    <div className={`h-full rounded-full ${oeeBarClass(value)}`} style={{ width: `${value}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <div className="flex flex-col gap-4 lg:col-span-2">
          {machines.map((machine) => {
            const severity = machine.ai_insight.severidad;
            const critical = severity === "critico";
            return (
              <article
                key={machine.machineId}
                className={
                  critical
                    ? "flex items-center justify-between rounded-3xl bg-[#e4007c] px-5 py-4 text-white shadow-[0_8px_30px_rgba(228,0,124,0.25)]"
                    : `${cardClass} flex items-center justify-between py-4`
                }
              >
                <div>
                  <h2 className={`text-base font-semibold ${critical ? "text-white" : "text-slate-900"}`}>
                    {machine.machineId}
                  </h2>
                  <p className={`mt-0.5 text-sm ${critical ? "text-white/90" : severityText[severity]}`}>
                    {severityLabel[severity]}
                  </p>
                </div>
                <Link
                  href={`/maquinas/${machine.machineId}`}
                  className={`inline-flex items-center gap-1 text-sm ${critical ? "text-white" : "text-slate-900"}`}
                >
                  Ver detalles
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </article>
            );
          })}
        </div>
      </div>

      <section className={cardClass}>
        <div className="mb-2 flex items-baseline justify-between">
          <h2 className="text-sm font-medium text-slate-500">Historial reciente</h2>
          <Link href="/historial" className="text-sm text-slate-500">
            Ver historial
          </Link>
        </div>
        <HistoryTable entries={entries.slice(0, 3)} />
      </section>
    </main>
  );
}
