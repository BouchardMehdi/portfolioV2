import { useEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import {
  Group,
  MathUtils,
  Mesh,
  MeshStandardMaterial,
  PerspectiveCamera,
} from "three";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";
import { structure } from "@/features/hero/structure";
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
  const pieces = useRef<(Mesh | null)[]>([]);
  const visible = useRef(false);
  const time = useRef(0);
  const invalidate = useThree((state) => state.invalidate);
  const geometry = useMemo(
    () => new RoundedBoxGeometry(1.42, 0.42, 0.42, 3, 0.045),
    [],
  );

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      visible.current = entry.isIntersecting;
      if (entry.isIntersecting) invalidate();
    });
    observer.observe(target);
    return () => {
      observer.disconnect();
      geometry.dispose();
      target.removeAttribute("data-three-ready");
    };
  }, [target, geometry, invalidate]);

  useFrame(({ camera }, delta) => {
    if (!group.current || !(camera instanceof PerspectiveCamera)) return;
    const progress = motion.heroProgress;
    const spread = MathUtils.smoothstep(progress, 0.05, 0.9);
    const opacity = 1 - MathUtils.smoothstep(progress, 0.8, 1);
    const idleStrength = 1 - MathUtils.smoothstep(progress, 0.02, 0.45) * 0.85;
    const rect = target.getBoundingClientRect();
    const viewHeight =
      2 * Math.tan(MathUtils.degToRad(camera.fov / 2)) * camera.position.z;
    const scale = Math.min(
      viewHeight / 4.2,
      (viewHeight * rect.width) / rect.height / 3.6,
    );
    const active = visible.current && !document.hidden && opacity > 0;
    if (active) time.current += Math.min(delta, 0.05);
    group.current.scale.setScalar(scale * (0.9 - spread * 0.22));
    group.current.rotation.set(
      0.32 + Math.sin(time.current * 0.4) * 0.055 * idleStrength,
      -0.55 + Math.sin(time.current * 0.45) * 0.22 * idleStrength,
      Math.sin(time.current * 0.3) * 0.018 * idleStrength,
    );
    group.current.position.y =
      Math.sin(time.current * 0.5) * 0.035 * idleStrength;
    structure.forEach((piece, index) => {
      const mesh = pieces.current[index];
      if (!mesh) return;
      const [x, y, z] = piece.position;
      mesh.position.set(
        x * (1 + spread * 1.15),
        y * (1 + spread * 1.4),
        z * (1 + spread * 0.7),
      );
      mesh.rotation.set(
        piece.spin[0] * spread,
        piece.turn + piece.spin[1] * spread,
        piece.spin[2] * spread,
      );
      (mesh.material as MeshStandardMaterial).opacity = opacity;
    });
    // La sculpture entretient le rendu jusqu’à sa disparition ; la galerie reste à la demande.
    if (active) invalidate();
  });

  return (
    <group ref={group}>
      {structure.map((piece, index) => (
        <mesh
          key={index}
          ref={(mesh) => {
            pieces.current[index] = mesh;
          }}
          geometry={geometry}
          onAfterRender={() => target.setAttribute("data-three-ready", "true")}
        >
          <meshStandardMaterial
            color={
              piece.accent
                ? palette.accent
                : palette.dark
                  ? "#646e7d"
                  : "#606977"
            }
            metalness={0.25}
            roughness={0.5}
            transparent
          />
        </mesh>
      ))}
    </group>
  );
}
