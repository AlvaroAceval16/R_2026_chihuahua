"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { machineLinks } from "@/app/components/plant/nav";

const links = [
  { href: "/", label: "Inicio" },
  ...machineLinks.map((machine) => ({ href: machine.href, label: machine.label })),
  { href: "/historial", label: "Análisis" },
];

export default function PlantNav() {
  const pathname = usePathname();

  return (
    <aside className="flex w-56 shrink-0 flex-col bg-white px-4 py-6 shadow-[8px_0_30px_rgba(15,23,42,0.04)]">
      <div className="flex justify-center pb-8 pt-2">
        <span className="text-base font-semibold tracking-tight text-slate-900">RetroFit</span>
      </div>
      <nav className="flex flex-1 flex-col gap-1">
        {links.map((link) => {
          const active = link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);
          return (
            <Link
              key={link.href}
              href={link.href}
              className={
                active
                  ? "rounded-xl bg-[#f4f6f8] px-3 py-2 text-sm font-medium text-slate-900"
                  : "rounded-xl px-3 py-2 text-sm text-slate-500"
              }
            >
              {link.label}
            </Link>
          );
        })}
      </nav>
      <p className="flex items-center justify-center gap-2 pt-6 text-xs text-slate-500">
        <span className="inline-block h-1.5 w-1.5 rounded-full bg-[#15803d]" />
        En línea
      </p>
    </aside>
  );
}
