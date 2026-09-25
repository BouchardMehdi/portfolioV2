type Point = [number, number, number];

export const structure = [-0.68, 0, 0.68].flatMap((y, layer) =>
  [
    { position: [-0.22, y, 0.72] as Point, turn: 0 },
    { position: [0.72, y, 0.22] as Point, turn: Math.PI / 2 },
    { position: [0.22, y, -0.72] as Point, turn: 0 },
    { position: [-0.72, y, -0.22] as Point, turn: Math.PI / 2 },
  ].map((piece, side) => ({
    ...piece,
    accent: layer === 1 && side === 0,
    spin: [
      (side % 2 ? -1 : 1) * 0.3,
      (layer - 1) * 0.4,
      (side - 1.5) * 0.2,
    ] as Point,
  })),
);

export function projectStructurePoint([x, y, z]: Point): Point {
  const yaw = -0.55;
  const pitch = 0.32;
  const xx = x * Math.cos(yaw) + z * Math.sin(yaw);
  const zz = -x * Math.sin(yaw) + z * Math.cos(yaw);
  return [
    xx,
    y * Math.cos(pitch) - zz * Math.sin(pitch),
    y * Math.sin(pitch) + zz * Math.cos(pitch),
  ];
}
