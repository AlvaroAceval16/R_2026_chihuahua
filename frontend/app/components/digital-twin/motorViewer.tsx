"use client";

import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import MotorModel from "./motorModel";

interface MotorViewerProps {
  status: "normal" | "advertencia" | "crítico";
  component: "carcasa" | "ventilador" | "tapas" | null;
}

export default function MotorViewer({ status, component }: MotorViewerProps) {
  return (
    <div className="h-full w-full">
      <Canvas camera={{ position: [4, 2, 4], fov: 42 }} gl={{ antialias: true }}>
        <color attach="background" args={["#000000"]} />
        <fog attach="fog" args={["#000000", 8, 22]} />
        <MotorModel status={status} component={component} />
        <OrbitControls enableDamping dampingFactor={0.08} target={[0, 0, 0]} />
      </Canvas>
    </div>
  );
}
