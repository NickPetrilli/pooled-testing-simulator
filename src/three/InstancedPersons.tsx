import { useRef, useEffect, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useSimulationStore } from "../state/simulationStore";
import { statusColors } from "./statusColors";

const MAX_INSTANCES = 4096;

// Scratch objects — allocated once to avoid GC pressure each frame
const _m4    = new THREE.Matrix4();
const _pos   = new THREE.Vector3();
const _scl   = new THREE.Vector3();
const _quat  = new THREE.Quaternion(); // stays identity
const _color = new THREE.Color();

// Instance color brightness — HDR values (>1) feed the emissive/bloom pipeline.
// The sphere SURFACE appears colored because the emissive dominates; the diffuse
// contribution from the strong scene lights is secondary.  Untested stays dark
// so active groups always pop against the background crowd.
const BRIGHTNESS: Record<string, number> = {
  untested:             0.10,   // near-invisible background crowd
  pooling:              1.70,   // soft blue  — "organised into a pool"
  testing:              2.60,   // golden     — "test in progress"
  negative:             2.20,   // vivid green — "safe / cleared"
  "positive-subgroup":  2.80,   // bright red  — "pool positive, awaiting individual test"
  "confirmed-infected": 3.80,   // intense red — "confirmed case"
};

// Emissive multiplier — keeps the vColor HDR contribution going into the bloom
// compositor without blowing out the sphere centers completely white.
const EMISSIVE_BOOST = 1.10;

export function InstancedPersons() {
  const meshRef  = useRef<THREE.InstancedMesh>(null);
  // Lerped positions live outside React state — zero allocations per frame
  const curPos   = useRef(new Float32Array(MAX_INSTANCES * 3));
  const prevLen  = useRef(0);

  const people = useSimulationStore((state) => state.people);

  // Purely-emissive material: black diffuse base so scene lights (ambient, directional,
  // point lights, IBL) contribute zero to the sphere surface.  All visible color comes
  // from the emissive term injected via onBeforeCompile, which reads vColor —
  // the per-instance color set each frame by setColorAt.  This makes the BRIGHTNESS
  // table act directly as emissive radiance: HDR values (>1) feed bloom with no
  // PBR-diffuse washout.  roughness=1 & metalness=0 suppress all specular highlights.
  const material = useMemo(() => {
    const boost = EMISSIVE_BOOST.toFixed(2);
    const mat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(0, 0, 0),
      roughness: 1.0,
      metalness: 0.0,
    });
    // vColor arrives from USE_INSTANCING_COLOR (activated when instanceColor is set).
    // vertexColors is NOT set, so USE_COLOR is absent and the diffuse pipeline is clean.
    mat.onBeforeCompile = (shader) => {
      shader.fragmentShader = shader.fragmentShader.replace(
        "#include <emissivemap_fragment>",
        `#include <emissivemap_fragment>
         totalEmissiveRadiance = vColor * ${boost};`,
      );
    };
    return mat;
  }, []);

  // Simple sphere — no color attribute needed, instance color flows via setColorAt
  const geometry = useMemo(() => new THREE.SphereGeometry(0.12, 10, 8), []);

  // Reset lerp positions when population resets or initialises
  useEffect(() => {
    if (people.length !== prevLen.current) {
      const cp = curPos.current;
      people.forEach((p, i) => {
        cp[i * 3]     = p.position[0];
        cp[i * 3 + 1] = p.position[1];
        cp[i * 3 + 2] = p.position[2];
      });
      prevLen.current = people.length;
    }
  }, [people.length]);

  useFrame((state, delta) => {
    const mesh = meshRef.current;
    if (!mesh || people.length === 0) return;

    const n  = people.length;
    mesh.count = n;

    const t  = state.clock.elapsedTime;
    const lf = 1 - Math.pow(0.04, delta);
    const cp = curPos.current;

    for (let i = 0; i < n; i++) {
      const p  = people[i];
      const bi = i * 3;
      const tx = p.target[0], ty = p.target[1], tz = p.target[2];

      // Lerp toward target
      cp[bi]     += (tx - cp[bi])     * lf;
      cp[bi + 1] += (ty - cp[bi + 1]) * lf;
      cp[bi + 2] += (tz - cp[bi + 2]) * lf;

      // Pulse scale per status — untested people are smaller so active groups stand out
      const s = p.status;
      let freq = 2, amp = 0.04, base = 1.0;
      if      (s === "confirmed-infected")  { freq = 2.5; amp = 0.18; base = 1.55; }
      else if (s === "positive-subgroup")   { freq = 9.0; amp = 0.12; base = 1.25; }
      else if (s === "testing")             { freq = 6.0; amp = 0.08; base = 1.20; }
      else if (s === "negative")            { freq = 2.5; amp = 0.05; base = 1.15; }
      else if (s === "pooling")             { freq = 3.5; amp = 0.05; base = 1.10; }
      else                                  { base = 0.80; amp = 0; }  // untested: smaller, no pulse
      const pulse = 1 + Math.sin(t * freq + p.id) * amp;

      _m4.compose(
        _pos.set(cp[bi], cp[bi + 1], cp[bi + 2]),
        _quat,
        _scl.setScalar(pulse * base),
      );
      mesh.setMatrixAt(i, _m4);

      // Brightness encodes status importance; bloom amplifies bright instances
      const bright = BRIGHTNESS[s] ?? 0.3;
      _color.set(statusColors[s] ?? "#4a5c54").multiplyScalar(bright);
      mesh.setColorAt(i, _color);
    }

    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  });

  if (people.length === 0) return null;

  return (
    <instancedMesh
      ref={meshRef}
      args={[geometry, material, MAX_INSTANCES]}
      frustumCulled={false}
    />
  );
}
