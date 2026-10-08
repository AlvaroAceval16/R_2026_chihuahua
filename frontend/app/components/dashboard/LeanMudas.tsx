"use client";

import { MachineData } from "@/types/machine";

interface LeanMudasProps {
  lean: MachineData["lean_mudas"];
}

const MAX_VALUE = 30;

const mudaConfig = [
  {
    key: "defectos" as keyof MachineData["lean_mudas"],
    label: "Defectos",
    description: "Unidades defectuosas",
    thresholds: { ok: 0, warn: 5 },
  },
  {
    key: "sobreprocesamiento" as keyof MachineData["lean_mudas"],
    label: "Sobreproceso",
    description: "Trabajo sin valor",
    thresholds: { ok: 5, warn: 10 },
  },
  {
    key: "esperas" as keyof MachineData["lean_mudas"],
    label: "Esperas",
    description: "Tiempo detenido",
    thresholds: { ok: 5, warn: 10 },
  },
];

function barColor(value: number, thresholds: { ok: number; warn: number }) {
  if (value <= thresholds.ok) return "bg-green-600";
  if (value <= thresholds.warn) return "bg-amber-500";
  return "bg-red-600";
}

function textColor(value: number, thresholds: { ok: number; warn: number }) {
  if (value <= thresholds.ok) return "text-green-700";
  if (value <= thresholds.warn) return "text-amber-600";
  return "text-red-600";
}

export default function LeanMudas({ lean }: LeanMudasProps) {
  return (
    <section>
      <h2 className="mb-3 border-b border-slate-200 pb-2 text-[11px] font-medium uppercase tracking-[0.16em] text-slate-500">
        Desperdicios
      </h2>
      <div className="flex flex-col gap-4">
        {mudaConfig.map((muda) => {
          const value = lean[muda.key];
          const pct = Math.min((value / MAX_VALUE) * 100, 100);

          return (
            <div key={muda.key}>
              <div className="mb-1.5 flex items-baseline justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm text-slate-800">{muda.label}</p>
                  <p className="text-[11px] text-slate-400">{muda.description}</p>
                </div>
                <span className={`text-lg font-semibold tabular-nums ${textColor(value, muda.thresholds)}`}>
                  {value}
                </span>
              </div>
              <div className="h-px w-full bg-slate-200">
                <div className={`h-px ${barColor(value, muda.thresholds)}`} style={{ width: `${pct}%` }} />
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
