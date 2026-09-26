import { gsap } from "gsap";

export function createAboutScroll(root: HTMLElement) {
  root.querySelectorAll<HTMLElement>(".journey-entry").forEach((entry) => {
    gsap.fromTo(
      entry,
      { opacity: 0, y: 24 },
      {
        opacity: 1,
        y: 0,
        duration: 0.55,
        ease: "power2.out",
        scrollTrigger: {
          trigger: entry,
          start: "top 88%",
          toggleActions: "play none none reverse",
        },
      },
    );
  });
}
