/**
 * PoolConnectors — draws thin lines from each parent pool's grid centre
 * to its two child subgroup centres, making the split hierarchy visible.
 *
 * Lines are recomputed whenever the pools / people state changes (i.e. on
 * every engine event), which is infrequent so the useMemo cost is tiny.
 */
import { useMemo } from "react";
import * as THREE from "three";
import { useSimulationStore } from "../state/simulationStore";
import { poolCenter } from "../utils/layout";
import type { Person } from "../types/simulation";

function subgroupCentroid(ids: number[], people: Person[]): [number, number, number] | null {
  const members = ids.map((id) => people[id]).filter(Boolean);
  if (!members.length) return null;
  const n = members.length;
  return [
    members.reduce((s, p) => s + p.target[0], 0) / n,
    members.reduce((s, p) => s + p.target[1], 0) / n,
    members.reduce((s, p) => s + p.target[2], 0) / n,
  ];
}

export function PoolConnectors() {
  const pools  = useSimulationStore((s) => s.pools);
  const people = useSimulationStore((s) => s.people);
  const config = useSimulationStore((s) => s.config);

  const totalPools = Math.ceil(config.populationSize / config.groupSize);

  // Build flat vertex array: each line = 2 × (x,y,z)
  const geometry = useMemo(() => {
    const verts: number[] = [];

    for (const pool of Object.values(pools)) {
      // Only subgroup pools have a parent to connect to
      if (!pool.id.includes("-sub-")) continue;

      const parentId = pool.id.replace(/-sub-\d+$/, "");
      const poolNum  = parseInt(parentId.match(/pool-(\d+)/)?.[1] ?? "1", 10) - 1;
      const [px, py, pz] = poolCenter(poolNum, totalPools);

      const cc = subgroupCentroid(pool.personIds, people);
      if (!cc) continue;

      // Vertical-ish line: pool grid centre → subgroup centre
      verts.push(px, py, pz, cc[0], cc[1], cc[2]);
    }

    const geo = new THREE.BufferGeometry();
    if (verts.length) {
      geo.setAttribute(
        "position",
        new THREE.BufferAttribute(new Float32Array(verts), 3),
      );
    }
    return geo;
  }, [pools, people, totalPools]);

  const hasSubgroups = useMemo(
    () => Object.values(pools).some((p) => p.id.includes("-sub-")),
    [pools],
  );

  if (!hasSubgroups) return null;

  return (
    <lineSegments geometry={geometry}>
      <lineBasicMaterial color="#3aff8a" opacity={0.30} transparent depthWrite={false} />
    </lineSegments>
  );
}
