import type { HomeMotion } from "@/lib/home-motion";

export type ProjectVisual = {
  slug: string;
  texture: string;
  aspect: number;
  accent: string;
};

export type PortfolioCanvasProps = {
  root: HTMLElement;
  motion: HomeMotion;
  projects: ProjectVisual[];
};

export type ScenePalette = {
  surface: string;
  border: string;
  accent: string;
  dark: boolean;
};
