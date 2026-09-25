import { useEffect, useRef, useState } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import {
  Group,
  MathUtils,
  PerspectiveCamera,
  SRGBColorSpace,
  Texture,
  TextureLoader,
} from "three";
import type { HomeMotion } from "@/lib/home-motion";
import type { ProjectVisual, ScenePalette } from "../scene-types";

type ScreenProps = {
  project: ProjectVisual;
  index: number;
  target: HTMLElement;
  motion: HomeMotion;
  palette: ScenePalette;
};

export function ProjectScreen({
  project,
  index,
  target,
  motion,
  palette,
}: ScreenProps) {
  const group = useRef<Group>(null);
  const [texture, setTexture] = useState<Texture | null>(null);
  const invalidate = useThree((state) => state.invalidate);
  const gl = useThree((state) => state.gl);
  const width = 3.8;
  const height = width / project.aspect;

  useEffect(() => {
    let cancelled = false;
    let loaded: Texture | undefined;
    new TextureLoader().load(
      project.texture,
      (result) => {
        if (cancelled) {
          result.dispose();
          return;
        }
        loaded = result;
        result.colorSpace = SRGBColorSpace;
        result.anisotropy = Math.min(4, gl.capabilities.getMaxAnisotropy());
        result.needsUpdate = true;
        setTexture(result);
        invalidate();
      },
      undefined,
      () => {
        /* La capture DOM reste affichée si la texture ne peut pas être chargée. */
      },
    );
    return () => {
      cancelled = true;
      loaded?.dispose();
      target.removeAttribute("data-three-ready");
    };
  }, [project.texture, gl, invalidate, target]);

  useFrame(({ camera }) => {
    if (!group.current || !(camera instanceof PerspectiveCamera)) return;
    const rect = target.getBoundingClientRect();
    const phase = MathUtils.clamp(motion.projectPosition - index, -1, 1);
    const viewHeight =
      2 * Math.tan(MathUtils.degToRad(camera.fov / 2)) * camera.position.z;
    const scale =
      Math.min(
        (viewHeight * rect.width) / rect.height / (width + 0.2),
        viewHeight / (height + 0.2),
      ) * 0.86;
    group.current.scale.setScalar(scale);
    group.current.position.z = -Math.abs(phase) * 0.35;
    group.current.rotation.set(0.06, -0.1 - phase * 0.22, phase * 0.025);
  });

  if (!texture) return null;
  return (
    <group ref={group}>
      <mesh>
        <boxGeometry args={[width + 0.16, height + 0.16, 0.16]} />
        <meshStandardMaterial
          color={palette.surface}
          metalness={0.2}
          roughness={palette.dark ? 0.35 : 0.75}
        />
      </mesh>
      <mesh
        position={[0, 0, 0.09]}
        onAfterRender={() => {
          target.setAttribute("data-three-ready", "true");
        }}
      >
        <planeGeometry args={[width, height]} />
        <meshBasicMaterial map={texture} toneMapped={false} />
      </mesh>
      <mesh position={[0, -height / 2 - 0.055, 0.09]}>
        <boxGeometry args={[width * 0.35, 0.02, 0.025]} />
        <meshBasicMaterial color={project.accent} toneMapped={false} />
      </mesh>
    </group>
  );
}
