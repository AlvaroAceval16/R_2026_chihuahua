"use client";

import Link from "next/link";
import { memo, useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import { Clock } from "lucide-react";
import { PlantMachine } from "@/types/machine";
import MotorViewerClient from "@/app/components/digital-twin/motorViewerClient";

type Severity = "normal" | "advertencia" | "critico";

type TelemetryData = PlantMachine["telemetry"] & PlantMachine["oee"];

type AlertState = {
  componente: string | null;
  severidad: Severity;
};

type Diagnosis = {
  conclusion: string;
  tecnico: string;
  accion: string;
};

type NormalPayload = {
  machineId: string;
  telemetry: Partial<PlantMachine["telemetry"]>;
  oee?: Partial<PlantMachine["oee"]>;
};

type AlertPayload = NormalPayload & {
  ai_insight: {
    severidad: string;
    componente_afectado: string;
    diagnostico_tecnico: string;
    conclusion_natural: string;
    accion_inmediata: string;
  };
};

function mergeTelemetry(current: TelemetryData, payload: NormalPayload): TelemetryData {
  return {
    vibration_raw: payload.telemetry.vibration_raw ?? current.vibration_raw,
    current_amp: payload.telemetry.current_amp ?? current.current_amp,
    temperature_c: payload.telemetry.temperature_c ?? current.temperature_c,
    humidity_percent: payload.telemetry.humidity_percent ?? current.humidity_percent,
    availability: payload.oee?.availability ?? current.availability,
    performance: payload.oee?.performance ?? current.performance,
    quality: payload.oee?.quality ?? current.quality,
  };
}

const VIBRATION_WARN = 500;
const VIBRATION_LIMIT = 800;
const TEMPERATURE_WARN = 50;
const TEMPERATURE_LIMIT = 65;
const HUMIDITY_WARN = 55;
const HUMIDITY_LIMIT = 70;
const HOLD_AFTER_DIAGNOSIS_MS = 15000;
const HOLD_MAX_MS = 45000;

function band(value: number, warn: number, crit: number): Severity {
  if (value >= crit) return "critico";
  if (value >= warn) return "advertencia";
  return "normal";
}

function worse(a: Severity, b: Severity): Severity {
  const rank = { normal: 0, advertencia: 1, critico: 2 };
  return rank[a] >= rank[b] ? a : b;
}

function paintFromTelemetry(machineId: string, data: TelemetryData): AlertState {
  const temp = band(data.temperature_c, TEMPERATURE_WARN, TEMPERATURE_LIMIT);

  if (machineId === "CNC-02") {
    const humidity = band(data.humidity_percent, HUMIDITY_WARN, HUMIDITY_LIMIT);
    if (temp !== "normal" && humidity !== "normal") {
      return { componente: "clima", severidad: worse(temp, humidity) };
    }
    if (humidity !== "normal") return { componente: "bornes", severidad: humidity };
    if (temp !== "normal") return { componente: "ventilador", severidad: temp };
    return { componente: null, severidad: "normal" };
  }

  const vibration = band(data.vibration_raw ?? 0, VIBRATION_WARN, VIBRATION_LIMIT);
  if (temp === "critico") return { componente: "motor", severidad: "critico" };
  if (vibration === "critico") return { componente: "balero", severidad: "critico" };
  if (temp === "advertencia") return { componente: "motor", severidad: "advertencia" };
  if (vibration === "advertencia") return { componente: "balero", severidad: "advertencia" };
  return { componente: null, severidad: "normal" };
}

function metricTone(severity: Severity) {
  if (severity === "critico") return "text-red-400";
  if (severity === "advertencia") return "text-amber-400";
  return "text-white";
}

const Twin = memo(function Twin({ componente, severidad }: AlertState) {
  return <MotorViewerClient activeComponent={componente} severity={severidad} />;
});

export default function MachineLive({ initial }: { initial: PlantMachine }) {
  const [telemetryData, setTelemetryData] = useState<TelemetryData>({
    ...initial.telemetry,
    ...initial.oee,
  });
  const [diagnosis, setDiagnosis] = useState<Diagnosis>({
    conclusion: initial.ai_insight.conclusion_natural,
    tecnico: initial.ai_insight.diagnostico_tecnico,
    accion: initial.ai_insight.accion_inmediata,
  });
  const liveRef = useRef<TelemetryData>(telemetryData);
  const peakRef = useRef<{ vibration_raw: number; current_amp: number } | null>(null);
  const holdUntilRef = useRef(0);
  const releaseTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [tickAt, setTickAt] = useState<number | null>(null);
  const visual = paintFromTelemetry(initial.machineId, telemetryData);
  const climateOnly = initial.machineId === "CNC-02";
  const vibrationBand = band(telemetryData.vibration_raw ?? 0, VIBRATION_WARN, VIBRATION_LIMIT);
  const temperatureBand = band(telemetryData.temperature_c, TEMPERATURE_WARN, TEMPERATURE_LIMIT);
  const humidityBand = band(telemetryData.humidity_percent, HUMIDITY_WARN, HUMIDITY_LIMIT);

  useEffect(() => {
    const socket = io("http://localhost:4000");
    const machineId = initial.machineId;

    const clearRelease = () => {
      if (releaseTimer.current) clearTimeout(releaseTimer.current);
      releaseTimer.current = null;
    };

    const show = (data: TelemetryData) => {
      const holding = Date.now() < holdUntilRef.current && peakRef.current;
      setTelemetryData(
        holding
          ? {
              ...data,
              vibration_raw: Math.max(data.vibration_raw, peakRef.current.vibration_raw),
              current_amp: peakRef.current.current_amp,
            }
          : data,
      );
    };

    const scheduleRelease = () => {
      clearRelease();
      const wait = holdUntilRef.current - Date.now();
      if (wait <= 0 || wait > HOLD_MAX_MS) return;
      releaseTimer.current = setTimeout(() => {
        peakRef.current = null;
        holdUntilRef.current = 0;
        setTelemetryData(liveRef.current);
      }, wait);
    };

    const ingest = (payload: NormalPayload, fromAlert: boolean) => {
      if (payload.machineId !== machineId) return;
      liveRef.current = mergeTelemetry(liveRef.current, payload);
      const live = liveRef.current;
      const spiked =
        machineId !== "CNC-02" &&
        (payload.telemetry.vibration_raw ?? live.vibration_raw ?? 0) >= VIBRATION_LIMIT;
      const now = Date.now();

      if (spiked) {
        const vibration_raw = Math.max(
          payload.telemetry.vibration_raw ?? live.vibration_raw ?? 0,
          peakRef.current?.vibration_raw ?? 0,
        );
        peakRef.current = {
          vibration_raw,
          current_amp: payload.telemetry.current_amp ?? live.current_amp,
        };
        holdUntilRef.current = fromAlert
          ? now + HOLD_AFTER_DIAGNOSIS_MS
          : Math.max(holdUntilRef.current, now + HOLD_MAX_MS);
      }

      if (fromAlert && peakRef.current) {
        holdUntilRef.current = now + HOLD_AFTER_DIAGNOSIS_MS;
      }

      show(live);
      setTickAt(Date.now());
      scheduleRelease();
    };

    const onNormal = (payload: NormalPayload) => ingest(payload, false);
    const onAlert = (payload: AlertPayload) => {
      ingest(payload, true);
      setDiagnosis({
        conclusion: payload.ai_insight.conclusion_natural,
        tecnico: payload.ai_insight.diagnostico_tecnico,
        accion: payload.ai_insight.accion_inmediata,
      });
    };

    socket.on("telemetria_normal", onNormal);
    socket.on("alerta_critica", onAlert);

    return () => {
      clearRelease();
      socket.off("telemetria_normal", onNormal);
      socket.off("alerta_critica", onAlert);
      socket.disconnect();
    };
  }, [initial.machineId]);

  return (
    <main className="grid min-h-dvh grid-cols-1 bg-black text-white lg:grid-cols-12">
      <section className="flex flex-col justify-center gap-8 px-4 py-8 sm:px-6 lg:col-span-3 lg:px-8 lg:py-10">
        <div>
          <p className="mb-6 flex items-center gap-2">
            <span className="h-2 w-2 animate-pulse rounded-full bg-lime-400" />
            <span className="text-xs tracking-wider text-gray-500">
              {tickAt == null
                ? "EN VIVO"
                : `EN VIVO · ${new Date(tickAt).toLocaleTimeString("es-MX", { hour12: false })}.${String(tickAt % 1000).padStart(3, "0")}`}
            </span>
          </p>
          <p className="text-[11px] uppercase tracking-[0.22em] text-gray-400">Componente afectado</p>
          <h1 className="mt-6 text-5xl leading-none text-white [font-family:var(--font-playfair)] sm:text-6xl">
            {initial.machineId}
          </h1>
          <p className="mt-8 max-w-xs text-sm leading-relaxed text-gray-400">
            {diagnosis.conclusion} {diagnosis.tecnico}
          </p>
        </div>
        <div className="flex gap-10 text-sm">
          <div>
            <p className="text-[11px] uppercase tracking-[0.16em] text-gray-500">Disponibilidad</p>
            <p className="mt-1 text-white">{telemetryData.availability}%</p>
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-[0.16em] text-gray-500">Calidad</p>
            <p className="mt-1 text-white">{telemetryData.quality}%</p>
          </div>
        </div>
      </section>

      <section className="relative h-[58dvh] min-h-[280px] w-full sm:h-[64dvh] lg:col-span-6 lg:h-dvh lg:min-h-dvh">
        <div className="absolute inset-0">
          <Twin componente={visual.componente} severidad={visual.severidad} />
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
          {!climateOnly && (
          <div>
            <dt className="text-[11px] uppercase tracking-[0.16em] text-gray-500">Vibración</dt>
            <dd className={`mt-1 text-3xl tabular-nums transition-colors duration-200 ${metricTone(vibrationBand)}`}>
              {telemetryData.vibration_raw}
            </dd>
          </div>
          )}
          <div>
            <dt className="text-[11px] uppercase tracking-[0.16em] text-gray-500">Corriente</dt>
            <dd className="mt-1 text-3xl tabular-nums text-white">
              {telemetryData.current_amp} A
            </dd>
          </div>
          <div>
            <dt className="text-[11px] uppercase tracking-[0.16em] text-gray-500">Temperatura</dt>
            <dd className={`mt-1 text-3xl tabular-nums transition-colors duration-200 ${metricTone(temperatureBand)}`}>
              {telemetryData.temperature_c} °C
            </dd>
          </div>
          {climateOnly && (
          <div>
            <dt className="text-[11px] uppercase tracking-[0.16em] text-gray-500">Humedad</dt>
            <dd className={`mt-1 text-3xl font-light tabular-nums transition-colors duration-200 ${metricTone(humidityBand)}`}>
              {telemetryData.humidity_percent} %
            </dd>
          </div>
          )}
        </dl>

        <div>
          <blockquote className="text-sm leading-relaxed text-gray-300">
            {diagnosis.accion}
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
