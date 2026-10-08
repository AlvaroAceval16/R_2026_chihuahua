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
      accent: "border-[#333333] hover:border-[#CCFF00]",
      dot: "bg-[#CCFF00]",
      hint: "text-[#CCFF00]",
    },
    {
      role: "mantenimiento" as const,
      title: "Soy de Mantenimiento",
      description: "Registro de mantenimientos",
      accent: "border-[#333333] hover:border-[#e4007c]",
      dot: "bg-[#e4007c]",
      hint: "text-[#e4007c]",
    },
  ];

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#121212] px-4 py-10">
      <div className="w-full max-w-4xl overflow-hidden rounded-2xl border border-[#333333] bg-[#1E1E1E]">
        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* Selección de rol */}
          <div className="p-8">
            <p className="text-lg font-semibold tracking-tight text-white">
              RetroF
              <span className="relative inline-block">
                i
                <span className="absolute left-1/2 top-[0.08em] h-[0.22em] w-[0.22em] -translate-x-1/2 rounded-full bg-[#CCFF00]" />
              </span>
              t
            </p>
            <p className="mt-1 text-[11px] uppercase tracking-[0.16em] text-gray-500">
              Acceso NFC
            </p>

            <h1 className="mt-6 text-xl font-semibold text-white">
              Selecciona tu rol
            </h1>
            <p className="mt-1 text-sm text-gray-400">
              Demo — en producción esto ocurre al escanear el chip NFC de la
              máquina.
            </p>

            <div className="mt-6 space-y-3">
              {roles.map(({ role, title, description, accent, dot, hint }) => (
                <button
                  key={role}
                  type="button"
                  onClick={() => selectRole(role)}
                  disabled={loading !== null}
                  className={`w-full rounded-xl border bg-[#121212] px-4 py-4 text-left transition-colors disabled:opacity-50 ${accent}`}
                >
                  <span className="flex items-center gap-2 text-sm font-semibold text-white">
                    <span className={`h-2 w-2 rounded-full ${dot}`} />
                    {title}
                  </span>
                  <span className="mt-0.5 block text-xs text-gray-400">
                    {description}
                  </span>
                  {loading === role && (
                    <span className={`mt-1 block text-xs ${hint}`}>
                      Ingresando…
                    </span>
                  )}
                </button>
              ))}

              {error && (
                <p className="text-sm text-[#e4007c]" role="alert">
                  {error}
                </p>
              )}
            </div>
          </div>

          {/* QR / información de demo */}
          <div className="flex flex-col items-center justify-center gap-3 border-t border-[#333333] bg-[#121212] p-8 md:border-l md:border-t-0">
            {qr ? (
              <div className="rounded-xl bg-white p-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={qr} alt="QR de acceso" width={220} height={220} />
              </div>
            ) : (
              <div className="h-[236px] w-[236px] animate-pulse rounded-xl bg-[#1E1E1E]" />
            )}
            <p className="text-xs text-gray-400">
              Escanea con tu celular para abrir{" "}
              <span className="font-medium text-[#CCFF00]">
                {origin || "esta URL"}
              </span>
            </p>
            <p className="text-center text-[11px] text-gray-500">
              Los chips NFC se programan con esta URL + el id de la máquina.
              En iPhone usa el QR, ya que Safari no abre URLs NFC nativamente.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}