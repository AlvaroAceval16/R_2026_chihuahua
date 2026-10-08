"use client";

import { PackageX } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { MachineData } from "@/types/machine";

interface LeanMudasProps {
  lean: MachineData["lean_mudas"];
}

const MAX_VALUE = 30;

const mudaConfig = [
  {
    key: "defectos" as keyof MachineData["lean_mudas"],
    label: "Defectos",
    description: "Unidades defectuosas producidas",
    thresholds: { ok: 0, warn: 5 },
  },
  {
    key: "sobreprocesamiento" as keyof MachineData["lean_mudas"],
    label: "Sobreprocesamiento",
    description: "Operaciones sin valor agregado",
    thresholds: { ok: 5, warn: 10 },
  },
  {
    key: "esperas" as keyof MachineData["lean_mudas"],
    label: "Esperas",
    description: "Tiempos de espera no productivos",
    thresholds: { ok: 5, warn: 10 },
  },
];

function getBarColor(value: number, thresholds: { ok: number; warn: number }) {
  if (value <= thresholds.ok) return "bg-green-500";
  if (value <= thresholds.warn) return "bg-amber-500";
  return "bg-red-500";
}

function getLabelColor(value: number, thresholds: { ok: number; warn: number }) {
  if (value <= thresholds.ok) return "text-green-600";
  if (value <= thresholds.warn) return "text-amber-600";
  return "text-red-600";
}

export default function LeanMudas({ lean }: LeanMudasProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-1.5">
          <PackageX className="h-3.5 w-3.5" />
          Desperdicios detectados
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-5">
        {mudaConfig.map((muda) => {
          const value = lean[muda.key];
          const pct = Math.min((value / MAX_VALUE) * 100, 100);
          const barColor = getBarColor(value, muda.thresholds);
          const labelColor = getLabelColor(value, muda.thresholds);

          return (
            <div key={muda.key}>
              <div className="mb-1.5 flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-slate-800">
                    {muda.label}
                  </p>
                  <p className="text-[11px] text-slate-400">{muda.description}</p>
                </div>
                <span className={`shrink-0 text-lg font-bold tabular-nums ${labelColor}`}>
                  {value}
                </span>
              </div>
              {/* Custom progress bar */}
              <div className="relative h-2 w-full overflow-hidden rounded-full bg-slate-100">
                <div
                  className={`h-full rounded-full transition-all duration-700 ease-out ${barColor}`}
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          );
        })}

        {/* Summary note */}
        <div className="mt-1 rounded-md bg-slate-50 px-3 py-2.5">
          <p className="text-[11px] leading-relaxed text-slate-500">
            <span className="font-semibold text-slate-700">Análisis Lean:</span>{" "}
            El sobreprocesamiento y las esperas representan las principales oportunidades
            de mejora. Revisar flujo de trabajo y tiempos de ciclo.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
