"use client";

import {
  AlertTriangle,
  ArrowRight,
  ChevronRight,
  Wrench,
  Zap,
} from "lucide-react";
import { Badge } from "@/app/components/ui/badge";
import { Button } from "@/app/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Separator } from "@/app/components/ui/separator";
import { MachineData } from "@/types/machine";

interface AIDiagnosisProps {
  insight: MachineData["ai_insight"];
}

const severityConfig = {
  "crítico": {
    label: "CRÍTICO",
    badgeVariant: "critical" as const,
    borderClass: "border-l-red-500",
    bgClass: "bg-red-50 border-red-200",
    textClass: "text-red-700",
    iconClass: "text-red-600",
  },
  "advertencia": {
    label: "ADVERTENCIA",
    badgeVariant: "warning" as const,
    borderClass: "border-l-amber-500",
    bgClass: "bg-amber-50 border-amber-200",
    textClass: "text-amber-700",
    iconClass: "text-amber-600",
  },
  "normal": {
    label: "NORMAL",
    badgeVariant: "normal" as const,
    borderClass: "border-l-green-500",
    bgClass: "bg-green-50 border-green-200",
    textClass: "text-green-700",
    iconClass: "text-green-600",
  },
};

export default function AIDiagnosis({ insight }: AIDiagnosisProps) {
  const config = severityConfig[insight.severidad];

  return (
    <Card className={`flex flex-col border-l-4 ${config.borderClass}`}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-1.5">
            <Zap className="h-3.5 w-3.5 text-slate-400" />
            Diagnóstico de IA
          </CardTitle>
          <Badge variant={config.badgeVariant} className="font-bold tracking-widest">
            <AlertTriangle className="h-3 w-3" />
            {config.label}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="flex flex-1 flex-col gap-4">
        {/* Affected component */}
        <div className="flex items-center justify-between rounded-md bg-slate-50 px-3 py-2.5">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
              Componente afectado
            </p>
            <p className="mt-0.5 text-sm font-semibold capitalize text-slate-900">
              {insight.componente_afectado}
            </p>
          </div>
          <div className="flex items-center gap-1.5 text-xs font-medium text-red-600">
            <span className="h-2 w-2 rounded-full bg-red-500" />
            Con anomalía
          </div>
        </div>

        <Separator />

        {/* Technical diagnosis */}
        <div>
          <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
            Diagnóstico técnico
          </p>
          <p className="text-sm leading-relaxed text-slate-700">
            {insight.diagnostico_tecnico}
          </p>
        </div>

        <Separator />

        {/* Conclusion */}
        <div>
          <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
            Conclusión
          </p>
          <p className="text-sm leading-relaxed text-slate-700">
            {insight.conclusion_natural}
          </p>
        </div>

        <Separator />

        {/* Immediate action — visually prominent */}
        <div className={`rounded-md border p-3.5 ${config.bgClass}`}>
          <div className="mb-2 flex items-center gap-1.5">
            <Wrench className={`h-4 w-4 ${config.iconClass}`} />
            <p className={`text-xs font-bold uppercase tracking-wider ${config.textClass}`}>
              Acción recomendada
            </p>
          </div>
          <p className={`text-sm leading-relaxed ${config.textClass}`}>
            {insight.accion_inmediata}
          </p>
        </div>

        {/* CTA Button */}
        <Button
          variant="default"
          className="mt-auto w-full gap-1.5"
          id="btn-ver-recomendaciones"
        >
          Ver recomendaciones
          <ChevronRight className="h-4 w-4" />
        </Button>
      </CardContent>
    </Card>
  );
}
