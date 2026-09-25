import type { ScenePalette } from "./scene-types";

export function SceneLighting({ palette }: { palette: ScenePalette }) {
  return (
    <>
      <ambientLight intensity={palette.dark ? 1.4 : 2} />
      <directionalLight
        position={[3, 5, 6]}
        intensity={palette.dark ? 3 : 2.5}
      />
      <directionalLight
        position={[-4, -1, 2]}
        intensity={0.8}
        color={palette.accent}
      />
    </>
  );
}
