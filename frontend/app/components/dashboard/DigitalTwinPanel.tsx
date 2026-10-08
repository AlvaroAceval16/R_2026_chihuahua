"use client";

import MotorViewerClient from "@/app/components/digital-twin/motorViewerClient";
import { MachineData } from "@/types/machine";

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
    <section>
      <div className="mb-2 flex items-baseline justify-between gap-3">
        <h2 className="text-[11px] font-medium uppercase tracking-[0.16em] text-slate-500">
          Gemelo digital
        </h2>
        <p className="text-[11px] text-slate-400">Arrastrar rota · scroll zoom · clic derecho desplaza</p>
      </div>
      <div className="h-[min(52vh,420px)] min-h-[280px] overflow-hidden bg-black">
        <MotorViewerClient status={status} component={component} />
      </div>
      {component && (
        <div className="mt-2 flex items-baseline justify-between gap-3 border-b border-slate-200 pb-2">
          <p className="text-[11px] uppercase tracking-[0.14em] text-slate-400">Componente afectado</p>
          <p className="text-sm font-semibold text-slate-900">
            {componentLabels[component] ?? component}
          </p>
        </div>
      )}
    </section>
  );
}
