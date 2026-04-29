import { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import {
  AdaptiveDpr,
  AdaptiveEvents,
  Environment,
  Stars,
  PerformanceMonitor,
} from '@react-three/drei';
import { EffectComposer, Bloom, DepthOfField, Vignette, ChromaticAberration, Noise } from '@react-three/postprocessing';
import { BlendFunction } from 'postprocessing';
import * as THREE from 'three';
import {
  CourierBike,
  Parcel,
  Smily,
  NepalMap,
  ValleyStreaks,
  CashSwarm,
  Phone,
  AmbientSparkles,
  CityBuildings,
  Road,
  Cars,
  Customer,
  Confetti,
  WetGround,
  HeroContactShadow,
} from './objects.jsx';
import { useStore } from '../lib/store.js';
import { ping, phonePing, cashRustle } from '../components/SoundManager.js';

// Map global scroll [0..1] to a per-zone local progress [0..1] over [start, end].
const range = (s, start, end) => Math.min(1, Math.max(0, (s - start) / (end - start)));

function Director({ districts }) {
  // Scroll progress is now driven by GSAP ScrollTrigger (see ScrollTriggerController).
  // We just read the store inside useFrame each tick — no useScroll() needed.
  const { camera } = useThree();
  const ghost = useStore((s) => s.ghostDistrict);
  const cashFlying = useStore((s) => s.cashFlying);

  const bikeRef = useRef();
  const parcelRef = useRef();        // pickup parcel that rides on the bike
  const handoverParcelRef = useRef();// parcel that flies to customer hands
  const mapRef = useRef();
  const smilyRef = useRef();
  const phoneRef = useRef();
  const customerRef = useRef();
  const cityRef = useRef();
  const carsRef = useRef();
  const roadRef = useRef();
  const valleyRef = useRef();
  const flyingParcels = useRef([]);
  const [pinged, setPinged] = useState(new Set());
  const fireFlags = useRef({ handover: false, cod: false });
  const setCashFlying = useStore((s) => s.fireCash);
  const resetCash = useStore((s) => s.resetCash);

  // Pre-pick destinations for the parcel swarm (zone 3).
  const swarm = useMemo(
    () =>
      new Array(40).fill(0).map((_, i) => {
        const d = districts[i % districts.length];
        return {
          x: (d.lng - 84) * 1.2,
          y: (d.lat - 28) * 1.6,
          delay: i * 0.025,
          name: d.name,
        };
      }),
    [districts]
  );

  useFrame((state) => {
    const s = useStore.getState().scroll; // 0..1, written by ScrollTriggerController

    // ─────── Zone 1 [0 → 0.20]  Hadigaun start
    const z1 = range(s, 0, 0.2);
    if (bikeRef.current) {
      bikeRef.current.position.set(-1.5 + z1 * 1.2, 0, 0);
      bikeRef.current.rotation.z = -z1 * 0.05;
    }
    if (parcelRef.current) {
      // Pick up: lifts from ground onto seat.
      parcelRef.current.position.set(-2.4 + z1 * 1.7, -0.2 + z1 * 0.65, 0);
      parcelRef.current.rotation.y = z1 * Math.PI;
    }

    // ─────── Zone 2 [0.20 → 0.40]  Valley rush — Higgsfield clip is the city now.
    // We keep the bike bobbing slightly so the hero feels alive over the footage.
    const z2 = range(s, 0.2, 0.4);
    if (valleyRef.current) valleyRef.current.visible = false;  // procedural streaks off
    if (cityRef.current)   cityRef.current.visible = false;    // procedural buildings off
    if (carsRef.current)   carsRef.current.visible = false;    // procedural cars off
    if (roadRef.current)   roadRef.current.visible = false;    // procedural road off
    if (bikeRef.current && z2 > 0) {
      bikeRef.current.position.y = Math.sin(state.clock.elapsedTime * 18) * 0.02;
      bikeRef.current.position.x += Math.sin(state.clock.elapsedTime * 24) * 0.0015;
    }
    if (parcelRef.current && z2 > 0) {
      parcelRef.current.position.set(-0.3, 0.45 + (bikeRef.current?.position.y ?? 0), 0);
    }

    // ─────── Zone 3 [0.40 → 0.62]  Coverage swarm
    const z3 = range(s, 0.4, 0.62);
    if (mapRef.current) {
      mapRef.current.visible = z3 > 0.001 || range(s, 0.62, 0.78) > 0.001;
      mapRef.current.position.y = -0.5 + z3 * 0.5;
      mapRef.current.scale.setScalar(0.6 + z3 * 0.6);
    }
    flyingParcels.current.forEach((m, i) => {
      if (!m) return;
      const it = swarm[i];
      const k = Math.min(1, Math.max(0, z3 * 1.2 - it.delay));
      // Start at HQ origin, arc to district pin on map plane.
      const sx = 0, sy = 0.5, sz = 0;
      const ex = it.x, ey = 0.18, ez = -it.y; // map is rotated -PI/2 around X, so flipped Y -> Z
      const arc = Math.sin(k * Math.PI) * 1.2;
      m.position.set(
        THREE.MathUtils.lerp(sx, ex, k),
        THREE.MathUtils.lerp(sy, ey, k) + arc,
        THREE.MathUtils.lerp(sz, ez, k)
      );
      m.rotation.set(k * 6, k * 4, 0);
      m.scale.setScalar(k > 0 && k < 1 ? 0.7 : 0);
      // Trigger ping when first arriving.
      if (k >= 0.99 && !pinged.has(i)) {
        pinged.add(i);
        if (i % 6 === 0) ping(660 + (i % 5) * 40);
        setPinged(new Set(pinged));
      }
    });

    // ─────── Zone 4 [0.62 → 0.78]  Predictive tracking — camera dives toward map
    const z4 = range(s, 0.62, 0.78);
    if (z4 > 0 && ghost) {
      const tx = ghost.lng ? (ghost.lng - 84) * 1.2 : 0;
      const tz = ghost.lat ? -(ghost.lat - 28) * 1.6 : 0;
      camera.position.lerp(new THREE.Vector3(tx, 1.6 - z4 * 0.8, tz + 1.4), 0.04);
      camera.lookAt(tx, 0, tz);
    } else {
      // default scripted camera path (zones 1-3, 5)
      const targetY = 0.6 + Math.sin(s * Math.PI) * 0.4;
      const targetZ = 4.5 - s * 1.2;
      camera.position.lerp(new THREE.Vector3(s * 0.2, targetY, targetZ), 0.05);
      camera.lookAt(0, 0.2, 0);
    }

    // ─────── Zone 5 [0.78 → 1.00]  Happy handover
    const z5 = range(s, 0.78, 1.0);
    if (customerRef.current) {
      customerRef.current.visible = z5 > 0.001;
      customerRef.current.position.set(1.6, -0.1, 0);
    }
    if (smilyRef.current) {
      smilyRef.current.visible = false; // replaced by Customer in zone 5
    }
    // Parcel flies from bike (left) to customer's hands (right) over [0..0.5]
    if (handoverParcelRef.current) {
      const k = Math.min(1, z5 * 2.0); // peaks at z5=0.5
      handoverParcelRef.current.visible = z5 > 0.001 && z5 < 0.95;
      const sx = -0.3, sy = 0.5, sz = 0;
      const ex = 1.6,  ey = 0.55, ez = 0.18; // customer's hands
      const arc = Math.sin(k * Math.PI) * 0.6;
      handoverParcelRef.current.position.set(
        THREE.MathUtils.lerp(sx, ex, k),
        THREE.MathUtils.lerp(sy, ey, k) + arc,
        THREE.MathUtils.lerp(sz, ez, k)
      );
      handoverParcelRef.current.rotation.y = k * Math.PI * 1.5;
      // Fire-once: handover thump when parcel lands in customer's hands
      if (k >= 0.98 && !fireFlags.current.handover) {
        fireFlags.current.handover = true;
        ping(540);
      }
    }
    // Phone slides in once the handover is done
    if (phoneRef.current) {
      const pk = Math.max(0, Math.min(1, (z5 - 0.5) * 2.5));
      phoneRef.current.visible = pk > 0.001;
      phoneRef.current.position.set(2.6 - pk * 0.5, 0.4 + pk * 0.05, 0.4);
      phoneRef.current.rotation.y = -0.25;
      phoneRef.current.scale.setScalar(0.7 + pk * 0.5);
      // Fire-once: COD received — phone pings, cash + confetti fire
      if (pk >= 0.98 && !fireFlags.current.cod) {
        fireFlags.current.cod = true;
        phonePing();
        cashRustle();
        setCashFlying();
      }
    }
    // Reset fire-once flags if user scrolls back out of zone 5
    if (z5 < 0.05 && (fireFlags.current.handover || fireFlags.current.cod)) {
      fireFlags.current.handover = false;
      fireFlags.current.cod = false;
      resetCash();
    }
  });

  return (
    <>
      {/* Zone 1 + 2 actors */}
      <group ref={bikeRef}>
        <CourierBike />
      </group>
      <group ref={parcelRef}>
        <Parcel />
      </group>

      {/* Zone 2 streaks */}
      <group ref={valleyRef} visible={false}>
        <ValleyStreaks count={120} />
      </group>
      {/* Zone 2 city — buildings, cars, dashed road scrolling toward camera */}
      <group ref={cityRef} visible={false}>
        <CityBuildings count={28} speed={16} />
      </group>
      <group ref={roadRef} visible={false}>
        <Road speed={16} />
      </group>
      <group ref={carsRef} visible={false}>
        <Cars count={10} speed={16} />
      </group>

      {/* Zone 3 + 4 map */}
      <group ref={mapRef} visible={false}>
        <NepalMap districts={districts} highlight={ghost} />
        {/* parcels flying onto the map */}
        {swarm.map((_, i) => (
          <group key={i} ref={(el) => (flyingParcels.current[i] = el)} scale={0}>
            <Parcel scale={0.4} />
          </group>
        ))}
      </group>

      {/* Zone 5 actors */}
      <group ref={smilyRef} visible={false}>
        <Smily />
      </group>
      <group ref={customerRef} visible={false}>
        <Customer holdingParcel />
      </group>
      {/* parcel that flies from bike → customer's hands */}
      <group ref={handoverParcelRef} visible={false}>
        <Parcel scale={0.7} />
      </group>
      <group ref={phoneRef} visible={false}>
        <Phone />
        <CashSwarm active={cashFlying} />
        <Confetti active={cashFlying} />
      </group>
    </>
  );
}

export default function Scene({ districts }) {
  const [perfOk, setPerfOk] = useState(true);
  return (
    <Canvas
      shadows
      dpr={[1, 1.8]}
      gl={{ antialias: true, alpha: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.05 }}
      camera={{ position: [0, 1.2, 4.5], fov: 50 }}
    >
      <PerformanceMonitor onDecline={() => setPerfOk(false)} />
      <AdaptiveDpr pixelated />
      <AdaptiveEvents />

      {/* No opaque scene background — lets the WebM backplate show through.
          HDRI (below) still drives image-based lighting, but doesn't paint the sky. */}
      <fog attach="fog" args={['#06112A', 10, 30]} />

      {/* cinematic three-point lighting + warm sun for that golden-hour KTM look */}
      <ambientLight intensity={0.25} />
      <directionalLight
        position={[6, 8, 4]}
        intensity={2.4}
        color="#ffd9a8"
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-far={30}
        shadow-camera-left={-10}
        shadow-camera-right={10}
        shadow-camera-top={10}
        shadow-camera-bottom={-10}
        shadow-bias={-0.0005}
      />
      <pointLight position={[-3, 2, -2]} intensity={0.7} color="#E63946" />
      <pointLight position={[3, 1.4, 2]} intensity={0.5} color="#3b82f6" />

      <Suspense fallback={null}>
        {/* sunset HDRI for image-based lighting only — no `background` prop so
            the canvas stays transparent and the WebM behind shows through. */}
        <Environment preset="sunset" />
        {/* Stars + WetGround removed — the Higgsfield video is now the backplate.
            We keep the floating sparkles (very subtle) and a tight contact shadow
            so the hero actors still feel grounded. */}
        <AmbientSparkles />
        <HeroContactShadow />

        <Director districts={districts} />
      </Suspense>

      {perfOk && (
        <EffectComposer disableNormalPass multisampling={0}>
          <DepthOfField focusDistance={0.018} focalLength={0.045} bokehScale={2.6} />
          <Bloom intensity={0.85} luminanceThreshold={0.55} luminanceSmoothing={0.25} mipmapBlur />
          <ChromaticAberration offset={[0.0006, 0.0006]} blendFunction={BlendFunction.NORMAL} />
          <Vignette eskil={false} offset={0.18} darkness={0.85} />
          <Noise opacity={0.04} premultiply blendFunction={BlendFunction.SCREEN} />
        </EffectComposer>
      )}
    </Canvas>
  );
}
