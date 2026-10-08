"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

/** Login sin contraseña (demo): el username es la credencial. */
export default function LoginForm({ next }: { next: string }) {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [qr, setQr] = useState<string | null>(null);
  const [origin, setOrigin] = useState("");

  // Genera un QR con la URL de la app para celulares sin NFC (iPhone).
  useEffect(() => {
    const o = window.location.origin;
    setOrigin(o);
    import("qrcode")
      .then(({ default: QRCode }) =>
        QRCode.toDataURL(o, { width: 220, margin: 1 })
      )
      .then(setQr)
      .catch(() => {});
  }, []);

  async function submit(value?: string) {
    const user = (value ?? username).trim();
    if (!user) {
      setError("Ingresa tu usuario.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: user }),
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
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f4f6f8] px-4">
      <div className="w-full max-w-4xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* Formulario */}
          <div className="p-8">
            <h1 className="text-xl font-semibold text-slate-800">RetroFit AI</h1>
            <p className="mt-1 text-sm text-slate-500">
              Acceso por credencial — escanea el chip NFC de la máquina y
              continúa.
            </p>

            <div className="mt-6 space-y-3">
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => submit("supervisor")}
                  disabled={loading}
                  className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 disabled:opacity-50"
                >
                  Soy Supervisor
                </button>
                <button
                  type="button"
                  onClick={() => submit("mantenimiento")}
                  disabled={loading}
                  className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 disabled:opacity-50"
                >
                  Soy de Mantenimiento
                </button>
              </div>

              <div className="flex items-center gap-2 text-xs text-slate-400">
                <span className="h-px flex-1 bg-slate-200" />
                o escribe tu usuario
                <span className="h-px flex-1 bg-slate-200" />
              </div>

              <input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && submit()}
                placeholder="supervisor | mantenimiento"
                autoComplete="off"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500"
              />
              <button
                type="button"
                onClick={() => submit()}
                disabled={loading}
                className="w-full rounded-lg bg-slate-800 px-3 py-2 text-sm font-medium text-white hover:bg-slate-700 disabled:opacity-50"
              >
                {loading ? "Ingresando…" : "Ingresar"}
              </button>

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