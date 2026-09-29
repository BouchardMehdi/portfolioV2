import { useEffect, useMemo, useRef, useState } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { PerspectiveCamera, RoundedBox } from "@react-three/drei";
import {
  Color,
  Group,
  MeshBasicMaterial,
  PerspectiveCamera as ThreeCamera,
  SRGBColorSpace,
  Texture,
  TextureLoader,
  Vector3,
} from "three";
import type { HomeMotion } from "@/lib/home-motion";
import { riverSegment } from "@/features/selected-work/river-story";
import { createRiverTextures } from "./river-textures";
import { RiverMachine } from "./RiverMachine";
import { RiverTable } from "./RiverTable";

type Shot = {
  at: number;
  eye: [number, number, number];
  look: [number, number, number];
};
const shots: Shot[] = [
  { at: 0, eye: [0, 1.2, 14], look: [0, 0.7, 0] },
  { at: 0.1, eye: [0, 0.8, 10.5], look: [0, 0, 0] },
  { at: 0.205, eye: [0, 0.8, 10.5], look: [0, 0, 0] },
  { at: 0.33, eye: [0, 7, -5], look: [0, 0, -14] },
  { at: 0.43, eye: [0, 7, -5], look: [0, 0, -14] },
  { at: 0.56, eye: [0, 10, -7], look: [0, 1, -14] },
  { at: 0.65, eye: [0, 10, -7], look: [0, 1, -14] },
  { at: 0.75, eye: [0, 1, -18], look: [0.6, 0, -28] },
  { at: 0.9, eye: [0, 1, -18], look: [0.6, 0, -28] },
  { at: 0.955, eye: [0, 1, -18], look: [0, 1, -28] },
  { at: 1, eye: [0, 1, -18], look: [0, 1, -28] },
];

export function RiverWorld({
  target,
  motion,
}: {
  target: HTMLElement;
  motion: HomeMotion;
}) {
  const camera = useRef<ThreeCamera>(null);
  const consoleGroup = useRef<Group>(null);
  const card = useRef<Group>(null);
  const mapFace = useRef<MeshBasicMaterial>(null);
  const pokerFace = useRef<MeshBasicMaterial>(null);
  const pin = useRef<Group>(null);
  const textures = useMemo(() => createRiverTextures(), []);
  const [screen, setScreen] = useState<Texture | null>(null);
  const invalidate = useThree((state) => state.invalidate);
  const gl = useThree((state) => state.gl);
  const look = useMemo(() => new Vector3(), []);
  const background = useMemo(() => new Color("#0c1015"), []);
  const night = useMemo(() => new Color("#0c1015"), []);
  const cream = useMemo(() => new Color("#e6e1ce"), []);

  useEffect(() => {
    let cancelled = false;
    let loaded: Texture | undefined;
    new TextureLoader().load(
      "/projects/the-river/menu.png",
      (texture) => {
        if (cancelled) {
          texture.dispose();
          return;
        }
        loaded = texture;
        texture.colorSpace = SRGBColorSpace;
        texture.anisotropy = Math.min(4, gl.capabilities.getMaxAnisotropy());
        setScreen(texture);
        target.dataset.riverScreenReady = "true";
        invalidate();
      },
      undefined,
      () => {
        /* La capture HTML reste disponible si la texture échoue. */
      },
    );
    return () => {
      cancelled = true;
      loaded?.dispose();
      delete target.dataset.riverScreenReady;
    };
  }, [target, gl, invalidate]);
  useEffect(
    () => () => {
      textures.marquee.dispose();
      textures.map.dispose();
      textures.cards.forEach((texture) => texture.dispose());
      textures.symbols.forEach((texture) => texture.dispose());
      target.removeAttribute("data-three-ready");
    },
    [textures, target],
  );

  useFrame(() => {
    if (!camera.current || !card.current) return;
    const p = motion.riverProgress;
    target.setAttribute("data-three-ready", "true");
    const index = Math.max(
      0,
      shots.findLastIndex((shot) => p >= shot.at),
    );
    const from = shots[index],
      to = shots[Math.min(index + 1, shots.length - 1)];
    const t = from === to ? 0 : riverSegment(p, from.at, to.at);
    const eye = from.eye.map((v, i) => v + (to.eye[i] - v) * t) as [
      number,
      number,
      number,
    ];
    look.set(
      ...(from.look.map((v, i) => v + (to.look[i] - v) * t) as [
        number,
        number,
        number,
      ]),
    );
    camera.current.position.set(...eye);
    camera.current.lookAt(look);
    camera.current.updateMatrixWorld();
    if (consoleGroup.current) {
      consoleGroup.current.visible = p > 0.65 && p < 0.998 && Boolean(screen);
      consoleGroup.current.rotation.y =
        0.13 * (1 - riverSegment(p, 0.67, 0.75));
    }
    const carry = riverSegment(p, 0.66, 0.75);
    const lift = riverSegment(p, 0.895, 0.95);
    const morph = riverSegment(p, 0.945, 0.985);
    const fill = riverSegment(p, 0.955, 1);
    card.current.visible = p > 0.27;
    card.current.position.set(
      1.36 + (3 - 1.36) * carry - 3 * lift,
      -0.44 - 0.16 * carry + 1.6 * lift,
      -14 - 10 * carry,
    );
    card.current.rotation.set(
      (-Math.PI / 2) * (1 - carry),
      0.2 * carry * (1 - lift),
      -0.12 * carry * (1 - lift),
    );
    card.current.scale.set(1 + fill * 28, 1 + fill * 12, 1);
    if (mapFace.current) mapFace.current.opacity = morph;
    if (pokerFace.current) pokerFace.current.opacity = 1 - morph;
    if (pin.current) {
      const size = 8 * riverSegment(p, 0.982, 1);
      pin.current.scale.set(
        size / (1 + fill * 28),
        size / (1 + fill * 12),
        size,
      );
    }
    background.copy(night).lerp(cream, riverSegment(p, 0.977, 1));
  });

  return (
    <>
      <primitive object={background} attach="background" />
      <fog attach="fog" args={["#0c1015", 18, 48]} />
      <PerspectiveCamera
        ref={camera}
        makeDefault
        position={[0, 1.2, 14]}
        fov={42}
        near={0.08}
        far={85}
      />
      <ambientLight intensity={0.7} />
      <directionalLight position={[4, 7, 7]} intensity={3.5} color="#e2ecff" />
      <directionalLight position={[-5, 3, -4]} intensity={3} color="#ff9a51" />
      <pointLight
        position={[0, 5, -13]}
        intensity={65}
        distance={18}
        color="#d7e5ff"
      />
      <pointLight
        position={[-4, 3, -23]}
        intensity={45}
        distance={15}
        color="#ffbb82"
      />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -3.1, -16]}>
        <planeGeometry args={[100, 100]} />
        <meshStandardMaterial color="#080b10" metalness={0.1} roughness={0.9} />
      </mesh>
      <RiverMachine motion={motion} textures={textures} />
      <RiverTable motion={motion} textures={textures} />
      <group ref={consoleGroup} position={[-0.8, -0.15, -28]} scale={0.78}>
        <RoundedBox args={[7.4, 5.08, 0.3]} radius={0.16} smoothness={3}>
          <meshStandardMaterial
            color="#35414d"
            metalness={0.65}
            roughness={0.35}
          />
        </RoundedBox>
        <RoundedBox
          args={[7.1, 4.78, 0.06]}
          position={[0, 0, 0.18]}
          radius={0.08}
          smoothness={3}
        >
          <meshStandardMaterial color="#080d13" />
        </RoundedBox>
        {screen && (
          <mesh position={[0, 0, 0.22]}>
            <planeGeometry args={[6.8, 4.54]} />
            <meshBasicMaterial map={screen} toneMapped={false} />
          </mesh>
        )}
        <mesh position={[0, -2.47, 0.19]}>
          <boxGeometry args={[1.3, 0.025, 0.025]} />
          <meshBasicMaterial color="#f3a06d" />
        </mesh>
        {[-2.7, 2.7].map((x) => (
          <group key={x} position={[x, -2.95, -0.45]}>
            <RoundedBox args={[0.15, 1.4, 0.3]} radius={0.04} smoothness={2}>
              <meshStandardMaterial
                color="#566574"
                metalness={0.65}
                roughness={0.28}
              />
            </RoundedBox>
            <mesh position={[0, -0.5, 0.35]}>
              <boxGeometry args={[1.2, 0.15, 1.6]} />
              <meshStandardMaterial color="#27313b" metalness={0.5} />
            </mesh>
          </group>
        ))}
      </group>
      <group ref={card}>
        <RoundedBox args={[0.62, 0.88, 0.035]} radius={0.025} smoothness={3}>
          <meshStandardMaterial color="#e6e1ce" roughness={0.85} />
        </RoundedBox>
        <mesh position={[0, 0, 0.021]}>
          <planeGeometry args={[0.605, 0.865]} />
          <meshBasicMaterial
            ref={pokerFace}
            map={textures.cards[0]}
            transparent
            toneMapped={false}
          />
        </mesh>
        <mesh position={[0, 0, 0.024]}>
          <planeGeometry args={[0.615, 0.875]} />
          <meshBasicMaterial
            ref={mapFace}
            map={textures.map}
            transparent
            opacity={0}
            depthWrite={false}
            toneMapped={false}
          />
        </mesh>
        <group ref={pin} position={[0.12, 0.09, 0.04]}>
          <mesh>
            <sphereGeometry args={[0.016, 16, 16]} />
            <meshBasicMaterial color="#315c43" />
          </mesh>
          <mesh position={[0, 0, -0.008]}>
            <ringGeometry args={[0.023, 0.026, 32]} />
            <meshBasicMaterial color="#315c43" />
          </mesh>
        </group>
      </group>
    </>
  );
}
