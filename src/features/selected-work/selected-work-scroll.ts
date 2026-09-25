import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export function createSelectedWorkScroll(
  section: HTMLElement,
  headerHeight: () => number,
  onPosition: (position: number) => void,
) {
  const stage = section.querySelector<HTMLElement>(".selected-work__stage")!;
  const viewport = section.querySelector<HTMLElement>(
    ".selected-work__viewport",
  )!;
  const track = section.querySelector<HTMLElement>(".selected-work__track")!;
  const panels = Array.from(
    section.querySelectorAll<HTMLElement>(".work-panel"),
  );
  const links = Array.from(
    section.querySelectorAll<HTMLAnchorElement>(".work-pagination a"),
  );
  const counter = section.querySelector<HTMLElement>("[data-work-current]")!;
  let exiting = false;
  let exitTween: gsap.core.Tween | undefined;
  let active = -1;
  section.dataset.horizontal = "true";

  function updateActiveProject() {
    onPosition(-Number(gsap.getProperty(track, "x")) / viewport.clientWidth);
    const index = Math.max(
      0,
      Math.min(
        panels.length - 1,
        Math.round(
          -Number(gsap.getProperty(track, "x")) / viewport.clientWidth,
        ),
      ),
    );
    if (index === active) return;
    active = index;
    counter.textContent = String(index + 1).padStart(2, "0");
    panels.forEach((panel, i) => {
      panel.inert = i !== index;
    });
    links.forEach((link, i) => {
      if (i === index) link.setAttribute("aria-current", "step");
      else link.removeAttribute("aria-current");
    });
  }

  const timeline = gsap.timeline({
    paused: true,
    onUpdate: updateActiveProject,
  });
  panels.forEach((_, index) => {
    if (index > 0)
      timeline.to(track, {
        x: () => -index * viewport.clientWidth,
        duration: 0.35,
        ease: "none",
      });
    timeline.addLabel(`project-${index}`).to({}, { duration: 0.65 });
  });

  const trigger = ScrollTrigger.create({
    trigger: section,
    pin: stage,
    start: () => `top top+=${headerHeight()}`,
    end: () => `+=${panels.length * Math.max(650, window.innerHeight * 0.85)}`,
    anticipatePin: 1,
    onRefresh: (self) => {
      timeline.invalidate().progress(self.progress);
      updateActiveProject();
    },
    onUpdate: (self) => {
      // Le pin reste mesuré pendant la sortie, mais le scroll ne pilote plus la timeline.
      if (!exiting) timeline.progress(self.progress);
    },
  });
  updateActiveProject();

  function cancelExit() {
    exitTween?.kill();
    exitTween = undefined;
    exiting = false;
    timeline.progress(trigger.progress);
  }

  return {
    positionFor(id: string) {
      const index = panels.findIndex((panel) => panel.id === id);
      if (id === section.id) return trigger.start;
      if (index < 0) return undefined;
      const time = timeline.labels[`project-${index}`] + 0.2;
      return (
        trigger.start +
        (time / timeline.duration()) * (trigger.end - trigger.start)
      );
    },
    leave(complete: () => void) {
      if (exiting) return;
      if (!trigger.isActive) {
        complete();
        return;
      }
      exiting = true;
      exitTween = gsap.to(timeline, {
        progress: 1,
        duration: 0.55,
        ease: "power2.inOut",
        onComplete: () => {
          exiting = false;
          exitTween = undefined;
          complete();
        },
      });
    },
    cancelExit,
    destroy() {
      exitTween?.kill();
      trigger.kill();
      timeline.revert();
      delete section.dataset.horizontal;
      panels.forEach((panel) => {
        panel.inert = false;
      });
      links.forEach((link) => link.removeAttribute("aria-current"));
      counter.textContent = "01";
    },
  };
}
