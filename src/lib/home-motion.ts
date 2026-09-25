export const immersiveMedia =
  "(min-width: 1024px) and (min-height: 700px) and (hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)";

export function createHomeMotion() {
  const listeners = new Set<() => void>();
  return {
    heroProgress: 0,
    projectPosition: 0,
    invalidate() {
      listeners.forEach((listener) => listener());
    },
    subscribe(listener: () => void) {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
  };
}

export type HomeMotion = ReturnType<typeof createHomeMotion>;
