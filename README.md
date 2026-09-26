# Portfolio V2

Portfolio de Mehdi Bouchard. La base du projet utilise Next.js App Router,
React, TypeScript strict et Tailwind CSS v4.

## Développement

Node.js 22.19 ou supérieur et npm sont nécessaires. Le fichier `.nvmrc`
cible la branche Node.js 22.

```sh
npm ci
npm run dev
```

Le site est accessible sur `http://localhost:3000`.
Aucune variable d’environnement n’est nécessaire à cette étape.

Sous PowerShell, utiliser `npm.cmd` à la place de `npm` si l’exécution
des scripts PowerShell est désactivée.

## Vérifications

```sh
npm run check
npm run build
```

`check` exécute ESLint, TypeScript, le contrôle du formatage, la validation des
projets et les tests. `npm test` lance les tests seuls.
`npm run format` applique le formatage Prettier.
`npm start` lance le serveur après un build.

ESLint reste en version 9 pour respecter la compatibilité déclarée du plugin
React fourni par la configuration Next.js. Le registre signale cette version
comme non maintenue ; le passage à ESLint 10 dépend de cette compatibilité.

## Organisation

```text
src/
  app/                  Routes et layout commun
    projects/
      [slug]/           Pages projet
    api/contact/        Emplacement du futur endpoint de contact
  components/           Navigation, thème, curseur et éléments partagés
  features/             Sections du portfolio et rendu 3D
  data/                 Contenu des projets
  schemas/              Validation des données
  lib/                  Accès aux données et fonctions partagées
  hooks/                Hooks partagés
  styles/               Styles globaux
public/
  projects/             Médias organisés par slug
  models/               Modèles 3D
  cv/                   CV au format PDF
```

Les composants propres à une section restent dans son dossier `features/`.
L’alias `@/` pointe vers `src/`. Les fichiers `.gitkeep` conservent les
dossiers réservés dans Git ; ils sont à retirer lorsque ces dossiers sont utilisés.

## Données projets

Le contenu se trouve dans `src/data/projects.json`. Les pages passent par
`src/lib/projects.ts` pour lire les projets, la sélection, les technologies
et les voisins d’un projet.

Les onze projets de l’ancien portfolio sont importés avec leurs descriptions,
technologies, liens, captures et vidéos. La sélection principale suit cet ordre :
The River, RamèneTaPoire, Wankul TCG. Les huit autres projets sont secondaires.
Un quatrième projet principal pourra être ajouté plus tard.

Les années non confirmées sont indiquées par `year: null`. Les contributions
personnelles non détaillées dans les sources et les bilans des études de cas
portent la mention « À compléter ». `placeholder: false` indique que les entrées
correspondent à des projets réels, même lorsque certains champs restent à préciser.

Le schéma Zod dans `src/schemas/project.schema.ts` vérifie notamment :

- les champs obligatoires, les slugs uniques et les statuts `ongoing` / `completed` ;
- les URL HTTP(S), les couleurs et les années connues entre 2000 et l’année prochaine ;
- trois ou quatre projets `featured`, publiés, numérotés depuis 1 sans doublon ni interruption ;
- les champs requis de l’étude de cas pour chaque projet mis en avant.

Un projet secondaire peut rester en brouillon avec `published: false`. Il ne
figure ni dans le catalogue, ni dans les pages publiques, ni dans la navigation.
La sélection doit conserver au moins trois projets publiés mis en avant.

Le catalogue présente d’abord la sélection dans son ordre, puis les autres
projets par année décroissante et par nom ; les années inconnues viennent après
les années connues. La navigation précédent/suivant
utilise le même ordre, sans reboucler aux extrémités.

Les médias se placent dans `public/projects/<slug>/`. Le JSON stocke uniquement
les noms de fichiers, par exemple `cover.webp`. Les captures PNG et vidéos MP4
de l’ancien portfolio sont conservées sans transformation, avec des noms sans
espaces ni accents. `coverSize` et `thumbnailSize` décrivent les dimensions des
images pour réserver leur place à l’affichage. `video` désigne une vidéo unique ;
`videos` permet d’en conserver plusieurs. Les médias de galerie sont référencés
dans les données, mais les pages minimales affichent uniquement la couverture.
Les sections et liens optionnels absents ne sont pas affichés.

```sh
npm run validate:projects
```

Cette commande vérifie le schéma et l’existence des médias des projets publiés.
Elle est exécutée avant chaque `npm run build` et bloque la compilation si une
erreur est détectée. La lecture des données par les pages applique également
le schéma. Les erreurs indiquent le champ ou le fichier à corriger.

## Interface et thèmes

Les couleurs, espacements, styles de texte et variantes de boutons sont définis
dans `src/styles/globals.css`. Space Grotesk et Inter sont chargées avec
`next/font/local` depuis les paquets Fontsource : aucune requête vers un service
de polices n’est nécessaire. Leurs licences sont dans `public/fonts/`.

`next-themes` suit la préférence système au premier affichage et mémorise le
choix clair/sombre dans `localStorage`. Le menu permet de revenir au réglage
système. Le bouton Menu fonctionne au clic et au clavier ; le survol du bord
supérieur ajoute un accès à la souris. Échap ferme le panneau et rend le focus
au bouton. Les transitions respectent `prefers-reduced-motion`.

Les tests navigateur couvrent les thèmes, le menu, la navigation et les petites
largeurs sur Chromium desktop et mobile. Après installation du navigateur :

```sh
npx playwright install chromium
npm run build
npm run test:e2e
```

Playwright démarre le build de production sur le port 3100, qui doit être libre.

## Parcours de l’accueil

L’accueil enchaîne Hero, Statement, Selected Work et À propos. Les trois projets
principaux viennent de `getFeaturedProjects()`. Le Hero utilise un volume simple
et les écrans présentent les captures des projets. Le texte personnel et le
parcours figurent dans la section À propos.

`src/lib/home-scroll.ts` relie Lenis, les ancres et les animations des sections.
La timeline de la sélection reste dans `features/selected-work/selected-work-scroll.ts`.
ScrollTrigger épingle la galerie ; le scroll vertical déplace les panneaux, avec
un temps de lecture entre les transitions. Les liens numérotés donnent aussi
accès à chaque projet au clavier. Les panneaux hors champ sont inertes.

Le bouton Continuer termine la séquence en 550 ms puis rejoint À propos. Une
nouvelle navigation ou un geste de scroll peut interrompre cette sortie. Les
ancres du menu sont immédiates. Le retour navigateur depuis un projet retrouve
son ancre dans l’accueil, sans ajouter de route intermédiaire.

Le mode horizontal nécessite une largeur d’au moins 1024 px, une hauteur d’au
moins 700 px, un pointeur précis et l’absence de préférence de mouvement réduit.
Sinon, les projets s’empilent et Lenis est désactivé. Le changement de mode et
la sortie de l’accueil nettoient les animations et le pin. Sans JavaScript,
le contenu et les liens restent disponibles sous forme verticale.

## Prototype 3D

`features/three/PortfolioScene.tsx` charge Three.js, React Three Fiber et Drei
uniquement en mode desktop animé. Un seul Canvas dessert le Hero et les trois
écrans grâce aux vues liées à leurs emplacements HTML. Les formes restent
provisoires ; aucun modèle externe, shader personnalisé ou post-traitement
n’est chargé.

Les captures de la sélection restent de face, sans rotation ni déplacement en
profondeur. Seuls les panneaux défilent horizontalement ; une bordure fine
encadre chaque aperçu.

`lib/home-motion.ts` partage la progression du scroll avec la caméra et les
objets sans mise à jour React à chaque image. Douze blocs aux arêtes adoucies
composent la sculpture du Hero. Au repos, un va-et-vient sur l’axe vertical
et une légère inclinaison rendent le volume lisible. Ce mouvement s’atténue
au début du défilement : les blocs se séparent
au scroll puis se recomposent au retour. La sculpture reste épinglée à droite
jusqu’à la fin d’Intention, dont le texte occupe la colonne gauche sur desktop.
Les blocs s’effacent avant les projets. La boucle de rendu s’arrête lorsque
la sculpture disparaît ou que l’onglet est masqué ; la galerie reste à la demande.
Le ratio de pixels est plafonné à 1,5. Les textures sont chargées à l’approche
de la galerie ; leurs URL passent par l’optimisation d’images Next.js. Les
matériaux reprennent les variables CSS du thème.

Les captures HTML restent accessibles pendant le chargement et en cas d’échec
d’une texture, de WebGL ou de perte du contexte graphique. Sur mobile et avec
`prefers-reduced-motion`, elles remplacent la scène. Le Hero utilise alors une
projection SVG fixe issue de la même structure, également visible sans JavaScript.
Le Canvas ne capte aucun
clic : les liens, le texte et les commandes restent en HTML. La sortie de
l’accueil libère la scène et les textures.

Les tests navigateur utilisent WebGL logiciel pour vérifier le Canvas unique,
les changements de thème et de route, les captures de secours et le changement
de préférence de mouvement.

## À propos et parcours

`features/about/About.tsx` contient la présentation et le lien de téléchargement
vers `public/cv/CV_Bouchard_Mehdi.pdf`. Aucun portrait n’est affiché.
`data/journey.ts` regroupe les sept étapes d’études et de stages. Les dates et
missions des stages viennent du CV ; les formations reprennent les précisions
confirmées : Bachelor 2025–2026, CDA obtenu en 2026 et première année de MBA
développeur fullstack à MyDigitalSchool Rennes.

La frise alterne les étapes sur desktop et les aligne en une colonne sur mobile.
`features/about/about-scroll.ts` anime l’apparition des étapes à la descente et
joue l’animation en sens inverse à la remontée via GSAP et ScrollTrigger.
Le contenu reste visible sans JavaScript et avec
`prefers-reduced-motion`. Le fichier PDF fourni est conservé tel quel.

## État actuel

`/` présente le prototype du parcours de scroll avec sa scène 3D. `/projects` affiche les onze projets
et `/projects/[slug]` une présentation minimale avec les liens précédent/suivant.
Les slugs inconnus et les brouillons renvoient une page 404.
Le dossier `api/contact` ne déclare pas encore de route active.

Le mini design system, les thèmes et la navigation commune sont en place.
Les assets 3D définitifs, les autres sections de l’accueil et les études de cas
détaillées restent à construire. Les pages portent une directive `noindex` pendant cette préparation.
