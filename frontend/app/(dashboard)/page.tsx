import Link from "next/link";
import { LayoutDashboard } from "lucide-react";

const equipment = [
  {
    name: "CNC-01",
    oee: "92%",
    diagnosis: "Operación Normal",
    status: "Normal",
    tone: "text-[#CCFF00]",
    href: "/maquinas/CNC-01",
  },
  {
    name: "CNC-02",
    oee: "60%",
    diagnosis: "Alto impacto, posible desbalance",
    status: "Crítico",
    tone: "text-red-400",
    href: "/maquinas/CNC-02",
  },
  {
    name: "Torno-A",
    oee: "78%",
    diagnosis: "Vibración leve en husillo",
    status: "Advertencia",
    tone: "text-[#eab308]",
  },
  {
    name: "Fresadora-B",
    oee: "95%",
    diagnosis: "Operación Normal",
    status: "Normal",
    tone: "text-[#CCFF00]",
  },
  {
    name: "Prensa-01",
    oee: "88%",
    diagnosis: "Operación Normal",
    status: "Normal",
    tone: "text-[#CCFF00]",
  },
];

const notices = [
  { when: "Hace 2 min", text: "CNC-02: Impacto severo (1023) detectado. IA invocada." },
  { when: "Hace 1 hora", text: "Torno-A: Aumento de temperatura a 52°C." },
  { when: "Hace 3 horas", text: "CNC-01: Mantenimiento preventivo completado." },
  { when: "Ayer", text: "Sistema: Actualización de modelo Llama 3.1 exitosa." },
];

const card = "rounded-2xl border border-[#333333] bg-[#1E1E1E] p-4";

const energyBars = [42, 68, 51, 84, 60, 93, 74, 58, 80, 66];

export default function Home() {
  return (
    <div className="flex min-h-dvh flex-col p-4 sm:p-6">
      <header className="mb-6 flex items-center gap-3 border-b border-[#333333] pb-4">
        <LayoutDashboard className="h-7 w-7 shrink-0 text-[#CCFF00]" aria-hidden />
        <h1 className="text-2xl font-semibold sm:text-3xl">
          <span className="text-gray-400">Dashboards</span>
          <span className="mx-2 text-gray-600">/</span>
          Overview
        </h1>
      </header>

      <div className="flex min-w-0 flex-1 flex-col gap-6 xl:flex-row">
      <div className="flex min-w-0 flex-1 flex-col gap-4">

        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <article className={card}>
            <p className="text-sm text-gray-400">OEE Planta Promedio</p>
            <p className="mt-3 text-3xl font-semibold tabular-nums">84%</p>
            <p className="mt-2 text-sm text-[#CCFF00]">+2.4% vs mes pasado</p>
          </article>
          <article className={card}>
            <p className="text-sm text-gray-400">Tiempo Operativo</p>
            <p className="mt-3 text-3xl font-semibold tabular-nums">96.5%</p>
            <p className="mt-2 text-sm text-[#CCFF00]">+1.2% vs mes pasado</p>
          </article>
          <article className={`${card} flex items-center justify-between gap-3`}>
            <div>
              <p className="text-sm text-gray-400">Máquinas Conectadas</p>
              <p className="mt-3 whitespace-nowrap text-3xl font-semibold tabular-nums">24 / 24</p>
            </div>
            <div
              className="grid h-14 w-14 shrink-0 place-items-center rounded-full"
              style={{ background: "conic-gradient(#CCFF00 0 100%)" }}
              aria-hidden
            >
              <span className="grid h-11 w-11 place-items-center rounded-full bg-[#1E1E1E] text-[10px] text-[#CCFF00]">
                24
              </span>
            </div>
          </article>
          <article className={card}>
            <p className="text-sm text-gray-400">Alertas Críticas Hoy</p>
            <p className="mt-3 text-3xl font-semibold tabular-nums">2</p>
            <p className="mt-2 text-sm text-red-400">−15% vs mes pasado</p>
          </article>
        </section>

        <section className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <article className={card}>
            <h2 className="text-sm font-medium">Estado de la Planta</h2>
            <div className="mt-6 flex flex-col items-center gap-6 sm:flex-row sm:items-center">
              <div
                className="grid h-36 w-36 shrink-0 place-items-center rounded-full"
                style={{
                  background:
                    "conic-gradient(#CCFF00 0 75%, #eab308 75% 91.67%, #333333 91.67% 100%)",
                }}
                aria-hidden
              >
                <span className="grid h-20 w-20 place-items-center rounded-full bg-[#1E1E1E] text-sm text-gray-400">
                  24
                </span>
              </div>
              <ul className="space-y-2 text-sm text-gray-400">
                <li className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-[#CCFF00]" />
                  18 Operativas
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-[#eab308]" />
                  4 Advertencia
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-[#333333]" />
                  2 Detenidas
                </li>
              </ul>
            </div>
          </article>

          <article className={card}>
            <h2 className="text-sm font-medium">Tendencia de Vibración Global</h2>
            <p className="mt-2 text-sm text-[#CCFF00]">Promedio actual: 3.2g</p>
            <div className="relative mt-4 h-36 overflow-hidden rounded-xl bg-[#121212]">
              <div
                className="absolute inset-0 bg-gradient-to-t from-[#CCFF00]/50 via-[#CCFF00]/15 to-transparent"
                style={{
                  clipPath:
                    "polygon(0 78%, 12% 70%, 24% 74%, 38% 48%, 52% 58%, 66% 30%, 80% 38%, 92% 18%, 100% 22%, 100% 100%, 0 100%)",
                }}
              />
            </div>
          </article>

          <article className={card}>
            <h2 className="text-sm font-medium">Consumo Energético</h2>
            <p className="mt-2 text-2xl font-semibold tabular-nums text-[#CCFF00]">4,250 kWh</p>
            <div className="mt-4 flex h-28 items-end gap-1.5" aria-hidden>
              {energyBars.map((height, index) => (
                <div key={index} className="flex h-full flex-1 items-end rounded-sm bg-[#333333]">
                  <div
                    className="w-full rounded-sm bg-[#CCFF00]"
                    style={{ height: `${height}%` }}
                  />
                </div>
              ))}
            </div>
          </article>

          <article className={card}>
            <h2 className="text-sm font-medium">Clima Operativo (Temp/Humedad)</h2>
            <p className="mt-2 text-2xl font-semibold tabular-nums">
              45.2 °C <span className="text-gray-500">|</span> 52% HR
            </p>
            <svg viewBox="0 0 240 90" className="mt-4 h-28 w-full" aria-hidden>
              <path
                d="M0 58 C 28 56, 42 22, 72 30 S 118 68, 150 38 S 188 16, 240 24"
                fill="none"
                stroke="#CCFF00"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
              <path
                d="M0 70 C 30 64, 52 42, 86 48 S 140 28, 172 44 S 210 58, 240 40"
                fill="none"
                stroke="#6b7280"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
            </svg>
          </article>
        </section>

        <section className={card}>
          <h2 className="text-sm font-medium">Lista de Maquinaria</h2>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead>
                <tr className="border-b border-[#333333] text-[11px] uppercase tracking-wider text-gray-400">
                  <th className="py-3 pr-4 font-medium">Máquina</th>
                  <th className="py-3 pr-4 font-medium">OEE actual</th>
                  <th className="py-3 pr-4 font-medium">Último Diagnóstico</th>
                  <th className="py-3 font-medium">Estado</th>
                </tr>
              </thead>
              <tbody>
                {equipment.map((row) => (
                  <tr key={row.name} className="border-b border-[#333333] last:border-0">
                    <td className="py-3 pr-4 font-medium">
                      {row.href ? (
                        <Link href={row.href} className="hover:text-[#CCFF00]">
                          {row.name}
                        </Link>
                      ) : (
                        row.name
                      )}
                    </td>
                    <td className="py-3 pr-4 tabular-nums text-gray-400">{row.oee}</td>
                    <td className="py-3 pr-4 text-gray-400">{row.diagnosis}</td>
                    <td className={`py-3 ${row.tone}`}>{row.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      <aside className="bg-transparent xl:ml-2 xl:w-80 xl:shrink-0 xl:border-l xl:border-[#333333] xl:pl-6">
        <h2 className="text-sm font-medium">Notificaciones del Agente IA</h2>
        <ul className="mt-4 space-y-4">
          {notices.map((notice) => (
            <li key={notice.when} className="border-b border-[#333333] pb-4 last:border-0 last:pb-0">
              <p className="text-[11px] uppercase tracking-wider text-[#CCFF00]">{notice.when}</p>
              <p className="mt-1 text-sm text-gray-400">{notice.text}</p>
            </li>
          ))}
        </ul>
      </aside>
      </div>
    </div>
  );
}
