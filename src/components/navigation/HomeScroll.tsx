"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { setupHomeScroll } from "@/lib/home-scroll";
import { createHomeMotion } from "@/lib/home-motion";
import { PortfolioScene } from "@/features/three/PortfolioScene";
import type { ProjectVisual } from "@/features/three/scene-types";

export function HomeScroll({
  children,
  projects,
}: {
  children: ReactNode;
  projects: ProjectVisual[];
}) {
  const [motion] = useState(createHomeMotion);
  const root = useRef<HTMLElement>(null);
  useEffect(() => {
    if (root.current) return setupHomeScroll(root.current, motion);
  }, [motion]);
  return (
    <main id="main-content" tabIndex={-1} ref={root} className="home-page">
      {children}
      <PortfolioScene root={root} motion={motion} projects={projects} />
    </main>
  );
}
