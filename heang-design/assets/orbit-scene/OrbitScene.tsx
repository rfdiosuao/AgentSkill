import { useTexture } from "@react-three/drei";
import { Canvas, useFrame, useThree, type ThreeElements, type ThreeEvent } from "@react-three/fiber";
import { useReducedMotion } from "motion/react";
import { Suspense, useEffect, useMemo, useRef, useState, type ReactNode, type Ref } from "react";
import * as THREE from "three";
import { cssVar, useMode, useThemeKey } from "./heang-3d";

/** One body in the system: a site or a project. */
export type OrbitBody = {
  name: string;
  code: string;
  href: string;
  color: string;
  kind?: "sphere" | "ring" | "gem" | "sat";
  /** major bodies sit on the inner orbits, larger, with an always-on label; minor ones label on hover */
  tier?: "major" | "minor";
  /** keep the name label on screen; default: majors yes, minors only on hover */
  pinLabel?: boolean;
};

type PlanetDef = OrbitBody & { r: number; size: number; speed: number; phase: number; kind: NonNullable<OrbitBody["kind"]>; tier: "major" | "minor" };

export const DEFAULT_BODIES: OrbitBody[] = [
  { name: "唤名", code: "HA-06", href: "https://summon.entermodetwo.com/", color: "#b9ed08", kind: "sat" },
  { name: "MODE II", code: "HA-01", href: "https://entermodetwo.com/", color: "#ff93b4", kind: "ring" },
  { name: "星匣", code: "HA-04", href: "https://xingxia.heang.top/", color: "#9c8cff", kind: "gem" },
  { name: "LOOM", code: "HA-02", href: "https://loom.heang.top/", color: "#3fd9a6" },
];


const MAJOR_ORBITS = [2.4, 3.2, 4.0];
const MINOR_ORBITS = [5.0, 5.65];
const BELT: [number, number] = [4.38, 4.66];

/** Spread bodies over their tier's orbits, evenly in angle on each orbit. */
function layout(bodies: OrbitBody[]): PlanetDef[] {
  const out: PlanetDef[] = [];
  for (const tier of ["major", "minor"] as const) {
    const orbits = tier === "major" ? MAJOR_ORBITS : MINOR_ORBITS;
    const list = bodies.filter((b) => (b.tier ?? "major") === tier);
    orbits.forEach((r, oi) => {
      const on = list.filter((_, i) => i % orbits.length === oi);
      on.forEach((b, k) => {
        out.push({
          ...b,
          tier,
          kind: b.kind ?? "sphere",
          r,
          size: tier === "major" ? 0.46 - oi * 0.03 : 0.2 + ((k * 7) % 3) * 0.03,
          speed: 0.95 / Math.pow(r, 1.25),
          phase: (k / on.length) * Math.PI * 2 + oi * 1.3,
        });
      });
    });
  }
  return out;
}

/** Three-step ramp so 3D shading matches the flat sticker UI. */
function useToonRamp() {
  return useMemo(() => {
    const t = new THREE.DataTexture(new Uint8Array([95, 175, 255]), 3, 1, THREE.RedFormat);
    t.minFilter = t.magFilter = THREE.NearestFilter;
    t.generateMipmaps = false;
    t.needsUpdate = true;
    return t;
  }, []);
}

// detail-0 polyhedra are already faceted, so no flat-shading switch is needed
function Toon({ color }: { color: string }) {
  const ramp = useToonRamp();
  return <meshToonMaterial color={color} gradientMap={ramp} />;
}


const noRaycast = () => null;

/**
 * Toon body plus an inverted-hull outline: a back-face copy pushed outward, drawn in the edge color.
 * `hull` overrides the outline geometry where uniform scaling would not stay concentric (tori).
 */
function Shell({
  geo,
  hull,
  k = 1.08,
  color,
  edge,
  bodyRef,
  onOver,
  onOut,
  onClick,
  ...group
}: {
  geo: ReactNode;
  hull?: ReactNode;
  k?: number;
  color: string;
  edge: string;
  bodyRef?: Ref<THREE.Mesh>;
  onOver?: (e: ThreeEvent<PointerEvent>) => void;
  onOut?: (e: ThreeEvent<PointerEvent>) => void;
  onClick?: (e: ThreeEvent<MouseEvent>) => void;
} & ThreeElements["group"]) {
  return (
    <group {...group}>
      <mesh ref={bodyRef} onPointerOver={onOver} onPointerOut={onOut} onClick={onClick}>
        {geo}
        <Toon color={color} />
      </mesh>
      <mesh scale={hull ? 1 : k} raycast={noRaycast}>
        {hull ?? geo}
        <meshBasicMaterial color={edge} side={THREE.BackSide} />
      </mesh>
    </group>
  );
}

function OrbitLine({ r, color }: { r: number; color: string }) {
  const geo = useMemo(() => {
    const pts: THREE.Vector3[] = [];
    for (let i = 0; i <= 180; i++) {
      const a = (i / 180) * Math.PI * 2;
      pts.push(new THREE.Vector3(Math.cos(a) * r, 0, Math.sin(a) * r));
    }
    return new THREE.BufferGeometry().setFromPoints(pts);
  }, [r]);
  const line = useMemo(() => {
    const l = new THREE.Line(geo, new THREE.LineDashedMaterial({ dashSize: 0.16, gapSize: 0.13, transparent: true, opacity: 0.45 }));
    l.computeLineDistances();
    return l;
  }, [geo]);
  useEffect(() => {
    (line.material as THREE.LineDashedMaterial).color.set(color);
  }, [line, color]);
  return <primitive object={line} />;
}

type Labels = React.RefObject<Record<string, HTMLAnchorElement | null>>;

const tmp = new THREE.Vector3();

function Planet({ def, edge, still, t, labels }: { def: PlanetDef; edge: string; still: boolean; t: React.RefObject<number>; labels: Labels }) {
  const group = useRef<THREE.Group>(null!);
  const spinBody = useRef<THREE.Group>(null!);
  const sat = useRef<THREE.Group>(null!);
  const [hover, setHover] = useState(false);

  useFrame((state, dt) => {
    const a = def.phase + t.current * def.speed;
    group.current.position.set(Math.cos(a) * def.r, 0, Math.sin(a) * def.r);
    if (!still) {
      spinBody.current.rotation.y += dt * 0.6;
      if (sat.current) sat.current.rotation.y += dt * 1.6;
    }
    const s = THREE.MathUtils.lerp(group.current.scale.x, hover ? 1.2 : 1, 0.18);
    group.current.scale.setScalar(s);

    // pin the DOM label above the planet (plain DOM keeps it crisp and themeable)
    const el = labels.current[def.code];
    if (el) {
      tmp.setFromMatrixPosition(group.current.matrixWorld);
      tmp.y += def.size + 0.55;
      tmp.project(state.camera);
      const x = ((tmp.x + 1) / 2) * state.size.width,
        y = ((1 - tmp.y) / 2) * state.size.height;
      el.style.transform = `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px) translate(-50%, -50%)`;
      if (!(def.pinLabel ?? def.tier === "major")) el.dataset.show = hover ? "1" : "";
      el.style.zIndex = tmp.z < 0.985 ? "3" : "2";
    }
  });

  const open = () => window.open(def.href, "_blank", "noopener,noreferrer");

  return (
    <group ref={group}>
      <Shell
        ref={spinBody}
        geo={def.kind === "gem" ? <icosahedronGeometry args={[def.size, 0]} /> : <sphereGeometry args={[def.size, 32, 20]} />}
        k={def.kind === "gem" ? 1.12 : 1.08}
        color={def.color}
        edge={edge}
        onOver={(e) => (e.stopPropagation(), setHover(true), (document.body.style.cursor = "pointer"))}
        onOut={() => (setHover(false), (document.body.style.cursor = ""))}
        onClick={(e) => (e.stopPropagation(), open())}
      />
      {def.kind === "ring" && (
        <Shell
          rotation={[Math.PI / 2.5, 0.3, 0]}
          geo={<torusGeometry args={[def.size * 1.75, 0.05, 10, 90]} />}
          hull={<torusGeometry args={[def.size * 1.75, 0.085, 10, 90]} />}
          color="#ffffff"
          edge={edge}
        />
      )}
      {def.kind === "sat" && (
        <group ref={sat} rotation={[0, 0, 0.5]}>
          <Shell position={[def.size + 0.42, 0, 0]} geo={<boxGeometry args={[0.42, 0.03, 0.14]} />} k={1.25} color="#9ab8e7" edge={edge} />
        </group>
      )}
    </group>
  );
}

/** Centre: avatar medallion inside the logo's tilted orbit (2:1, −18°) and its fog-blue star. */
function Core({ edge, space, avatar }: { edge: string; space: boolean; avatar: string }) {
  const ref = useRef<THREE.Group>(null!);
  const tex = useTexture(avatar);
  tex.colorSpace = THREE.SRGBColorSpace;
  const { camera } = useThree();
  useFrame(() => ref.current.quaternion.copy(camera.quaternion));
  // sun-yellow halo for 深空: radial gradient drawn once to a canvas
  const glow = useMemo(() => {
    const c = document.createElement("canvas");
    c.width = c.height = 128;
    const g = c.getContext("2d")!;
    const r = g.createRadialGradient(64, 64, 0, 64, 64, 64);
    r.addColorStop(0, "rgba(255,210,63,.9)");
    r.addColorStop(1, "rgba(255,210,63,0)");
    g.fillStyle = r;
    g.fillRect(0, 0, 128, 128);
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  }, []);
  return (
    <group ref={ref}>
      {space && (
        <sprite position={[0, 0, -0.3]} scale={6}>
          <spriteMaterial map={glow} transparent depthWrite={false} blending={THREE.AdditiveBlending} opacity={0.55} />
        </sprite>
      )}
      <mesh position={[0, 0, -0.01]}>
        <circleGeometry args={[1.28, 64]} />
        <meshBasicMaterial color={edge} />
      </mesh>
      <mesh>
        <circleGeometry args={[1.15, 64]} />
        <meshBasicMaterial map={tex} toneMapped={false} />
      </mesh>
      <Shell
        rotation={[0, 0, (-18 * Math.PI) / 180]}
        scale={[1, 0.5, 1]}
        geo={<torusGeometry args={[1.9, 0.1, 10, 90]} />}
        hull={<torusGeometry args={[1.9, 0.14, 10, 90]} />}
        color="#ffd23f"
        edge={edge}
      />
      <Shell position={[1.55, 0.98, 0.1]} geo={<sphereGeometry args={[0.17, 16, 12]} />} k={1.3} color="#9ab8e7" edge={edge} />
    </group>
  );
}

function Stars({ visible }: { visible: boolean }) {
  const geo = useMemo(() => {
    const p: number[] = [];
    for (let i = 0; i < 520; i++) {
      const u = Math.random() * 2 - 1,
        th = Math.random() * Math.PI * 2,
        rr = 26 + Math.random() * 30,
        s = Math.sqrt(1 - u * u);
      p.push(rr * s * Math.cos(th), rr * u, rr * s * Math.sin(th));
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(p, 3));
    return g;
  }, []);
  return (
    <points geometry={geo} visible={visible}>
      <pointsMaterial color="#dde8ff" size={0.16} transparent opacity={0.9} depthWrite={false} />
    </points>
  );
}

/** A ring of small faceted rocks and stars between the site orbits and the project orbits. */
function Belt({ still }: { still: boolean }) {
  const ref = useRef<THREE.InstancedMesh>(null!);
  const ramp = useToonRamp();
  const COUNT = 160;
  const palette = useMemo(() => ["#ffd23f", "#9ab8e7", "#ffffff", "#ff93b4", "#dce6ff"].map((c) => new THREE.Color(c)), []);
  useEffect(() => {
    const m = new THREE.Matrix4(),
      q = new THREE.Quaternion(),
      e = new THREE.Euler(),
      v = new THREE.Vector3(),
      sc = new THREE.Vector3();
    for (let i = 0; i < COUNT; i++) {
      const a = (i / COUNT) * Math.PI * 2 + Math.sin(i * 12.9898) * 0.08;
      const r = BELT[0] + ((Math.sin(i * 78.233) + 1) / 2) * (BELT[1] - BELT[0]);
      v.set(Math.cos(a) * r, Math.sin(i * 3.7) * 0.07, Math.sin(a) * r);
      e.set(i * 0.7, i * 1.3, i * 0.4);
      q.setFromEuler(e);
      const s = 0.028 + ((i * 37) % 10) * 0.006;
      sc.set(s, s, s);
      m.compose(v, q, sc);
      ref.current.setMatrixAt(i, m);
      ref.current.setColorAt(i, palette[i % palette.length]);
    }
    ref.current.instanceMatrix.needsUpdate = true;
    if (ref.current.instanceColor) ref.current.instanceColor.needsUpdate = true;
  }, [palette]);
  useFrame((_, dt) => {
    if (!still) ref.current.rotation.y += dt * 0.03;
  });
  return (
    <instancedMesh ref={ref} args={[undefined, undefined, COUNT]} raycast={noRaycast}>
      <octahedronGeometry args={[1, 0]} />
      <meshToonMaterial gradientMap={ramp} />
    </instancedMesh>
  );
}

function System({ drag, still, labels, planets, avatar }: { drag: React.RefObject<{ yaw: number; pitch: number; vy: number; down: boolean }>; still: boolean; labels: Labels; planets: PlanetDef[]; avatar: string }) {
  const [mode] = useMode();
  const theme = useThemeKey();
  const space = mode === "space";
  // outline color comes from the active dimension's tokens
  const edge = useMemo(() => cssVar("--h-3d-edge") || (space ? "#dce6ff" : "#0f2044"), [theme, space]);
  const root = useRef<THREE.Group>(null!);
  const t = useRef(0);

  useFrame((_, dtRaw) => {
    const dt = Math.min(dtRaw, 0.05);
    const d = drag.current;
    if (!still) t.current += dt;
    if (!d.down) {
      if (!still) d.yaw += dt * 0.05;
      d.yaw += d.vy;
      d.vy *= 0.92;
    }
    root.current.rotation.set(d.pitch, d.yaw, 0);
  });

  return (
    <>
      <ambientLight intensity={0.55 * Math.PI} />
      <directionalLight position={[-5, 7, 6]} intensity={0.95 * Math.PI} />
      <Stars visible={space} />
      <group ref={root}>
        {[...new Set(planets.map((p) => p.r))].map((r) => (
          <OrbitLine key={r} r={r} color={edge} />
        ))}
        <Belt still={still} />
        {planets.map((p) => (
          <Planet key={p.code} def={p} edge={edge} still={still} t={t} labels={labels} />
        ))}
      </group>
      <Core edge={edge} space={space} avatar={avatar} />
    </>
  );
}

/**
 * M3 showcase: the HEANG planet system. Drag to turn it, click a planet to open that site.
 * Pauses when scrolled off screen; stops auto-rotation under reduced motion.
 */
export function OrbitScene({
  className = "",
  bodies = DEFAULT_BODIES,
  avatar = "/avatar.jpg",
}: {
  className?: string;
  bodies?: OrbitBody[];
  /** image for the centre medallion (square, ≥ 512px) */
  avatar?: string;
}) {
  const planets = useMemo(() => layout(bodies), [bodies]);
  const still = useReducedMotion() ?? false;
  const wrap = useRef<HTMLDivElement>(null!);
  const drag = useRef({ yaw: 0, pitch: 0.12, vy: 0, down: false });
  const labels = useRef<Record<string, HTMLAnchorElement | null>>({});
  const last = useRef({ x: 0, y: 0 });
  const [onScreen, setOnScreen] = useState(true);

  useEffect(() => {
    const io = new IntersectionObserver(([e]) => setOnScreen(e.isIntersecting));
    io.observe(wrap.current);
    return () => io.disconnect();
  }, []);

  return (
    <div
      ref={wrap}
      className={`relative aspect-square w-full max-w-[480px] cursor-grab touch-pan-y select-none active:cursor-grabbing ${className}`}
      onPointerDown={(e) => {
        if ((e.target as HTMLElement).closest("a")) return;
        drag.current.down = true;
        last.current = { x: e.clientX, y: e.clientY };
      }}
      onPointerMove={(e) => {
        const d = drag.current;
        if (!d.down) return;
        const dx = e.clientX - last.current.x,
          dy = e.clientY - last.current.y;
        d.vy = dx * 0.006;
        d.yaw += d.vy;
        d.pitch = Math.max(-0.35, Math.min(0.6, d.pitch + dy * 0.004));
        last.current = { x: e.clientX, y: e.clientY };
      }}
      onPointerUp={() => (drag.current.down = false)}
      onPointerLeave={() => (drag.current.down = false)}
      onPointerCancel={() => (drag.current.down = false)}
    >
      <Canvas
        frameloop={onScreen ? "always" : "never"}
        dpr={[1, 2]}
        camera={{ position: [0, 6.2, 16.6], fov: 38 }}
        flat
        gl={{ alpha: true, antialias: true, preserveDrawingBuffer: true }}
        onCreated={({ camera }) => camera.lookAt(0, 0, 0)}
      >
        <Suspense fallback={null}>
          <System drag={drag} still={still} labels={labels} planets={planets} avatar={avatar} />
        </Suspense>
      </Canvas>
      {planets.map((p) => (
        <a
          key={p.code}
          ref={(el) => {
            labels.current[p.code] = el;
          }}
          href={p.href}
          target="_blank"
          rel="noopener noreferrer"
          className={`orbit-label r-pill bw sh-xs absolute left-0 top-0 flex select-none items-center gap-1.5 whitespace-nowrap border-edge bg-card py-1 pl-1 pr-2.5 text-[11px] font-bold leading-none text-ink no-underline will-change-transform hover:bg-accent hover:text-on-accent ${(p.pinLabel ?? p.tier === "major") ? "" : "orbit-label--minor"}`}
          style={{ transform: "translate(-999px,-999px)" }}
        >
          <i className="size-[15px] rounded-full border-2 border-navy" style={{ background: p.color }} />
          {p.name}
          <span className="font-mono text-[10px] font-normal opacity-70">{p.code}</span>
        </a>
      ))}
      <span className="pointer-events-none absolute bottom-0.5 left-1/2 -translate-x-1/2 whitespace-nowrap font-mono text-[10.5px] text-muted">
        // 拖动旋转 · 点星球进站
      </span>
    </div>
  );
}
