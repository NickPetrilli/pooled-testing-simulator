export function latticePosition(index: number, total: number): [number, number, number] {
  const columns = Math.ceil(Math.sqrt(total));
  const row = Math.floor(index / columns);
  const col = index % columns;
  const x = (col - columns / 2) * 0.88;
  const z = (row - columns / 2) * 0.88;
  const y = Math.sin(index * 1.71) * 0.16;
  return [x, y, z];
}

export function poolTarget(poolIndex: number, memberIndex: number, members: number): [number, number, number] {
  const ring = poolIndex % 7;
  const band = Math.floor(poolIndex / 7);
  const centerX = (ring - 3) * 2.25;
  const centerZ = (band - 2) * 2.1;
  const angle = (memberIndex / Math.max(members, 1)) * Math.PI * 2;
  const radius = members > 4 ? 0.82 : 0.52;
  return [centerX + Math.cos(angle) * radius, 0.4 + Math.sin(poolIndex) * 0.08, centerZ + Math.sin(angle) * radius];
}

export function quarantineTarget(index: number): [number, number, number] {
  const angle = index * 1.618;
  const radius = 6.8 + (index % 5) * 0.18;
  return [Math.cos(angle) * radius, 1.2 + (index % 3) * 0.22, Math.sin(angle) * radius];
}
