"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Progress } from "@/app/components/ui/progress";
import { BarChart2 } from "lucide-react";
import { MachineData } from "@/types/machine";

interface OEESectionProps {
  oee: MachineData["oee"];
}

const metrics = [
  {
    key: "availability" as keyof MachineData["oee"],
    label: "Disponibilidad",
    description: "Tiempo operativo real vs. planificado",
  },
  {
    key: "performance" as keyof MachineData["oee"],
    label: "Rendimiento",
    description: "Velocidad real vs. velocidad ideal",
  },
  {
    key: "quality" as keyof MachineData["oee"],
    label: "Calidad",
    description: "Piezas buenas vs. piezas totales",
  },
];

function getOEEColor(value: number): string {
  if (value >= 85) return "bg-green-500";
  if (value >= 65) return "bg-amber-500";
  return "bg-red-500";
}

function getOEETextColor(value: number): string {
  if (value >= 85) return "text-green-600";
  if (value >= 65) return "text-amber-600";
  return "text-red-600";
}

function getProgressColor(value: number): string {
  if (value >= 85) return "bg-green-500";
  if (value >= 65) return "bg-blue-500";
  return "bg-amber-500";
}

export default function OEESection({ oee }: OEESectionProps) {
  const oeeTotal = Math.round(
    (oee.availability / 100) * (oee.performance / 100) * (oee.quality / 100) * 100 * 10
  ) / 10;

  return (
    <div>
      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-slate-500">
        Eficiencia de la máquina
      </h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
        {/* OEE Total — prominent */}
        <Card className="sm:col-span-1">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-1.5">
              <BarChart2 className="h-3.5 w-3.5" />
              OEE Global
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center gap-3 pt-2">
            {/* Circular-style donut using SVG */}
            <div className="relative flex h-24 w-24 items-center justify-center">
              <svg viewBox="0 0 36 36" className="h-24 w-24 -rotate-90">
                <circle
                  cx="18"
                  cy="18"
                  r="15.9"
                  fill="none"
                  stroke="#f1f5f9"
                  strokeWidth="3"
                />
                <circle
                  cx="18"
                  cy="18"
                  r="15.9"
                  fill="none"
                  stroke={oeeTotal >= 65 ? "#f59e0b" : "#ef4444"}
                  strokeWidth="3"
                  strokeDasharray={`${oeeTotal} ${100 - oeeTotal}`}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className={`text-2xl font-bold tabular-nums ${getOEETextColor(oeeTotal)}`}>
                  {oeeTotal}%
                </span>
                <span className="text-[9px] uppercase tracking-wider text-slate-400">OEE</span>
              </div>
            </div>
            <p className="text-center text-xs text-slate-500">
              {oeeTotal >= 85
                ? "Operación eficiente"
                : oeeTotal >= 65
                ? "Requiere atención"
                : "Eficiencia baja — acción requerida"}
            </p>
          </CardContent>
        </Card>

        {/* Individual metrics */}
        <Card className="sm:col-span-3">
          <CardHeader className="pb-3">
            <CardTitle>Métricas OEE</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-5">
            {metrics.map((metric) => {
              const value = oee[metric.key];
              return (
                <div key={metric.key}>
                  <div className="mb-1.5 flex items-center justify-between">
                    <div>
                      <span className="text-sm font-medium text-slate-800">
                        {metric.label}
                      </span>
                      <p className="text-[11px] text-slate-400">
                        {metric.description}
                      </p>
                    </div>
                    <span
                      className={`text-lg font-bold tabular-nums ${getOEETextColor(value)}`}
                    >
                      {value}%
                    </span>
                  </div>
                  <Progress
                    value={value}
                    className="h-2"
                    indicatorClassName={getProgressColor(value)}
                  />
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
