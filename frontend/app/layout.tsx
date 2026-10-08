import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import PlantNav from "@/app/components/plant/PlantNav";
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
  title: "RetroFit — Centro de monitoreo industrial",
  description: "Monitoreo de motores industriales con gemelo digital, telemetría y eficiencia.",
  keywords: ["monitoreo industrial", "gemelo digital", "OEE", "mantenimiento"],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-[#f4f6f8]">
        <PlantNav />
        {children}
      </body>
    </html>
  );
}
