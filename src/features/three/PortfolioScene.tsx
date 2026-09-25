"use client";

import { useEffect, useState, type ComponentType, type RefObject } from "react";
import { immersiveMedia, type HomeMotion } from "@/lib/home-motion";
import type { PortfolioCanvasProps, ProjectVisual } from "./scene-types";

type SceneProps = {
  root: RefObject<HTMLElement | null>;
  motion: HomeMotion;
  projects: ProjectVisual[];
};

export function PortfolioScene({ root, motion, projects }: SceneProps) {
  const [scene, setScene] = useState<{
    Canvas: ComponentType<PortfolioCanvasProps>;
    element: HTMLElement;
  } | null>(null);
  useEffect(() => {
    const media = window.matchMedia(immersiveMedia);
    let generation = 0;
    function update() {
      const current = ++generation;
      if (!media.matches) {
        setScene(null);
        return;
      }
      void import("./PortfolioCanvas")
        .then(({ PortfolioCanvas }) => {
          if (current === generation && root.current)
            setScene({ Canvas: PortfolioCanvas, element: root.current });
        })
        .catch(() => {
          if (current === generation) setScene(null);
        });
    }
    update();
    media.addEventListener("change", update);
    return () => {
      generation++;
      media.removeEventListener("change", update);
    };
  }, [root]);
  return scene ? (
    <scene.Canvas root={scene.element} motion={motion} projects={projects} />
  ) : null;
}
