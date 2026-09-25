import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import { createSelectedWorkScroll } from "@/features/selected-work/selected-work-scroll";

gsap.registerPlugin(ScrollTrigger);

export function setupHomeScroll(root: HTMLElement) {
  const media = gsap.matchMedia();
  let lenis: Lenis | undefined;
  let gallery: ReturnType<typeof createSelectedWorkScroll> | undefined;
  let disposed = false;
  let refreshFrame = 0;
  let hashFrame = 0;
  const headerHeight = () =>
    document.querySelector(".site-header__bar")?.getBoundingClientRect()
      .height ?? 80;

  function jump(target: HTMLElement, focus = true) {
    gallery?.cancelExit();
    const top =
      gallery?.positionFor(target.id) ??
      (target.id === "hero" || target === root
        ? 0
        : target.getBoundingClientRect().top + window.scrollY - headerHeight());
    if (lenis) lenis.scrollTo(top, { immediate: true, force: true });
    else window.scrollTo({ top, behavior: "instant" });
    ScrollTrigger.update();
    if (focus) target.focus({ preventScroll: true });
  }

  function hashTarget(hash: string) {
    try {
      return document.getElementById(decodeURIComponent(hash.slice(1)));
    } catch {
      return null;
    }
  }

  function followHash() {
    const target = hashTarget(window.location.hash);
    if (target && root.contains(target)) jump(target, false);
  }

  media.add(
    "(min-width: 1024px) and (min-height: 700px) and (hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)",
    () => {
      lenis = new Lenis({
        autoRaf: false,
        lerp: 0.12,
        smoothWheel: true,
        syncTouch: false,
      });
      const currentLenis = lenis;
      const tick = (seconds: number) => currentLenis.raf(seconds * 1000);
      currentLenis.on("scroll", ScrollTrigger.update);
      gsap.ticker.add(tick);

      gallery = createSelectedWorkScroll(
        root.querySelector<HTMLElement>("#selected-work")!,
        headerHeight,
      );
      const hero = root.querySelector<HTMLElement>("#hero")!;
      gsap.to(hero.querySelectorAll(".home-title span"), {
        x: (index) => (index === 0 ? -40 : 40),
        ease: "none",
        scrollTrigger: {
          trigger: hero,
          start: "top top",
          end: "bottom top",
          scrub: true,
        },
      });
      gsap.to(hero.querySelector(".hero-volume"), {
        scale: 1.15,
        y: -40,
        ease: "none",
        scrollTrigger: {
          trigger: hero,
          start: "top top",
          end: "bottom top",
          scrub: true,
        },
      });
      const statement = root.querySelector<HTMLElement>("#statement")!;
      gsap.fromTo(
        statement.querySelectorAll("h2 span, .statement-line"),
        { opacity: 0.35, y: 24 },
        {
          opacity: 1,
          y: 0,
          stagger: 0.15,
          ease: "none",
          scrollTrigger: {
            trigger: statement,
            start: "top 85%",
            end: "center 55%",
            scrub: true,
          },
        },
      );

      const resizeLenis = () => currentLenis.resize();
      ScrollTrigger.addEventListener("refresh", resizeLenis);
      refreshFrame = requestAnimationFrame(() => {
        ScrollTrigger.refresh();
        currentLenis.resize();
      });
      return () => {
        cancelAnimationFrame(refreshFrame);
        ScrollTrigger.removeEventListener("refresh", resizeLenis);
        gallery?.destroy();
        gallery = undefined;
        gsap.ticker.remove(tick);
        currentLenis.destroy();
        lenis = undefined;
      };
    },
    root,
  );

  function handleHistory() {
    gallery?.cancelExit();
    cancelAnimationFrame(hashFrame);
    // Le navigateur applique aussi son défilement natif lors d’un changement d’ancre.
    hashFrame = requestAnimationFrame(followHash);
  }

  function rememberHash(id: string, replace = false) {
    const hash = `#${id}`;
    if (window.location.hash === hash) return;
    if (replace) window.history.replaceState(window.history.state, "", hash);
    else window.history.pushState(window.history.state, "", hash);
  }

  function handleClick(event: MouseEvent) {
    if (
      event.defaultPrevented ||
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    )
      return;
    const link =
      event.target instanceof Element
        ? event.target.closest<HTMLAnchorElement>("a[href]")
        : null;
    if (!link || link.target === "_blank" || link.hasAttribute("download"))
      return;
    const url = new URL(link.href, window.location.href);
    if (url.origin !== window.location.origin) return;
    if (url.pathname !== "/") {
      gallery?.cancelExit();
      // L’ancre appartient à l’entrée d’historique de l’accueil, pour retrouver le projet au retour.
      const panel = link.closest<HTMLElement>(".work-panel");
      if (panel) rememberHash(panel.id, true);
      return;
    }
    const target = hashTarget(url.hash);
    if (!target || !(root.contains(target) || target === root)) return;
    event.preventDefault();
    if (link.hasAttribute("data-continue") && gallery) {
      lenis?.scrollTo(window.scrollY, { immediate: true });
      gallery.leave(() => {
        rememberHash(target.id);
        jump(target);
      });
    } else {
      rememberHash(target.id);
      jump(target);
    }
  }

  function interrupt() {
    gallery?.cancelExit();
  }
  function handleKey(event: KeyboardEvent) {
    if (
      [
        "Escape",
        "ArrowUp",
        "ArrowDown",
        "PageUp",
        "PageDown",
        "Home",
        "End",
        " ",
        "Tab",
      ].includes(event.key)
    )
      interrupt();
  }
  function refresh() {
    if (disposed) return;
    ScrollTrigger.refresh();
    lenis?.resize();
    followHash();
  }
  const initialFrame = requestAnimationFrame(refresh);
  void document.fonts.ready.then(refresh);
  document.addEventListener("click", handleClick, true);
  window.addEventListener("hashchange", handleHistory);
  window.addEventListener("popstate", handleHistory);
  window.addEventListener("wheel", interrupt, { passive: true });
  window.addEventListener("touchstart", interrupt, { passive: true });
  window.addEventListener("keydown", handleKey);

  return () => {
    disposed = true;
    cancelAnimationFrame(initialFrame);
    cancelAnimationFrame(hashFrame);
    media.revert();
    document.removeEventListener("click", handleClick, true);
    window.removeEventListener("hashchange", handleHistory);
    window.removeEventListener("popstate", handleHistory);
    window.removeEventListener("wheel", interrupt);
    window.removeEventListener("touchstart", interrupt);
    window.removeEventListener("keydown", handleKey);
  };
}
