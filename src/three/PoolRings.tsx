import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useSimulationStore } from "../state/simulationStore";
import type { Person } from "../types/simulation";

const RING_COLOR: Record<string, string> = {
  created:  "#59b8ff",
  testing:  "#ffd166",
  negative: "#7effc4",
  positive: "#ff4b4b",
  split:    "#1e3a4a",
};

const RING_OPACITY: Record<string, number> = {
  created:  0.20,
  testing:  0.55,
  negative: 0.60,
  positive: 0.80,
  split:    0.07,
};

// Ring outer radius must clear the member ring radius with a small margin.
// Pool members sit at radius ≈0.82 → pool ring outer = 0.82 + 0.14 = 0.96
// Subgroup members sit at SUB_R=0.50 → subgroup ring outer = 0.50 + 0.16 = 0.66
const RING_OUTER: Record<string, number> = {
  pool:     0.96,
  subgroup: 0.66,
};

function centroid(personIds: number[], people: Person[]): [number, number, number] | null {
  const members = personIds.map((id) => people[id]).filter(Boolean);
  if (!members.length) return null;
  const n = members.length;
  return [
    members.reduce((s, p) => s + p.target[0], 0) / n,
    members.reduce((s, p) => s + p.target[1], 0) / n,
    members.reduce((s, p) => s + p.target[2], 0) / n,
  ];
}

interface RingData {
  id: string;
  x: number; y: number; z: number;
  innerR: number; outerR: number;
  color: string; opacity: number;
  isPositive: boolean;
}

export function PoolRings() {
  const rings = useRef<RingData[]>([]);
  const meshRefs = useRef<Map<string, THREE.Mesh>>(new Map());

  const pools  = useSimulationStore((state) => state.pools);
  const people = useSimulationStore((state) => state.people);

  // Rebuild ring list each render (cheap — pools only change on events)
  rings.current = Object.values(pools)
    .map((pool) => {
      const center = centroid(pool.personIds, people);
      if (!center) return null;
      const outerR  = RING_OUTER[pool.level] ?? 1.10;
      const innerR  = outerR - 0.09;
      const color   = RING_COLOR[pool.status] ?? "#59b8ff";
      const opacity = RING_OPACITY[pool.status] ?? 0.22;
      return {
        id: pool.id,
        x: center[0],
        y: center[1] - 0.38,
        z: center[2],
        innerR, outerR,
        color, opacity,
        isPositive: pool.status === "positive",
      } satisfies RingData;
    })
    .filter((r): r is RingData => r !== null);

  // Pulse positive rings
  useFrame((state) => {
    const t = state.clock.elapsedTime;
    for (const ring of rings.current) {
      if (!ring.isPositive) continue;
      const mesh = meshRefs.current.get(ring.id);
      if (!mesh) continue;
      const mat = mesh.material as THREE.MeshBasicMaterial;
      mat.opacity = ring.opacity * (0.7 + 0.3 * Math.sin(t * 7));
    }
  });

  if (!rings.current.length) return null;

  return (
    <>
      {rings.current.map((ring) => (
        <mesh
          key={ring.id}
          ref={(m) => {
            if (m) meshRefs.current.set(ring.id, m);
            else meshRefs.current.delete(ring.id);
          }}
          position={[ring.x, ring.y, ring.z]}
          rotation={[-Math.PI / 2, 0, 0]}
        >
          <ringGeometry args={[ring.innerR, ring.outerR, 56]} />
          <meshBasicMaterial
            color={ring.color}
            transparent
            opacity={ring.opacity}
            side={THREE.DoubleSide}
            depthWrite={false}
          />
        </mesh>
      ))}
    </>
  );
}
