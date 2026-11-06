import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { RoundedBox } from "@react-three/drei";
import { DoubleSide, Group, Texture } from "three";
import type { HomeMotion } from "@/lib/home-motion";
import { wankulSegment as segment } from "@/features/selected-work/wankul-story";

export function WankulBooster({
  motion,
  texture,
}: {
  motion: HomeMotion;
  texture: Texture;
}) {
  const group = useRef<Group>(null);
  const seal = useRef<Group>(null);
  const front = useRef<Group>(null);
  const maps = useMemo(() => {
    // Le sachet et sa languette partagent la même image, découpée dans ses UV.
    const body = texture.clone();
    body.repeat.set(644 / 830, 995 / 1299);
    body.offset.set(110 / 830, 1 - 1222 / 1299);
    const top = texture.clone();
    top.repeat.set(644 / 830, 125 / 1299);
    top.offset.set(110 / 830, 1 - 227 / 1299);
    return { body, top };
  }, [texture]);
  useEffect(
    () => () => {
      maps.body.dispose();
      maps.top.dispose();
    },
    [maps],
  );
  useFrame(({ clock, invalidate }) => {
    if (!group.current || !seal.current || !front.current) return;
    const p = motion.wankulProgress;
    const opening = segment(p, 0.17, 0.255);
    const fall = segment(p, 0.28, 0.34);
    const appear = segment(p, 0.035, 0.1);
    const idle =
      motion.projectIndex === 2 && p > 0.06 && p < 0.2 && !document.hidden;
    const drift = idle
      ? Math.sin(clock.elapsedTime * 0.7) * 0.04 * (1 - opening)
      : 0;
    group.current.visible = p < 0.345;
    group.current.position.set(0, -0.7 - fall * 5 + drift, -1 + appear);
    group.current.rotation.set(
      0.04,
      -0.17 * (1 - opening) + drift,
      -0.035 * (1 - opening),
    );
    group.current.scale.setScalar(Math.max(0.001, appear * (1 - fall)));
    seal.current.position.set(
      opening * 3,
      1.85 - opening * 0.2,
      -opening * 0.2,
    );
    seal.current.rotation.z = -opening * 0.65;
    front.current.rotation.x = opening * 0.55;
    if (idle) invalidate();
  });
  return (
    <group ref={group}>
      <RoundedBox
        args={[2.48, 3.94, 0.24]}
        position={[0, -0.05, -0.12]}
        radius={0.09}
        smoothness={3}
      >
        <meshStandardMaterial color="#544767" roughness={0.3} metalness={0.6} />
      </RoundedBox>
      <group ref={front} position={[0, -1.9, 0.04]}>
        <mesh position={[0, 1.85, 0.1]}>
          <planeGeometry args={[2.5, 3.86]} />
          <meshStandardMaterial
            map={maps.body}
            transparent
            alphaTest={0.2}
            side={DoubleSide}
            roughness={0.48}
            metalness={0.08}
          />
        </mesh>
      </group>
      <group ref={seal} position={[0, 1.85, 0]}>
        <mesh position={[0, 0.22, 0.15]}>
          <planeGeometry args={[2.5, 0.485]} />
          <meshStandardMaterial
            map={maps.top}
            transparent
            alphaTest={0.2}
            side={DoubleSide}
            roughness={0.35}
            metalness={0.35}
          />
        </mesh>
      </group>
    </group>
  );
}
