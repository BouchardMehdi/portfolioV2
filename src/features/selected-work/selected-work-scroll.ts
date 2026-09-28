import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import type { HomeMotion } from "@/lib/home-motion";
import {
  riverBeatIndex,
  riverBeats,
  riverDuration,
  riverSegment,
} from "./river-story";

export function createSelectedWorkScroll(
  section: HTMLElement,
  headerHeight: () => number,
  motion: HomeMotion,
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
  const next = section.querySelector<HTMLAnchorElement>("[data-next-project]")!;
  const river = section.querySelector<HTMLElement>(".river-panel");
  const beats = river?.querySelectorAll<HTMLElement>("[data-river-beat]");
  const setTrackX = gsap.quickSetter(track, "x", "px");
  let exiting = false;
  let exitTween: gsap.core.Tween | undefined;
  let active = -1;
  let activeBeat = -1;
  let destroyed = false;
  section.dataset.horizontal = "true";

  function updateActiveProject() {
    if (destroyed || viewport.clientWidth === 0) return;
    const time = timeline.time();
    const riverIndex = panels.findIndex((panel) => panel === river);
    const riverProgress =
      riverIndex < 0
        ? 0
        : Math.max(
            0,
            Math.min(
              1,
              (time - timeline.labels[`project-${riverIndex}`]) / riverDuration,
            ),
          );
    const position = panels.reduce((value, _, index) => {
      if (index === 0) return value;
      const start = timeline.labels[`project-${index}`] - 0.35;
      return value + Math.max(0, Math.min(1, (time - start) / 0.35));
    }, 0);
    setTrackX(-position * viewport.clientWidth);
    motion.riverProgress = riverProgress;
    motion.invalidate();
    section.style.setProperty("--work-progress", String(timeline.progress()));
    if (river) {
      const beat = riverBeatIndex(riverProgress);
      if (beat !== activeBeat) {
        activeBeat = beat;
        river.dataset.riverPhase = riverBeats[beat].id;
        beats?.forEach((element, index) => {
          element.hidden = index !== beat;
        });
      }
      const p = riverProgress;
      const gamesIn = riverSegment(p, 0.3, 0.34);
      river.style.setProperty(
        "--river-games-opacity",
        String(gamesIn * (1 - riverSegment(p, 0.46, 0.5))),
      );
      river.style.setProperty(
        "--river-games-scale",
        String(0.86 + gamesIn * 0.14 + riverSegment(p, 0.46, 0.5) * 0.08),
      );
      const dashboardIn = riverSegment(p, 0.7, 0.735);
      river.style.setProperty(
        "--river-dashboard-opacity",
        String(dashboardIn * (1 - riverSegment(p, 0.935, 0.95))),
      );
      river.style.setProperty(
        "--river-dashboard-y",
        `${20 * (1 - dashboardIn)}px`,
      );
    }
    const index = Math.max(
      0,
      Math.min(panels.length - 1, Math.round(position)),
    );
    if (index === active) return;
    active = index;
    section.dataset.riverActive = String(panels[index] === river);
    next.hidden = index === panels.length - 1;
    if (!next.hidden) next.href = `#${panels[index + 1].id}`;
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
  panels.forEach((panel, index) => {
    if (index > 0) timeline.to({}, { duration: 0.35 });
    timeline.addLabel(`project-${index}`);
    timeline.to({}, { duration: panel === river ? riverDuration : 0.65 });
  });

  const trigger = ScrollTrigger.create({
    trigger: section,
    pin: stage,
    start: () => `top top+=${headerHeight()}`,
    end: () =>
      `+=${timeline.duration() * Math.max(650, window.innerHeight * 0.85)}`,
    anticipatePin: 1,
    onRefresh: (self) => {
      timeline.progress(self.progress);
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
    advance(id: string, complete: () => void) {
      const index = panels.findIndex((panel) => panel.id === id);
      if (index < 0 || exiting) return;
      exiting = true;
      exitTween = gsap.to(timeline, {
        time: timeline.labels[`project-${index}`] + 0.2,
        duration: 0.8,
        ease: "power2.inOut",
        onComplete: () => {
          exiting = false;
          exitTween = undefined;
          complete();
        },
      });
    },
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
      destroyed = true;
      exitTween?.kill();
      trigger.kill();
      timeline.revert();
      gsap.set(track, { clearProps: "transform" });
      delete section.dataset.horizontal;
      delete section.dataset.riverActive;
      section.style.removeProperty("--work-progress");
      if (river) delete river.dataset.riverPhase;
      for (const property of [
        "games-opacity",
        "games-scale",
        "dashboard-opacity",
        "dashboard-y",
      ])
        river?.style.removeProperty(`--river-${property}`);
      beats?.forEach((element, index) => {
        element.hidden = index !== 0;
      });
      motion.riverProgress = 0;
      next.hidden = true;
      panels.forEach((panel) => {
        panel.inert = false;
      });
      links.forEach((link) => link.removeAttribute("aria-current"));
      counter.textContent = "01";
    },
  };
}
