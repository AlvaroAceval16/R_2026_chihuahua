import Link from "next/link";

const links = [
  { href: "/", label: "Planta" },
  { href: "/historial", label: "Historial" },
];

export default function PlantNav() {
  return (
    <header className="flex items-center justify-between px-6 py-5">
      <nav className="flex items-center gap-1 rounded-full bg-white px-2 py-1 shadow-[0_8px_30px_rgba(15,23,42,0.06)]">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="rounded-full px-4 py-1.5 text-sm text-slate-700"
          >
            {link.label}
          </Link>
        ))}
      </nav>
      <p className="flex items-center gap-2 text-sm text-slate-600">
        <span className="inline-block h-1.5 w-1.5 rounded-full bg-[#15803d]" />
        En línea
      </p>
    </header>
  );
}
