"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, ScrollText } from "lucide-react";
import { machineLinks } from "@/app/components/plant/nav";

const links = [
  { href: "/", label: "Inicio", icon: "home" as const },
  ...machineLinks.map((machine, index) => ({
    href: machine.href,
    label: machine.label,
    icon: "machine" as const,
    mark: String(index + 1),
  })),
  { href: "/historial", label: "Análisis", icon: "analysis" as const },
];

export default function PlantNav() {
  const pathname = usePathname();

  return (
    <aside className="flex w-[76px] shrink-0 flex-col items-center rounded-[28px] bg-[#15803d] py-5 text-white">
      <span className="mb-8 text-xs font-semibold tracking-tight">RF</span>
      <nav className="flex flex-1 flex-col items-center gap-3">
        {links.map((link) => {
          const active = link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);
          return (
            <Link
              key={link.href}
              href={link.href}
              aria-label={link.label}
              title={link.label}
              className={
                active
                  ? "flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-[#15803d]"
                  : "flex h-11 w-11 items-center justify-center rounded-2xl text-white/80"
              }
            >
              {link.icon === "home" ? <Home className="h-5 w-5" /> : null}
              {link.icon === "analysis" ? <ScrollText className="h-5 w-5" /> : null}
              {link.icon === "machine" ? <span className="text-sm font-semibold">{link.mark}</span> : null}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
