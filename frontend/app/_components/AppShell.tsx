import { getSession } from "@/lib/auth";
import LogoutButton from "@/app/_components/LogoutButton";

/** Cascarón básico para páginas autenticadas (login no lo usa). */
export async function AppShell({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  const roleLabel = session?.role === "supervisor" ? "Supervisor" : "Mantenimiento";

  return (
    <div className="flex min-h-screen flex-col bg-[#f4f6f8]">
      <header className="sticky top-0 z-10 border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <div className="flex items-baseline gap-2">
            <span className="font-semibold text-slate-800">RetroFit AI</span>
            <span className="text-xs text-slate-400">Acceso NFC</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden text-sm text-slate-600 sm:inline">
              {session?.full_name}
            </span>
            <span className="rounded-full bg-slate-800 px-2.5 py-0.5 text-xs font-medium text-white">
              {roleLabel}
            </span>
            <LogoutButton />
          </div>
        </div>
      </header>

      <nav className="border-b border-slate-200 bg-white/60">
        <div className="mx-auto flex max-w-5xl gap-4 px-4 py-2 text-sm">
          <a href="/" className="text-slate-600 hover:text-slate-900">
            Máquinas
          </a>
          <a href="/logs" className="text-slate-600 hover:text-slate-900">
            Logs
          </a>
        </div>
      </nav>

      <main className="flex-1">{children}</main>
    </div>
  );
}