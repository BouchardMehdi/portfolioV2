import { useEffect, useMemo, useRef, useState } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { PerspectiveCamera, RoundedBox } from "@react-three/drei";
import {
  Color,
  Group,
  MeshBasicMaterial,
  SRGBColorSpace,
  Texture,
  TextureLoader,
  PerspectiveCamera as ThreeCamera,
} from "three";
import type { HomeMotion } from "@/lib/home-motion";
import {
  wankulCards,
  wankulSegment as segment,
} from "@/features/selected-work/wankul-story";
import { WankulBooster } from "./WankulBooster";
import { WankulCards } from "./WankulCards";

const assets = {
  booster: "booster.png",
  back: "card-back.webp",
  ...Object.fromEntries(wankulCards.map((name) => [name, `${name}.webp`])),
};

export function WankulWorld({
  target,
  motion,
  backgroundColor,
}: {
  target: HTMLElement;
  motion: HomeMotion;
  backgroundColor: string;
}) {
  const camera = useRef<ThreeCamera>(null);
  const entry = useRef<Group>(null);
  const entryFace = useRef<MeshBasicMaterial>(null);
  const coins = useRef<(Group | null)[]>([]);
  const [textures, setTextures] = useState<Record<string, Texture>>({});
  const invalidate = useThree((state) => state.invalidate);
  const gl = useThree((state) => state.gl);
  const background = useMemo(() => new Color("#21172d"), []);
  const purple = useMemo(() => new Color("#21172d"), []);
  const dark = useMemo(() => new Color("#100e18"), []);
  const exitColor = useMemo(
    () => new Color(backgroundColor),
    [backgroundColor],
  );
  const ready = Object.keys(textures).length === Object.keys(assets).length;
  useEffect(() => {
    let cancelled = false;
    const loaded: Texture[] = [];
    Object.entries(assets).forEach(([key, file]) => {
      new TextureLoader().load(
        `/projects/wankultcg/scene/${file}`,
        (texture) => {
          if (cancelled) {
            texture.dispose();
            return;
          }
          texture.colorSpace = SRGBColorSpace;
          texture.anisotropy = Math.min(4, gl.capabilities.getMaxAnisotropy());
          loaded.push(texture);
          setTextures((previous) => ({ ...previous, [key]: texture }));
          invalidate();
        },
        undefined,
        () => {
          // Le panneau conserve sa capture HTML si un visuel manque.
        },
      );
    });
    return () => {
      cancelled = true;
      loaded.forEach((texture) => texture.dispose());
      delete target.dataset.threeReady;
    };
  }, [target, invalidate, gl]);
  useFrame(() => {
    if (!camera.current) return;
    const p = motion.wankulProgress;
    // Les objets portent la chorégraphie ; le cadrage reste calme pendant la lecture.
    const approach = segment(p, 0.11, 0.23) * (1 - segment(p, 0.28, 0.34));
    camera.current.position.set(0, 0, 14 - approach * 0.8);
    camera.current.lookAt(0, 0, 0);
    background
      .copy(purple)
      .lerp(dark, segment(p, 0.04, 0.14))
      .lerp(exitColor, segment(p, 0.975, 0.995));
    if (entry.current) {
      const enter = segment(p, 0, 0.035);
      entry.current.visible = p < 0.1;
      entry.current.scale.setScalar(18 * (1 - enter) + enter * 1.4);
      entry.current.position.set(
        -segment(p, 0.055, 0.1) * 8,
        0.15 * enter,
        -enter * 2,
      );
      entry.current.rotation.set(0, segment(p, 0.045, 0.1) * 1.1, enter * 0.1);
      if (entryFace.current)
        entryFace.current.opacity = segment(p, 0.025, 0.045);
    }
    coins.current.forEach((coin, index) => {
      if (!coin) return;
      const appear = segment(p, 0.756 + index * 0.006, 0.785 + index * 0.006);
      const leave = segment(p, 0.827, 0.853);
      const exchange = segment(p, 0.79, 0.835);
      coin.visible = p >= 0.75 && p < 0.855;
      coin.scale.setScalar(Math.max(0.001, appear * (1 - leave)));
      const side = index < 3 ? -1 : 1;
      coin.position.set(
        side * (2.8 - exchange * 1.3) + (index % 3) * 0.22,
        -1.4 + Math.sin(exchange * Math.PI) * 0.6 + (index % 3) * 0.1,
        2.2,
      );
      coin.rotation.set(Math.PI / 2, exchange * Math.PI, 0.15 * index);
    });
    if (ready) target.setAttribute("data-three-ready", "true");
  });
  return (
    <>
      <primitive object={background} attach="background" />
      <PerspectiveCamera
        ref={camera}
        makeDefault
        position={[0, 0, 14]}
        fov={42}
        near={0.1}
        far={80}
      />
      <ambientLight intensity={1.8} color="#eee6ff" />
      <directionalLight position={[-5, 7, 8]} intensity={3} color="#e9dcff" />
      <directionalLight position={[5, 2, 4]} intensity={2} color="#a4beea" />
      <group visible={ready}>
        <group ref={entry}>
          <RoundedBox args={[1.6, 2.25, 0.035]} radius={0.025} smoothness={3}>
            <meshBasicMaterial color="#21172d" toneMapped={false} />
          </RoundedBox>
          <mesh position={[0, 0, 0.025]}>
            <planeGeometry args={[1.59, 2.24]} />
            <meshBasicMaterial
              ref={entryFace}
              map={textures.back}
              transparent
              opacity={0}
              toneMapped={false}
            />
          </mesh>
        </group>
        {textures.booster && (
          <WankulBooster motion={motion} texture={textures.booster} />
        )}
        <WankulCards motion={motion} textures={textures} />
        {Array.from({ length: 6 }, (_, index) => (
          <group
            key={index}
            ref={(element) => {
              coins.current[index] = element;
            }}
          >
            <mesh>
              <cylinderGeometry args={[0.27, 0.27, 0.055, 40]} />
              <meshStandardMaterial
                color="#d4b779"
                metalness={0.72}
                roughness={0.28}
              />
            </mesh>
            <mesh position={[0, 0.032, 0]} rotation={[-Math.PI / 2, 0, 0]}>
              <ringGeometry args={[0.205, 0.225, 40]} />
              <meshStandardMaterial
                color="#f4daa3"
                metalness={0.6}
                roughness={0.3}
              />
            </mesh>
          </group>
        ))}
      </group>
    </>
  );
}
