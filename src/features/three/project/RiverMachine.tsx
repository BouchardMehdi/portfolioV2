import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { RoundedBox } from "@react-three/drei";
import { Group } from "three";
import type { HomeMotion } from "@/lib/home-motion";
import { riverSegment } from "@/features/selected-work/river-story";
import type { RiverTextures } from "./river-textures";

const panels: {
  position: [number, number, number];
  size: [number, number, number];
  exit: [number, number, number];
}[] = [
  { position: [-1.93, 0, 0], size: [0.3, 4.9, 1.6], exit: [-5, 0, 1] },
  { position: [1.93, 0, 0], size: [0.3, 4.9, 1.6], exit: [5, 0, 1] },
  { position: [0, 2.05, 0], size: [3.65, 0.85, 1.6], exit: [0, 4, 0] },
  { position: [0, -1.4, 0], size: [3.65, 1.8, 1.5], exit: [0, -4, 0] },
  { position: [0, -2.42, 0.15], size: [4.3, 0.25, 1.9], exit: [0, -4.8, 1] },
];

export function RiverMachine({
  motion,
  textures,
}: {
  motion: HomeMotion;
  textures: RiverTextures;
}) {
  const root = useRef<Group>(null);
  const parts = useRef<(Group | null)[]>([]);
  const reels = useRef<(Group | null)[]>([]);
  const lever = useRef<Group>(null);
  useFrame(() => {
    const p = motion.riverProgress;
    if (!root.current) return;
    root.current.visible = p < 0.34;
    root.current.rotation.y = -0.12 * (1 - riverSegment(p, 0.03, 0.14));
    const open = riverSegment(p, 0.21, 0.3);
    panels.forEach((panel, i) => {
      const part = parts.current[i];
      if (!part) return;
      part.position.set(
        ...(panel.position.map((v, axis) => v + panel.exit[axis] * open) as [
          number,
          number,
          number,
        ]),
      );
      part.rotation.z = (i === 0 ? -1 : i === 1 ? 1 : 0) * open * 0.16;
    });
    reels.current.forEach((reel, i) => {
      if (!reel) return;
      reel.position.set(
        (i - 1) * (1.12 + open * 4),
        0.35 + (i === 1 ? open * 5 : 0),
        0.15,
      );
      reel.rotation.x =
        Math.PI * 6 * riverSegment(p, 0.055 + i * 0.012, 0.17 + i * 0.012);
    });
    if (lever.current) {
      lever.current.position.x = 2.23 + open * 5;
      lever.current.rotation.x =
        riverSegment(p, 0.055, 0.085) *
        0.65 *
        (1 - riverSegment(p, 0.11, 0.16));
    }
  });
  return (
    <group ref={root} position={[0, -0.5, 0]}>
      {panels.map((panel, i) => (
        <group
          key={i}
          position={panel.position}
          ref={(el) => {
            parts.current[i] = el;
          }}
        >
          <RoundedBox args={panel.size} radius={0.09} smoothness={3}>
            <meshStandardMaterial
              color={i === 4 ? "#8e8270" : "#28323d"}
              metalness={0.65}
              roughness={0.32}
            />
          </RoundedBox>
          {i < 2 && (
            <mesh position={[0, 0, 0.81]}>
              <boxGeometry args={[0.045, 4.55, 0.025]} />
              <meshBasicMaterial color="#eda16b" />
            </mesh>
          )}
          {i === 2 && (
            <mesh position={[0, 0, 0.815]}>
              <planeGeometry args={[3.25, 0.64]} />
              <meshBasicMaterial map={textures.marquee} toneMapped={false} />
            </mesh>
          )}
          {i === 3 && (
            <>
              <RoundedBox
                args={[3.3, 0.3, 1.75]}
                position={[0, 0.69, 0.2]}
                radius={0.05}
                smoothness={3}
              >
                <meshStandardMaterial
                  color="#7d858b"
                  metalness={0.7}
                  roughness={0.3}
                />
              </RoundedBox>
              <mesh position={[0, -0.14, 0.76]}>
                <boxGeometry args={[1.5, 0.17, 0.05]} />
                <meshStandardMaterial color="#0b1015" />
              </mesh>
              {[-0.48, 0, 0.48].map((x) => (
                <mesh
                  key={x}
                  position={[x, 0.7, 1.09]}
                  rotation={[Math.PI / 2, 0, 0]}
                >
                  <cylinderGeometry args={[0.13, 0.13, 0.09, 24]} />
                  <meshStandardMaterial
                    color={x === 0 ? "#ef9a62" : "#34424f"}
                    metalness={0.25}
                    roughness={0.4}
                  />
                </mesh>
              ))}
            </>
          )}
        </group>
      ))}
      {[0, 1, 2].map((i) => (
        <group
          key={i}
          ref={(el) => {
            reels.current[i] = el;
          }}
        >
          <mesh rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.9, 0.9, 1.01, 40]} />
            <meshStandardMaterial
              color="#eee5cf"
              roughness={0.38}
              metalness={0.08}
            />
          </mesh>
          {Array.from({ length: 8 }, (_, j) => {
            const angle = (j * Math.PI) / 4;
            return (
              <mesh
                key={j}
                position={[0, Math.sin(angle) * 0.91, Math.cos(angle) * 0.91]}
                rotation={[-angle, 0, 0]}
              >
                <planeGeometry args={[0.6, 0.6]} />
                <meshBasicMaterial
                  map={textures.symbols[(j + i) % 3]}
                  transparent
                  toneMapped={false}
                  depthWrite={false}
                />
              </mesh>
            );
          })}
        </group>
      ))}
      <group ref={lever} position={[2.23, -0.15, 0]}>
        <mesh position={[0, 0.6, 0]}>
          <cylinderGeometry args={[0.07, 0.07, 1.4, 16]} />
          <meshStandardMaterial
            color="#aab5bc"
            metalness={0.8}
            roughness={0.22}
          />
        </mesh>
        <mesh position={[0, 1.35, 0]}>
          <sphereGeometry args={[0.22, 24, 24]} />
          <meshStandardMaterial
            color="#d67d40"
            metalness={0.25}
            roughness={0.25}
          />
        </mesh>
        <mesh rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.16, 0.16, 0.55, 16]} />
          <meshStandardMaterial color="#6e7b85" metalness={0.65} />
        </mesh>
      </group>
    </group>
  );
}
