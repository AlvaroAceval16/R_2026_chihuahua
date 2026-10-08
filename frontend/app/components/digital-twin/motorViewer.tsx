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
    <div className="h-[340px] w-full">
      <Canvas camera={{ position: [4, 3, 4], fov: 45 }}>
        <ambientLight intensity={1.8} />

        <directionalLight position={[5, 5, 5]} intensity={2} />

        <directionalLight position={[-5, 3, 2]} intensity={1} />

        <directionalLight position={[0, -2, -5]} intensity={0.7} />

        {status === "advertencia" && (
          <pointLight
            position={[0, 1, 1]}
            color="#f59e0b"
            intensity={3}
            distance={4}
          />
        )}

        {status === "crítico" && (
          <pointLight
            position={[0, 1, 1]}
            color="#ef4444"
            intensity={5}
            distance={4}
          />
        )}

        <MotorModel status={status} component={component} />

        <OrbitControls />
      </Canvas>
    </div>
  );
}
