export const riverDuration = 5.2;

export const riverBeats = [
  {
    id: "intro",
    start: 0,
    label: "Entrer dans The River",
    title: "Entrez dans la partie.",
    description:
      "Du jeu solo aux tables multijoueurs, une même progression accompagne le joueur.",
  },
  {
    id: "machine",
    start: 0.1,
    label: "La machine",
    title: "Multijoueur. Temps réel. Progression.",
    description:
      "Trois idées au cœur du projet. Le scroll ouvre le passage vers les jeux.",
  },
  {
    id: "games",
    start: 0.3,
    label: "Les jeux",
    title: "Plusieurs jeux. Une seule plateforme.",
    description:
      "Poker, blackjack, roulette et machine à sous : quatre interfaces, un même compte.",
  },
  {
    id: "realtime",
    start: 0.5,
    label: "Le multijoueur",
    title: "Une table partagée. Un état synchronisé.",
    description:
      "Les actions des joueurs sont traitées côté serveur et transmises en temps réel avec Socket.IO.",
  },
  {
    id: "progression",
    start: 0.7,
    label: "La progression",
    title: "La partie s’arrête. La progression reste.",
    description:
      "Crédits, tableau de bord et quêtes quotidiennes, hebdomadaires et anti-tilt.",
  },
  {
    id: "reading",
    start: 0.84,
    label: "The River, en détail",
    title: "Le jeu en interface. La logique côté serveur.",
    description:
      "Une plateforme de casino full-stack en cours de développement, avec du multijoueur et une progression persistante.",
  },
  {
    id: "exit",
    start: 0.95,
    label: "Vers le projet suivant",
    title: "D’une table à l’autre.",
    description:
      "La carte change d’univers. Direction les repas partagés de RamèneTaPoire.",
  },
] as const;

export function riverBeatIndex(progress: number) {
  return Math.max(
    0,
    riverBeats.findLastIndex((beat) => progress >= beat.start),
  );
}

export function riverSegment(progress: number, start: number, end: number) {
  const t = Math.max(0, Math.min(1, (progress - start) / (end - start)));
  return t * t * (3 - 2 * t);
}
