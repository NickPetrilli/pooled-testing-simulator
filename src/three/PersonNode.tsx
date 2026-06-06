import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import type { Person } from "../types/simulation";
import { statusColors } from "./statusColors";

interface PersonNodeProps {
  person: Person;
}

export function PersonNode({ person }: PersonNodeProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const lightRef = useRef<THREE.PointLight>(null);
  const color = statusColors[person.status];
  const target = useMemo(() => new THREE.Vector3(...person.target), [person.target]);

  useFrame((state, delta) => {
    if (!meshRef.current) return;
    meshRef.current.position.lerp(target, 1 - Math.pow(0.04, delta));
    const pulse = 1 + Math.sin(state.clock.elapsedTime * 5 + person.id) * 0.08;
    const statusScale = person.status === "confirmed-infected" ? 1.45 : person.status === "testing" ? 1.24 : 1;
    meshRef.current.scale.setScalar(pulse * statusScale);

    if (lightRef.current) {
      lightRef.current.position.copy(meshRef.current.position);
      lightRef.current.intensity = person.status === "untested" ? 0 : person.status === "confirmed-infected" ? 1.35 : 0.65;
    }
  });

  return (
    <>
      <mesh ref={meshRef} position={person.position}>
        <sphereGeometry args={[0.12, 24, 24]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={person.status === "untested" ? 0.08 : 0.85}
          roughness={0.22}
          metalness={0.28}
        />
      </mesh>
      <pointLight ref={lightRef} color={color} distance={1.8} intensity={0.4} />
    </>
  );
}
