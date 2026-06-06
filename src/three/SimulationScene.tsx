import { Environment, Float, Grid, OrbitControls } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { Bloom, EffectComposer, Vignette } from "@react-three/postprocessing";
import { Suspense } from "react";
import { useSimulationStore } from "../state/simulationStore";
import { ParticleField } from "./ParticleField";
import { PersonNode } from "./PersonNode";
import { PoolRings } from "./PoolRings";

export function SimulationScene() {
  const people = useSimulationStore((state) => state.people);

  return (
    <Canvas camera={{ position: [0, 7.5, 12], fov: 48 }} dpr={[1, 1.8]}>
      <color attach="background" args={["#050c09"]} />
      <fog attach="fog" args={["#06100d", 9, 28]} />
      <ambientLight intensity={0.45} color="#b8ffdc" />
      <directionalLight position={[3, 7, 6]} intensity={1.8} color="#e8fff3" />
      <pointLight position={[-6, 4, -4]} intensity={4} color="#59b8ff" />
      <pointLight position={[6, 3, 4]} intensity={2.8} color="#d9a456" />

      <Suspense fallback={null}>
        <Float speed={0.9} rotationIntensity={0.08} floatIntensity={0.3}>
          {people.map((person) => (
            <PersonNode key={person.id} person={person} />
          ))}
          <PoolRings />
        </Float>
        <ParticleField />
        <Grid
          position={[0, -0.55, 0]}
          args={[28, 28]}
          cellSize={0.8}
          cellThickness={0.4}
          cellColor="#174836"
          sectionSize={4}
          sectionThickness={1.1}
          sectionColor="#7effc4"
          fadeDistance={20}
          fadeStrength={1.6}
          infiniteGrid
        />
        <Environment preset="city" />
      </Suspense>

      <OrbitControls enablePan={false} maxPolarAngle={Math.PI / 2.05} minDistance={5.5} maxDistance={18} />
      <EffectComposer>
        <Bloom intensity={1.05} luminanceThreshold={0.08} luminanceSmoothing={0.25} mipmapBlur />
        <Vignette eskil={false} offset={0.2} darkness={0.74} />
      </EffectComposer>
    </Canvas>
  );
}
