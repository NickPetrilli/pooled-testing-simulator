import { Environment, Float, Grid, OrbitControls } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { Bloom, EffectComposer, Vignette } from "@react-three/postprocessing";
import { Suspense } from "react";
import { InstancedPersons } from "./InstancedPersons";
import { ParticleField } from "./ParticleField";
import { PoolConnectors } from "./PoolConnectors";
import { PoolLabels } from "./PoolLabels";
import { PoolRings } from "./PoolRings";

export function SimulationScene() {
  return (
    <Canvas
      camera={{ position: [0, 10, 16], fov: 52 }}
      dpr={[1, 1.5]}
    >
      <color attach="background" args={["#050c09"]} />
      <fog attach="fog" args={["#06100d", 14, 36]} />
      <ambientLight intensity={0.55} color="#b8ffdc" />
      <directionalLight position={[3, 7, 6]} intensity={2.0} color="#e8fff3" />
      <pointLight position={[-6, 4, -4]} intensity={3.5} color="#59b8ff" />
      <pointLight position={[6, 3, 4]} intensity={2.2} color="#d9a456" />

      <Suspense fallback={null}>
        {/*
          Float gives a gentle idle bob. rotationIntensity is kept very low
          so the grid hierarchy (pools → subgroups rising on the Y axis) reads
          clearly — a strong rotation would tilt the tree and confuse the layout.
        */}
        <Float speed={0.9} rotationIntensity={0.02} floatIntensity={0.2}>
          <InstancedPersons />
          <PoolRings />
          <PoolLabels />
          <PoolConnectors />
        </Float>
        <ParticleField />
        <Grid
          position={[0, -0.55, 0]}
          args={[36, 36]}
          cellSize={0.8}
          cellThickness={0.4}
          cellColor="#174836"
          sectionSize={4}
          sectionThickness={1.1}
          sectionColor="#7effc4"
          fadeDistance={26}
          fadeStrength={1.6}
          infiniteGrid
        />
        <Environment preset="city" />
      </Suspense>

      <OrbitControls
        enablePan={false}
        maxPolarAngle={Math.PI / 2.05}
        minDistance={4}
        maxDistance={30}
      />
      <EffectComposer>
        <Bloom intensity={1.2} luminanceThreshold={0.06} luminanceSmoothing={0.25} mipmapBlur />
        <Vignette eskil={false} offset={0.2} darkness={0.74} />
      </EffectComposer>
    </Canvas>
  );
}
