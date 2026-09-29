import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Line, RoundedBox } from "@react-three/drei";
import { Group, Mesh } from "three";
import type { HomeMotion } from "@/lib/home-motion";
import { riverSegment } from "@/features/selected-work/river-story";
import type { RiverTextures } from "./river-textures";

const seats: [number, number, number][] = [
  [-3.5, 0.3, 1.7],
  [3.5, 0.3, 1.7],
  [-3.5, 0.3, -1.7],
  [3.5, 0.3, -1.7],
];
const oval = Array.from({ length: 65 }, (_, i): [number, number, number] => [
  Math.cos((i / 64) * Math.PI * 2) * 3.42,
  0.23,
  Math.sin((i / 64) * Math.PI * 2) * 1.9,
]);

export function RiverTable({
  motion,
  textures,
}: {
  motion: HomeMotion;
  textures: RiverTextures;
}) {
  const root = useRef<Group>(null);
  const players = useRef<(Group | null)[]>([]);
  const network = useRef<Group>(null);
  const packets = useRef<(Mesh | null)[]>([]);
  useFrame(() => {
    const p = motion.riverProgress;
    if (!root.current) return;
    root.current.visible = p > 0.26 && p < 0.92;
    players.current.forEach((player, i) =>
      player?.scale.setScalar(
        riverSegment(p, 0.47 + i * 0.014, 0.53 + i * 0.014),
      ),
    );
    const reveal = riverSegment(p, 0.53, 0.59);
    network.current?.scale.setScalar(reveal);
    packets.current.forEach((packet, i) => {
      if (!packet) return;
      const t = riverSegment(p, 0.55 + i * 0.013, 0.63 + i * 0.01);
      packet.position.set(
        seats[i][0] * (1 - t),
        0.55 + 1.45 * t,
        seats[i][2] * (1 - t),
      );
      packet.scale.setScalar(reveal * (1 - riverSegment(p, 0.65, 0.68)));
    });
  });
  return (
    <group ref={root} position={[0, -0.7, -14]}>
      <mesh scale={[1.8, 1, 1]}>
        <cylinderGeometry args={[2.1, 2.1, 0.32, 64]} />
        <meshStandardMaterial
          color="#292f35"
          roughness={0.5}
          metalness={0.25}
        />
      </mesh>
      <mesh position={[0, 0.18, 0]} scale={[1.8, 1, 1]}>
        <cylinderGeometry args={[1.94, 1.94, 0.045, 64]} />
        <meshStandardMaterial color="#245248" roughness={0.95} />
      </mesh>
      <Line points={oval} color="#a58a5c" lineWidth={1.3} />
      {[-1.6, 1.6].map((x) => (
        <mesh key={x} position={[x, -1.05, 0]}>
          <cylinderGeometry args={[0.23, 0.42, 1.8, 24]} />
          <meshStandardMaterial
            color="#222a33"
            metalness={0.6}
            roughness={0.32}
          />
        </mesh>
      ))}
      {textures.cards.slice(1).map((texture, i) => (
        <group
          key={i}
          position={[(i - 2) * 0.68, 0.25, 0]}
          rotation={[-Math.PI / 2, 0, 0]}
        >
          <RoundedBox args={[0.61, 0.86, 0.035]} radius={0.025} smoothness={2}>
            <meshStandardMaterial color="#eee7d9" />
          </RoundedBox>
          <mesh position={[0, 0, 0.02]}>
            <planeGeometry args={[0.59, 0.84]} />
            <meshBasicMaterial map={texture} toneMapped={false} />
          </mesh>
        </group>
      ))}
      {[-2.5, 2.5].map((x, side) => (
        <group key={x} position={[x, 0.24, 0.6]}>
          {Array.from({ length: 3 }, (_, stack) => (
            <group key={stack} position={[stack * 0.24, 0, stack * 0.1]}>
              {Array.from({ length: 3 + stack }, (_, i) => (
                <mesh key={i} position={[0, i * 0.055, 0]}>
                  <cylinderGeometry args={[0.17, 0.17, 0.05, 24]} />
                  <meshStandardMaterial
                    color={i % 2 ? "#e6dfce" : side ? "#cf7b46" : "#29495a"}
                    roughness={0.6}
                  />
                </mesh>
              ))}
            </group>
          ))}
        </group>
      ))}
      {seats.map((position, i) => (
        <group
          key={i}
          position={position}
          ref={(el) => {
            players.current[i] = el;
          }}
        >
          <mesh>
            <cylinderGeometry args={[0.42, 0.5, 0.13, 32]} />
            <meshStandardMaterial color="#74818c" metalness={0.5} />
          </mesh>
          <mesh position={[0, 0.4, 0]}>
            <sphereGeometry args={[0.21, 24, 24]} />
            <meshStandardMaterial
              color="#e3a46f"
              metalness={0.2}
              roughness={0.45}
            />
          </mesh>
          <mesh position={[0, 0.16, 0]}>
            <cylinderGeometry args={[0.15, 0.29, 0.25, 24]} />
            <meshStandardMaterial color="#344656" roughness={0.6} />
          </mesh>
        </group>
      ))}
      <group ref={network}>
        <RoundedBox
          args={[0.62, 0.62, 0.62]}
          position={[0, 2, 0]}
          rotation={[0, Math.PI / 4, 0]}
          radius={0.06}
          smoothness={3}
        >
          <meshStandardMaterial
            color="#d89357"
            metalness={0.4}
            roughness={0.25}
          />
        </RoundedBox>
        {[-0.16, 0, 0.16].map((y) => (
          <mesh key={y} position={[0, 2 + y, 0.46]}>
            <boxGeometry args={[0.25, 0.025, 0.025]} />
            <meshBasicMaterial color="#ffe0af" />
          </mesh>
        ))}
        {seats.map((pos, i) => (
          <Line
            key={i}
            points={[
              [pos[0], 0.55, pos[2]],
              [pos[0] * 0.35, 1.4, pos[2] * 0.35],
              [0, 2, 0],
            ]}
            color="#eaa570"
            lineWidth={1.2}
            transparent
            opacity={0.65}
          />
        ))}
      </group>
      {seats.map((_, i) => (
        <mesh
          key={i}
          ref={(el) => {
            packets.current[i] = el;
          }}
        >
          <sphereGeometry args={[0.07, 12, 12]} />
          <meshBasicMaterial color="#ffe2bd" />
        </mesh>
      ))}
    </group>
  );
}
