import { useEffect, useRef, useState } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import {
  Mesh,
  MathUtils,
  PerspectiveCamera,
  SRGBColorSpace,
  Texture,
  TextureLoader,
} from "three";
import type { ProjectVisual } from "../scene-types";

type ScreenProps = {
  project: ProjectVisual;
  target: HTMLElement;
};

export function ProjectScreen({ project, target }: ScreenProps) {
  const screen = useRef<Mesh>(null);
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
    if (!screen.current || !(camera instanceof PerspectiveCamera)) return;
    const rect = target.getBoundingClientRect();
    const viewHeight =
      2 * Math.tan(MathUtils.degToRad(camera.fov / 2)) * camera.position.z;
    const scale =
      Math.min(
        (viewHeight * rect.width) / rect.height / width,
        viewHeight / height,
      ) * 0.96;
    screen.current.scale.setScalar(scale);
  });

  if (!texture) return null;
  return (
    <mesh
      ref={screen}
      onAfterRender={() => {
        target.setAttribute("data-three-ready", "true");
      }}
    >
      <planeGeometry args={[width, height]} />
      <meshBasicMaterial map={texture} toneMapped={false} />
    </mesh>
  );
}
