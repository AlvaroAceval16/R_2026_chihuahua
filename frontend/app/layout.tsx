import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "RetroFit AI — Centro de Monitoreo Industrial",
  description:
    "Sistema de monitoreo y diagnóstico de maquinaria industrial en tiempo real, potenciado por inteligencia artificial.",
  keywords: ["monitoreo industrial", "SCADA", "gemelo digital", "IA", "OEE", "mantenimiento predictivo"],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#f4f6f8]">{children}</body>
    </html>
  );
}
