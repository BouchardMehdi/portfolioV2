"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
const games = [
  { file: "poker.png", label: "Poker", width: 1894, height: 831 },
  { file: "blackjack.png", label: "Blackjack", width: 1262, height: 895 },
  { file: "roulette.png", label: "Roulette", width: 1303, height: 917 },
  {
    file: "slot-machine.png",
    label: "Machine à sous",
    width: 738,
    height: 483,
  },
];

export function RiverScreens() {
  const root = useRef<HTMLDivElement>(null);
  const [nearby, setNearby] = useState(false);
  useEffect(() => {
    if (!root.current) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setNearby(true);
          observer.disconnect();
        }
      },
      { rootMargin: "400px" },
    );
    observer.observe(root.current);
    return () => observer.disconnect();
  }, []);
  return (
    <div ref={root} className="river-screens" aria-hidden="true">
      <div className="river-reel-labels">
        <span>Multijoueur</span>
        <span>Temps réel</span>
        <span>Progression</span>
      </div>
      <div className="river-games">
        {games.map((game) => (
          <figure key={game.file}>
            <Image
              src={`/projects/the-river/${game.file}`}
              alt=""
              width={game.width}
              height={game.height}
              sizes="(min-width: 1024px) 28vw, 1px"
              loading={nearby ? "eager" : "lazy"}
            />
            <figcaption>{game.label}</figcaption>
          </figure>
        ))}
      </div>
      <div className="river-network-label">
        <span>4 joueurs</span>
        <span>Un état côté serveur</span>
        <span>Socket.IO</span>
      </div>
      <figure className="river-dashboard">
        <Image
          src="/projects/the-river/menu.png"
          alt=""
          width={1288}
          height={860}
          sizes="(min-width: 1024px) 55vw, 1px"
          loading={nearby ? "eager" : "lazy"}
        />
        <figcaption>Crédits · Tableau de bord · Quêtes</figcaption>
      </figure>
      <p className="river-scroll-cue">
        Défiler pour explorer <span>↓</span>
      </p>
    </div>
  );
}
