import { HistoryEntry } from "@/types/machine";
import { resolutionLabel, resolutionText } from "@/app/components/plant/status";

function formatWhen(timestamp: string) {
  return new Date(timestamp).toLocaleString("es-MX", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

export default function HistoryTable({ entries }: { entries: HistoryEntry[] }) {
  return (
    <table className="w-full text-left text-sm">
      <thead>
        <tr className="border-b border-slate-200 text-[11px] uppercase tracking-[0.14em] text-slate-400">
          <th className="py-3 pr-4 font-medium">Fecha</th>
          <th className="py-3 pr-4 font-medium">Máquina</th>
          <th className="py-3 pr-4 font-medium">Sensor</th>
          <th className="py-3 pr-4 font-medium">Diagnóstico</th>
          <th className="py-3 font-medium">Resolución</th>
        </tr>
      </thead>
      <tbody>
        {entries.map((entry) => (
          <tr key={`${entry.timestamp}-${entry.machineId}`} className="border-b border-slate-100 last:border-0">
            <td className="py-3 pr-4 whitespace-nowrap text-slate-500">{formatWhen(entry.timestamp)}</td>
            <td className="py-3 pr-4 font-medium text-slate-900">{entry.machineId}</td>
            <td className="py-3 pr-4 text-slate-700">{entry.sensor}</td>
            <td className="py-3 pr-4 text-slate-700">{entry.diagnosis}</td>
            <td className={`py-3 ${resolutionText[entry.resolution]}`}>{resolutionLabel[entry.resolution]}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
