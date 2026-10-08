"use client";

import { MachineData } from "@/types/machine";

interface TelemetryKPIsProps {
  telemetry: MachineData["telemetry"];
}

interface KPIConfig {
  key: keyof MachineData["telemetry"];
  label: string;
  unit: string;
  thresholds: { warning: number; critical: number };
  trendValue: string;
}

const kpiConfigs: KPIConfig[] = [
  {
    key: "vibration_g",
    label: "Vibración",
    unit: "g",
    thresholds: { warning: 3.0, critical: 4.5 },
    trendValue: "+0.4",
  },
  {
    key: "current_amp",
    label: "Corriente",
    unit: "A",
    thresholds: { warning: 14.0, critical: 17.0 },
    trendValue: "+1.2",
  },
  {
    key: "temperature_c",
    label: "Temperatura",
    unit: "°C",
    thresholds: { warning: 65.0, critical: 80.0 },
    trendValue: "+3.1",
  },
];

function getStatus(value: number, thresholds: { warning: number; critical: number }) {
  if (value >= thresholds.critical) return "critical" as const;
  if (value >= thresholds.warning) return "warning" as const;
  return "normal" as const;
}

const statusLabels = {
  critical: "Crítico",
  warning: "Advertencia",
  normal: "Normal",
};

const valueColors = {
  critical: "text-red-600",
  warning: "text-amber-600",
  normal: "text-slate-900",
};

export default function TelemetryKPIs({ telemetry }: TelemetryKPIsProps) {
  return (
    <section>
      <h2 className="mb-3 border-b border-slate-200 pb-2 text-[11px] font-medium uppercase tracking-[0.16em] text-slate-500">
        Telemetría
      </h2>
      <div className="grid grid-cols-3 gap-4">
        {kpiConfigs.map((kpi) => {
          const value = telemetry[kpi.key];
          const status = getStatus(value, kpi.thresholds);

          return (
            <div key={kpi.key} className="min-w-0">
              <p className="text-[11px] uppercase tracking-[0.14em] text-slate-400">{kpi.label}</p>
              <p className={`mt-1 text-3xl font-semibold tabular-nums tracking-tight ${valueColors[status]}`}>
                {value}
                <span className="ml-1 text-sm font-medium text-slate-400">{kpi.unit}</span>
              </p>
              <p className="mt-1 text-[11px] text-slate-500">
                <span className={valueColors[status]}>{statusLabels[status]}</span>
                <span className="text-slate-300"> · </span>
                {kpi.trendValue}
                <span className="text-slate-300"> · </span>
                límite {kpi.thresholds.critical}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
