"use client";

import {
  Component,
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { View } from "@react-three/drei";
import { CameraRig } from "./CameraRig";
import { HeroVolume } from "./HeroVolume";
import { SceneLighting } from "./SceneLighting";
import { ProjectScreen } from "./project/ProjectScreen";
import type { PortfolioCanvasProps } from "./scene-types";

function readPalette(root: HTMLElement) {
  const styles = getComputedStyle(root);
  return {
    surface: styles.getPropertyValue("--surface-elevated").trim(),
    border: styles.getPropertyValue("--border").trim(),
    accent: styles.getPropertyValue("--accent").trim(),
    dark: styles.colorScheme === "dark",
  };
}

class SceneBoundary extends Component<
  { children: ReactNode; onFailure: () => void },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch() {
    this.props.onFailure();
  }
  render() {
    return this.state.failed ? null : this.props.children;
  }
}

function RenderSync({
  root,
  motion,
  onFailure,
}: Pick<PortfolioCanvasProps, "root" | "motion"> & { onFailure: () => void }) {
  const invalidate = useThree((state) => state.invalidate);
  const gl = useThree((state) => state.gl);
  useEffect(() => {
    const draw = () => {
      if (!document.hidden) invalidate(2);
    };
    const lost = (event: Event) => {
      event.preventDefault();
      onFailure();
    };
    const unsubscribe = motion.subscribe(draw);
    const resize = new ResizeObserver(draw);
    resize.observe(root);
    window.addEventListener("scroll", draw, { passive: true });
    window.addEventListener("resize", draw);
    document.addEventListener("visibilitychange", draw);
    gl.domElement.addEventListener("webglcontextlost", lost);
    draw();
    return () => {
      unsubscribe();
      resize.disconnect();
      window.removeEventListener("scroll", draw);
      window.removeEventListener("resize", draw);
      document.removeEventListener("visibilitychange", draw);
      gl.domElement.removeEventListener("webglcontextlost", lost);
    };
  }, [root, motion, invalidate, gl, onFailure]);
  useFrame(() => {
    // Chaque vue a son cadrage ; le fond est effacé pour ne pas laisser de traces au scroll.
    gl.setScissorTest(false);
    gl.setClearColor(0x000000, 0);
    gl.clear();
  }, 0);
  return null;
}

export function PortfolioCanvas({
  root,
  motion,
  projects,
}: PortfolioCanvasProps) {
  const [failed, setFailed] = useState(false);
  const [galleryLoaded, setGalleryLoaded] = useState(false);
  const [palette, setPalette] = useState(() => readPalette(root));
  const fail = useCallback(() => setFailed(true), []);
  const targets = useMemo(
    () => ({
      hero: { current: root.querySelector<HTMLElement>(".hero-volume")! },
      projects: projects.map((project) => ({
        current: root.querySelector<HTMLElement>(
          `[data-project-preview="${project.slug}"]`,
        )!,
      })),
    }),
    [root, projects],
  );
  useEffect(() => {
    // Les variables CSS sont lues après l’application du thème au document.
    const observer = new MutationObserver(() => setPalette(readPalette(root)));
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });
    return () => observer.disconnect();
  }, [root]);

  useEffect(() => {
    const section = root.querySelector("#selected-work")!;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setGalleryLoaded(true);
          observer.disconnect();
        }
      },
      { rootMargin: "400px" },
    );
    observer.observe(section);
    return () => observer.disconnect();
  }, [root]);

  useEffect(() => {
    if (failed)
      root
        .querySelectorAll<HTMLElement>("[data-three-ready]")
        .forEach((target) => {
          delete target.dataset.threeReady;
        });
    return () => {
      root
        .querySelectorAll<HTMLElement>("[data-three-ready]")
        .forEach((target) => {
          delete target.dataset.threeReady;
        });
    };
  }, [root, failed]);

  if (failed) return null;
  return (
    <div
      className="portfolio-canvas"
      aria-hidden="true"
      data-theme={palette.dark ? "dark" : "light"}
    >
      <SceneBoundary onFailure={fail}>
        <Canvas
          style={{ pointerEvents: "none" }}
          frameloop="demand"
          dpr={[1, 1.5]}
          camera={{ position: [0, 0, 6], fov: 38, near: 0.1, far: 30 }}
          gl={{ alpha: true, antialias: true, powerPreference: "low-power" }}
        >
          <RenderSync root={root} motion={motion} onFailure={fail} />
          <CameraRig motion={motion} />
          <View track={targets.hero} index={1}>
            <SceneLighting palette={palette} />
            <HeroVolume
              target={targets.hero.current}
              motion={motion}
              palette={palette}
            />
          </View>
          {galleryLoaded &&
            projects.map((project, index) => (
              <View
                key={project.slug}
                track={targets.projects[index]}
                index={index + 2}
              >
                <ProjectScreen
                  project={project}
                  target={targets.projects[index].current}
                />
              </View>
            ))}
        </Canvas>
      </SceneBoundary>
    </div>
  );
}
