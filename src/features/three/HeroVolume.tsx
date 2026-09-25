import { useEffect, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import type { Group } from "three";
import type { HomeMotion } from "@/lib/home-motion";
import type { ScenePalette } from "./scene-types";

export function HeroVolume({
  target,
  motion,
  palette,
}: {
  target: HTMLElement;
  motion: HomeMotion;
  palette: ScenePalette;
}) {
  const group = useRef<Group>(null);
  useEffect(
    () => () => {
      target.removeAttribute("data-three-ready");
    },
    [target],
  );
  useFrame(() => {
    if (!group.current) return;
    group.current.rotation.set(
      0.2 + motion.heroProgress * 0.12,
      -0.4 + motion.heroProgress * 0.3,
      -0.08,
    );
  });
  return (
    <group ref={group}>
      <mesh
        onAfterRender={() => {
          target.setAttribute("data-three-ready", "true");
        }}
      >
        <boxGeometry args={[1.5, 1.9, 0.22]} />
        <meshStandardMaterial
          color={palette.surface}
          metalness={0.2}
          roughness={palette.dark ? 0.35 : 0.7}
        />
      </mesh>
      <mesh position={[0, 0, 0.13]}>
        <boxGeometry args={[1.23, 1.63, 0.06]} />
        <meshStandardMaterial color={palette.border} roughness={0.8} />
      </mesh>
      <mesh position={[0, -0.6, 0.18]}>
        <boxGeometry args={[0.85, 0.025, 0.015]} />
        <meshBasicMaterial color={palette.accent} toneMapped={false} />
      </mesh>
    </group>
  );
}
