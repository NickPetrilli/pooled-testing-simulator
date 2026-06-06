import { Points, PointMaterial } from "@react-three/drei";
import { useMemo } from "react";

export function ParticleField() {
  const particles = useMemo(() => {
    const positions = new Float32Array(900 * 3);
    for (let i = 0; i < 900; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 28;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 10;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 28;
    }
    return positions;
  }, []);

  return (
    <Points positions={particles} stride={3} frustumCulled>
      <PointMaterial transparent color="#7effc4" size={0.018} sizeAttenuation depthWrite={false} opacity={0.42} />
    </Points>
  );
}
