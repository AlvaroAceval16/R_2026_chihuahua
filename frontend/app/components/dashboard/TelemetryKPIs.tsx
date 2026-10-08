"use client";

import type { LucideIcon } from "lucide-react";
import { Activity, TrendingUp, TrendingDown, Minus, Thermometer, Zap } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Badge } from "@/app/components/ui/badge";
import { MachineData } from "@/types/machine";

interface TelemetryKPIsProps {
  telemetry: MachineData["telemetry"];
}

type TrendDirection = "up" | "down" | "stable";

interface KPIConfig {
  key: keyof MachineData["telemetry"];
  label: string;
  unit: string;
  icon: LucideIcon;
  thresholds: { warning: number; critical: number };
  trend: TrendDirection;
  trendValue: string;
}

const kpiConfigs: KPIConfig[] = [
  {
    key: "vibration_g",
    label: "Vibración",
    unit: "g",
    icon: Activity,
    thresholds: { warning: 3.0, critical: 4.5 },
    trend: "up",
    trendValue: "+0.4",
  },
  {
    key: "current_amp",
    label: "Corriente",
    unit: "A",
    icon: Zap,
    thresholds: { warning: 14.0, critical: 17.0 },
    trend: "up",
    trendValue: "+1.2",
  },
  {
    key: "temperature_c",
    label: "Temperatura",
    unit: "°C",
    icon: Thermometer,
    thresholds: { warning: 65.0, critical: 80.0 },
    trend: "up",
    trendValue: "+3.1",
  },
];

function getStatus(value: number, thresholds: { warning: number; critical: number }) {
  if (value >= thresholds.critical) return "critical";
  if (value >= thresholds.warning) return "warning";
  return "normal";
}

const statusLabels = {
  critical: "Crítico",
  warning: "Advertencia",
  normal: "Normal",
};

const statusVariants = {
  critical: "critical" as const,
  warning: "warning" as const,
  normal: "normal" as const,
};

const TrendIcon = ({ direction }: { direction: TrendDirection }) => {
  if (direction === "up") return <TrendingUp className="h-3.5 w-3.5 text-red-500" />;
  if (direction === "down") return <TrendingDown className="h-3.5 w-3.5 text-green-500" />;
  return <Minus className="h-3.5 w-3.5 text-slate-400" />;
};

export default function TelemetryKPIs({ telemetry }: TelemetryKPIsProps) {
  return (
    <div>
      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-slate-500">
        Telemetría en tiempo real
      </h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {kpiConfigs.map((kpi) => {
          const value = telemetry[kpi.key];
          const status = getStatus(value, kpi.thresholds);
          const Icon = kpi.icon;

          return (
            <Card key={kpi.key} className="relative overflow-hidden">
              {/* Status accent bar */}
              <div
                className={`absolute inset-x-0 top-0 h-0.5 ${
                  status === "critical"
                    ? "bg-red-500"
                    : status === "warning"
                    ? "bg-amber-500"
                    : "bg-green-500"
                }`}
              />
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Icon className="h-3.5 w-3.5" />
                    {kpi.label}
                  </span>
                  <Badge variant={statusVariants[status]} className="text-[10px]">
                    {statusLabels[status]}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-end justify-between">
                  <div className="flex items-baseline gap-1">
                    <span
                      className={`text-3xl font-bold tabular-nums tracking-tight ${
                        status === "critical"
                          ? "text-red-600"
                          : status === "warning"
                          ? "text-amber-600"
                          : "text-slate-900"
                      }`}
                    >
                      {value}
                    </span>
                    <span className="text-sm font-medium text-slate-400">
                      {kpi.unit}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-slate-500">
                    <TrendIcon direction={kpi.trend} />
                    <span
                      className={
                        kpi.trend === "up"
                          ? "text-red-500"
                          : kpi.trend === "down"
                          ? "text-green-500"
                          : "text-slate-400"
                      }
                    >
                      {kpi.trendValue}
                    </span>
                  </div>
                </div>
                <div className="mt-2 flex items-center gap-1.5">
                  <span className="text-[10px] uppercase tracking-wider text-slate-400">
                    Umbral crítico:
                  </span>
                  <span className="text-[10px] font-semibold text-slate-500">
                    {kpi.thresholds.critical} {kpi.unit}
                  </span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
