"use client";

import { useMemo, useState } from "react";
import { Download, Plus, Search } from "lucide-react";

type LogCategory = "ai" | "maintenance" | "access";

type ActivityLog = {
  id: string;
  categoria: LogCategory;
  maquina: string;
  responsable: string;
  fecha: string;
  detalle: string;
  estado: string;
  estadoColor: string;
};

const mockLogs: ActivityLog[] = [
  {
    id: "LOG-001",
    categoria: "ai",
    maquina: "CNC-01",
    responsable: "Agente Llama 3.1",
    fecha: "07 Oct 2026, 14:30",
    detalle: "Fricción anómala detectada en rodamiento. Detención sugerida.",
    estado: "Crítico",
    estadoColor: "text-red-400 bg-red-400/10",
  },
  {
    id: "LOG-002",
    categoria: "access",
    maquina: "CNC-02",
    responsable: "Emilio Salas",
    fecha: "07 Oct 2026, 12:15",
    detalle: "Inicio de sesión remoto (Consola de Operador).",
    estado: "Acceso",
    estadoColor: "text-lime-400 bg-lime-400/10",
  },
  {
    id: "LOG-003",
    categoria: "maintenance",
    maquina: "Torno-A",
    responsable: "Equipo Técnico",
    fecha: "06 Oct 2026, 09:00",
    detalle: "Cambio de aceite y lubricación de husillo principal.",
    estado: "Programado",
    estadoColor: "text-yellow-400 bg-yellow-400/10",
  },
  {
    id: "LOG-004",
    categoria: "ai",
    maquina: "CNC-02",
    responsable: "Agente Llama 3.1",
    fecha: "05 Oct 2026, 16:45",
    detalle: "Pico de temperatura inusual. Ajuste automático de parámetros.",
    estado: "Advertencia",
    estadoColor: "text-yellow-400 bg-yellow-400/10",
  },
  {
    id: "LOG-005",
    categoria: "access",
    maquina: "Panel Central",
    responsable: "Hugo Gonzales",
    fecha: "05 Oct 2026, 08:30",
    detalle: "Actualización de credenciales de red M2M.",
    estado: "Acceso",
    estadoColor: "text-lime-400 bg-lime-400/10",
  },
  {
    id: "LOG-006",
    categoria: "maintenance",
    maquina: "Fresadora-B",
    responsable: "Victoria Bueno",
    fecha: "04 Oct 2026, 11:00",
    detalle: "Calibración de sensores de vibración.",
    estado: "En curso",
    estadoColor: "text-blue-400 bg-blue-400/10",
  },
  {
    id: "LOG-007",
    categoria: "access",
    maquina: "Gateway Pi",
    responsable: "Christian",
    fecha: "03 Oct 2026, 22:10",
    detalle: "Reinicio de servicio MQTT Mosquitto.",
    estado: "Acceso",
    estadoColor: "text-lime-400 bg-lime-400/10",
  },
];

const filters = [
  { id: "all", label: "Todos los eventos" },
  { id: "ai", label: "Diagnósticos IA" },
  { id: "maintenance", label: "Mantenimientos" },
  { id: "access", label: "Accesos" },
] as const;

const tipoLabel: Record<LogCategory, string> = {
  ai: "Diagnóstico IA",
  maintenance: "Mantenimiento",
  access: "Acceso",
};

function countFor(id: (typeof filters)[number]["id"]) {
  if (id === "all") return mockLogs.length;
  return mockLogs.filter((log) => log.categoria === id).length;
}

export default function HistoryTable() {
  const [activeFilter, setActiveFilter] = useState<(typeof filters)[number]["id"]>("all");
  const [query, setQuery] = useState("");
  const [onlyCnc01, setOnlyCnc01] = useState(false);

  const filteredLogs = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return mockLogs.filter((log) => {
      if (activeFilter !== "all" && log.categoria !== activeFilter) return false;
      if (onlyCnc01 && log.maquina !== "CNC-01") return false;
      if (!needle) return true;
      const haystack = `${log.maquina} ${log.responsable} ${log.detalle} ${log.estado} ${tipoLabel[log.categoria]}`.toLowerCase();
      return haystack.includes(needle);
    });
  }, [activeFilter, onlyCnc01, query]);

  function exportCsv() {
    const header = ["Tipo", "Máquina", "Responsable", "Fecha", "Detalle", "Estado"];
    const rows = filteredLogs.map((log) => [
      tipoLabel[log.categoria],
      log.maquina,
      log.responsable,
      log.fecha,
      log.detalle,
      log.estado,
    ]);
    const csv = [header, ...rows]
      .map((row) => row.map((cell) => `"${cell.replaceAll('"', '""')}"`).join(","))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "registro-actividad.csv";
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div>
      <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-semibold text-white">Registro de Actividad</h1>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={exportCsv}
            className="inline-flex items-center gap-2 rounded-xl border border-[#333333] bg-[#1E1E1E] px-3 py-2 text-sm text-gray-400 hover:border-gray-500 hover:text-white"
          >
            <Download className="h-4 w-4" aria-hidden />
            Exportar CSV
          </button>
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-xl border border-[#333333] bg-[#1E1E1E] px-3 py-2 text-sm text-gray-400 hover:border-gray-500 hover:text-white"
          >
            <Plus className="h-4 w-4" aria-hidden />
            Añadir Registro
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {filters.map((filter) => {
          const active = activeFilter === filter.id;
          return (
            <button
              key={filter.id}
              type="button"
              onClick={() => setActiveFilter(filter.id)}
              className={`rounded-2xl bg-[#1E1E1E] px-4 py-4 text-left ${
                active ? "border border-lime-400" : "border border-[#333333]"
              }`}
            >
              <p className="text-sm text-gray-400">{filter.label}</p>
              <p className={`mt-3 text-3xl font-semibold tabular-nums ${active ? "text-lime-400" : "text-white"}`}>
                {countFor(filter.id)}
              </p>
            </button>
          );
        })}
      </div>

      <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center">
        <label className="flex min-w-0 flex-1 items-center gap-2 rounded-xl border border-[#333333] bg-[#121212] px-3 py-2">
          <Search className="h-4 w-4 shrink-0 text-gray-400" aria-hidden />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Buscar máquina, responsable o detalle"
            className="w-full bg-transparent text-sm text-white outline-none placeholder:text-gray-500"
          />
        </label>
        <button
          type="button"
          onClick={() => setOnlyCnc01((current) => !current)}
          className={`shrink-0 rounded-full border px-3 py-1.5 text-sm ${
            onlyCnc01
              ? "border-lime-400 bg-lime-400/10 text-lime-400"
              : "border-[#333333] text-gray-400 hover:text-white"
          }`}
        >
          Solo CNC-01
        </button>
      </div>

      <div className="mt-5 overflow-x-auto rounded-2xl border border-[#333333] bg-[#1E1E1E]">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead>
            <tr className="border-b border-[#333333] text-[11px] uppercase tracking-[0.14em] text-gray-400">
              <th className="px-4 py-3 font-medium">Tipo</th>
              <th className="px-4 py-3 font-medium">Máquina</th>
              <th className="px-4 py-3 font-medium">Responsable</th>
              <th className="px-4 py-3 font-medium">Fecha</th>
              <th className="px-4 py-3 font-medium">Detalle</th>
              <th className="px-4 py-3 font-medium">Estado</th>
            </tr>
          </thead>
          <tbody>
            {filteredLogs.map((log) => (
              <tr key={log.id} className="border-b border-[#333333] last:border-0">
                <td className="px-4 py-3 whitespace-nowrap text-gray-400">{tipoLabel[log.categoria]}</td>
                <td className="px-4 py-3 whitespace-nowrap font-medium text-white">{log.maquina}</td>
                <td className="px-4 py-3 whitespace-nowrap text-gray-400">{log.responsable}</td>
                <td className="px-4 py-3 whitespace-nowrap text-gray-400">{log.fecha}</td>
                <td className="px-4 py-3 text-gray-400">{log.detalle}</td>
                <td className="px-4 py-3">
                  <span className={`inline-flex rounded-full px-2.5 py-1 text-xs ${log.estadoColor}`}>{log.estado}</span>
                </td>
              </tr>
            ))}
            {filteredLogs.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-sm text-gray-400">
                  No hay registros con ese filtro.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}
