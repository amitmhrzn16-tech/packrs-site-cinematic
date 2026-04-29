import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Float, RoundedBox, Sparkles, Text, MeshReflectorMaterial, ContactShadows } from '@react-three/drei';
import * as THREE from 'three';
import Asset from './Asset.jsx';

// Wet-asphalt mirror ground — gives the city scenes a real "rainy KTM night" depth.
export function WetGround() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.4, 0]} receiveShadow>
      <planeGeometry args={[60, 60]} />
      <MeshReflectorMaterial
        blur={[300, 100]}
        resolution={512}
        mixBlur={1}
        mixStrength={40}
        roughness={0.85}
        depthScale={1.1}
        minDepthThreshold={0.4}
        maxDepthThreshold={1.4}
        color="#0a0d14"
        metalness={0.5}
        mirror={0.6}
      />
    </mesh>
  );
}

// Soft contact shadow under hero actors — sells the grounding without baked GI.
export function HeroContactShadow({ ...props }) {
  return (
    <ContactShadows
      position={[0, -0.39, 0]}
      opacity={0.6}
      scale={12}
      blur={2.4}
      far={3}
      resolution={1024}
      color="#000"
      {...props}
    />
  );
}

// 3D courier bike — procedural fallback. Drop /public/models/bike.glb to upgrade.
export function CourierBike({ withRider = true, ...props }) {
  return (
    <Asset url="/models/bike.glb" {...props}>
      <ProceduralBike withRider={withRider} />
    </Asset>
  );
}

function ProceduralBike({ withRider = true }) {
  return (
    <group>
      {/* wheels */}
      <mesh position={[-0.7, -0.35, 0]} rotation={[0, 0, Math.PI / 2]}>
        <torusGeometry args={[0.32, 0.08, 16, 32]} />
        <meshStandardMaterial color="#0a0a0a" roughness={0.9} />
      </mesh>
      <mesh position={[0.7, -0.35, 0]} rotation={[0, 0, Math.PI / 2]}>
        <torusGeometry args={[0.32, 0.08, 16, 32]} />
        <meshStandardMaterial color="#0a0a0a" roughness={0.9} />
      </mesh>
      {/* body */}
      <RoundedBox args={[1.4, 0.35, 0.4]} radius={0.08} position={[0, 0, 0]}>
        <meshStandardMaterial color="#FF6A1A" metalness={0.4} roughness={0.35} emissive="#3a0a0d" emissiveIntensity={0.4} />
      </RoundedBox>
      {/* seat */}
      <RoundedBox args={[0.5, 0.1, 0.32]} radius={0.04} position={[-0.25, 0.22, 0]}>
        <meshStandardMaterial color="#111" />
      </RoundedBox>
      {/* handlebar */}
      <mesh position={[0.55, 0.35, 0]}>
        <cylinderGeometry args={[0.03, 0.03, 0.6, 12]} />
        <meshStandardMaterial color="#2b2b2b" />
      </mesh>
      {/* headlight */}
      <mesh position={[0.75, 0.05, 0]}>
        <sphereGeometry args={[0.08, 16, 16]} />
        <meshStandardMaterial color="#FF6A1A" emissive="#FF6A1A" emissiveIntensity={2.2} />
      </mesh>
      {withRider && <Rider position={[-0.05, 0.55, 0]} />}
    </group>
  );
}

// Amit — the Speed Hero. Navy logistics suit with electric-orange piping.
// Drop /public/models/amit.glb (or rider.glb) to upgrade.
export function Amit({ ...props }) {
  return (
    <Asset url="/models/amit.glb" {...props}>
      <Asset url="/models/rider.glb">
        <ProceduralAmit />
      </Asset>
    </Asset>
  );
}
// Backwards-compat export
export const Rider = Amit;

function ProceduralAmit() {
  return (
    <group>
      {/* helmet — navy with orange visor strip */}
      <mesh position={[0.05, 0.45, 0]} castShadow>
        <sphereGeometry args={[0.18, 20, 20]} />
        <meshStandardMaterial color="#0A1B3D" roughness={0.35} metalness={0.3} />
      </mesh>
      <mesh position={[0.18, 0.45, 0]}>
        <sphereGeometry args={[0.182, 20, 20, 0, Math.PI * 0.55]} />
        <meshStandardMaterial color="#FF6A1A" emissive="#FF6A1A" emissiveIntensity={1.2} metalness={0.6} roughness={0.15} />
      </mesh>
      {/* torso — sleek navy logistics suit */}
      <RoundedBox args={[0.42, 0.5, 0.3]} radius={0.07} position={[0, 0.05, 0]} castShadow>
        <meshStandardMaterial color="#0A1B3D" roughness={0.5} metalness={0.25} />
      </RoundedBox>
      {/* orange chest piping — the brand stripe */}
      <mesh position={[0, 0.18, 0.16]}>
        <boxGeometry args={[0.36, 0.025, 0.005]} />
        <meshStandardMaterial color="#FF6A1A" emissive="#FF6A1A" emissiveIntensity={1.6} />
      </mesh>
      <mesh position={[0, -0.05, 0.16]}>
        <boxGeometry args={[0.28, 0.02, 0.005]} />
        <meshStandardMaterial color="#FF6A1A" emissive="#FF6A1A" emissiveIntensity={1.4} />
      </mesh>
      {/* arms */}
      <mesh position={[0.32, 0.12, 0.1]} rotation={[0, 0, -0.6]} castShadow>
        <cylinderGeometry args={[0.05, 0.05, 0.45, 16]} />
        <meshStandardMaterial color="#0A1B3D" />
      </mesh>
      <mesh position={[0.32, 0.12, -0.1]} rotation={[0, 0, -0.6]} castShadow>
        <cylinderGeometry args={[0.05, 0.05, 0.45, 16]} />
        <meshStandardMaterial color="#0A1B3D" />
      </mesh>
      {/* legs */}
      <mesh position={[-0.05, -0.3, 0.1]} castShadow>
        <cylinderGeometry args={[0.06, 0.06, 0.4, 16]} />
        <meshStandardMaterial color="#040A1A" />
      </mesh>
      <mesh position={[-0.05, -0.3, -0.1]} castShadow>
        <cylinderGeometry args={[0.06, 0.06, 0.4, 16]} />
        <meshStandardMaterial color="#040A1A" />
      </mesh>
    </group>
  );
}

// A customer at the doorstep — receives the parcel in zone 5.
// Drop /public/models/customer.glb to upgrade to a real character mesh.
export function Customer({ holdingParcel = false, ...props }) {
  return (
    <Asset url="/models/customer.glb" {...props}>
      <ProceduralCustomer holdingParcel={holdingParcel} />
    </Asset>
  );
}

function ProceduralCustomer({ holdingParcel = false }) {
  return (
    <group>
      {/* doorway frame behind */}
      <mesh position={[0, 0.3, -0.5]}>
        <boxGeometry args={[1.4, 2.1, 0.05]} />
        <meshStandardMaterial color="#1a1f2e" emissive="#0a1020" emissiveIntensity={0.2} />
      </mesh>
      <mesh position={[0, 0.3, -0.48]}>
        <planeGeometry args={[1.0, 1.9]} />
        <meshStandardMaterial color="#FF6A1A" emissive="#FF6A1A" emissiveIntensity={0.6} transparent opacity={0.18} />
      </mesh>
      {/* head */}
      <mesh position={[0, 0.95, 0]}>
        <sphereGeometry args={[0.22, 24, 24]} />
        <meshStandardMaterial color="#f6c89a" />
      </mesh>
      {/* hair */}
      <mesh position={[0, 1.06, -0.02]}>
        <sphereGeometry args={[0.23, 24, 24, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color="#2b1d12" />
      </mesh>
      {/* smile */}
      <mesh position={[0, 0.88, 0.21]} rotation={[0, 0, Math.PI]}>
        <torusGeometry args={[0.05, 0.012, 8, 16, Math.PI]} />
        <meshStandardMaterial color="#0b0f1a" />
      </mesh>
      {/* eyes */}
      <mesh position={[-0.07, 0.97, 0.2]}>
        <sphereGeometry args={[0.022, 12, 12]} />
        <meshStandardMaterial color="#0b0f1a" />
      </mesh>
      <mesh position={[0.07, 0.97, 0.2]}>
        <sphereGeometry args={[0.022, 12, 12]} />
        <meshStandardMaterial color="#0b0f1a" />
      </mesh>
      {/* torso */}
      <RoundedBox args={[0.55, 0.7, 0.3]} radius={0.08} position={[0, 0.4, 0]}>
        <meshStandardMaterial color="#3b82f6" />
      </RoundedBox>
      {/* arms — angle in front when holding parcel */}
      <mesh position={[-0.32, 0.2, 0.18]} rotation={[holdingParcel ? -0.7 : 0, 0, 0.5]}>
        <cylinderGeometry args={[0.06, 0.06, 0.55, 12]} />
        <meshStandardMaterial color="#3b82f6" />
      </mesh>
      <mesh position={[0.32, 0.2, 0.18]} rotation={[holdingParcel ? -0.7 : 0, 0, -0.5]}>
        <cylinderGeometry args={[0.06, 0.06, 0.55, 12]} />
        <meshStandardMaterial color="#3b82f6" />
      </mesh>
      {/* legs */}
      <mesh position={[-0.12, -0.25, 0]}>
        <cylinderGeometry args={[0.08, 0.08, 0.55, 12]} />
        <meshStandardMaterial color="#1e293b" />
      </mesh>
      <mesh position={[0.12, -0.25, 0]}>
        <cylinderGeometry args={[0.08, 0.08, 0.55, 12]} />
        <meshStandardMaterial color="#1e293b" />
      </mesh>
    </group>
  );
}

// Cars threading down the road in zone 2.
export function Cars({ count = 8, speed = 14 }) {
  const ref = useRef();
  const data = useMemo(
    () =>
      new Array(count).fill(0).map((_, i) => ({
        x: (i % 2 === 0 ? -1 : 1) * (0.6 + Math.random() * 0.4),
        z: -i * 2.4 - Math.random() * 1.5,
        color: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#a855f7'][i % 5],
        scale: 0.55 + Math.random() * 0.25,
      })),
    [count]
  );
  useFrame((_, delta) => {
    if (!ref.current) return;
    ref.current.children.forEach((m) => {
      m.position.z += delta * speed;
      if (m.position.z > 6) m.position.z -= count * 2.4;
    });
  });
  return (
    <group ref={ref}>
      {data.map((c, i) => (
        <group key={i} position={[c.x, -0.18, c.z]} scale={c.scale}>
          <RoundedBox args={[0.9, 0.3, 0.45]} radius={0.06} position={[0, 0.15, 0]}>
            <meshStandardMaterial color={c.color} metalness={0.5} roughness={0.3} />
          </RoundedBox>
          <RoundedBox args={[0.55, 0.22, 0.42]} radius={0.05} position={[-0.05, 0.36, 0]}>
            <meshStandardMaterial color={c.color} metalness={0.5} roughness={0.3} />
          </RoundedBox>
          {/* taillight */}
          <mesh position={[-0.46, 0.2, 0]}>
            <sphereGeometry args={[0.04, 8, 8]} />
            <meshStandardMaterial color="#ef4444" emissive="#ef4444" emissiveIntensity={1.8} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

// Confetti burst — fires when COD is received.
export function Confetti({ active }) {
  const ref = useRef();
  const pieces = useMemo(
    () =>
      new Array(60).fill(0).map(() => ({
        seed: Math.random() * 6.28,
        radius: 0.4 + Math.random() * 1.4,
        speed: 0.6 + Math.random() * 0.8,
        color: ['#FF6A1A', '#FF884D', '#3b82f6', '#10b981', '#fff'][Math.floor(Math.random() * 5)],
      })),
    []
  );
  useFrame((state) => {
    if (!ref.current) return;
    const t = state.clock.elapsedTime;
    ref.current.children.forEach((m, i) => {
      const p = pieces[i];
      const k = active ? Math.min(1, ((t * p.speed) % 3) / 2) : 0;
      const ang = p.seed + t * 0.6;
      m.position.set(Math.cos(ang) * p.radius * k, k * 1.6 - 0.2, Math.sin(ang) * p.radius * k);
      m.rotation.set(t + p.seed, t + p.seed * 2, 0);
      m.scale.setScalar(active ? 1 : 0);
    });
  });
  return (
    <group ref={ref}>
      {pieces.map((p, i) => (
        <mesh key={i}>
          <planeGeometry args={[0.06, 0.12]} />
          <meshBasicMaterial color={p.color} side={THREE.DoubleSide} />
        </mesh>
      ))}
    </group>
  );
}

// 3D parcel with tape stripe. Drop /public/models/parcel.glb to upgrade.
export function Parcel({ scale = 1, ...props }) {
  return (
    <Asset url="/models/parcel.glb" scale={scale} {...props}>
      <group scale={scale}>
        <RoundedBox args={[0.5, 0.4, 0.5]} radius={0.04} castShadow receiveShadow>
          <meshStandardMaterial color="#d2a86a" roughness={0.85} envMapIntensity={0.7} />
        </RoundedBox>
        <mesh position={[0, 0.205, 0]} castShadow>
          <boxGeometry args={[0.52, 0.012, 0.12]} />
          <meshStandardMaterial color="#FF6A1A" />
        </mesh>
        <mesh position={[0, 0.205, 0]} rotation={[0, Math.PI / 2, 0]} castShadow>
          <boxGeometry args={[0.52, 0.012, 0.12]} />
          <meshStandardMaterial color="#FF6A1A" />
        </mesh>
      </group>
    </Asset>
  );
}

// Smiling face — receiver of happiness.
export function Smily({ ...props }) {
  return (
    <Float speed={2} floatIntensity={0.5} rotationIntensity={0.2}>
      <group {...props}>
        <mesh>
          <sphereGeometry args={[0.6, 32, 32]} />
          <meshStandardMaterial color="#FF6A1A" emissive="#FF6A1A" emissiveIntensity={0.35} />
        </mesh>
        <mesh position={[-0.2, 0.15, 0.5]}>
          <sphereGeometry args={[0.06, 16, 16]} />
          <meshStandardMaterial color="#0B0F1A" />
        </mesh>
        <mesh position={[0.2, 0.15, 0.5]}>
          <sphereGeometry args={[0.06, 16, 16]} />
          <meshStandardMaterial color="#0B0F1A" />
        </mesh>
        <mesh position={[0, -0.1, 0.5]} rotation={[0, 0, Math.PI]}>
          <torusGeometry args={[0.18, 0.035, 12, 24, Math.PI]} />
          <meshStandardMaterial color="#0B0F1A" />
        </mesh>
      </group>
    </Float>
  );
}

// Stylized Nepal map — extruded simplified outline. Not cartographically perfect; visually evocative.
export function NepalMap({ highlight = null, districts = [], onPing }) {
  const shape = useMemo(() => {
    const s = new THREE.Shape();
    // Simplified hand-drawn outline (lng, lat-ish space normalized)
    const pts = [
      [80.0, 28.7], [81.0, 29.7], [82.5, 30.4], [83.5, 30.2], [85.0, 30.3],
      [86.5, 29.6], [88.0, 28.7], [88.2, 27.8], [87.0, 27.0], [85.5, 26.5],
      [84.0, 26.6], [82.5, 27.0], [81.0, 27.2], [80.0, 28.7],
    ];
    pts.forEach(([x, y], i) => {
      const X = (x - 84) * 1.2;     // center on ~84 lng
      const Y = (y - 28) * 1.6;     // center on ~28 lat
      i === 0 ? s.moveTo(X, Y) : s.lineTo(X, Y);
    });
    return s;
  }, []);

  return (
    <group rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.05, 0]}>
      <mesh>
        <extrudeGeometry args={[shape, { depth: 0.08, bevelEnabled: true, bevelSize: 0.02, bevelThickness: 0.02, bevelSegments: 2 }]} />
        <meshStandardMaterial color="#162033" emissive="#0a1830" emissiveIntensity={0.4} metalness={0.2} roughness={0.6} />
      </mesh>
      {/* district pins */}
      {districts.map((d) => {
        const x = (d.lng - 84) * 1.2;
        const y = (d.lat - 28) * 1.6;
        const isHi = highlight && highlight.name === d.name;
        return <DistrictPin key={d.name} position={[x, y, 0.12]} label={d.name} highlighted={isHi} onPing={onPing} />;
      })}
    </group>
  );
}

function DistrictPin({ position, label, highlighted, onPing }) {
  const ref = useRef();
  const ringRef = useRef();
  useFrame((state) => {
    if (!ref.current) return;
    const t = state.clock.elapsedTime;
    ref.current.scale.setScalar(highlighted ? 1.6 + Math.sin(t * 4) * 0.15 : 1);
    if (ringRef.current) {
      const k = (t % 1.6) / 1.6;
      ringRef.current.scale.setScalar(0.2 + k * 1.6);
      ringRef.current.material.opacity = (1 - k) * (highlighted ? 0.9 : 0.35);
    }
  });
  return (
    <group position={position}>
      <mesh ref={ref}>
        <sphereGeometry args={[0.05, 12, 12]} />
        <meshStandardMaterial
          color={highlighted ? '#FF6A1A' : '#FF884D'}
          emissive={highlighted ? '#FF6A1A' : '#FF884D'}
          emissiveIntensity={highlighted ? 2.5 : 1.1}
        />
      </mesh>
      <mesh ref={ringRef} rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.06, 0.075, 32]} />
        <meshBasicMaterial color={highlighted ? '#FF6A1A' : '#FF884D'} transparent opacity={0.6} />
      </mesh>
      {highlighted && (
        <Text position={[0, 0.18, 0]} fontSize={0.08} color="#FF6A1A" anchorX="center" anchorY="middle">
          {label}
        </Text>
      )}
    </group>
  );
}

// Scrolling city — buildings stream past the camera so the parcel feels like
// it's threading between blocks of Kathmandu. Each building has neon window
// strips. Recycles z-positions to keep the skyline endless.
export function CityBuildings({ count = 24, speed = 14 }) {
  const ref = useRef();
  const data = useMemo(() => {
    return new Array(count).fill(0).map((_, i) => {
      const side = i % 2 === 0 ? -1 : 1;
      return {
        x: side * (1.6 + Math.random() * 1.4),
        y: 0.5 + Math.random() * 0.6,
        z: -i * 1.6 - Math.random() * 1.5,
        w: 0.7 + Math.random() * 0.7,
        h: 1.2 + Math.random() * 2.6,
        d: 0.6 + Math.random() * 0.6,
        hue: Math.random() < 0.5 ? '#1a2238' : '#221a32',
        glow: Math.random() < 0.5 ? '#FF6A1A' : '#FF884D',
      };
    });
  }, [count]);

  useFrame((_, delta) => {
    if (!ref.current) return;
    ref.current.children.forEach((m, i) => {
      m.position.z += delta * speed;
      if (m.position.z > 6) {
        const dz = -count * 1.6;
        m.position.z = dz - Math.random() * 1.2;
      }
    });
  });

  return (
    <group ref={ref}>
      {data.map((b, i) => (
        <group key={i} position={[b.x, b.y, b.z]}>
          {/* core */}
          <mesh position={[0, b.h / 2 - 0.5, 0]}>
            <boxGeometry args={[b.w, b.h, b.d]} />
            <meshStandardMaterial color={b.hue} roughness={0.85} />
          </mesh>
          {/* glowing window strip */}
          <mesh position={[0, b.h / 2 - 0.5, b.d / 2 + 0.001]}>
            <planeGeometry args={[b.w * 0.7, b.h * 0.85]} />
            <meshBasicMaterial color={b.glow} transparent opacity={0.18} />
          </mesh>
          {/* roof tip */}
          <mesh position={[0, b.h - 0.5, 0]}>
            <boxGeometry args={[b.w * 0.4, 0.05, b.d * 0.4]} />
            <meshStandardMaterial color={b.glow} emissive={b.glow} emissiveIntensity={0.8} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

// Dashed center-line road that scrolls past — sells the motion in zone 2.
export function Road({ speed = 14 }) {
  const ref = useRef();
  const dashes = useMemo(() => new Array(20).fill(0).map((_, i) => -i * 1.4), []);
  useFrame((_, delta) => {
    if (!ref.current) return;
    ref.current.children.forEach((m) => {
      m.position.z += delta * speed;
      if (m.position.z > 6) m.position.z -= dashes.length * 1.4;
    });
  });
  return (
    <>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.39, -5]}>
        <planeGeometry args={[2.4, 60]} />
        <meshStandardMaterial color="#0c1018" roughness={1} />
      </mesh>
      <group ref={ref}>
        {dashes.map((z, i) => (
          <mesh key={i} position={[0, -0.385, z]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[0.08, 0.6]} />
            <meshBasicMaterial color="#FF6A1A" />
          </mesh>
        ))}
      </group>
    </>
  );
}

// Streaks of light — used for valley rush motion blur feel.
export function ValleyStreaks({ count = 80 }) {
  const ref = useRef();
  const positions = useMemo(() => {
    const a = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      a[i * 3] = (Math.random() - 0.5) * 30;
      a[i * 3 + 1] = (Math.random() - 0.5) * 6;
      a[i * 3 + 2] = (Math.random() - 0.5) * 30;
    }
    return a;
  }, [count]);
  useFrame((_, delta) => {
    if (!ref.current) return;
    const arr = ref.current.geometry.attributes.position.array;
    for (let i = 0; i < count; i++) {
      arr[i * 3 + 2] += delta * 18;
      if (arr[i * 3 + 2] > 15) arr[i * 3 + 2] = -15;
    }
    ref.current.geometry.attributes.position.needsUpdate = true;
  });
  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={count} array={positions} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial size={0.08} color="#FF6A1A" transparent opacity={0.85} />
    </points>
  );
}

// 3D hearts + gold coins explode out of the parcel on COD success.
export function HeartsAndCoins({ active }) {
  const group = useRef();
  const items = useMemo(
    () =>
      new Array(28).fill(0).map((_, i) => ({
        kind: i % 2 === 0 ? 'heart' : 'coin',
        seed: Math.random() * Math.PI * 2,
        radius: 0.6 + Math.random() * 1.4,
        speed: 0.5 + Math.random() * 0.7,
        delay: (i * 0.04) % 1.6,
        spin: Math.random() * 4,
      })),
    []
  );
  useFrame((state) => {
    if (!group.current) return;
    const t = state.clock.elapsedTime;
    group.current.children.forEach((m, i) => {
      const it = items[i];
      const k = active ? Math.min(1, Math.max(0, ((t * it.speed) % 3) - it.delay) / 1.8) : 0;
      const ang = it.seed + t * 0.5;
      m.position.set(
        Math.cos(ang) * it.radius * k,
        k * 1.8 - 0.1 + Math.sin(t * 2 + it.seed) * 0.05,
        Math.sin(ang) * it.radius * k
      );
      m.rotation.set(t * it.spin + it.seed, t * 1.2, 0);
      m.scale.setScalar(active ? 0.6 + Math.sin(k * Math.PI) * 0.4 : 0);
    });
  });
  return (
    <group ref={group}>
      {items.map((it, i) =>
        it.kind === 'heart' ? <Heart key={i} /> : <Coin key={i} />
      )}
    </group>
  );
}

function Heart() {
  // Built from two spheres + a cone-ish tip — readable as a heart at small sizes.
  return (
    <group>
      <mesh position={[-0.08, 0.05, 0]}>
        <sphereGeometry args={[0.1, 14, 14]} />
        <meshStandardMaterial color="#FF6A1A" emissive="#FF6A1A" emissiveIntensity={1.6} />
      </mesh>
      <mesh position={[0.08, 0.05, 0]}>
        <sphereGeometry args={[0.1, 14, 14]} />
        <meshStandardMaterial color="#FF6A1A" emissive="#FF6A1A" emissiveIntensity={1.6} />
      </mesh>
      <mesh position={[0, -0.07, 0]} rotation={[0, 0, Math.PI / 4]}>
        <boxGeometry args={[0.16, 0.16, 0.16]} />
        <meshStandardMaterial color="#FF6A1A" emissive="#FF6A1A" emissiveIntensity={1.4} />
      </mesh>
    </group>
  );
}

function Coin() {
  return (
    <mesh rotation={[Math.PI / 2, 0, 0]}>
      <cylinderGeometry args={[0.11, 0.11, 0.018, 24]} />
      <meshStandardMaterial color="#F4C300" emissive="#8a5a00" emissiveIntensity={0.6} metalness={0.95} roughness={0.18} />
    </mesh>
  );
}

// Backwards-compat alias used elsewhere.
export const CashSwarm = HeartsAndCoins;

// A simple "phone" target the cash flies into.
export function Phone({ ...props }) {
  return (
    <group {...props}>
      <RoundedBox args={[0.7, 1.4, 0.08]} radius={0.06}>
        <meshStandardMaterial color="#10131c" metalness={0.6} roughness={0.3} />
      </RoundedBox>
      <mesh position={[0, 0, 0.045]}>
        <planeGeometry args={[0.6, 1.25]} />
        <meshStandardMaterial color="#0F4C2D" emissive="#0F4C2D" emissiveIntensity={1.2} />
      </mesh>
      <Text position={[0, 0.4, 0.05]} fontSize={0.09} color="#FF6A1A" anchorX="center" anchorY="middle">
        COD
      </Text>
      <Text position={[0, 0.25, 0.05]} fontSize={0.06} color="#ffffff" anchorX="center" anchorY="middle">
        Received
      </Text>
    </group>
  );
}

export function AmbientSparkles() {
  return <Sparkles count={60} scale={[20, 8, 20]} size={2} speed={0.3} color="#FF6A1A" />;
}
