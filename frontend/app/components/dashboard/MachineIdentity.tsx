"use client";

import { MachineData } from "@/types/machine";

interface MachineIdentityProps {
  data: MachineData;
}

const statusConfig = {
  "crítico": {
    label: "Crítico",
    textClass: "text-red-600",
  },
  "advertencia": {
    label: "Advertencia",
    textClass: "text-amber-600",
  },
  "normal": {
    label: "Normal",
    textClass: "text-green-700",
  },
};

export default function MachineIdentity({ data }: MachineIdentityProps) {
  const config = statusConfig[data.ai_insight.severidad];

  const formattedTime = new Date(data.timestamp).toLocaleString("es-MX", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  return (
    <div className="flex items-end justify-between gap-4 border-b border-slate-900 pb-3">
      <div>
        <p className="text-[11px] uppercase tracking-[0.16em] text-slate-400">Motor industrial</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">{data.machineId}</h1>
      </div>
      <div className="text-right">
        <p className={`text-sm font-semibold ${config.textClass}`}>{config.label}</p>
        <p className="mt-1 text-[11px] text-slate-400">{formattedTime}</p>
      </div>
    </div>
  );
}
