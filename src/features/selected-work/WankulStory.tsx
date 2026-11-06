import Image from "next/image";
import { wankulBeats, wankulScreens } from "./wankul-story";

export function WankulCopy() {
  return (
    <div className="wankul-copy">
      <p className="wankul-disclaimer">Projet fan-made non officiel</p>
      {wankulBeats.map((beat, index) => (
        <div key={beat.id} data-wankul-beat={beat.id} hidden={index !== 0}>
          <p className="wankul-chapter">
            {String(index + 1).padStart(2, "0")} / {beat.label}
          </p>
          <p className="wankul-headline">{beat.title}</p>
          {beat.description && (
            <p className="wankul-description">{beat.description}</p>
          )}
        </div>
      ))}
    </div>
  );
}

export function WankulDetails() {
  return (
    <div className="wankul-details">
      <p className="wankul-collection-labels">
        <span>Collectionner</span>
        <span>Compléter</span>
        <span>Suivre</span>
      </p>
      <div className="wankul-market-labels">
        <span>Prix</span>
        <span>Historique</span>
        <span>Offres</span>
        <span>Acheter</span>
        <span>Vendre</span>
      </div>
      <div className="wankul-economy">
        <span>Une carte</span>
        <span aria-hidden="true">↔</span>
        <strong>Marché</strong>
        <span aria-hidden="true">↔</span>
        <span>WankulCoins</span>
      </div>
      <p className="wankul-summary">
        <span>Ouvrir</span>
        <span>Collectionner</span>
        <span>Échanger</span>
      </p>
      {wankulScreens.map((screen) => (
        <figure key={screen.id} data-wankul-screen={screen.id}>
          <div className="wankul-screen-crop">
            <Image
              src={`/projects/wankultcg/${screen.file}`}
              width={screen.width}
              height={screen.height}
              sizes="(min-width: 1400px) 800px, 600px"
              alt={screen.caption}
            />
          </div>
          <figcaption>{screen.caption}</figcaption>
        </figure>
      ))}
      <p className="wankul-scroll-cue">
        Défiler pour explorer <span aria-hidden="true">↓</span>
      </p>
    </div>
  );
}
