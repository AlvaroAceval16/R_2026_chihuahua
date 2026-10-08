import historial from "@/data/historial.json";
import { HistoryEntry } from "@/types/machine";
import HistoryTable from "@/app/components/plant/HistoryTable";
import { cardClass } from "@/app/components/plant/status";

const entries = historial as HistoryEntry[];

export default function HistorialPage() {
  return (
    <main className="mx-auto w-full max-w-6xl flex-1 px-6 pb-10">
      <h1 className="mb-4 text-2xl font-semibold tracking-tight text-slate-900">Historial</h1>
      <section className={cardClass}>
        <HistoryTable entries={entries} />
      </section>
    </main>
  );
}
