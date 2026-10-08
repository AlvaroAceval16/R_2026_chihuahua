"use client";

import { useEffect, useLayoutEffect, useMemo } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Grid, useGLTF } from "@react-three/drei";
import * as THREE from "three";

interface MotorModelProps {
  status: "normal" | "advertencia" | "crítico";
  component: "carcasa" | "ventilador" | "tapas" | null;
}

const componentGroups = {
  carcasa: "body",
  ventilador: "parts",
  tapas: "closingPart",
};

function belongsToGroup(object: THREE.Object3D, groupName: string | null) {
  if (!groupName) return false;
  let current: THREE.Object3D | null = object;
  while (current) {
    if (current.name === groupName) return true;
    current = current.parent;
  }
  return false;
}

const hologramVertex = /* glsl */ `
out vec3 vNormal;
out vec3 vWorldPos;
out vec3 vViewDir;

void main() {
  vec4 worldPos = modelMatrix * vec4(position, 1.0);
  vWorldPos = worldPos.xyz;
  vNormal = normalize(mat3(modelMatrix) * normal);
  vViewDir = normalize(cameraPosition - worldPos.xyz);
  gl_Position = projectionMatrix * viewMatrix * worldPos;
}
`;

const hologramFragment = /* glsl */ `
in vec3 vNormal;
in vec3 vWorldPos;
in vec3 vViewDir;

uniform float uTime;
uniform vec3 uColor;

out vec4 fragColor;

void main() {
  float fresnel = pow(1.0 - abs(dot(normalize(vNormal), normalize(vViewDir))), 2.0);
  float sweep = fract(vWorldPos.y * 1.4 - uTime * 0.28);
  float scan = smoothstep(0.42, 0.5, sweep) * smoothstep(0.62, 0.5, sweep);
  float bands = smoothstep(0.94, 1.0, fract(vWorldPos.y * 7.0));
  vec3 color = uColor * (0.22 + fresnel * 1.35 + scan * 0.7 + bands * 0.28);
  float alpha = clamp(0.06 + fresnel * 0.78 + scan * 0.28, 0.0, 0.95);
  fragColor = vec4(color, alpha);
}
`;

function createHologramMaterial(color: THREE.Color) {
  return new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uColor: { value: color },
    },
    vertexShader: hologramVertex,
    fragmentShader: hologramFragment,
    glslVersion: THREE.GLSL3,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    side: THREE.DoubleSide,
  });
}

export default function MotorModel({ status, component }: MotorModelProps) {
  const { scene } = useGLTF("/models/electric_motor.glb");
  const camera = useThree((state) => state.camera);
  const glScene = useThree((state) => state.scene);

  const rig = useMemo(() => {
    const root = scene.clone(true);
    const materials: THREE.ShaderMaterial[] = [];
    const affectedGroup = component ? componentGroups[component] : null;
    const hotColor =
      status === "crítico" ? new THREE.Color("#ff4d4d") : new THREE.Color("#f5b942");
    const baseColor = new THREE.Color("#3ecfff");

    root.traverse((object) => {
      if (!(object instanceof THREE.Mesh)) return;

      const isHot = belongsToGroup(object, affectedGroup) && status !== "normal";
      const color = isHot ? hotColor : baseColor;
      const material = createHologramMaterial(color);
      object.material = material;
      materials.push(material);

      const edges = new THREE.EdgesGeometry(object.geometry, 18);
      const lines = new THREE.LineSegments(
        edges,
        new THREE.LineBasicMaterial({
          color,
          transparent: true,
          opacity: isHot ? 0.95 : 0.45,
        })
      );
      object.add(lines);
    });

    root.updateMatrixWorld(true);
    const bounds = new THREE.Box3().setFromObject(root);
    const center = bounds.getCenter(new THREE.Vector3());
    root.position.sub(center);
    const size = bounds.getSize(new THREE.Vector3());
    const span = Math.max(size.x, size.y, size.z, 0.001);

    return { root, materials, size, span };
  }, [scene, status, component]);

  useLayoutEffect(() => {
    const { span } = rig;
    const distance = span * 1.7;
    camera.position.set(distance * 0.95, distance * 0.42, distance);
    camera.lookAt(0, 0, 0);
    if (camera instanceof THREE.PerspectiveCamera) {
      camera.near = span / 80;
      camera.far = span * 24;
      camera.updateProjectionMatrix();
    }
    glScene.fog = new THREE.Fog("#05080f", span * 1.8, span * 7);
  }, [camera, glScene, rig]);

  useEffect(() => {
    const { root, materials } = rig;
    return () => {
      root.traverse((object) => {
        if (object instanceof THREE.LineSegments) {
          object.geometry.dispose();
          const lineMaterial = object.material;
          if (Array.isArray(lineMaterial)) {
            lineMaterial.forEach((item) => item.dispose());
          } else {
            lineMaterial.dispose();
          }
        }
      });
      materials.forEach((material) => material.dispose());
    };
  }, [rig]);

  useFrame((_, delta) => {
    for (const material of rig.materials) {
      material.uniforms.uTime.value += delta;
    }
  });

  const floor = -rig.size.y / 2;
  const cell = rig.span * 0.12;

  return (
    <group>
      <primitive object={rig.root} />
      <Grid
        position={[0, floor - rig.span * 0.02, 0]}
        args={[rig.span * 6, rig.span * 6]}
        cellSize={cell}
        cellThickness={0.6}
        cellColor="#14506a"
        sectionSize={cell * 4}
        sectionThickness={1.1}
        sectionColor="#3ecfff"
        fadeDistance={rig.span * 5}
        fadeStrength={1.4}
        infiniteGrid
      />
    </group>
  );
}

useGLTF.preload("/models/electric_motor.glb");
