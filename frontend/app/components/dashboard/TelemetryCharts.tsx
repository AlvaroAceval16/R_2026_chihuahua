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
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
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
  // Use seeded-style generation so results are deterministic per call
  const history = [];
  for (let i = points - 1; i >= 0; i--) {
    const t = new Date(nowMs - i * 30000);
    const seed = (baseValue * 100 + i * 137) % 1;
    const noise = (Math.sin(baseValue * 1000 + i * 2.7) * variance * 0.8);
    // Inject anomaly spike in last 4 points to simulate growing anomaly
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
  variance: number;
  yDomain: [number, number];
}

const chartConfigs: ChartConfig[] = [
  {
    title: "Vibración",
    dataKey: "vibration_g",
    unit: "g",
    criticalThreshold: 4.5,
    warningThreshold: 3.0,
    variance: 0.6,
    yDomain: [0, 8],
  },
  {
    title: "Corriente",
    dataKey: "current_amp",
    unit: "A",
    criticalThreshold: 17.0,
    warningThreshold: 14.0,
    variance: 1.5,
    yDomain: [8, 24],
  },
  {
    title: "Temperatura",
    dataKey: "temperature_c",
    unit: "°C",
    criticalThreshold: 80.0,
    warningThreshold: 65.0,
    variance: 4,
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
      <div className="rounded-md border border-slate-200 bg-white px-3 py-2 shadow-md">
        <p className="text-xs text-slate-500">{label}</p>
        <p className="text-sm font-semibold text-slate-900">
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
    <div>
      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-slate-500">
        Comportamiento de la máquina
      </h2>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {chartConfigs.map((cfg) => {
          const data = historicalData?.[cfg.dataKey];
          return (
            <Card key={cfg.dataKey}>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center justify-between">
                  <span>{cfg.title}</span>
                  <span className="font-mono text-xs font-semibold text-slate-600">
                    {telemetry[cfg.dataKey]} {cfg.unit}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="pr-2">
                {data ? (
                  <ResponsiveContainer width="100%" height={160}>
                    <LineChart
                      data={data}
                      margin={{ top: 4, right: 8, bottom: 0, left: -20 }}
                    >
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="#f1f5f9"
                        vertical={false}
                      />
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
                        tickCount={5}
                      />
                      <Tooltip
                        content={<CustomTooltip unit={cfg.unit} />}
                        cursor={{ stroke: "#e2e8f0", strokeWidth: 1 }}
                      />
                      <ReferenceLine
                        y={cfg.criticalThreshold}
                        stroke="#ef4444"
                        strokeDasharray="4 3"
                        strokeWidth={1}
                        label={{
                          value: "Crítico",
                          position: "insideTopRight",
                          fontSize: 9,
                          fill: "#ef4444",
                        }}
                      />
                      <ReferenceLine
                        y={cfg.warningThreshold}
                        stroke="#f59e0b"
                        strokeDasharray="4 3"
                        strokeWidth={1}
                        label={{
                          value: "Advertencia",
                          position: "insideTopRight",
                          fontSize: 9,
                          fill: "#f59e0b",
                        }}
                      />
                      <Line
                        type="monotone"
                        dataKey="value"
                        stroke="#2563eb"
                        strokeWidth={1.5}
                        dot={false}
                        activeDot={{ r: 3, strokeWidth: 0, fill: "#2563eb" }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  /* Skeleton while data loads */
                  <div className="flex h-[160px] items-center justify-center">
                    <div className="h-full w-full animate-pulse rounded-md bg-slate-100" />
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
