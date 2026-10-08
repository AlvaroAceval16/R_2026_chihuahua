"use client";

import { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
} from "recharts";
import { MachineData } from "@/types/machine";

interface TelemetryChartsProps {
  telemetry: MachineData["telemetry"];
}

function generateHistory(
  baseValue: number,
  points: number,
  variance: number,
  nowMs: number
): { time: string; value: number }[] {
  const history = [];
  for (let i = points - 1; i >= 0; i--) {
    const t = new Date(nowMs - i * 30000);
    const noise = Math.sin(baseValue * 1000 + i * 2.7) * variance * 0.8;
    const anomalyBump = i < 4 ? variance * 1.8 * (1 - i * 0.15) : 0;
    history.push({
      time: t.toLocaleTimeString("es-MX", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
      }),
      value: Math.round((baseValue - variance * 0.3 + noise + anomalyBump) * 10) / 10,
    });
  }
  return history;
}

interface ChartConfig {
  title: string;
  dataKey: keyof MachineData["telemetry"];
  unit: string;
  criticalThreshold: number;
  warningThreshold: number;
  yDomain: [number, number];
}

const chartConfigs: ChartConfig[] = [
  {
    title: "Vibración",
    dataKey: "vibration_g",
    unit: "g",
    criticalThreshold: 4.5,
    warningThreshold: 3.0,
    yDomain: [0, 8],
  },
  {
    title: "Corriente",
    dataKey: "current_amp",
    unit: "A",
    criticalThreshold: 17.0,
    warningThreshold: 14.0,
    yDomain: [8, 24],
  },
  {
    title: "Temperatura",
    dataKey: "temperature_c",
    unit: "°C",
    criticalThreshold: 80.0,
    warningThreshold: 65.0,
    yDomain: [40, 100],
  },
];

const CustomTooltip = ({
  active,
  payload,
  label,
  unit,
}: {
  active?: boolean;
  payload?: { value: number }[];
  label?: string;
  unit: string;
}) => {
  if (active && payload && payload.length) {
    return (
      <div className="border border-slate-200 bg-white px-2 py-1.5">
        <p className="text-[11px] text-slate-500">{label}</p>
        <p className="text-sm font-semibold tabular-nums text-slate-900">
          {payload[0].value} {unit}
        </p>
      </div>
    );
  }
  return null;
};

type HistoricalData = Record<keyof MachineData["telemetry"], { time: string; value: number }[]>;

export default function TelemetryCharts({ telemetry }: TelemetryChartsProps) {
  const [historicalData, setHistoricalData] = useState<HistoricalData | null>(null);

  useEffect(() => {
    const nowMs = Date.now();
    setHistoricalData({
      vibration_g: generateHistory(telemetry.vibration_g, 20, 0.6, nowMs),
      current_amp: generateHistory(telemetry.current_amp, 20, 1.5, nowMs),
      temperature_c: generateHistory(telemetry.temperature_c, 20, 4, nowMs),
    });
  }, [telemetry]);

  return (
    <section>
      <h2 className="mb-3 border-b border-slate-200 pb-2 text-[11px] font-medium uppercase tracking-[0.16em] text-slate-500">
        Comportamiento
      </h2>
      <div className="flex flex-col gap-5">
        {chartConfigs.map((cfg) => {
          const data = historicalData?.[cfg.dataKey];
          return (
            <div key={cfg.dataKey}>
              <div className="mb-1 flex items-baseline justify-between">
                <p className="text-sm text-slate-700">{cfg.title}</p>
                <p className="font-mono text-xs tabular-nums text-slate-600">
                  {telemetry[cfg.dataKey]} {cfg.unit}
                </p>
              </div>
              {data ? (
                <ResponsiveContainer width="100%" height={132}>
                  <LineChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                    <XAxis
                      dataKey="time"
                      tick={{ fontSize: 9, fill: "#94a3b8" }}
                      tickLine={false}
                      axisLine={false}
                      interval={4}
                    />
                    <YAxis
                      domain={cfg.yDomain}
                      tick={{ fontSize: 9, fill: "#94a3b8" }}
                      tickLine={false}
                      axisLine={false}
                      tickCount={4}
                    />
                    <Tooltip content={<CustomTooltip unit={cfg.unit} />} cursor={{ stroke: "#cbd5e1", strokeWidth: 1 }} />
                    <ReferenceLine
                      y={cfg.criticalThreshold}
                      stroke="#ef4444"
                      strokeDasharray="4 3"
                      strokeWidth={1}
                    />
                    <ReferenceLine
                      y={cfg.warningThreshold}
                      stroke="#d97706"
                      strokeDasharray="4 3"
                      strokeWidth={1}
                    />
                    <Line
                      type="monotone"
                      dataKey="value"
                      stroke="#0f172a"
                      strokeWidth={1.5}
                      dot={false}
                      activeDot={{ r: 3, strokeWidth: 0, fill: "#0f172a" }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[132px] border-b border-slate-100" />
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
