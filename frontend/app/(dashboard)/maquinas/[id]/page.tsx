import Link from "next/link";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { Clock } from "lucide-react";
import plant from "@/data/plant.json";
import { PlantMachine, PlantSeverity } from "@/types/machine";
import MotorViewerClient from "@/app/components/digital-twin/motorViewerClient";

const machines = plant as PlantMachine[];

export function generateStaticParams() {
  return machines.map((machine) => ({ id: machine.machineId }));
}

function toViewerStatus(severity: PlantSeverity): "normal" | "advertencia" | "crítico" {
  if (severity === "critico") return "crítico";
  return severity;
}

function toViewerComponent(name: string): "carcasa" | "ventilador" | "tapas" | null {
  const key = name.toLowerCase();
  if (key === "carcasa" || key === "eje central") return "carcasa";
  if (key === "ventilador") return "ventilador";
  if (key === "tapas") return "tapas";
  return null;
}

export default function MachinePage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <Suspense fallback={<p className="text-sm text-slate-400">Cargando máquina</p>}>
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

  const critical = machine.ai_insight.severidad === "critico";

  return (
    <main className="grid min-h-dvh grid-cols-1 bg-black text-white lg:grid-cols-12">
      <section className="flex flex-col justify-center gap-8 px-4 py-8 sm:px-6 lg:col-span-3 lg:px-8 lg:py-10">
        <div>
          <p className="mb-6 flex items-center gap-2">
            <span className="h-2 w-2 animate-pulse rounded-full bg-lime-400" />
            <span className="text-xs tracking-wider text-gray-500">LATENCIA: 12ms</span>
          </p>
          <p className="text-[11px] uppercase tracking-[0.22em] text-gray-400">Componente afectado</p>
          <h1 className="mt-6 text-5xl leading-none text-white [font-family:var(--font-playfair)] sm:text-6xl">
            {machine.machineId}
          </h1>
          <p className="mt-8 max-w-xs text-sm leading-relaxed text-gray-400">
            {machine.ai_insight.conclusion_natural} {machine.ai_insight.diagnostico_tecnico}
          </p>
        </div>
        <div className="flex gap-10 text-sm">
          <div>
            <p className="text-[11px] uppercase tracking-[0.16em] text-gray-500">Disponibilidad</p>
            <p className="mt-1 text-white">{machine.oee.availability}%</p>
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-[0.16em] text-gray-500">Calidad</p>
            <p className="mt-1 text-white">{machine.oee.quality}%</p>
          </div>
        </div>
      </section>

      <section className="relative h-[58dvh] min-h-[280px] w-full sm:h-[64dvh] lg:col-span-6 lg:h-dvh lg:min-h-dvh">
        <div className="absolute inset-0">
          <MotorViewerClient
            status={toViewerStatus(machine.ai_insight.severidad)}
            component={toViewerComponent(machine.ai_insight.componente_afectado)}
          />
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <span className="flex h-16 w-16 items-center justify-center rounded-full border border-white/25 text-[10px] uppercase tracking-[0.16em] text-white/70">
              Ver
            </span>
          </div>
        </div>
      </section>

      <section className="flex flex-col justify-center gap-10 px-4 py-8 text-right sm:px-6 lg:col-span-3 lg:px-8 lg:py-10">
        <div className="flex flex-col items-end gap-3">
          <p className="text-[10px] tracking-widest text-gray-500 uppercase">Operador: Victoria Bueno</p>
          <nav className="flex justify-end gap-6 text-xs uppercase tracking-[0.16em] text-gray-400">
          <span className="text-white">Estado</span>
          <Link href="/historial">Historial</Link>
          <span>Ajustes</span>
          </nav>
        </div>

        <dl className="space-y-6">
          <div>
            <dt className="text-[11px] uppercase tracking-[0.16em] text-gray-500">Vibración</dt>
            <dd className={`mt-1 text-3xl tabular-nums ${critical ? "text-red-400" : "text-white"}`}>
              {machine.telemetry.vibration_raw}
            </dd>
          </div>
          <div>
            <dt className="text-[11px] uppercase tracking-[0.16em] text-gray-500">Corriente</dt>
            <dd className="mt-1 text-3xl tabular-nums text-white">{machine.telemetry.current_amp} A</dd>
          </div>
          <div>
            <dt className="text-[11px] uppercase tracking-[0.16em] text-gray-500">Temperatura</dt>
            <dd className="mt-1 text-3xl tabular-nums text-white">{machine.telemetry.temperature_c} °C</dd>
          </div>
          <div>
            <dt className="text-[11px] uppercase tracking-[0.16em] text-gray-500">Humedad</dt>
            <dd className="mt-1 text-3xl font-light tabular-nums text-white">45 %</dd>
          </div>
        </dl>

        <div>
          <blockquote className="text-sm leading-relaxed text-gray-300">
            {machine.ai_insight.accion_inmediata}
          </blockquote>
          <p className="mt-4 flex items-center justify-end gap-2 text-sm text-amber-500">
            <Clock className="h-4 w-4 shrink-0" aria-hidden />
            Riesgo de falla crítica en: ~4.5 Horas
          </p>
        </div>

        <div>
          <button
            type="button"
            className="inline-flex items-center gap-3 bg-neutral-900 px-5 py-3 text-sm text-white"
          >
            Detener equipo
            <span aria-hidden>↗</span>
          </button>
        </div>
      </section>
    </main>
  );
}
