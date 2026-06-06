import * as THREE from "three";
import { useSimulationStore } from "../state/simulationStore";
import type { Person } from "../types/simulation";

// Ring color matches the pool's result status
const RING_COLOR: Record<string, string> = {
  created: "#59b8ff",
  testing: "#ffd166",
  negative: "#7effc4",
  positive: "#ff4b4b",
  split: "#1e3a4a",
};

const RING_OPACITY: Record<string, number> = {
  created: 0.22,
  testing: 0.50,
  negative: 0.65,
  positive: 0.72,
  split: 0.08,
};

function centroid(personIds: number[], people: Person[]): [number, number, number] | null {
  const members = personIds.map((id) => people[id]).filter(Boolean);
  if (members.length === 0) return null;
  const n = members.length;
  return [
    members.reduce((s, p) => s + p.target[0], 0) / n,
    members.reduce((s, p) => s + p.target[1], 0) / n,
    members.reduce((s, p) => s + p.target[2], 0) / n,
  ];
}

export function PoolRings() {
  const pools = useSimulationStore((state) => state.pools);
  const people = useSimulationStore((state) => state.people);

  const rings = Object.values(pools)
    .map((pool) => {
      const center = centroid(pool.personIds, people);
      if (!center) return null;
      // Rings sit just below the person layer
      const y = center[1] - 0.38;
      // Outer radius: pool-of-8 is larger than subgroup-of-4
      const outerR = pool.level === "pool" ? 1.08 : 0.72;
      const innerR = outerR - 0.08;
      const color = RING_COLOR[pool.status] ?? "#59b8ff";
      const opacity = RING_OPACITY[pool.status] ?? 0.25;
      return { id: pool.id, x: center[0], y, z: center[2], innerR, outerR, color, opacity };
    })
    .filter((r): r is NonNullable<typeof r> => r !== null);

  if (rings.length === 0) return null;

  return (
    <>
      {rings.map((ring) => (
        <mesh key={ring.id} position={[ring.x, ring.y, ring.z]} rotation={[-Math.PI / 2, 0, 0]}>
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
