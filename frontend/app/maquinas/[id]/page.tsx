import { Suspense } from "react";
import { notFound } from "next/navigation";
import plant from "@/data/plant.json";
import { PlantMachine, PlantSeverity } from "@/types/machine";
import MotorViewerClient from "@/app/components/digital-twin/motorViewerClient";
import { machineLinks } from "@/app/components/plant/nav";
import { cardClass, severityLabel, severityText, severityWash } from "@/app/components/plant/status";

const machines = plant as PlantMachine[];

const readings = [
  { key: "vibration_raw" as const, label: "Vibración", unit: "" },
  { key: "current_amp" as const, label: "Corriente", unit: "A" },
  { key: "temperature_c" as const, label: "Temperatura", unit: "°C" },
  { key: "humidity_percent" as const, label: "Humedad", unit: "%" },
];

export function generateStaticParams() {
  return machines.map((machine) => ({ id: machine.machineId }));
}

function toViewerStatus(severity: PlantSeverity): "normal" | "advertencia" | "crítico" {
  if (severity === "critico") return "crítico";
  return severity;
}

function toViewerComponent(name: string): "carcasa" | "ventilador" | "tapas" | null {
  const key = name.toLowerCase();
  if (key === "carcasa" || key === "ventilador" || key === "tapas") return key;
  return null;
}

export default function MachinePage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <Suspense fallback={<p className="px-6 text-sm text-slate-400">Cargando máquina</p>}>
      <MachineDetail params={params} />
    </Suspense>
  );
}

async function MachineDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const machine = machines.find((item) => item.machineId === id);

  if (!machine) {
    notFound();
  }

  const severity = machine.ai_insight.severidad;
  const label = machineLinks.find((link) => link.machineId === machine.machineId)?.label ?? machine.machineId;

  return (
    <main className="grid w-full flex-1 grid-cols-1 gap-4 p-4 lg:grid-cols-3 lg:p-6">
      <section className={`${cardClass} overflow-hidden p-0 lg:col-span-2`}>
        <div className="h-full min-h-[72vh] bg-[#05080f]">
          <MotorViewerClient
            status={toViewerStatus(severity)}
            component={toViewerComponent(machine.ai_insight.componente_afectado)}
          />
        </div>
        <p className="px-6 py-4 text-sm text-slate-700">
          <span className="text-slate-400">Componente afectado </span>
          {machine.ai_insight.componente_afectado}
        </p>
      </section>

      <section className="flex flex-col gap-4 lg:col-span-1">
        <header className={`${cardClass} flex items-baseline justify-between gap-4 py-5`}>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">{label}</h1>
          <p className={`text-sm font-medium ${severityText[severity]}`}>{severityLabel[severity]}</p>
        </header>

        <div className={cardClass}>
          <h2 className="text-sm font-medium text-slate-500">Telemetría</h2>
          <div className="mt-5 grid grid-cols-2 gap-5">
            {readings.map((reading) => (
              <div key={reading.key}>
                <p className="text-[11px] uppercase tracking-[0.14em] text-slate-400">{reading.label}</p>
                <p className="mt-2 text-3xl font-semibold tabular-nums tracking-tight text-slate-900">
                  {machine.telemetry[reading.key]}
                  {reading.unit ? (
                    <span className="ml-1 text-sm font-medium text-slate-400">{reading.unit}</span>
                  ) : null}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className={`rounded-3xl px-6 py-5 shadow-[0_8px_30px_rgba(15,23,42,0.06)] ${severityWash[severity]}`}>
          <h2 className="text-sm font-medium text-slate-500">Diagnóstico</h2>
          <p className="mt-3 text-sm leading-relaxed text-slate-800">{machine.ai_insight.diagnostico_tecnico}</p>
          <p className={`mt-3 text-sm font-semibold leading-relaxed ${severityText[severity]}`}>
            {machine.ai_insight.accion_inmediata}
          </p>
        </div>
      </section>
    </main>
  );
}
