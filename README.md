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

Les quatre entrées actuelles sont des démonstrations identifiées par
`placeholder: true`. Leurs technologies sont vides, les liens externes sont
absents et les études de cas contiennent uniquement des textes à remplacer.
Mettre `placeholder` à `false` après avoir renseigné le contenu réel.

Le schéma Zod dans `src/schemas/project.schema.ts` vérifie notamment :

- les champs obligatoires, les slugs uniques et les statuts `ongoing` / `completed` ;
- les URL HTTP(S), les couleurs et les années entre 2000 et l’année prochaine ;
- exactement quatre projets `featured`, publiés, avec les ordres 1 à 4 distincts ;
- une étude de cas complète pour chaque projet mis en avant.

Un projet secondaire peut rester en brouillon avec `published: false`. Il ne
figure ni dans le catalogue, ni dans les pages publiques, ni dans la navigation.
Pour retirer un projet de la sélection, le remplacer par un autre afin de
conserver quatre projets publiés mis en avant.

Le catalogue présente d’abord la sélection dans son ordre, puis les autres
projets par année décroissante et par nom. La navigation précédent/suivant
utilise le même ordre, sans reboucler aux extrémités.

Les médias se placent dans `public/projects/<slug>/`. Le JSON stocke uniquement
les noms de fichiers, par exemple `cover.webp`. Les SVG actuels sont des visuels
temporaires. Les sections et liens optionnels absents ne sont pas affichés.

```sh
npm run validate:projects
```

Cette commande vérifie le schéma et l’existence des médias des projets publiés.
Elle est exécutée avant chaque `npm run build` et bloque la compilation si une
erreur est détectée. La lecture des données par les pages applique également
le schéma. Les erreurs indiquent le champ ou le fichier à corriger.

## État actuel

`/` reste une page d’attente. `/projects` affiche le catalogue de démonstration
et `/projects/[slug]` une présentation minimale avec les liens précédent/suivant.
Les slugs inconnus et les brouillons renvoient une page 404.
Le dossier `api/contact` ne déclare pas encore de route active.

Le design system complet, les thèmes, les études de cas détaillées et les
animations seront ajoutés ensuite. Les pages portent une directive `noindex`
pendant cette préparation.
