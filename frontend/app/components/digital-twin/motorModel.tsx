"use client";

import { useGLTF } from "@react-three/drei";
import * as THREE from "three";

interface MotorModelProps {
  status: "normal" | "advertencia" | "crítico";
  component: "carcasa" | "ventilador" | "tapas" | null;
}

const componentMeshes = {
  carcasa: "defaultMaterial",
  ventilador: "defaultMaterial_1",
  tapas: "defaultMaterial_2",
};

export default function MotorModel({ status, component }: MotorModelProps) {
  const { scene } = useGLTF("/models/electric_motor.glb");

  const affectedMesh = component ? componentMeshes[component] : null;

  scene.traverse((object) => {
    if (!(object instanceof THREE.Mesh)) return;

    const material = object.material as THREE.MeshStandardMaterial;

    if (object.name !== affectedMesh) {
      return;
    }

    if (status === "crítico") {
      object.material = new THREE.MeshStandardMaterial({
        color: "#f30101",
        metalness: 0,
        roughness: 1,
      });
    } else if (status === "advertencia") {
      object.material = new THREE.MeshStandardMaterial({
        color: "#f59e0b",
        metalness: 0,
        roughness: 1,
      });
    }
  });

  return <primitive object={scene} />;
}

useGLTF.preload("/models/electric_motor.glb");
