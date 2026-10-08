"use client";

import { AlertTriangle, Bot, Clock, Cpu, Tag } from "lucide-react";
import { Badge } from "@/app/components/ui/badge";
import { MachineData } from "@/types/machine";

interface MachineIdentityProps {
  data: MachineData;
}

const statusConfig = {
  "crítico": {
    label: "CRÍTICO",
    variant: "critical" as const,
    icon: AlertTriangle,
    ringClass: "ring-red-200 bg-red-50",
    dotClass: "bg-red-500",
  },
  "advertencia": {
    label: "ADVERTENCIA",
    variant: "warning" as const,
    icon: AlertTriangle,
    ringClass: "ring-amber-200 bg-amber-50",
    dotClass: "bg-amber-500",
  },
  "normal": {
    label: "NORMAL",
    variant: "normal" as const,
    icon: Cpu,
    ringClass: "ring-green-200 bg-green-50",
    dotClass: "bg-green-500",
  },
};

export default function MachineIdentity({ data }: MachineIdentityProps) {
  const config = statusConfig[data.ai_insight.severidad];
  const StatusIcon = config.icon;

  const formattedTime = new Date(data.timestamp).toLocaleString("es-MX", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-slate-200 bg-white p-5 sm:flex-row sm:items-center sm:justify-between">
      {/* Machine info */}
      <div className="flex items-start gap-4">
        <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg ring-2 ${config.ringClass}`}>
          <Cpu className="h-5 w-5 text-slate-600" />
        </div>
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-slate-900">
              {data.machineId}
            </h1>
            <Badge variant={config.variant} className="text-xs font-bold uppercase tracking-widest">
              <StatusIcon className="h-3 w-3" />
              {config.label}
            </Badge>
          </div>
          <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
            <span className="flex items-center gap-1">
              <Tag className="h-3 w-3" />
              Motor industrial
            </span>
            <span className="flex items-center gap-1">
              <Cpu className="h-3 w-3" />
              ID: {data.machineId}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {formattedTime}
            </span>
          </div>
        </div>
      </div>

      {/* AI anomaly notice */}
      <div className="flex items-center gap-2 rounded-md border border-red-200 bg-red-50 px-3 py-2 sm:shrink-0">
        <Bot className="h-4 w-4 shrink-0 text-red-600" />
        <span className="text-xs font-medium text-red-700">
          Anomalía detectada por IA
        </span>
      </div>
    </div>
  );
}
