"use client";

import dynamic from "next/dynamic";
import { memo } from "react";

const MotorViewer = dynamic(() => import("./motorViewer"), {
  ssr: false,
});

interface MotorViewerClientProps {
  activeComponent?: string | null;
  severity?: "normal" | "advertencia" | "critico";
  status?: "normal" | "advertencia" | "crítico";
  component?: string | null;
}

function MotorViewerClient({
  activeComponent,
  severity,
  status,
  component,
}: MotorViewerClientProps) {
  const resolvedSeverity =
    severity ?? (status === "crítico" ? "critico" : status === "advertencia" ? "advertencia" : "normal");
  const resolvedComponent = activeComponent !== undefined ? activeComponent : (component ?? null);

  return <MotorViewer activeComponent={resolvedComponent} severity={resolvedSeverity} />;
}

export default memo(MotorViewerClient);
