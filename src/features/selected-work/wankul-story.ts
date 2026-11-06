export const wankulDuration = 5.2;

export const wankulBeats = [
  {
    id: "intro",
    start: 0,
    label: "Un univers de collection",
    title: "Ouvrir. Collectionner. Échanger.",
    description:
      "Une application inspirée de l’univers Wankul / Wankil Studio.",
  },
  {
    id: "booster",
    start: 0.11,
    label: "Ouvrir",
    title: "Tout commence par un booster.",
    description: "Découvrir les cartes d’une nouvelle ouverture.",
  },
  {
    id: "reveal",
    start: 0.25,
    label: "Découvrir",
    title: "Chaque ouverture réserve sa découverte.",
    description: "Des cartes, des personnages et différents niveaux de rareté.",
  },
  {
    id: "rare",
    start: 0.36,
    label: "La découverte",
    title: "Une carte se distingue.",
    description:
      "Le plaisir de découvrir une nouvelle pièce pour sa collection.",
  },
  {
    id: "collection",
    start: 0.46,
    label: "Collectionner",
    title: "Une collection qui prend forme.",
    description:
      "Filtres, favoris et cartes manquantes pour suivre sa progression.",
  },
  {
    id: "market",
    start: 0.61,
    label: "Échanger",
    title: "Une collection qui vit.",
    description:
      "Acheter et vendre sur un marché communautaire en WankulCoins.",
  },
  {
    id: "economy",
    start: 0.75,
    label: "Côté serveur",
    title: "Derrière chaque échange, une transaction.",
    description:
      "Les achats, les ventes et les récompenses sont calculés par l’API.",
  },
  {
    id: "reading",
    start: 0.85,
    label: "Wankul TCG, en détail",
    title: "Du booster au marché.",
    description:
      "Une application React, une API NestJS et une collection persistante.",
  },
  {
    id: "exit",
    start: 0.95,
    label: "Derrière les projets",
    title: "La suite, c’est mon parcours.",
    description: "",
  },
] as const;

export function wankulBeatIndex(progress: number) {
  return Math.max(
    0,
    wankulBeats.findLastIndex((beat) => progress >= beat.start),
  );
}

export function wankulSegment(progress: number, start: number, end: number) {
  const t = Math.max(0, Math.min(1, (progress - start) / (end - start)));
  return t * t * t * (t * (t * 6 - 15) + 10);
}

export function wankulScreenState(progress: number) {
  const visible =
    wankulSegment(progress, 0.51, 0.54) *
    (1 - wankulSegment(progress, 0.735, 0.755));
  const transition = wankulSegment(progress, 0.595, 0.63);
  return {
    collection: visible * (1 - transition),
    market: visible * transition,
    cards: 1 - visible,
  };
}

export const wankulCards = [
  "pirate",
  "martine",
  "terracid",
  "survivant",
  "gotaga",
] as const;

export const wankulScreens = [
  {
    id: "collection",
    file: "collection.png",
    width: 675,
    height: 367,
    caption: "La collection : filtres, favoris et cartes manquantes.",
  },
  {
    id: "market",
    file: "market-1.png",
    width: 565,
    height: 429,
    caption: "Le marché communautaire et les offres de cartes.",
  },
] as const;
