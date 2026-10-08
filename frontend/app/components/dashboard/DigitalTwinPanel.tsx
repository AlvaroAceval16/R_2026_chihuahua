"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import MotorViewerClient from "@/app/components/digital-twin/motorViewerClient";
import { MachineData } from "@/types/machine";
import { Cpu, AlertCircle } from "lucide-react";

interface DigitalTwinPanelProps {
  status: MachineData["ai_insight"]["severidad"];
  component: MachineData["ai_insight"]["componente_afectado"];
}

const componentLabels: Record<string, string> = {
  carcasa: "Carcasa",
  ventilador: "Ventilador",
  tapas: "Tapas",
};

export default function DigitalTwinPanel({ status, component }: DigitalTwinPanelProps) {
  return (
    <Card className="flex flex-col">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-1.5">
          <Cpu className="h-3.5 w-3.5" />
          Gemelo digital
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col gap-3">
        {/* Controls hint */}
        <div className="flex items-center gap-3 text-[11px] text-slate-400">
          <span className="flex items-center gap-1">
            <kbd className="rounded border border-slate-200 bg-slate-50 px-1 py-0.5 font-mono text-[10px]">
              Arrastrar
            </kbd>
            Rotar
          </span>
          <span className="flex items-center gap-1">
            <kbd className="rounded border border-slate-200 bg-slate-50 px-1 py-0.5 font-mono text-[10px]">
              Scroll
            </kbd>
            Zoom
          </span>
          <span className="flex items-center gap-1">
            <kbd className="rounded border border-slate-200 bg-slate-50 px-1 py-0.5 font-mono text-[10px]">
              Clic der.
            </kbd>
            Pan
          </span>
        </div>

        {/* 3D Canvas */}
        <div className="relative overflow-hidden rounded-md bg-slate-50" style={{ minHeight: "340px" }}>
          <MotorViewerClient status={status} component={component} />
        </div>

        {/* Affected component indicator */}
        {component && (
          <div className="flex items-center gap-3 rounded-md border border-slate-200 bg-white p-3">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                Componente afectado
              </p>
              <p className="mt-0.5 text-sm font-semibold text-slate-900">
                {componentLabels[component] ?? component}
              </p>
            </div>
            <div className="ml-auto flex items-center gap-1.5 text-xs font-medium text-red-600">
              <AlertCircle className="h-3.5 w-3.5" />
              Componente con anomalía
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
