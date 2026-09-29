import { useEffect, useRef, useState } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { RoundedBox } from "@react-three/drei";
import { Group, SRGBColorSpace, Texture, TextureLoader } from "three";
import type { HomeMotion } from "@/lib/home-motion";
import {
  poireScreens,
  poireSegment as segment,
} from "@/features/selected-work/poire-story";

export function PoireInterface({
  motion,
  target,
}: {
  motion: HomeMotion;
  target: HTMLElement;
}) {
  const group = useRef<Group>(null);
  const screens = useRef<(Group | null)[]>([]);
  const [textures, setTextures] = useState<Record<string, Texture>>({});
  const invalidate = useThree((state) => state.invalidate);
  const gl = useThree((state) => state.gl);
  useEffect(() => {
    let started = false,
      cancelled = false;
    const loaded: Texture[] = [];
    const load = () => {
      if (started || motion.poireProgress < 0.62) return;
      started = true;
      poireScreens.forEach((screen) => {
        new TextureLoader().load(
          `/projects/ramenetapoire/${screen.file}`,
          (texture) => {
            if (cancelled) {
              texture.dispose();
              return;
            }
            texture.colorSpace = SRGBColorSpace;
            texture.anisotropy = Math.min(
              4,
              gl.capabilities.getMaxAnisotropy(),
            );
            loaded.push(texture);
            setTextures((previous) => ({ ...previous, [screen.id]: texture }));
            invalidate();
          },
          undefined,
          () => {
            /* La capture HTML prend le relais si la texture est indisponible. */
          },
        );
      });
    };
    load();
    const unsubscribe = motion.subscribe(load);
    return () => {
      cancelled = true;
      unsubscribe();
      loaded.forEach((texture) => texture.dispose());
      delete target.dataset.poireScreenReady;
    };
  }, [motion, gl, invalidate, target]);
  useFrame(() => {
    if (!group.current) return;
    const p = motion.poireProgress;
    const arrival = segment(p, 0.705, 0.752);
    const departure = segment(p, 0.931, 0.952);
    const index = p >= 0.88 ? 2 : p >= 0.8 ? 1 : 0;
    const ready = Boolean(textures[poireScreens[index].id]);
    group.current.visible = p >= 0.7 && p < 0.954 && ready;
    group.current.position.set(
      0,
      0.25 + arrival * 2.4 - departure * 1.8,
      0.4 + arrival * 3.4,
    );
    group.current.rotation.x = (-Math.PI / 2) * (1 - arrival) - 0.2 * arrival;
    group.current.scale.setScalar(
      Math.max(0.001, (0.16 + 0.56 * arrival) * (1 - departure)),
    );
    screens.current.forEach((screen, i) => {
      if (screen) screen.visible = i === index;
    });
    if (ready) target.setAttribute("data-poire-screen-ready", "true");
    else target.removeAttribute("data-poire-screen-ready");
  });
  return (
    <group ref={group}>
      <RoundedBox args={[8.9, 4.36, 0.13]} radius={0.09} smoothness={3}>
        <meshStandardMaterial color="#61735b" roughness={0.9} />
      </RoundedBox>
      <RoundedBox
        args={[8.72, 4.18, 0.035]}
        position={[0, 0, 0.075]}
        radius={0.04}
        smoothness={2}
      >
        <meshStandardMaterial color="#f4f0e4" roughness={0.85} />
      </RoundedBox>
      {poireScreens.map((screen, index) => (
        <group
          key={screen.id}
          ref={(element) => {
            screens.current[index] = element;
          }}
        >
          {textures[screen.id] && (
            <mesh position={[0, 0, 0.098]}>
              <planeGeometry
                args={[8.6, (8.6 * screen.height) / screen.width]}
              />
              <meshBasicMaterial map={textures[screen.id]} toneMapped={false} />
            </mesh>
          )}
        </group>
      ))}
      <RoundedBox
        args={[2.2, 0.1, 0.7]}
        position={[0, -2.24, -0.1]}
        radius={0.04}
        smoothness={2}
      >
        <meshStandardMaterial color="#a98556" roughness={0.9} />
      </RoundedBox>
    </group>
  );
}
