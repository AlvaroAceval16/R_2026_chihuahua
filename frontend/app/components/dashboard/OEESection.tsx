"use client";

import { MachineData } from "@/types/machine";

interface OEESectionProps {
  oee: MachineData["oee"];
}

const metrics = [
  {
    key: "availability" as keyof MachineData["oee"],
    label: "Disponibilidad",
    description: "Tiempo real frente al planificado",
  },
  {
    key: "performance" as keyof MachineData["oee"],
    label: "Rendimiento",
    description: "Velocidad real frente a la ideal",
  },
  {
    key: "quality" as keyof MachineData["oee"],
    label: "Calidad",
    description: "Piezas buenas frente al total",
  },
];

function textColor(value: number): string {
  if (value >= 85) return "text-green-700";
  if (value >= 65) return "text-amber-600";
  return "text-red-600";
}

function barColor(value: number): string {
  if (value >= 85) return "bg-green-600";
  if (value >= 65) return "bg-amber-500";
  return "bg-red-600";
}

export default function OEESection({ oee }: OEESectionProps) {
  const oeeTotal =
    Math.round((oee.availability / 100) * (oee.performance / 100) * (oee.quality / 100) * 1000) / 10;

  const reading =
    oeeTotal >= 85 ? "Operación eficiente" : oeeTotal >= 65 ? "Requiere atención" : "Eficiencia baja";

  return (
    <section>
      <div className="mb-3 flex items-baseline justify-between border-b border-slate-200 pb-2">
        <h2 className="text-[11px] font-medium uppercase tracking-[0.16em] text-slate-500">Eficiencia</h2>
        <p className="text-[11px] text-slate-400">{reading}</p>
      </div>
      <div className="grid grid-cols-4 gap-3">
        <div>
          <p className="text-[11px] uppercase tracking-[0.14em] text-slate-400">OEE</p>
          <p className={`mt-1 text-3xl font-semibold tabular-nums ${textColor(oeeTotal)}`}>{oeeTotal}%</p>
        </div>
        {metrics.map((metric) => {
          const value = oee[metric.key];
          return (
            <div key={metric.key} className="min-w-0">
              <p className="truncate text-[11px] uppercase tracking-[0.14em] text-slate-400">{metric.label}</p>
              <p className={`mt-1 text-3xl font-semibold tabular-nums ${textColor(value)}`}>{value}%</p>
              <div className="mt-2 h-px w-full bg-slate-200">
                <div className={`h-px ${barColor(value)}`} style={{ width: `${value}%` }} />
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
