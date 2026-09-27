"use client";

import Image from "next/image";
import { useEffect, useRef, useState, type ReactNode } from "react";

type ProjectImage = {
  src: string;
  caption: string;
  width: number;
  height: number;
};

export function ProjectImageViewer({
  images,
  children,
}: {
  images: ProjectImage[];
  children: ReactNode;
}) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const touchStart = useRef<{ x: number; y: number } | null>(null);
  const open = activeIndex !== null;
  const activeImage = activeIndex === null ? null : images[activeIndex];

  useEffect(() => {
    if (!open) return;
    const element = dialog.current;
    if (!element) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    element.showModal();
    return () => {
      element.close();
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  function move(direction: number) {
    setActiveIndex((index) =>
      index === null
        ? null
        : (index + direction + images.length) % images.length,
    );
  }

  return (
    <div
      onClick={(event) => {
        if (!(event.target instanceof Element)) return;
        const link = event.target.closest<HTMLAnchorElement>(
          "a[data-project-image]",
        );
        if (
          !link ||
          event.ctrlKey ||
          event.metaKey ||
          event.shiftKey ||
          event.altKey
        )
          return;
        const index = images.findIndex(
          (image) => image.src === link.dataset.projectImage,
        );
        if (index < 0) return;
        event.preventDefault();
        link.focus({ preventScroll: true });
        setActiveIndex(index);
      }}
    >
      {children}
      <dialog
        ref={dialog}
        className="project-lightbox"
        aria-label="Visionneuse des captures du projet"
        aria-describedby="project-image-caption"
        onClose={() => setActiveIndex(null)}
        onClick={(event) => {
          if (event.target === event.currentTarget) setActiveIndex(null);
        }}
        onKeyDown={(event) => {
          if (event.key === "Tab") {
            const buttons =
              event.currentTarget.querySelectorAll<HTMLButtonElement>(
                "button:not(:disabled)",
              );
            const first = buttons[0];
            const last = buttons[buttons.length - 1];
            if (event.shiftKey && document.activeElement === first) {
              event.preventDefault();
              last?.focus();
            } else if (!event.shiftKey && document.activeElement === last) {
              event.preventDefault();
              first?.focus();
            }
          }
          if (event.key === "ArrowRight" || event.key === "ArrowLeft") {
            event.preventDefault();
            move(event.key === "ArrowRight" ? 1 : -1);
          }
        }}
      >
        {activeImage && (
          <>
            <button
              type="button"
              className="project-lightbox__close"
              onClick={() => setActiveIndex(null)}
              autoFocus
              aria-label="Fermer la visionneuse"
            >
              Fermer <span aria-hidden="true">×</span>
            </button>
            <figure
              onTouchStart={(event) => {
                if (event.touches.length !== 1) {
                  touchStart.current = null;
                  return;
                }
                const touch = event.touches[0];
                touchStart.current = { x: touch.clientX, y: touch.clientY };
              }}
              onTouchEnd={(event) => {
                if (!touchStart.current) return;
                const touch = event.changedTouches[0];
                const dx = touch.clientX - touchStart.current.x;
                const dy = touch.clientY - touchStart.current.y;
                if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy))
                  move(dx < 0 ? 1 : -1);
                touchStart.current = null;
              }}
              onTouchCancel={() => {
                touchStart.current = null;
              }}
            >
              <Image
                key={activeImage.src}
                src={activeImage.src}
                alt={activeImage.caption}
                width={activeImage.width}
                height={activeImage.height}
                unoptimized
                className="project-lightbox__image"
              />
              <figcaption id="project-image-caption" aria-live="polite">
                {activeImage.caption}
              </figcaption>
            </figure>
            <div className="project-lightbox__navigation">
              <button
                type="button"
                onClick={() => move(-1)}
                aria-label="Image précédente"
                disabled={images.length < 2}
              >
                ←
              </button>
              <span>
                {(activeIndex ?? 0) + 1} / {images.length}
              </span>
              <button
                type="button"
                onClick={() => move(1)}
                aria-label="Image suivante"
                disabled={images.length < 2}
              >
                →
              </button>
            </div>
          </>
        )}
      </dialog>
    </div>
  );
}
