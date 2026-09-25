import { projectStructurePoint, structure } from "./structure";

const faces = [
  [0, 1, 3, 2],
  [4, 6, 7, 5],
  [0, 4, 5, 1],
  [2, 3, 7, 6],
  [0, 2, 6, 4],
  [1, 5, 7, 3],
];

export function StructureFallback() {
  const polygons = structure
    .flatMap((piece) => {
      const corners = Array.from({ length: 8 }, (_, index) => {
        const x = (index & 1 ? 1 : -1) * (piece.turn ? 0.21 : 0.71);
        const y = (index & 2 ? 1 : -1) * 0.21;
        const z = (index & 4 ? 1 : -1) * (piece.turn ? 0.71 : 0.21);
        return projectStructurePoint([
          x + piece.position[0],
          y + piece.position[1],
          z + piece.position[2],
        ]);
      });
      return faces.map((indices, face) => ({
        depth: indices.reduce((sum, index) => sum + corners[index][2], 0) / 4,
        points: indices
          .map(
            (index) =>
              `${150 + corners[index][0] * 88},${150 - corners[index][1] * 88}`,
          )
          .join(" "),
        accent: piece.accent,
        shade: [0.5, 0.8, 0.45, 1, 0.6, 0.7][face],
      }));
    })
    .sort((a, b) => a.depth - b.depth);
  return (
    <svg
      className="hero-structure-fallback"
      viewBox="0 0 300 300"
      aria-hidden="true"
    >
      {polygons.map((face, index) => (
        <polygon
          key={index}
          points={face.points}
          fill={face.accent ? "var(--accent)" : "var(--muted)"}
          style={{ filter: `brightness(${face.shade})` }}
          stroke="var(--background)"
          strokeWidth="0.5"
        />
      ))}
    </svg>
  );
}
