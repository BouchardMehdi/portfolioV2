import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { RoundedBox } from "@react-three/drei";
import { Color, Group, MeshStandardMaterial, Vector2 } from "three";
import type { HomeMotion } from "@/lib/home-motion";
import { poireSegment as segment } from "@/features/selected-work/poire-story";

const seats = [
  { x: -3.1, z: 0.2, angle: Math.PI / 2, color: "#426b56" },
  { x: 0, z: -2.9, angle: 0, color: "#ad6444" },
  { x: 3.1, z: 0.2, angle: -Math.PI / 2, color: "#698b9c" },
  { x: 0, z: 3, angle: Math.PI, color: "#b18a48" },
] as const;

function Place({ index, motion }: { index: number; motion: HomeMotion }) {
  const root = useRef<Group>(null);
  const person = useRef<Group>(null);
  const bubble = useRef<Group>(null);
  const cushion = useRef<MeshStandardMaterial>(null);
  const reserved = useMemo(() => new Color("#487356"), []);
  const available = useMemo(() => new Color("#d6c6a4"), []);
  const seat = seats[index];
  useFrame(() => {
    const p = motion.poireProgress;
    const assemble = segment(p, 0.335 + index * 0.012, 0.42 + index * 0.012);
    const arrival = segment(p, 0.54 + index * 0.025, 0.595 + index * 0.025);
    const leave = 1 - segment(p, 0.932, 0.961);
    if (root.current) {
      root.current.scale.setScalar(Math.max(0.001, assemble * leave));
      root.current.position.set(
        seat.x * (1.4 - assemble * 0.4),
        -0.12,
        seat.z * (1.4 - assemble * 0.4),
      );
    }
    if (person.current)
      person.current.scale.setScalar(Math.max(0.001, arrival));
    if (cushion.current)
      cushion.current.color
        .copy(available)
        .lerp(reserved, index === 0 ? segment(p, 0.445, 0.48) : arrival);
    if (bubble.current) {
      const appear =
        segment(p, 0.65 + index * 0.008, 0.675 + index * 0.008) *
        (1 - segment(p, 0.715, 0.74));
      bubble.current.scale.setScalar(Math.max(0.001, appear));
    }
  });
  return (
    <group ref={root} rotation={[0, seat.angle, 0]}>
      <RoundedBox
        args={[1.15, 0.18, 1.05]}
        position={[0, -0.9, 0]}
        radius={0.12}
        smoothness={3}
      >
        <meshStandardMaterial color="#987346" roughness={0.85} />
      </RoundedBox>
      <RoundedBox
        args={[1, 0.13, 0.9]}
        position={[0, -0.79, 0]}
        radius={0.08}
        smoothness={3}
      >
        <meshStandardMaterial ref={cushion} color="#d6c6a4" roughness={1} />
      </RoundedBox>
      <RoundedBox
        args={[1.08, 1, 0.14]}
        position={[0, -0.18, -0.48]}
        radius={0.12}
        smoothness={3}
      >
        <meshStandardMaterial color="#af8b5c" roughness={0.9} />
      </RoundedBox>
      {[-0.4, 0.4].flatMap((x) =>
        [-0.35, 0.35].map((z) => (
          <mesh key={`${x}-${z}`} position={[x, -1.6, z]}>
            <cylinderGeometry args={[0.055, 0.075, 1.35, 8]} />
            <meshStandardMaterial color="#846140" roughness={0.9} />
          </mesh>
        )),
      )}
      <group position={[0, 0.19, 1.1]} rotation={[-Math.PI / 2, 0, 0]}>
        <mesh>
          <circleGeometry args={[0.45, 40]} />
          <meshStandardMaterial color="#f6f1e2" roughness={0.5} />
        </mesh>
        <mesh position={[0, 0, 0.016]}>
          <ringGeometry args={[0.33, 0.365, 40]} />
          <meshStandardMaterial color="#c9d2b8" roughness={0.8} />
        </mesh>
        {[-0.57, 0.57].map((x) => (
          <RoundedBox
            key={x}
            args={[0.045, 0.65, 0.026]}
            position={[x, 0, 0.02]}
            radius={0.016}
            smoothness={2}
          >
            <meshStandardMaterial
              color="#a9aaa0"
              metalness={0.65}
              roughness={0.35}
            />
          </RoundedBox>
        ))}
      </group>
      <group ref={person} position={[0, -0.66, 0.04]}>
        <mesh position={[0, 0.53, 0]}>
          <capsuleGeometry args={[0.29, 0.48, 5, 16]} />
          <meshStandardMaterial color={seat.color} roughness={0.95} />
        </mesh>
        <mesh position={[0, 1.24, 0]}>
          <sphereGeometry args={[0.24, 20, 16]} />
          <meshStandardMaterial color="#d7b68a" roughness={0.95} />
        </mesh>
        {[-0.2, 0.2].map((x) => (
          <mesh key={x} position={[x, -0.53, 0.33]} rotation={[0.1, 0, 0]}>
            <capsuleGeometry args={[0.12, 0.67, 4, 12]} />
            <meshStandardMaterial color="#494e40" roughness={1} />
          </mesh>
        ))}
      </group>
      <group
        ref={bubble}
        position={[0, 1.55, 0]}
        rotation={[0, -seat.angle, 0]}
      >
        <RoundedBox args={[0.8, 0.38, 0.09]} radius={0.16} smoothness={3}>
          <meshStandardMaterial color="#f9f5e9" roughness={0.9} />
        </RoundedBox>
        {[-0.2, 0, 0.2].map((x) => (
          <mesh key={x} position={[x, 0, 0.06]}>
            <sphereGeometry args={[0.038, 10, 10]} />
            <meshBasicMaterial color="#3c634b" />
          </mesh>
        ))}
      </group>
    </group>
  );
}

export function PoireTable({ motion }: { motion: HomeMotion }) {
  const root = useRef<Group>(null);
  const surface = useRef<Group>(null);
  const legs = useRef<Group>(null);
  const fruit = useRef<Group>(null);
  const pear = useMemo(
    () => [
      new Vector2(0, 0),
      new Vector2(0.16, 0.025),
      new Vector2(0.23, 0.15),
      new Vector2(0.21, 0.3),
      new Vector2(0.13, 0.43),
      new Vector2(0.09, 0.55),
      new Vector2(0, 0.59),
    ],
    [],
  );
  useFrame(() => {
    const p = motion.poireProgress;
    const enter = segment(p, 0.31, 0.405);
    const exit = segment(p, 0.94, 0.974);
    if (root.current) {
      root.current.visible = p > 0.305 && p < 0.978;
      const reading = segment(p, 0.7, 0.752) * (1 - segment(p, 0.925, 0.96));
      root.current.scale.setScalar(1 - reading * 0.2);
      root.current.position.z = -reading * 1.8;
      root.current.position.y = reading * 1.2;
    }
    if (surface.current)
      surface.current.scale.set(
        Math.max(0.001, enter * (1 - exit)),
        Math.max(0.001, enter),
        Math.max(0.001, enter * (1 - exit)),
      );
    if (legs.current) {
      legs.current.visible = p < 0.965;
      legs.current.scale.y = Math.max(
        0.001,
        segment(p, 0.335, 0.42) * (1 - exit),
      );
    }
    if (fruit.current)
      fruit.current.scale.setScalar(
        Math.max(0.001, segment(p, 0.43, 0.5) * (1 - segment(p, 0.93, 0.956))),
      );
  });
  return (
    <group ref={root}>
      <group ref={surface}>
        <mesh scale={[1.12, 1, 1]} position={[0, -0.1, 0]}>
          <cylinderGeometry args={[2.55, 2.5, 0.23, 80]} />
          <meshStandardMaterial color="#c29a64" roughness={0.86} />
        </mesh>
        <mesh
          rotation={[-Math.PI / 2, 0, 0]}
          position={[0, 0.025, 0]}
          scale={[1.12, 1, 1]}
        >
          <ringGeometry args={[2.4, 2.43, 80]} />
          <meshStandardMaterial color="#aa8553" roughness={1} />
        </mesh>
        <RoundedBox
          args={[0.9, 0.012, 4.6]}
          position={[0, 0.03, 0]}
          radius={0.005}
          smoothness={2}
        >
          <meshStandardMaterial color="#758468" roughness={1} />
        </RoundedBox>
      </group>
      <group ref={legs}>
        {[-1.7, 1.7].flatMap((x) =>
          [-1.5, 1.5].map((z) => (
            <mesh key={`${x}-${z}`} position={[x, -1.35, z]}>
              <cylinderGeometry args={[0.12, 0.08, 2.45, 12]} />
              <meshStandardMaterial color="#947044" roughness={0.9} />
            </mesh>
          )),
        )}
      </group>
      {seats.map((_, index) => (
        <Place key={index} index={index} motion={motion} />
      ))}
      <group ref={fruit} position={[0, 0.17, 0]}>
        {[-0.24, 0.24].map((x, index) => (
          <group
            key={x}
            position={[x, 0, index === 0 ? -0.12 : 0.13]}
            rotation={[0, index, index === 0 ? -0.12 : 0.08]}
          >
            <mesh>
              <latheGeometry args={[pear, 24]} />
              <meshStandardMaterial
                color={index === 0 ? "#93a14f" : "#c2ac57"}
                roughness={0.9}
              />
            </mesh>
            <mesh position={[0.016, 0.63, 0]} rotation={[0, 0, -0.2]}>
              <cylinderGeometry args={[0.016, 0.02, 0.13, 8]} />
              <meshStandardMaterial color="#685335" />
            </mesh>
            <mesh
              position={[0.1, 0.64, 0]}
              rotation={[0.4, 0, -0.45]}
              scale={[1.8, 0.25, 1]}
            >
              <sphereGeometry args={[0.09, 12, 8]} />
              <meshStandardMaterial color="#567443" roughness={0.9} />
            </mesh>
          </group>
        ))}
      </group>
    </group>
  );
}
