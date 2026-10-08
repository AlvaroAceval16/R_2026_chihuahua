import Link from "next/link";

/** Página pública de acceso denegado (rol no permitido). */
export default function ProhibidoPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f4f6f8] px-4">
      <div className="max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <p className="text-4xl">⛔</p>
        <h1 className="mt-3 text-lg font-semibold text-slate-800">
          Acceso denegado
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          Tu rol no tiene permisos para ver esta pantalla de esta máquina.
        </p>
        <div className="mt-5 flex justify-center gap-3">
          <Link
            href="/"
            className="rounded-lg bg-slate-800 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700"
          >
            Ir a máquinas
          </Link>
          <Link
            href="/login"
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100"
          >
            Cambiar de usuario
          </Link>
        </div>
      </div>
    </div>
  );
}