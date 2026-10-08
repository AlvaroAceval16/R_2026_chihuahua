import mockData from "@/data/mockData.json";
import { MachineData } from "@/types/machine";
import Header from "@/app/components/dashboard/Header";
import MachineIdentity from "@/app/components/dashboard/MachineIdentity";
import DigitalTwinPanel from "@/app/components/dashboard/DigitalTwinPanel";
import AIDiagnosis from "@/app/components/dashboard/AIDiagnosis";
import TelemetryKPIs from "@/app/components/dashboard/TelemetryKPIs";
import TelemetryCharts from "@/app/components/dashboard/TelemetryCharts";
import OEESection from "@/app/components/dashboard/OEESection";
import LeanMudas from "@/app/components/dashboard/LeanMudas";

export default function Home() {
  const machineData = mockData as MachineData;

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      {/* ── Sticky header ── */}
      <Header lastUpdated={machineData.timestamp} />

      {/* ── Main content ── */}
      <main className="flex-1 px-4 py-5 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-screen-xl space-y-5">
          {/* 1 — Machine identity & status (highest priority) */}
          <MachineIdentity data={machineData} />

          {/* 2 — Digital twin + AI Diagnosis (two-column on md+) */}
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
            <DigitalTwinPanel
              status={machineData.ai_insight.severidad}
              component={machineData.ai_insight.componente_afectado}
            />
            <AIDiagnosis insight={machineData.ai_insight} />
          </div>

          {/* 3 — Telemetry KPIs */}
          <TelemetryKPIs telemetry={machineData.telemetry} />

          {/* 4 — Telemetry charts */}
          <TelemetryCharts telemetry={machineData.telemetry} />

          {/* 5 — OEE + Lean side by side on lg+ */}
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <OEESection oee={machineData.oee} />
            </div>
            <div>
              <LeanMudas lean={machineData.lean_mudas} />
            </div>
          </div>
        </div>
      </main>

      {/* ── Footer ── */}
      <footer className="border-t border-slate-200 bg-white px-6 py-3">
        <div className="mx-auto flex max-w-screen-xl items-center justify-between">
          <p className="text-xs text-slate-400">
            RetroFit AI — Sistema de monitoreo industrial
          </p>
          <p className="text-xs text-slate-400">
            ID sesión: {machineData.machineId} ·{" "}
            {new Date(machineData.timestamp).toISOString()}
          </p>
        </div>
      </footer>
    </div>
  );
}
