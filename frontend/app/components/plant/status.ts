import { PlantSeverity, ResolutionStatus } from "@/types/machine";

export const severityLabel: Record<PlantSeverity, string> = {
  normal: "Normal",
  advertencia: "Advertencia",
  critico: "Crítico",
};

export const severityText: Record<PlantSeverity, string> = {
  normal: "text-[#15803d]",
  advertencia: "text-[#a16207]",
  critico: "text-[#e4007c]",
};

export const severityDot: Record<PlantSeverity, string> = {
  normal: "bg-[#15803d]",
  advertencia: "bg-[#eab308]",
  critico: "bg-[#e4007c]",
};

export const severityWash: Record<PlantSeverity, string> = {
  normal: "bg-[#f0fdf4]",
  advertencia: "bg-[#fefce8]",
  critico: "bg-[#fdf2f8]",
};

export const severityBar: Record<PlantSeverity, string> = {
  normal: "bg-[#15803d]",
  advertencia: "bg-[#eab308]",
  critico: "bg-[#e4007c]",
};

export function oeeBarClass(value: number) {
  if (value >= 85) return "bg-[#15803d]";
  if (value >= 65) return "bg-[#eab308]";
  return "bg-[#e4007c]";
}

export const resolutionLabel: Record<ResolutionStatus, string> = {
  abierto: "Abierto",
  "en curso": "En curso",
  cerrado: "Cerrado",
};

export const resolutionText: Record<ResolutionStatus, string> = {
  abierto: "text-[#e4007c]",
  "en curso": "text-[#a16207]",
  cerrado: "text-[#15803d]",
};

export const cardClass = "rounded-3xl bg-white p-6 shadow-[0_8px_30px_rgba(15,23,42,0.06)]";
