"use client";

import { memo } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import MotorModel from "./motorModel";

interface MotorViewerProps {
  activeComponent: string | null;
  severity: "normal" | "advertencia" | "critico";
}

function MotorViewer({ activeComponent, severity }: MotorViewerProps) {
  return (
    <div className="h-full w-full">
      <Canvas camera={{ position: [4, 2, 4], fov: 42 }} gl={{ antialias: true }}>
        <color attach="background" args={["#000000"]} />
        <fog attach="fog" args={["#000000", 8, 22]} />
        <MotorModel activeComponent={activeComponent} severity={severity} />
        <OrbitControls enableDamping dampingFactor={0.08} target={[0, 0, 0]} />
      </Canvas>
    </div>
  );
}

export default memo(MotorViewer);
