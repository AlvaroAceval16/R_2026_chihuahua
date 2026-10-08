"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

/** Selección de rol (demo): solo hay dos roles, sin usuario ni contraseña. */
export default function LoginForm({ next }: { next: string }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<string | null>(null);
  const [qr, setQr] = useState<string | null>(null);
  const [origin, setOrigin] = useState("");

  // Genera un QR con la URL de la app para celulares sin NFC (iPhone).
  useEffect(() => {
    const o = window.location.origin;
    import("qrcode")
      .then(({ default: QRCode }) => {
        setOrigin(o);
        return QRCode.toDataURL(o, { width: 220, margin: 1 });
      })
      .then(setQr)
      .catch(() => {});
  }, []);

  async function selectRole(role: "supervisor" | "mantenimiento") {
    setLoading(role);
    setError(null);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: role }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? "No se pudo iniciar sesión.");
        return;
      }
      router.push(next.startsWith("/") ? next : "/");
      router.refresh();
    } catch {
      setError("Error de red al iniciar sesión.");
    } finally {
      setLoading(null);
    }
  }

  const roles = [
    {
      role: "supervisor" as const,
      title: "Soy Supervisor",
      description: "Panel de la máquina y diagnóstico",
      accent: "border-slate-800 bg-slate-800 text-white hover:bg-slate-700",
    },
    {
      role: "mantenimiento" as const,
      title: "Soy de Mantenimiento",
      description: "Registro de mantenimientos",
      accent: "border-[#e4007c] bg-[#e4007c] text-white hover:bg-[#c20066]",
    },
  ];

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f4f6f8] px-4">
      <div className="w-full max-w-4xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* Selección de rol */}
          <div className="p-8">
            <h1 className="text-xl font-semibold text-slate-800">RetroFit AI</h1>
            <p className="mt-1 text-sm text-slate-500">
              Demo — selecciona tu rol para continuar. (En producción esto
              ocurre al escanear el chip NFC de la máquina.)
            </p>

            <div className="mt-6 space-y-3">
              {roles.map(({ role, title, description, accent }) => (
                <button
                  key={role}
                  type="button"
                  onClick={() => selectRole(role)}
                  disabled={loading !== null}
                  className={`w-full rounded-xl border px-4 py-4 text-left transition-colors disabled:opacity-50 ${accent}`}
                >
                  <span className="block text-sm font-semibold">{title}</span>
                  <span className="mt-0.5 block text-xs opacity-75">
                    {description}
                  </span>
                  {loading === role && (
                    <span className="mt-1 block text-xs opacity-75">
                      Ingresando…
                    </span>
                  )}
                </button>
              ))}

              {error && (
                <p className="text-sm text-red-600" role="alert">
                  {error}
                </p>
              )}
            </div>
          </div>

          {/* QR / información de demo */}
          <div className="flex flex-col items-center justify-center gap-3 border-t border-slate-200 bg-slate-50 p-8 md:border-l md:border-t-0">
            {qr ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={qr} alt="QR de acceso" width={220} height={220} />
            ) : (
              <div className="h-[220px] w-[220px] animate-pulse rounded-lg bg-slate-200" />
            )}
            <p className="text-xs text-slate-500">
              Escanea con tu celular para abrir{" "}
              <span className="font-medium text-slate-700">{origin || "esta URL"}</span>
            </p>
            <p className="text-center text-[11px] text-slate-400">
              Los chips NFC se programan con esta URL + el id de la máquina.
              En iPhone usa el QR, ya que Safari no abre URLs NFC nativamente.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}