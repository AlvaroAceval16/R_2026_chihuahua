"use client";

import { MachineData } from "@/types/machine";

interface AIDiagnosisProps {
  insight: MachineData["ai_insight"];
}

const severityConfig = {
  "crítico": {
    label: "Crítico",
    textClass: "text-red-700",
    ruleClass: "border-red-600",
  },
  "advertencia": {
    label: "Advertencia",
    textClass: "text-amber-700",
    ruleClass: "border-amber-500",
  },
  "normal": {
    label: "Normal",
    textClass: "text-green-700",
    ruleClass: "border-green-600",
  },
};

export default function AIDiagnosis({ insight }: AIDiagnosisProps) {
  const config = severityConfig[insight.severidad];

  return (
    <section>
      <div className="mb-3 flex items-baseline justify-between border-b border-slate-200 pb-2">
        <h2 className="text-[11px] font-medium uppercase tracking-[0.16em] text-slate-500">
          Diagnóstico
        </h2>
        <p className={`text-xs font-semibold ${config.textClass}`}>{config.label}</p>
      </div>

      <dl className="space-y-4">
        <div>
          <dt className="text-[11px] uppercase tracking-[0.14em] text-slate-400">Hallazgo</dt>
          <dd className="mt-1 text-sm leading-relaxed text-slate-800">{insight.diagnostico_tecnico}</dd>
        </div>
        <div>
          <dt className="text-[11px] uppercase tracking-[0.14em] text-slate-400">Qué significa</dt>
          <dd className="mt-1 text-sm leading-relaxed text-slate-700">{insight.conclusion_natural}</dd>
        </div>
        <div className={`border-l-2 pl-3 ${config.ruleClass}`}>
          <dt className={`text-[11px] font-semibold uppercase tracking-[0.14em] ${config.textClass}`}>
            Acción inmediata
          </dt>
          <dd className={`mt-1 text-sm leading-relaxed ${config.textClass}`}>{insight.accion_inmediata}</dd>
        </div>
      </dl>
    </section>
  );
}
