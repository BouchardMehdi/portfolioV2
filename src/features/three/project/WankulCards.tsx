import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { RoundedBox } from "@react-three/drei";
import { Group, MeshBasicMaterial, MeshPhysicalMaterial, Texture } from "three";
import type { HomeMotion } from "@/lib/home-motion";
import {
  wankulCards,
  wankulScreenState,
  wankulSegment as segment,
} from "@/features/selected-work/wankul-story";

type Pose = {
  at: number;
  x: number;
  y: number;
  z: number;
  turn: number;
  tilt: number;
  scale: number;
};

function poses(index: number): Pose[] {
  const side = index - 2;
  const selected = index === 2;
  return [
    {
      at: 0.2,
      x: 0,
      y: -0.6,
      z: -0.1 - index * 0.04,
      turn: Math.PI,
      tilt: 0,
      scale: 0.82,
    },
    {
      at: 0.27,
      x: side * 0.12,
      y: 0.6 + index * 0.06,
      z: 0.1 + index * 0.04,
      turn: Math.PI,
      tilt: side * -0.03,
      scale: 0.85,
    },
    {
      at: 0.335,
      x: side * 2.3,
      y: -0.15 - Math.abs(side) * 0.45,
      z: 1.3 - Math.abs(side) * 0.6,
      turn: side * -0.12,
      tilt: side * -0.12,
      scale: 0.95,
    },
    {
      at: 0.365,
      x: side * 2.3,
      y: -0.15 - Math.abs(side) * 0.45,
      z: 1.3 - Math.abs(side) * 0.6,
      turn: side * -0.12,
      tilt: side * -0.12,
      scale: 0.95,
    },
    {
      at: 0.405,
      x: selected ? 0.7 : side * 3.1,
      y: selected ? -0.3 : -1,
      z: selected ? 2.5 : -2,
      turn: selected ? -0.16 : side * -0.16,
      tilt: selected ? 0.025 : side * -0.15,
      scale: selected ? 1.4 : 0.7,
    },
    {
      at: 0.45,
      x: selected ? 0.7 : side * 3.1,
      y: selected ? -0.3 : -1,
      z: selected ? 2.5 : -2,
      turn: selected ? 0.16 : side * -0.16,
      tilt: selected ? -0.025 : side * -0.15,
      scale: selected ? 1.4 : 0.7,
    },
    { at: 0.505, x: side * 1.7, y: -0.7, z: 0, turn: 0, tilt: 0, scale: 0.8 },
    { at: 0.735, x: side * 1.7, y: -0.7, z: 0, turn: 0, tilt: 0, scale: 0.8 },
    {
      at: 0.785,
      x: side * 2.15,
      y: 0.1 - Math.abs(side) * 0.3,
      z: selected ? 1.5 : 0,
      turn: side * -0.12,
      tilt: side * -0.08,
      scale: selected ? 1.05 : 0.7,
    },
    {
      at: 0.845,
      x: side * 2.15,
      y: 0.1 - Math.abs(side) * 0.3,
      z: selected ? 1.5 : 0,
      turn: side * -0.12,
      tilt: side * -0.08,
      scale: selected ? 1.05 : 0.7,
    },
    {
      at: 0.89,
      x: side * 1.35,
      y: -0.65 - Math.abs(side) * 0.12,
      z: 0.2 - Math.abs(side) * 0.3,
      turn: side * -0.06,
      tilt: side * -0.1,
      scale: 0.68,
    },
    {
      at: 0.94,
      x: side * 1.35,
      y: -0.65 - Math.abs(side) * 0.12,
      z: 0.2 - Math.abs(side) * 0.3,
      turn: side * -0.06,
      tilt: side * -0.1,
      scale: 0.68,
    },
    {
      at: 0.967,
      x: side * 0.025,
      y: -0.3 + index * 0.018,
      z: -index * 0.055,
      turn: 0,
      tilt: 0,
      scale: 0.75,
    },
    { at: 1, x: 0, y: -3.4, z: -index * 0.002, turn: 0, tilt: 0, scale: 0.75 },
  ];
}

function Card({
  index,
  face,
  back,
  motion,
}: {
  index: number;
  face: Texture;
  back: Texture;
  motion: HomeMotion;
}) {
  const group = useRef<Group>(null);
  const front = useRef<MeshBasicMaterial>(null);
  const foil = useRef<MeshPhysicalMaterial>(null);
  const frames = useRef(poses(index));
  useFrame(() => {
    if (!group.current) return;
    const p = motion.wankulProgress;
    const shots = frames.current;
    const i = Math.max(
      0,
      shots.findLastIndex((shot) => p >= shot.at),
    );
    const from = shots[i],
      to = shots[Math.min(i + 1, shots.length - 1)];
    const t = from === to ? 0 : segment(p, from.at, to.at);
    const mix = (key: "x" | "y" | "z" | "turn" | "tilt" | "scale") =>
      from[key] + (to[key] - from[key]) * t;
    const screens = wankulScreenState(p);
    const exit = segment(p, 0.972, 0.993);
    const size = mix("scale");
    group.current.visible = p >= 0.225 && screens.cards > 0.02;
    group.current.position.set(mix("x"), mix("y"), mix("z"));
    group.current.rotation.set(0, mix("turn"), mix("tilt"));
    group.current.scale.set(
      size * (1 - exit * 0.993),
      size * (1 + exit * 1.8),
      Math.max(0.001, size * (1 - exit)),
    );
    if (front.current) {
      front.current.opacity = screens.cards * (1 - exit);
      const dim =
        index === 2
          ? 1
          : 1 - 0.65 * segment(p, 0.36, 0.4) * (1 - segment(p, 0.45, 0.49));
      front.current.color.setScalar(dim);
    }
    if (foil.current)
      foil.current.opacity =
        index === 2
          ? 0.13 * segment(p, 0.36, 0.4) * (1 - segment(p, 0.45, 0.49))
          : 0;
  });
  return (
    <group ref={group}>
      <RoundedBox args={[1.8, 2.52, 0.035]} radius={0.05} smoothness={3}>
        <meshStandardMaterial
          color={index === 2 ? "#d1b2e5" : "#45394f"}
          metalness={0.5}
          roughness={0.3}
        />
      </RoundedBox>
      <mesh position={[0, 0, 0.02]}>
        <planeGeometry args={[1.76, 2.46]} />
        <meshBasicMaterial
          ref={front}
          map={face}
          transparent
          toneMapped={false}
        />
      </mesh>
      <mesh position={[0, 0, -0.02]} rotation={[0, Math.PI, 0]}>
        <planeGeometry args={[1.76, 2.46]} />
        <meshBasicMaterial map={back} toneMapped={false} />
      </mesh>
      {index === 2 && (
        <mesh position={[0, 0, 0.024]}>
          <planeGeometry args={[1.76, 2.46]} />
          <meshPhysicalMaterial
            ref={foil}
            color="#d9bcf6"
            metalness={0.6}
            roughness={0.18}
            iridescence={0.7}
            iridescenceIOR={1.3}
            transparent
            opacity={0}
            depthWrite={false}
          />
        </mesh>
      )}
    </group>
  );
}

export function WankulCards({
  motion,
  textures,
}: {
  motion: HomeMotion;
  textures: Record<string, Texture>;
}) {
  return (
    <>
      {wankulCards.map(
        (name, index) =>
          textures[name] &&
          textures.back && (
            <Card
              key={name}
              index={index}
              face={textures[name]}
              back={textures.back}
              motion={motion}
            />
          ),
      )}
    </>
  );
}
