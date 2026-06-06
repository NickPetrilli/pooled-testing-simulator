// ── Pool grid geometry ──────────────────────────────────────────────────────
//
// Each pool owns a "column" in the grid.  Subgroups must fit inside that
// column so they never overlap with adjacent pools' subgroups.
//
// Rule: spacingX × 0.26  →  half-separation between sibling subgroup centres.
//       That leaves (spacingX - 2 × sepX) ≥ 1.3 × subgroupRingDiameter gap.
//
// Hierarchy heights (Y axis):
//   0.40  – original pools (flat plane, no Y jitter)
//   2.60  – subgroups of 4  (poolY + RISE_Y)
//   4.60  – would be individual-test level if needed (not used currently)
// ────────────────────────────────────────────────────────────────────────────

export const RISE_Y   = 2.20;   // how far subgroups rise above their parent pool
export const SUB_R    = 0.50;   // ring radius for 4-person subgroup circles

// How far each subgroup centre sits left/right of the parent pool centre.
// Scales with X spacing so subgroups always fit inside the parent column.
export function subgroupSepX(totalPools: number): number {
  const cols = Math.ceil(Math.sqrt(totalPools));
  const spacingX = Math.min(3.5, 20 / Math.max(cols, 1));
  return spacingX * 0.26;          // ensures sub-rings never touch neighbours
}

// Exact geometric centre of a pool's grid cell (no member offset).
export function poolCenter(
  poolIndex: number,
  totalPools: number,
): [number, number, number] {
  const cols = Math.ceil(Math.sqrt(totalPools));
  const rows = Math.ceil(totalPools / cols);
  const spacingX = Math.min(3.5, 20 / Math.max(cols, 1));
  const spacingZ = Math.min(4.5, 18 / Math.max(rows, 1));
  const col = poolIndex % cols;
  const row = Math.floor(poolIndex / cols);
  return [
    (col - (cols - 1) / 2) * spacingX,
    0.40,
    (row - (rows - 1) / 2) * spacingZ,
  ];
}

// Position of the i-th member of a pool ring.
export function poolTarget(
  poolIndex: number,
  memberIndex: number,
  members: number,
  totalPools: number = 64,
): [number, number, number] {
  const [cx, , cz] = poolCenter(poolIndex, totalPools);
  const cols     = Math.ceil(Math.sqrt(totalPools));
  const spacingX = Math.min(3.5, 20 / Math.max(cols, 1));
  const radius   = Math.min(0.82, spacingX * 0.22);   // pool ring radius
  const angle    = (memberIndex / Math.max(members, 1)) * Math.PI * 2;
  return [
    cx + Math.cos(angle) * radius,
    0.40,
    cz + Math.sin(angle) * radius,
  ];
}

// Scatter initial (pre-pooling) positions over the whole floor.
export function latticePosition(index: number, total: number): [number, number, number] {
  const columns = Math.ceil(Math.sqrt(total));
  const row = Math.floor(index / columns);
  const col = index % columns;
  return [
    (col - columns / 2) * 0.88,
    Math.sin(index * 1.71) * 0.16,
    (row - columns / 2) * 0.88,
  ];
}
