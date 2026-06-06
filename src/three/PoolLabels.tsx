import { Html } from "@react-three/drei";
import { useMemo } from "react";
import { useSimulationStore } from "../state/simulationStore";
import type { Pool, Person } from "../types/simulation";

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

function labelConfig(pool: Pool): { text: string; color: string; bg: string } | null {
  const isSubgroup = pool.level === "subgroup";
  const subTag = pool.id.includes("-sub-2") ? "B" : "A";

  if (pool.status === "positive") {
    return {
      text: isSubgroup ? `GROUP ${subTag} — POSITIVE` : "POSITIVE",
      color: "#ff4b4b",
      bg:    "rgba(255,75,75,0.14)",
    };
  }
  if (isSubgroup && pool.status === "split") {
    return {
      text: `GROUP ${subTag}`,
      color: "#59b8ff",
      bg:    "rgba(89,184,255,0.10)",
    };
  }
  if (isSubgroup && pool.status === "testing") {
    return {
      text: `GROUP ${subTag} — TESTING`,
      color: "#ffd166",
      bg:    "rgba(255,209,102,0.10)",
    };
  }
  if (isSubgroup && pool.status === "negative") {
    return {
      text: `GROUP ${subTag} — CLEAR`,
      color: "#7effc4",
      bg:    "rgba(126,255,196,0.10)",
    };
  }
  return null;
}

export function PoolLabels() {
  const pools  = useSimulationStore((state) => state.pools);
  const people = useSimulationStore((state) => state.people);

  const labels = useMemo(() => {
    return Object.values(pools)
      .map((pool) => {
        const cfg = labelConfig(pool);
        if (!cfg) return null;
        const c = centroid(pool.personIds, people);
        if (!c) return null;
        return { id: pool.id, x: c[0], y: c[1] + 1.05, z: c[2], ...cfg };
      })
      .filter((l): l is NonNullable<typeof l> => l !== null);
  }, [pools, people]);

  if (!labels.length) return null;

  return (
    <>
      {labels.map((item) => (
        <Html
          key={item.id}
          position={[item.x, item.y, item.z]}
          center
          style={{ pointerEvents: "none" }}
          occlude={false}
        >
          <div
            style={{
              color:        item.color,
              background:   item.bg,
              border:       `1px solid ${item.color}88`,
              borderRadius: "4px",
              padding:      "3px 8px",
              fontFamily:   "monospace",
              fontSize:     "10px",
              fontWeight:   "bold",
              letterSpacing:"0.12em",
              whiteSpace:   "nowrap",
              textShadow:   `0 0 8px ${item.color}`,
              boxShadow:    `0 0 10px ${item.color}40`,
            }}
          >
            {item.text}
          </div>
        </Html>
      ))}
    </>
  );
}
