"use client";

import { Settings, Wifi } from "lucide-react";
import { Button } from "@/app/components/ui/button";

interface HeaderProps {
  lastUpdated: string;
}

export default function Header({ lastUpdated }: HeaderProps) {
  const formattedTime = new Date(lastUpdated).toLocaleString("es-MX", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });

  return (
    <header className="sticky top-0 z-50 flex h-14 items-center justify-between border-b border-slate-200 bg-[#f4f6f8] px-6">
      <div className="flex items-baseline gap-3">
        <span className="text-sm font-semibold tracking-tight text-slate-900">RetroFit</span>
        <span className="hidden text-[11px] uppercase tracking-[0.14em] text-slate-400 sm:inline">
          Centro de monitoreo
        </span>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="inline-flex h-1.5 w-1.5 rounded-full bg-green-600" />
          <span className="text-xs text-slate-600">En línea</span>
        </div>
        <div className="hidden items-center gap-1.5 text-xs text-slate-400 md:flex">
          <Wifi className="h-3.5 w-3.5" />
          <span>{formattedTime}</span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <span className="hidden text-xs text-slate-600 sm:inline">Operador</span>
        <Button variant="ghost" size="icon" className="h-8 w-8" aria-label="Configuración">
          <Settings className="h-4 w-4 text-slate-500" />
        </Button>
      </div>
    </header>
  );
}
