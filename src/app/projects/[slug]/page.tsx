import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import {
  getAllProjects,
  getNextProject,
  getPreviousProject,
  getProjectBySlug,
  getProjectMediaPath,
} from "@/lib/projects";

type ProjectPageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return getAllProjects().map((project) => ({ slug: project.slug }));
}

export async function generateMetadata({
  params,
}: ProjectPageProps): Promise<Metadata> {
  const { slug } = await params;
  const project = getProjectBySlug(slug);
  if (!project) notFound();

  return {
    title: project.name,
    description: project.shortDescription,
  };
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const { slug } = await params;
  const project = getProjectBySlug(slug);
  if (!project) notFound();

  const previousProject = getPreviousProject(slug);
  const nextProject = getNextProject(slug);

  return (
    <main
      id="main-content"
      tabIndex={-1}
      className="layout-container page-shell"
    >
      <Link href="/projects" className="text-link">
        <span aria-hidden="true">←</span> Tous les projets
      </Link>

      <header className="page-heading content-column">
        {project.placeholder && (
          <p className="mb-4 text-sm text-muted">
            Démonstration · contenu et visuel temporaires
          </p>
        )}
        <h1>{project.name}</h1>
        <p className="body-large text-muted">{project.shortDescription}</p>
      </header>

      <Image
        src={getProjectMediaPath(project, project.media.cover)}
        alt={
          project.placeholder
            ? `Visuel temporaire — ${project.name}`
            : project.name
        }
        width={project.media.coverSize?.width ?? 1200}
        height={project.media.coverSize?.height ?? 750}
        className="project-cover"
        sizes="(min-width: 1440px) 1312px, 100vw"
      />

      {project.content?.overview && (
        <section
          className="project-section content-column"
          aria-labelledby="overview-heading"
        >
          <h2 id="overview-heading">Présentation</h2>
          <p className="body-large text-muted">{project.content.overview}</p>
        </section>
      )}

      {project.technologies.length > 0 && (
        <section
          className="project-section"
          aria-labelledby="technologies-heading"
        >
          <h2 id="technologies-heading">Technologies</h2>
          <ul className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-muted">
            {project.technologies.map((technology) => (
              <li key={technology}>{technology}</li>
            ))}
          </ul>
        </section>
      )}

      {(project.links?.live || project.links?.github) && (
        <nav
          aria-label="Liens du projet"
          className="mt-12 flex flex-wrap gap-6"
        >
          {project.links.live && (
            <a href={project.links.live} className="text-link">
              Voir le site
            </a>
          )}
          {project.links.github && (
            <a href={project.links.github} className="text-link">
              Code sur GitHub
            </a>
          )}
        </nav>
      )}

      <nav aria-label="Autres projets" className="project-navigation">
        {previousProject && (
          <Link
            href={`/projects/${previousProject.slug}`}
            className="button button--ghost"
          >
            <span aria-hidden="true">←</span> Précédent : {previousProject.name}
          </Link>
        )}
        {nextProject && (
          <Link
            href={`/projects/${nextProject.slug}`}
            className="button button--ghost ml-auto"
          >
            Suivant : {nextProject.name} <span aria-hidden="true">→</span>
          </Link>
        )}
      </nav>
    </main>
  );
}
