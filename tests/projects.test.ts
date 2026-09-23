import assert from "node:assert/strict";
import { test } from "node:test";

import projectData from "../src/data/projects.json";
import {
  getAllProjects,
  getFeaturedProjects,
  getNextProject,
  getPreviousProject,
  getProjectBySlug,
  getProjectMediaPath,
  getTechnologies,
} from "../src/lib/projects";
import {
  parseProjects,
  projectSchema,
  projectsSchema,
} from "../src/schemas/project.schema";

type TestData = { projects: Record<string, unknown>[] };

const data = {
  projects: Array.from({ length: 4 }, (_, index) => ({
    slug: `projet-test-${index + 1}`,
    name: `Projet de test ${index + 1}`,
    shortDescription: "Contenu réservé aux tests.",
    year: 2026,
    type: "Test",
    status: "ongoing",
    published: true,
    placeholder: true,
    featured: true,
    featuredOrder: index + 1,
    accent: "#6889EB",
    technologies: [],
    media: { cover: "cover.svg", thumbnail: "cover.svg" },
    caseStudy: {
      context: "Contexte de test.",
      problem: "Problème de test.",
      role: "Rôle de test.",
      solution: "Solution de test.",
      technicalDecisions: [
        { title: "Décision de test", description: "Justification de test." },
      ],
      results: ["Résultat de test."],
      conclusion: "Conclusion de test.",
    },
  })),
};

test("le fichier projets respecte le schéma final", () => {
  assert.doesNotThrow(() => parseProjects(projectData));
});

const invalidCases: {
  name: string;
  change: (draft: TestData) => void;
  path: string;
}[] = [
  {
    name: "slug dupliqué",
    change: ({ projects }) => {
      projects[1].slug = projects[0].slug;
    },
    path: "projects.1.slug",
  },
  {
    name: "slug contenant un chemin",
    change: ({ projects }) => {
      projects[0].slug = "../projet";
    },
    path: "projects.0.slug",
  },
  {
    name: "statut inconnu",
    change: ({ projects }) => {
      projects[0].status = "archived";
    },
    path: "projects.0.status",
  },
  {
    name: "URL invalide",
    change: ({ projects }) => {
      projects[0].links = { live: "pas-une-url" };
    },
    path: "projects.0.links.live",
  },
  {
    name: "protocole de lien non web",
    change: ({ projects }) => {
      projects[0].links = { github: "javascript:alert(1)" };
    },
    path: "projects.0.links.github",
  },
  {
    name: "trois projets mis en avant",
    change: ({ projects }) => {
      projects.pop();
    },
    path: "projects",
  },
  {
    name: "cinq projets mis en avant",
    change: ({ projects }) => {
      projects.push({ ...projects[0], slug: "cinquieme-projet" });
    },
    path: "projects",
  },
  {
    name: "ordre dupliqué",
    change: ({ projects }) => {
      projects[1].featuredOrder = 1;
    },
    path: "projects.1.featuredOrder",
  },
  {
    name: "ordre manquant",
    change: ({ projects }) => {
      delete projects[0].featuredOrder;
    },
    path: "projects.0.featuredOrder",
  },
  {
    name: "ordre hors sélection",
    change: ({ projects }) => {
      projects[0].featuredOrder = 5;
    },
    path: "projects.0.featuredOrder",
  },
  {
    name: "projet mis en avant non publié",
    change: ({ projects }) => {
      projects[0].published = false;
    },
    path: "projects.0.published",
  },
  {
    name: "étude de cas absente",
    change: ({ projects }) => {
      delete projects[0].caseStudy;
    },
    path: "projects.0.caseStudy",
  },
  {
    name: "contribution personnelle vide",
    change: ({ projects }) => {
      projects[0].caseStudy = { ...data.projects[0].caseStudy, role: "   " };
    },
    path: "projects.0.caseStudy.role",
  },
  {
    name: "résultats absents",
    change: ({ projects }) => {
      projects[0].caseStudy = { ...data.projects[0].caseStudy, results: [] };
    },
    path: "projects.0.caseStudy.results",
  },
  {
    name: "titre absent",
    change: ({ projects }) => {
      delete projects[0].name;
    },
    path: "projects.0.name",
  },
  {
    name: "couverture absente",
    change: ({ projects }) => {
      projects[0].media = { thumbnail: "cover.svg" };
    },
    path: "projects.0.media.cover",
  },
  {
    name: "média sortant du dossier du projet",
    change: ({ projects }) => {
      projects[0].media = { cover: "../cover.svg", thumbnail: "cover.svg" };
    },
    path: "projects.0.media.cover",
  },
  {
    name: "couleur invalide",
    change: ({ projects }) => {
      projects[0].accent = "orange";
    },
    path: "projects.0.accent",
  },
  {
    name: "année incohérente",
    change: ({ projects }) => {
      projects[0].year = 3000;
    },
    path: "projects.0.year",
  },
  {
    name: "configuration d’animation dans le contenu",
    change: ({ projects }) => {
      projects[0].cameraX = 8;
    },
    path: "projects.0",
  },
];

for (const { name, change, path } of invalidCases) {
  test(`validation : ${name}`, () => {
    const draft = structuredClone(data);
    change(draft);
    const result = projectsSchema.safeParse(draft);
    assert.equal(result.success, false);
    if (result.success) return;
    assert.ok(
      result.error.issues.some((issue) => issue.path.join(".") === path),
    );
  });
}

test("un projet secondaire accepte l’absence des sections optionnelles", () => {
  const secondary = {
    slug: "projet-secondaire",
    name: "Projet de test",
    shortDescription: "Contenu réservé au test.",
    year: 2026,
    type: "Test",
    status: "completed",
    published: false,
    featured: false,
    technologies: ["Outil de test"],
    media: { cover: "cover.webp", thumbnail: "thumbnail.webp" },
  };
  const parsed = projectSchema.parse(secondary);
  assert.equal(parsed.placeholder, false);
  assert.equal(parsed.content, undefined);
  assert.equal(parsed.caseStudy, undefined);
  assert.equal(parsed.links, undefined);
  assert.equal(
    projectsSchema.safeParse({ projects: [...data.projects, secondary] })
      .success,
    true,
  );
});

test("les liens web et les médias optionnels valides sont acceptés", () => {
  const project = {
    ...data.projects[0],
    links: {
      live: "https://example.com",
      github: "https://github.com/example/project",
    },
    media: {
      cover: "cover.avif",
      thumbnail: "thumbnail.webp",
      gallery: ["01.webp"],
      video: null,
    },
  };
  assert.equal(projectSchema.safeParse(project).success, true);
});

test("les erreurs désignent le fichier et le champ à corriger", () => {
  const draft = structuredClone(data);
  draft.projects[1].slug = draft.projects[0].slug;
  assert.throws(
    () => parseProjects(draft),
    /projects\.json invalide[\s\S]*projects\.1\.slug/,
  );
});

test("la sélection suit featuredOrder et les lectures ne modifient pas le JSON", () => {
  const before = structuredClone(projectData);
  const slugs = getAllProjects().map((project) => project.slug);
  assert.deepEqual(
    getFeaturedProjects().map((project) => project.featuredOrder),
    [1, 2, 3, 4],
  );
  getAllProjects().reverse();
  assert.deepEqual(
    getAllProjects().map((project) => project.slug),
    slugs,
  );
  assert.deepEqual(projectData, before);
});

test("la navigation précédent/suivant respecte les limites du catalogue", () => {
  const projects = getAllProjects();
  const first = projects[0];
  const second = projects[1];
  const last = projects[projects.length - 1];
  assert.equal(getNextProject(first.slug)?.slug, second.slug);
  assert.equal(getPreviousProject(second.slug)?.slug, first.slug);
  assert.equal(getPreviousProject(first.slug), undefined);
  assert.equal(getNextProject(last.slug), undefined);
  assert.equal(getNextProject(""), undefined);
  assert.equal(getPreviousProject(""), undefined);
  assert.equal(getProjectBySlug(""), undefined);
  assert.equal(getProjectBySlug(second.slug)?.name, second.name);
});

test("les médias suivent le slug et les technologies viennent des projets publiés", () => {
  assert.equal(
    getProjectMediaPath({ slug: "projet-02" }, "cover.svg"),
    "/projects/projet-02/cover.svg",
  );
  const technologies = getTechnologies();
  const publishedTechnologies = getAllProjects().flatMap(
    (project) => project.technologies,
  );
  assert.equal(technologies.length, new Set(technologies).size);
  assert.ok(
    technologies.every((technology) =>
      publishedTechnologies.includes(technology),
    ),
  );
  assert.ok(
    publishedTechnologies.every((technology) =>
      technologies.includes(technology),
    ),
  );
});
