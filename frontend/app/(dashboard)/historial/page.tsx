export const instant = false;

import HistoryTable from "@/app/components/plant/HistoryTable";
import { listAiLogs } from "@/lib/data";

export default function HistorialPage() {
  const aiLogs = listAiLogs().map((log) => ({ ...log }));

  return (
    <main className="bg-[#121212] p-4 sm:p-6">
      <HistoryTable aiLogs={aiLogs} />
    </main>
  );
}
