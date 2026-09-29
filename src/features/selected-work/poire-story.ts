export const poireDuration = 5.2;

export const poireBeats = [
  {
    id: "intro",
    start: 0,
    label: "Découvrir · Réserver · Partager",
    title: "Une place à table, près de chez soi.",
    description: "Des repas chez l’habitant, à découvrir et à partager.",
  },
  {
    id: "discover",
    start: 0.1,
    label: "Découvrir",
    title: "Un repas commence par une adresse.",
    description:
      "Localisation, date et disponibilité : trouver le repas qui nous correspond.",
  },
  {
    id: "table",
    start: 0.26,
    label: "Se retrouver",
    title: "D’une adresse à une table.",
    description: "Derrière chaque repas, un hôte ouvre sa porte.",
  },
  {
    id: "reserve",
    start: 0.4,
    label: "Réserver",
    title: "Une place vous attend.",
    description:
      "Consulter les informations du repas et réserver une ou plusieurs places.",
  },
  {
    id: "share",
    start: 0.53,
    label: "Partager",
    title: "Une réservation devient une rencontre.",
    description: "La table se remplit. Le repas devient un moment partagé.",
  },
  {
    id: "messages",
    start: 0.7,
    label: "Échanger",
    title: "La conversation commence avant le repas.",
    description:
      "Une messagerie de groupe réunit les participants de chaque repas.",
  },
  {
    id: "host",
    start: 0.8,
    label: "Organiser",
    title: "Et si vous ouvriez votre table ?",
    description:
      "Le parcours hôte permet de créer ses repas et de gérer les participants.",
  },
  {
    id: "reading",
    start: 0.88,
    label: "RamèneTaPoire, en détail",
    title: "Découvrir. Réserver. Partager.",
    description:
      "Recherche cartographique, réservation et messagerie réunies dans une plateforme de repas chez l’habitant.",
  },
  {
    id: "exit",
    start: 0.955,
    label: "Vers le projet suivant",
    title: "Une autre carte à découvrir.",
    description:
      "La table laisse place à l’univers de collection de Wankul TCG.",
  },
] as const;

export function poireBeatIndex(progress: number) {
  return Math.max(
    0,
    poireBeats.findLastIndex((beat) => progress >= beat.start),
  );
}

export function poireSegment(progress: number, start: number, end: number) {
  const t = Math.max(0, Math.min(1, (progress - start) / (end - start)));
  return t * t * t * (t * (t * 6 - 15) + 10);
}

export const poireScreens = [
  {
    id: "messages",
    file: "page-messagerie-3.png",
    width: 1896,
    height: 906,
    caption: "La conversation de groupe liée au repas",
  },
  {
    id: "host",
    file: "page-creation-evenement.png",
    width: 1915,
    height: 898,
    caption: "Créer un repas depuis le parcours hôte",
  },
  {
    id: "reading",
    file: "page-fiche-repas.png",
    width: 1908,
    height: 894,
    caption: "Les informations d’un repas avant réservation",
  },
] as const;
