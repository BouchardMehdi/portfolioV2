import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { PerspectiveCamera, RoundedBox } from "@react-three/drei";
import {
  CanvasTexture,
  Color,
  Group,
  MeshStandardMaterial,
  MeshBasicMaterial,
  PerspectiveCamera as ThreeCamera,
  SRGBColorSpace,
  Vector3,
} from "three";
import type { HomeMotion } from "@/lib/home-motion";
import { poireSegment as segment } from "@/features/selected-work/poire-story";
import { createMealMapTexture } from "./meal-map-texture";
import { PoireTable } from "./PoireTable";
import { PoireInterface } from "./PoireInterface";

type Shot = {
  at: number;
  eye: [number, number, number];
  look: [number, number, number];
};
const shots: Shot[] = [
  { at: 0, eye: [0, 1, 6], look: [0, 1, 0] },
  { at: 0.1, eye: [0, 11, 8], look: [0, 0, 0] },
  { at: 0.21, eye: [0, 11, 8], look: [0, 0, 0] },
  { at: 0.3, eye: [0, 1.5, 1.2], look: [0, -0.7, 0] },
  { at: 0.405, eye: [0, 9, 13.8], look: [0, -0.25, 0] },
  { at: 0.67, eye: [0, 9, 13.8], look: [0, -0.25, 0] },
  { at: 0.752, eye: [0, 4.7, 13.5], look: [0, 2.7, 0] },
  { at: 0.925, eye: [0, 4.7, 13.5], look: [0, 2.7, 0] },
  { at: 0.96, eye: [0, 11, 0.01], look: [0, 0, 0] },
  { at: 1, eye: [0, 11, 0.01], look: [0, 0, 0] },
];

function invitationTexture(back: boolean) {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 720;
  const context = canvas.getContext("2d")!;
  context.fillStyle = back ? "#21172d" : "#f4edda";
  context.fillRect(0, 0, 512, 720);
  context.strokeStyle = back ? "#aa8cd4" : "#768965";
  context.lineWidth = 3;
  context.strokeRect(25, 25, 462, 670);
  context.fillStyle = back ? "#d6bde9" : "#355a40";
  context.textAlign = "center";
  context.font = "500 24px sans-serif";
  context.fillText(back ? "03 / 03" : "RAMÈNETAPOIRE", 256, 150);
  context.font = "600 55px sans-serif";
  context.fillText(back ? "WANKUL" : "À TABLE", 256, 340);
  context.fillText(back ? "TCG" : "", 256, 410);
  context.font = "400 18px sans-serif";
  context.fillText(
    back ? "PROJET FAN-MADE NON OFFICIEL" : "DÉCOUVRIR · RÉSERVER · PARTAGER",
    256,
    590,
  );
  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  return texture;
}

export function PoireWorld({
  target,
  motion,
}: {
  target: HTMLElement;
  motion: HomeMotion;
}) {
  const camera = useRef<ThreeCamera>(null);
  const map = useRef<Group>(null);
  const pins = useRef<(Group | null)[]>([]);
  const plate = useRef<Group>(null);
  const rim = useRef<MeshStandardMaterial>(null);
  const well = useRef<Group>(null);
  const invitation = useRef<Group>(null);
  const cardBack = useRef<MeshBasicMaterial>(null);
  const cardEdge = useRef<MeshStandardMaterial>(null);
  const textures = useMemo(
    () => ({
      map: createMealMapTexture(),
      front: invitationTexture(false),
      back: invitationTexture(true),
    }),
    [],
  );
  const look = useMemo(() => new Vector3(), []);
  const background = useMemo(() => new Color("#e6e1ce"), []);
  const cream = useMemo(() => new Color("#e6e1ce"), []);
  const violet = useMemo(() => new Color("#21172d"), []);
  const green = useMemo(() => new Color("#315c43"), []);
  const ceramic = useMemo(() => new Color("#f6f1e2"), []);
  useEffect(
    () => () => {
      Object.values(textures).forEach((texture) => texture.dispose());
      delete target.dataset.threeReady;
    },
    [textures, target],
  );

  useFrame(() => {
    if (!camera.current) return;
    const p = motion.poireProgress;
    const index = Math.max(
      0,
      shots.findLastIndex((shot) => p >= shot.at),
    );
    const from = shots[index],
      to = shots[Math.min(index + 1, shots.length - 1)];
    const t = from === to ? 0 : segment(p, from.at, to.at);
    camera.current.position.set(
      ...(from.eye.map((value, i) => value + (to.eye[i] - value) * t) as [
        number,
        number,
        number,
      ]),
    );
    look.set(
      ...(from.look.map((value, i) => value + (to.look[i] - value) * t) as [
        number,
        number,
        number,
      ]),
    );
    camera.current.lookAt(look);
    camera.current.updateMatrixWorld();
    const unfold = segment(p, 0, 0.1);
    if (map.current) {
      map.current.position.y = 1 - 1.8 * unfold;
      map.current.rotation.x = (-Math.PI / 2) * unfold;
      map.current.scale.setScalar(Math.max(0.001, 1 - segment(p, 0.305, 0.36)));
      map.current.visible = p < 0.365;
    }
    pins.current.forEach((pin, i) => {
      if (!pin) return;
      const appearance =
        i === 0 ? 1 : segment(p, 0.04 + i * 0.018, 0.1 + i * 0.018);
      const selection =
        i === 0 ? 1 - segment(p, 0.2, 0.26) : 1 - segment(p, 0.18, 0.245);
      pin.scale.setScalar(Math.max(0.001, appearance * selection));
    });
    if (plate.current) {
      const enter = segment(p, 0.12, 0.19);
      const portal = segment(p, 0.235, 0.3);
      const settle = segment(p, 0.3, 0.4);
      const exit = 1 - segment(p, 0.932, 0.959);
      const size = (0.3 + portal * 3.3) * (1 - settle) + 0.75 * settle;
      plate.current.scale.setScalar(Math.max(0.001, size * enter * exit));
      plate.current.position.y = -0.65 + settle * 0.82;
      plate.current.visible = p > 0.12 && p < 0.96;
      if (rim.current)
        rim.current.color.copy(green).lerp(ceramic, segment(p, 0.27, 0.345));
      if (well.current)
        well.current.scale.setScalar(Math.max(0.001, segment(p, 0.278, 0.316)));
    }
    if (invitation.current) {
      const lift = segment(p, 0.933, 0.962);
      const flip = segment(p, 0.961, 0.981);
      const fill = segment(p, 0.979, 1);
      invitation.current.visible = p > 0.37;
      invitation.current.position.set(
        1.2 * (1 - lift),
        0.07 + lift * 0.5,
        0.5 * (1 - lift),
      );
      invitation.current.rotation.set(
        -Math.PI / 2,
        Math.PI * flip,
        0.15 * (1 - lift),
      );
      invitation.current.scale.set(
        0.7 + lift * 0.8 + fill * 17,
        0.7 + lift * 0.8 + fill * 9,
        1,
      );
      if (cardBack.current)
        cardBack.current.opacity = 1 - segment(p, 0.983, 0.998);
      if (cardEdge.current)
        cardEdge.current.color
          .copy(cream)
          .lerp(violet, segment(p, 0.98, 0.986));
    }
    background.copy(cream).lerp(violet, segment(p, 0.977, 0.993));
    target.setAttribute("data-three-ready", "true");
  });
  return (
    <>
      <primitive object={background} attach="background" />
      <PerspectiveCamera
        ref={camera}
        makeDefault
        position={[0, 1, 6]}
        fov={42}
        near={0.06}
        far={90}
      />
      <ambientLight intensity={1.6} color="#fff4df" />
      <directionalLight position={[-4, 8, 5]} intensity={2.4} color="#fff2d3" />
      <directionalLight position={[5, 4, -4]} intensity={1.2} color="#d2e2d1" />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2.6, 0]}>
        <planeGeometry args={[150, 150]} />
        <meshBasicMaterial color={background} toneMapped={false} />
      </mesh>
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -2.58, 0]}
        scale={[1.25, 1, 1]}
      >
        <circleGeometry args={[3.6, 64]} />
        <meshBasicMaterial
          color="#897f61"
          transparent
          opacity={0.12}
          depthWrite={false}
        />
      </mesh>
      <group ref={map} position={[0, 1, 0]}>
        <mesh>
          <planeGeometry args={[17.835, 11.375]} />
          <meshBasicMaterial map={textures.map} toneMapped={false} />
        </mesh>
        {[
          [3.48, 1.17],
          [-3.6, 1.6],
          [2.2, -2.6],
          [-4.5, -2.2],
        ].map(([x, y], index) => (
          <group
            ref={(element) => {
              pins.current[index] = element;
            }}
            key={index}
            position={[x, y, 0.06]}
          >
            <mesh>
              <sphereGeometry args={[0.128, 20, 16]} />
              <meshBasicMaterial color="#315c43" />
            </mesh>
            <mesh position={[0, 0, -0.015]}>
              <ringGeometry args={[0.184, 0.208, 40]} />
              <meshBasicMaterial color="#315c43" />
            </mesh>
          </group>
        ))}
      </group>
      <group ref={plate} rotation={[-Math.PI / 2, 0, 0]}>
        <mesh>
          <torusGeometry args={[1, 0.075, 12, 64]} />
          <meshStandardMaterial ref={rim} color="#315c43" roughness={0.55} />
        </mesh>
        <group ref={well}>
          <mesh position={[0, 0, -0.035]}>
            <circleGeometry args={[0.97, 64]} />
            <meshStandardMaterial color="#e8e8d5" roughness={0.65} />
          </mesh>
          <mesh position={[0, 0, -0.026]}>
            <ringGeometry args={[0.74, 0.77, 64]} />
            <meshStandardMaterial color="#d2d8bc" roughness={0.7} />
          </mesh>
        </group>
      </group>
      <PoireTable motion={motion} />
      <PoireInterface motion={motion} target={target} />
      <group ref={invitation}>
        <RoundedBox args={[1.6, 2.25, 0.035]} radius={0.025} smoothness={3}>
          <meshStandardMaterial ref={cardEdge} color="#e4dcca" roughness={1} />
        </RoundedBox>
        <mesh position={[0, 0, 0.022]}>
          <planeGeometry args={[1.59, 2.24]} />
          <meshBasicMaterial map={textures.front} toneMapped={false} />
        </mesh>
        <mesh position={[0, 0, -0.022]} rotation={[0, Math.PI, 0]}>
          <planeGeometry args={[1.59, 2.24]} />
          <meshBasicMaterial
            ref={cardBack}
            map={textures.back}
            transparent
            toneMapped={false}
          />
        </mesh>
      </group>
    </>
  );
}
