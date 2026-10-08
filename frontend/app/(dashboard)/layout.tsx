import { Suspense } from "react";
import PlantNav from "@/app/components/plant/PlantNav";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col bg-[#121212] text-white lg:flex-row">
      <Suspense
        fallback={<aside className="h-16 shrink-0 border-b border-[#333333] bg-[#1E1E1E] lg:h-auto lg:w-60 lg:border-r lg:border-b-0" />}
      >
        <PlantNav />
      </Suspense>
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
