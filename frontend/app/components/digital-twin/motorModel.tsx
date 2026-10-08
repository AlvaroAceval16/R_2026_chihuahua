"use client";

import { useEffect, useLayoutEffect, useMemo } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";

interface MotorModelProps {
  activeComponent: string | null;
  severity: "normal" | "advertencia" | "critico";
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
uniform float uBoost;
uniform float uFloor;

out vec4 fragColor;

void main() {
  float fresnel = pow(1.0 - abs(dot(normalize(vNormal), normalize(vViewDir))), 2.0);
  float sweep = fract(vWorldPos.y * 1.4 - uTime * 0.28);
  float scan = smoothstep(0.42, 0.5, sweep) * smoothstep(0.62, 0.5, sweep);
  float bands = smoothstep(0.94, 1.0, fract(vWorldPos.y * 7.0));
  vec3 color = uColor * (0.22 + fresnel * 1.35 + scan * 0.7 + bands * 0.28) * uBoost;
  float alpha = clamp(uFloor + fresnel * 0.78 + scan * 0.28, 0.0, 0.95);
  fragColor = vec4(color, alpha);
}
`;

function createHologramMaterial(color: THREE.Color) {
  return new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uColor: { value: color },
      uBoost: { value: 1 },
      uFloor: { value: 0.06 },
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

type Paint = {
  material: THREE.ShaderMaterial;
  lines: THREE.LineBasicMaterial;
  role: "body" | "bearing" | "fan" | "bornes";
};

function radialDistance(point: THREE.Vector3, center: THREE.Vector3, axis: number) {
  const dx = axis === 0 ? 0 : point.x - center.x;
  const dy = axis === 1 ? 0 : point.y - center.y;
  const dz = axis === 2 ? 0 : point.z - center.z;
  return Math.hypot(dx, dy, dz);
}

function geometryFromTriangles(source: THREE.BufferGeometry, triangles: number[]) {
  const position = source.getAttribute("position");
  const normal = source.getAttribute("normal");
  const index = source.index;
  if (!index) return null;

  const positions = new Float32Array(triangles.length * 9);
  const normals = new Float32Array(triangles.length * 9);
  let write = 0;

  for (const triangle of triangles) {
    for (let corner = 0; corner < 3; corner += 1) {
      const vertex = index.getX(triangle + corner);
      positions[write] = position.getX(vertex);
      positions[write + 1] = position.getY(vertex);
      positions[write + 2] = position.getZ(vertex);
      if (normal) {
        normals[write] = normal.getX(vertex);
        normals[write + 1] = normal.getY(vertex);
        normals[write + 2] = normal.getZ(vertex);
      }
      write += 3;
    }
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute("normal", new THREE.BufferAttribute(normals, 3));
  return geometry;
}

/** Outer rim of the shaft-end bell, the end opposite the fan, already in closingPart. */
function splitDriveEndRing(source: THREE.BufferGeometry, fanCenter: THREE.Vector3) {
  const index = source.index;
  const position = source.getAttribute("position");
  if (!index || !position) return null;

  source.computeBoundingBox();
  const box = source.boundingBox;
  if (!box) return null;

  const size = box.getSize(new THREE.Vector3());
  const center = box.getCenter(new THREE.Vector3());
  const axis = size.x >= size.y && size.x >= size.z ? 0 : size.y >= size.z ? 1 : 2;
  const shaftEnd = Math.sign(fanCenter.getComponent(axis) - center.getComponent(axis)) || 1;
  const end = shaftEnd > 0 ? box.max.getComponent(axis) : box.min.getComponent(axis);
  const reach = size.getComponent(axis) * 0.14;
  const radii: number[] = [];
  const point = new THREE.Vector3();

  for (let vertex = 0; vertex < position.count; vertex += 1) {
    point.fromBufferAttribute(position, vertex);
    if (Math.abs(point.getComponent(axis) - end) > reach) continue;
    radii.push(radialDistance(point, center, axis));
  }
  radii.sort((a, b) => a - b);
  const rim = radii[Math.floor(radii.length * 0.8)] ?? 0;

  const ringTriangles: number[] = [];
  const restTriangles: number[] = [];
  const cornerA = new THREE.Vector3();
  const cornerB = new THREE.Vector3();
  const cornerC = new THREE.Vector3();

  for (let triangle = 0; triangle < index.count; triangle += 3) {
    cornerA.fromBufferAttribute(position, index.getX(triangle));
    cornerB.fromBufferAttribute(position, index.getX(triangle + 1));
    cornerC.fromBufferAttribute(position, index.getX(triangle + 2));
    const centroid = cornerA.clone().add(cornerB).add(cornerC).multiplyScalar(1 / 3);
    const nearShaftEnd = Math.abs(centroid.getComponent(axis) - end) < reach;
    const radial = radialDistance(centroid, center, axis);
    const onRim = radial > rim * 0.86 && radial < rim * 1.05;
    if (nearShaftEnd && onRim) ringTriangles.push(triangle);
    else restTriangles.push(triangle);
  }

  if (ringTriangles.length < 24 || restTriangles.length === 0) return null;
  const ring = geometryFromTriangles(source, ringTriangles);
  const rest = geometryFromTriangles(source, restTriangles);
  if (!ring || !rest) return null;
  return { ring, rest };
}

/** Square terminal box sitting on top of the stator housing. */
function splitTerminalBox(source: THREE.BufferGeometry) {
  const index = source.index;
  const position = source.getAttribute("position");
  if (!index || !position) return null;

  source.computeBoundingBox();
  const box = source.boundingBox;
  if (!box) return null;

  const size = box.getSize(new THREE.Vector3());
  const axis = size.y >= size.x && size.y >= size.z ? 1 : size.x >= size.z ? 0 : 2;
  const cut = box.min.getComponent(axis) + size.getComponent(axis) * 0.72;
  const boxTriangles: number[] = [];
  const restTriangles: number[] = [];
  const cornerA = new THREE.Vector3();
  const cornerB = new THREE.Vector3();
  const cornerC = new THREE.Vector3();

  for (let triangle = 0; triangle < index.count; triangle += 3) {
    cornerA.fromBufferAttribute(position, index.getX(triangle));
    cornerB.fromBufferAttribute(position, index.getX(triangle + 1));
    cornerC.fromBufferAttribute(position, index.getX(triangle + 2));
    const centroid = cornerA.clone().add(cornerB).add(cornerC).multiplyScalar(1 / 3);
    if (centroid.getComponent(axis) > cut) boxTriangles.push(triangle);
    else restTriangles.push(triangle);
  }

  if (boxTriangles.length < 24 || restTriangles.length === 0) return null;
  const terminal = geometryFromTriangles(source, boxTriangles);
  const rest = geometryFromTriangles(source, restTriangles);
  if (!terminal || !rest) return null;
  return { terminal, rest };
}

function ancestorName(object: THREE.Object3D, name: string) {
  let current: THREE.Object3D | null = object;
  while (current) {
    if (current.name === name) return true;
    current = current.parent;
  }
  return false;
}

export default function MotorModel({ activeComponent, severity }: MotorModelProps) {
  const { scene } = useGLTF("/models/electric_motor.glb");
  const camera = useThree((state) => state.camera);
  const glScene = useThree((state) => state.scene);
  const paintWholeMotor = activeComponent === "motor" && severity !== "normal";
  const paintBearing = activeComponent === "balero" && severity !== "normal";
  const paintFan =
    severity !== "normal" && (activeComponent === "ventilador" || activeComponent === "clima");
  const paintBornes =
    severity !== "normal" && (activeComponent === "bornes" || activeComponent === "clima");
  const alertHex = severity === "advertencia" ? "#f59e0b" : "#ef4444";

  const rig = useMemo(() => {
    const root = scene.clone(true);
    const materials: THREE.ShaderMaterial[] = [];
    const paints: Paint[] = [];
    const ownedGeometries: THREE.BufferGeometry[] = [];
    const baseColor = new THREE.Color("#3ecfff");

    const dress = (mesh: THREE.Mesh, role: Paint["role"]) => {
      const material = createHologramMaterial(baseColor.clone());
      mesh.material = material;
      materials.push(material);

      const lineMaterial = new THREE.LineBasicMaterial({
        color: baseColor.clone(),
        transparent: true,
        opacity: 0.45,
      });
      mesh.add(new THREE.LineSegments(new THREE.EdgesGeometry(mesh.geometry, 18), lineMaterial));
      paints.push({ material, lines: lineMaterial, role });
    };

    const meshes: THREE.Mesh[] = [];
    root.traverse((object) => {
      if (object instanceof THREE.Mesh) meshes.push(object);
    });

    const fan = meshes.find((mesh) => ancestorName(mesh, "parts"));
    const fanCenter = new THREE.Vector3();
    fan?.geometry.computeBoundingBox();
    fan?.geometry.boundingBox?.getCenter(fanCenter);

    for (const mesh of meshes) {
      if (ancestorName(mesh, "closingPart")) {
        const split = splitDriveEndRing(mesh.geometry, fanCenter);
        if (split) {
          ownedGeometries.push(split.rest, split.ring);
          mesh.geometry = split.rest;
          const bearing = new THREE.Mesh(split.ring);
          bearing.name = "balero";
          mesh.add(bearing);
          dress(bearing, "bearing");
        }
        dress(mesh, "body");
        continue;
      }
      if (ancestorName(mesh, "parts")) {
        dress(mesh, "fan");
        continue;
      }
      if (ancestorName(mesh, "body")) {
        const split = splitTerminalBox(mesh.geometry);
        if (split) {
          ownedGeometries.push(split.rest, split.terminal);
          mesh.geometry = split.rest;
          const bornes = new THREE.Mesh(split.terminal);
          bornes.name = "bornes";
          mesh.add(bornes);
          dress(bornes, "bornes");
        }
      }
      dress(mesh, "body");
    }

    root.updateMatrixWorld(true);
    const bounds = new THREE.Box3().setFromObject(root);
    const center = bounds.getCenter(new THREE.Vector3());
    root.position.sub(center);
    root.updateMatrixWorld(true);
    const size = bounds.getSize(new THREE.Vector3());
    const span = Math.max(size.x, size.y, size.z, 0.001);

    return { root, materials, paints, ownedGeometries, span };
  }, [scene]);

  useEffect(() => {
    const base = new THREE.Color("#3ecfff");
    const alertColor = new THREE.Color(alertHex);

    for (const paint of rig.paints) {
      const alert =
        paintWholeMotor ||
        (paintBearing && paint.role === "bearing") ||
        (paintFan && paint.role === "fan") ||
        (paintBornes && paint.role === "bornes");
      const color = alert ? alertColor : base;
      const hotPiece = paint.role !== "body";
      paint.material.uniforms.uColor.value.copy(color);
      paint.material.uniforms.uBoost.value = alert ? (hotPiece ? 1.8 : 1.35) : 1;
      paint.material.uniforms.uFloor.value = alert && hotPiece ? 0.72 : 0.06;
      paint.lines.color.copy(color);
      paint.lines.opacity = alert && hotPiece ? 1 : 0.45;
    }
  }, [alertHex, paintBearing, paintBornes, paintFan, paintWholeMotor, rig]);

  /* eslint-disable react-hooks/immutability -- three.js exige mutación imperativa de la cámara y la escena */
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
    glScene.fog = new THREE.Fog("#000000", span * 1.8, span * 7);
  }, [camera, glScene, rig]);
  /* eslint-enable react-hooks/immutability */

  useEffect(() => {
    const { root, materials, ownedGeometries } = rig;
    return () => {
      root.traverse((object) => {
        if (!(object instanceof THREE.LineSegments)) return;
        object.geometry.dispose();
        const lineMaterial = object.material;
        if (lineMaterial instanceof THREE.Material) lineMaterial.dispose();
      });
      materials.forEach((material) => material.dispose());
      ownedGeometries.forEach((geometry) => geometry.dispose());
    };
  }, [rig]);

  useFrame((_, delta) => {
    for (const material of rig.materials) {
      // eslint-disable-next-line react-hooks/immutability -- los uniforms de three.js se actualizan por referencia
      material.uniforms.uTime.value += delta;
    }
  });

  return <primitive object={rig.root} />;
}

useGLTF.preload("/models/electric_motor.glb");
