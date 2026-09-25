import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { getAllProjects, getProjectMediaPath } from "@/lib/projects";

export const metadata: Metadata = { title: "Projets" };

export default function ProjectsPage() {
  const projects = getAllProjects();

  return (
    <main
      id="main-content"
      tabIndex={-1}
      className="layout-container page-shell"
    >
      <p className="eyebrow">Index / {projects.length} projets</p>
      <header className="page-heading">
        <h1>Projets</h1>
        {projects.some((project) => project.placeholder) && (
          <p className="text-muted">
            Les entrées marquées « Démonstration » sont des contenus
            temporaires.
          </p>
        )}
      </header>
      <ol className="project-list">
        {projects.map((project) => (
          <li key={project.slug}>
            <Link href={`/projects/${project.slug}`} className="project-row">
              <Image
                src={getProjectMediaPath(project, project.media.thumbnail)}
                alt=""
                width={project.media.thumbnailSize?.width ?? 1200}
                height={project.media.thumbnailSize?.height ?? 750}
                className="project-thumbnail"
                sizes="(min-width: 1440px) 422px, (min-width: 640px) 30vw, 100vw"
              />
              <div>
                <p className="eyebrow">
                  {project.featured
                    ? `Sélection / 0${project.featuredOrder}`
                    : "Projet"}
                </p>
                {project.placeholder && (
                  <p className="mt-2 text-sm text-muted">
                    Démonstration · contenu temporaire
                  </p>
                )}
                <h2 className="project-row__title">
                  {project.name}
                  <span className="project-row__arrow" aria-hidden="true">
                    ↗
                  </span>
                </h2>
                <p className="project-row__description">
                  {project.shortDescription}
                </p>
              </div>
            </Link>
          </li>
        ))}
      </ol>
    </main>
  );
}
