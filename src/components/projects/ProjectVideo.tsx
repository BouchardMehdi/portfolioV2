"use client";

import { useEffect, useRef, useState } from "react";

export function ProjectVideo({
  src,
  caption,
}: {
  src: string;
  caption: string;
}) {
  const video = useRef<HTMLVideoElement>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const element = video.current;
    if (!element) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setReady(true);
          observer.disconnect();
        }
      },
      { rootMargin: "400px 0px" },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  const playback = {
    autoPlay: true,
    muted: true,
    loop: true,
    playsInline: true,
    disablePictureInPicture: true,
    disableRemotePlayback: true,
    tabIndex: -1,
    "aria-label": caption,
  };

  return (
    <>
      <video
        ref={video}
        className="project-video__player"
        src={ready ? src : undefined}
        preload="none"
        {...playback}
      />
      <noscript>
        <style>{".project-video__player { display: none; }"}</style>
        <video src={src} {...playback} />
      </noscript>
    </>
  );
}
