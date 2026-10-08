import historial from "@/data/historial.json";
import { HistoryEntry } from "@/types/machine";
import HistoryTable from "@/app/components/plant/HistoryTable";

const entries = historial as HistoryEntry[];

export default function HistorialPage() {
  return (
    <main>
      <h1 className="mb-4 text-2xl font-semibold tracking-tight text-slate-900">Análisis</h1>
      <HistoryTable entries={entries} />
    </main>
  );
}
