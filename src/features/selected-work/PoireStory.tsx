import Image from "next/image";
import { poireBeats, poireScreens } from "./poire-story";

export function PoireCopy() {
  return (
    <div className="poire-copy">
      {poireBeats.map((beat, index) => (
        <div key={beat.id} data-poire-beat={beat.id} hidden={index !== 0}>
          <p className="poire-chapter">
            {String(index + 1).padStart(2, "0")} / {beat.label}
          </p>
          <p className="poire-headline">{beat.title}</p>
          <p className="poire-description">{beat.description}</p>
        </div>
      ))}
    </div>
  );
}

export function PoireDetails() {
  return (
    <div className="poire-details">
      <p className="poire-filters">
        <span>Localisation</span>
        <span>Date</span>
        <span>Disponibilité</span>
      </p>
      <p className="poire-reservation">
        <span>Disponible</span>
        <span aria-hidden="true"> → </span>
        <strong>Réservée</strong>
      </p>
      <p className="poire-sharing">
        Réserver <span>→</span> Rencontrer <span>→</span> Partager
      </p>
      {poireScreens.map((screen) => (
        <figure key={screen.id} data-poire-screen={screen.id}>
          <Image
            src={`/projects/ramenetapoire/${screen.file}`}
            width={screen.width}
            height={screen.height}
            alt={screen.caption}
            sizes="70vw"
          />
          <figcaption>{screen.caption}</figcaption>
        </figure>
      ))}
      <p className="poire-scroll-cue">
        Défiler pour explorer <span aria-hidden="true">↓</span>
      </p>
    </div>
  );
}
