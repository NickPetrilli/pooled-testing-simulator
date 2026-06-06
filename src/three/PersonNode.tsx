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

    // pulse speed and scale per status
    const t = state.clock.elapsedTime;
    let pulseFreq = 5;
    let pulseAmp = 0.08;
    let baseScale = 1;
    if (person.status === "confirmed-infected") { pulseFreq = 2.5; pulseAmp = 0.14; baseScale = 1.45; }
    else if (person.status === "positive-subgroup") { pulseFreq = 9; pulseAmp = 0.11; baseScale = 1.18; }
    else if (person.status === "testing") { pulseFreq = 6; pulseAmp = 0.06; baseScale = 1.24; }
    const pulse = 1 + Math.sin(t * pulseFreq + person.id) * pulseAmp;
    meshRef.current.scale.setScalar(pulse * baseScale);

    if (lightRef.current) {
      lightRef.current.position.copy(meshRef.current.position);
      lightRef.current.intensity =
        person.status === "untested" ? 0 :
        person.status === "confirmed-infected" ? 1.6 :
        person.status === "positive-subgroup" ? 1.1 : 0.65;
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
