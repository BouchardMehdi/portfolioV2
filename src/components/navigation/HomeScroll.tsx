"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { setupHomeScroll } from "@/lib/home-scroll";

export function HomeScroll({ children }: { children: ReactNode }) {
  const root = useRef<HTMLElement>(null);
  useEffect(() => {
    if (root.current) return setupHomeScroll(root.current);
  }, []);
  return (
    <main id="main-content" tabIndex={-1} ref={root} className="home-page">
      {children}
    </main>
  );
}
