"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { machineLinks } from "@/app/components/plant/nav";

const links = [
  { href: "/", label: "Overview", active: (path: string) => path === "/" },
  { href: "/maquinas/CNC-01", label: "Máquinas", active: (path: string) => path.startsWith("/maquinas") },
];

function itemClass(active: boolean) {
  return active
    ? "shrink-0 rounded-xl bg-[#CCFF00] px-3 py-2 text-sm font-medium text-black"
    : "shrink-0 rounded-xl px-3 py-2 text-sm text-gray-400 hover:text-white";
}

export default function PlantNav() {
  const pathname = usePathname();

  return (
    <aside className="flex shrink-0 flex-col border-b border-[#333333] bg-[#1E1E1E] lg:w-60 lg:border-r lg:border-b-0">
      <div className="px-5 py-4 lg:py-6">
        <p className="text-lg font-semibold tracking-tight text-white">
          RetroF
          <span className="relative inline-block">
            i
            <span className="absolute left-1/2 top-[0.08em] h-[0.22em] w-[0.22em] -translate-x-1/2 rounded-full bg-[#CCFF00]" />
          </span>
          t
        </p>
      </div>
      <nav className="flex gap-1 overflow-x-auto px-3 pb-3 lg:flex-col lg:overflow-visible lg:pb-6">
        {links.map((link) => (
          <Link key={link.label} href={link.href} className={itemClass(link.active(pathname))}>
            {link.label}
          </Link>
        ))}
        <div className="flex gap-1 lg:flex-col lg:gap-0.5 lg:pl-3">
          {machineLinks.map((machine) => {
            const active = pathname === machine.href;
            return (
              <Link
                key={machine.href}
                href={machine.href}
                className={
                  active
                    ? "shrink-0 rounded-lg px-3 py-1.5 text-sm text-[#CCFF00]"
                    : "shrink-0 rounded-lg px-3 py-1.5 text-sm text-gray-500 hover:text-gray-300"
                }
              >
                {machine.label}
              </Link>
            );
          })}
        </div>
        <Link href="/historial" className={itemClass(pathname.startsWith("/historial"))}>
          Analítica
        </Link>
        <span className="shrink-0 rounded-xl px-3 py-2 text-sm text-gray-500">Configuración</span>
      </nav>
    </aside>
  );
}
