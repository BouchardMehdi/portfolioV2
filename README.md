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

`check` exécute ESLint, la vérification TypeScript et le contrôle du formatage.
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
      [slug]/           Emplacement des futures pages projet
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

## État actuel

`/` et `/projects` affichent des pages d’attente. Les URL inconnues renvoient
une page 404. Les dossiers `[slug]` et `api/contact` ne déclarent pas encore
de route active.

Les données projets, le design system complet, les thèmes et les animations
seront ajoutés au prototype. Leurs dépendances ne sont pas encore installées.
Les pages portent une directive `noindex` pendant cette préparation.
