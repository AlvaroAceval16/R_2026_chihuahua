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
    <header className="sticky top-0 z-50 flex h-14 items-center justify-between border-b border-slate-200 bg-white px-6">
      {/* Left — Brand */}
      <div className="flex items-center gap-3">
        <div className="flex h-7 w-7 items-center justify-center rounded bg-blue-600">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-4 w-4 text-white"
          >
            <path d="M12 2L2 7l10 5 10-5-10-5z" />
            <path d="M2 17l10 5 10-5" />
            <path d="M2 12l10 5 10-5" />
          </svg>
        </div>
        <span className="text-sm font-semibold text-slate-900">
          RetroFit AI
        </span>
        <span className="hidden text-slate-300 sm:inline">|</span>
        <span className="hidden text-xs text-slate-500 sm:inline">
          Centro de Monitoreo Industrial
        </span>
      </div>

      {/* Center — Connection status */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500" />
          </span>
          <span className="text-xs font-medium text-slate-600">
            Sistema conectado
          </span>
        </div>
        <div className="hidden items-center gap-1.5 text-xs text-slate-400 md:flex">
          <Wifi className="h-3.5 w-3.5" />
          <span>Actualizado: {formattedTime}</span>
        </div>
      </div>

      {/* Right — User & Settings */}
      <div className="flex items-center gap-2">
        <div className="hidden items-center gap-2 sm:flex">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-100 text-xs font-semibold text-blue-700">
            OP
          </div>
          <span className="text-xs font-medium text-slate-700">Operador</span>
        </div>
        <Button variant="ghost" size="icon" className="h-8 w-8" aria-label="Configuración">
          <Settings className="h-4 w-4 text-slate-500" />
        </Button>
      </div>
    </header>
  );
}
