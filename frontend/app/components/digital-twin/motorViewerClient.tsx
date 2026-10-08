"use client";

import dynamic from "next/dynamic";

const MotorViewer = dynamic(() => import("./motorViewer"), {
  ssr: false,
});

interface MotorViewerClientProps {
  status: "normal" | "advertencia" | "crítico";
  component: "carcasa" | "ventilador" | "tapas" | null;
}

export default function MotorViewerClient({
  status,
  component,
}: MotorViewerClientProps) {
  return <MotorViewer status={status} component={component} />;
}
