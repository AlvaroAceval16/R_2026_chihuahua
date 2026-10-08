import { Suspense } from "react";
import PlantNav from "@/app/components/plant/PlantNav";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen gap-4 bg-[#e4e7ee] p-4">
      <Suspense fallback={<aside className="w-[76px] shrink-0 rounded-[28px] bg-[#15803d]" />}>
        <PlantNav />
      </Suspense>
      <div className="min-w-0 flex-1 rounded-[28px] bg-white p-6">{children}</div>
    </div>
  );
}
