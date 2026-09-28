import { useEffect, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Line, PerspectiveCamera } from "@react-three/drei";
import { Group, Mesh, PerspectiveCamera as ThreeCamera } from "three";
import type { HomeMotion } from "@/lib/home-motion";
import { riverSegment } from "@/features/selected-work/river-story";

const orange = "#FF8A54";
const players: [number, number, number][] = [
  [-2.1, 1.15, 0],
  [2.1, 1.15, 0],
  [-2.1, -1.15, 0],
  [2.1, -1.15, 0],
];
const shell: {
  position: [number, number, number];
  size: [number, number, number];
  exit: [number, number, number];
  color: string;
}[] = [
  {
    position: [-1.8, 0.2, 0],
    size: [0.24, 3.8, 1.1],
    exit: [-4, 0, -1],
    color: "#89909a",
  },
  {
    position: [1.8, 0.2, 0],
    size: [0.24, 3.8, 1.1],
    exit: [4, 0, -1],
    color: "#89909a",
  },
  {
    position: [0, 2, 0],
    size: [3.84, 0.45, 1.1],
    exit: [0, 3, 0],
    color: "#414750",
  },
  {
    position: [0, 1.47, 0.08],
    size: [3.4, 0.55, 0.8],
    exit: [0, 2.8, -1],
    color: "#1b2028",
  },
  {
    position: [0, -0.85, 0.06],
    size: [3.45, 0.2, 1.35],
    exit: [0, -2, 0],
    color: "#59616c",
  },
  {
    position: [0, -1.55, -0.12],
    size: [3.4, 1.15, 0.95],
    exit: [0, -3, -1],
    color: "#292e38",
  },
  {
    position: [0, -2.2, 0],
    size: [3.85, 0.2, 1.2],
    exit: [0, -3.5, 0],
    color: "#89909a",
  },
];

export function RiverWorld({
  target,
  motion,
}: {
  target: HTMLElement;
  motion: HomeMotion;
}) {
  const camera = useRef<ThreeCamera>(null);
  const machine = useRef<Group>(null);
  const pieces = useRef<(Mesh | null)[]>([]);
  const reels = useRef<(Group | null)[]>([]);
  const details = useRef<Group>(null);
  const table = useRef<Group>(null);
  const connections = useRef<Group>(null);
  const markers = useRef<(Group | null)[]>([]);
  const card = useRef<Group>(null);
  const cardFace = useRef<Mesh>(null);

  useEffect(
    () => () => {
      target.removeAttribute("data-three-ready");
    },
    [target],
  );

  useFrame(() => {
    if (!camera.current || !machine.current || !table.current || !card.current)
      return;
    const p = motion.riverProgress;
    target.setAttribute("data-three-ready", "true");
    const opening = riverSegment(p, 0.2, 0.3);
    const approach = riverSegment(p, 0, 0.12);
    const through = riverSegment(p, 0.24, 0.34);
    const toTable = riverSegment(p, 0.44, 0.53);
    const toDashboard = riverSegment(p, 0.65, 0.72);
    camera.current.position.set(
      0,
      0,
      12 - approach * 3.5 - through * 10 - toTable * 5.5 - toDashboard * 8,
    );
    camera.current.lookAt(0, 0, camera.current.position.z - 10);
    camera.current.updateMatrixWorld();
    machine.current.visible = p < 0.35;
    machine.current.rotation.y = -0.18 * (1 - through);
    shell.forEach((piece, index) => {
      pieces.current[index]?.position.set(
        ...(piece.position.map(
          (value, axis) => value + piece.exit[axis] * opening,
        ) as [number, number, number]),
      );
    });
    reels.current.forEach((reel, index) => {
      if (!reel) return;
      reel.position.set(
        (index - 1) * (1.08 + opening * 4),
        0.3 + (index === 1 ? opening * 4 : 0),
        0.15,
      );
      reel.rotation.x =
        Math.PI *
        6 *
        riverSegment(p, 0.045 + index * 0.012, 0.18 + index * 0.01);
    });
    if (details.current) details.current.scale.setScalar(1 - opening);
    table.current.visible = p >= 0.46 && p < 0.72;
    table.current.position.y = -riverSegment(p, 0.65, 0.72) * 3;
    table.current.rotation.x = 0.95 - riverSegment(p, 0.49, 0.57) * 0.15;
    markers.current.forEach((marker, index) =>
      marker?.scale.setScalar(
        riverSegment(p, 0.5 + index * 0.012, 0.56 + index * 0.012),
      ),
    );
    if (connections.current)
      connections.current.scale.setScalar(riverSegment(p, 0.54, 0.6));
    card.current.visible = p >= 0.94;
    card.current.position.z = -22 + riverSegment(p, 0.95, 1) * 4;
    card.current.rotation.y = riverSegment(p, 0.95, 1) * Math.PI;
    card.current.scale.setScalar(0.3 + riverSegment(p, 0.94, 1) * 1.5);
    if (cardFace.current) cardFace.current.visible = p < 0.985;
  });

  return (
    <>
      <PerspectiveCamera
        ref={camera}
        makeDefault
        position={[0, 0, 12]}
        fov={38}
        near={0.1}
        far={60}
      />
      <ambientLight intensity={1.25} />
      <directionalLight position={[3, 5, 8]} intensity={3} />
      <directionalLight position={[-5, 0, 2]} color={orange} intensity={1.4} />
      <pointLight
        position={[0, 2, -12]}
        color={orange}
        intensity={35}
        distance={18}
      />
      <group ref={machine}>
        {shell.map((piece, index) => (
          <mesh
            key={index}
            position={piece.position}
            ref={(element) => {
              pieces.current[index] = element;
            }}
            onAfterRender={() =>
              target.setAttribute("data-three-ready", "true")
            }
          >
            <boxGeometry args={piece.size} />
            <meshStandardMaterial
              color={piece.color}
              metalness={0.55}
              roughness={0.35}
            />
          </mesh>
        ))}
        {[0, 1, 2].map((index) => (
          <group
            key={index}
            ref={(element) => {
              reels.current[index] = element;
            }}
            position={[(index - 1) * 1.08, 0.3, 0.15]}
          >
            <mesh rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.76, 0.76, 0.94, 32]} />
              <meshStandardMaterial color="#ddd9cb" roughness={0.65} />
            </mesh>
            {Array.from({ length: 8 }, (_, symbol) => {
              const angle = (symbol * Math.PI) / 4;
              return (
                <mesh
                  key={symbol}
                  position={[
                    0,
                    Math.sin(angle) * 0.765,
                    Math.cos(angle) * 0.765,
                  ]}
                  rotation={[-angle, 0, Math.PI / 4]}
                >
                  <boxGeometry args={[0.27, 0.27, 0.02]} />
                  <meshStandardMaterial
                    color={symbol % 2 === 0 ? orange : "#252b35"}
                  />
                </mesh>
              );
            })}
          </group>
        ))}
        <group ref={details}>
          <mesh position={[0, 1.47, 0.5]}>
            <boxGeometry args={[2.7, 0.045, 0.02]} />
            <meshBasicMaterial color={orange} />
          </mesh>
          <mesh position={[0, -1.38, 0.38]}>
            <boxGeometry args={[1.3, 0.11, 0.04]} />
            <meshBasicMaterial color="#111318" />
          </mesh>
          <mesh position={[2.15, 0.3, 0]}>
            <cylinderGeometry args={[0.07, 0.07, 1.4, 12]} />
            <meshStandardMaterial
              color="#89909a"
              metalness={0.7}
              roughness={0.3}
            />
          </mesh>
          <mesh position={[2.15, 1.05, 0]}>
            <sphereGeometry args={[0.22, 16, 16]} />
            <meshStandardMaterial color={orange} />
          </mesh>
        </group>
      </group>
      <group ref={table} position={[0, 0, -16]}>
        <mesh scale={[1.7, 1, 1]}>
          <cylinderGeometry args={[1.35, 1.35, 0.16, 48]} />
          <meshStandardMaterial
            color="#4b535a"
            metalness={0.3}
            roughness={0.6}
          />
        </mesh>
        <mesh position={[0, 0.1, 0]} scale={[1.7, 1, 1]}>
          <cylinderGeometry args={[1.22, 1.22, 0.02, 48]} />
          <meshStandardMaterial color="#1e4140" roughness={1} />
        </mesh>
        <group rotation={[Math.PI / 2, 0, 0]} position={[0, 0.3, 0]}>
          {[-0.65, -0.32, 0, 0.32, 0.65].map((x) => (
            <mesh key={x} position={[x, 0, 0]}>
              <boxGeometry args={[0.25, 0.36, 0.025]} />
              <meshStandardMaterial color="#ece6d5" />
            </mesh>
          ))}
        </group>
        {players.map(([x, y], index) => (
          <group
            key={index}
            position={[x, y * 1.45, 0]}
            ref={(element) => {
              markers.current[index] = element;
            }}
          >
            <mesh>
              <sphereGeometry args={[0.14, 16, 16]} />
              <meshStandardMaterial color={orange} />
            </mesh>
            <mesh position={[0, -0.28, 0]}>
              <boxGeometry args={[0.55, 0.055, 0.05]} />
              <meshBasicMaterial color="#aeb6bc" />
            </mesh>
          </group>
        ))}
        <group ref={connections}>
          <mesh position={[0, 0.7, 0.3]} rotation={[0, Math.PI / 4, 0]}>
            <boxGeometry args={[0.3, 0.3, 0.3]} />
            <meshStandardMaterial color={orange} />
          </mesh>
          {players.map(([x, y], index) => (
            <Line
              key={index}
              points={[
                [0, 0.7, 0.3],
                [x, y * 1.45, 0],
              ]}
              color={orange}
              lineWidth={1.2}
              transparent
              opacity={0.65}
            />
          ))}
        </group>
      </group>
      <group ref={card}>
        <mesh>
          <boxGeometry args={[1.4, 2, 0.045]} />
          <meshStandardMaterial color="#ede5d3" roughness={0.8} />
        </mesh>
        <mesh
          ref={cardFace}
          position={[0, 0, 0.026]}
          rotation={[0, 0, Math.PI / 4]}
        >
          <planeGeometry args={[0.4, 0.4]} />
          <meshBasicMaterial color={orange} />
        </mesh>
        <group rotation={[0, Math.PI, 0]} position={[0, 0, -0.026]}>
          <mesh>
            <planeGeometry args={[1.25, 1.85]} />
            <meshBasicMaterial color="#76A989" />
          </mesh>
          <Line
            points={[
              [-0.55, -0.65, 0.01],
              [-0.15, -0.25, 0.01],
              [0.4, -0.2, 0.01],
              [0.1, 0.65, 0.01],
            ]}
            color="#ede5d3"
            lineWidth={3}
          />
          <mesh position={[0.1, 0.25, 0.02]}>
            <circleGeometry args={[0.12, 24]} />
            <meshBasicMaterial color="#ede5d3" />
          </mesh>
        </group>
      </group>
    </>
  );
}
