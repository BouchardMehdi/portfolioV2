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
    <main className="mx-auto min-h-svh max-w-360 px-5 py-16 sm:px-8 lg:px-16">
      <Link href="/projects" className="underline underline-offset-4">
        <span aria-hidden="true">←</span> Tous les projets
      </Link>

      <header className="mt-16 max-w-3xl">
        {project.placeholder && (
          <p className="mb-4 text-sm text-muted">
            Démonstration · contenu et visuel temporaires
          </p>
        )}
        <h1 className="text-5xl font-medium tracking-tight sm:text-7xl">
          {project.name}
        </h1>
        <p className="mt-8 text-lg text-muted">{project.shortDescription}</p>
      </header>

      <Image
        src={getProjectMediaPath(project, project.media.cover)}
        alt={
          project.placeholder
            ? `Visuel temporaire — ${project.name}`
            : project.name
        }
        width={1200}
        height={750}
        className="mt-12 h-auto w-full"
        sizes="(min-width: 1440px) 1312px, 100vw"
      />

      {project.content?.overview && (
        <section className="mt-12 max-w-3xl" aria-labelledby="overview-heading">
          <h2 id="overview-heading" className="text-2xl font-medium">
            Présentation
          </h2>
          <p className="mt-4 text-lg text-muted">{project.content.overview}</p>
        </section>
      )}

      {project.technologies.length > 0 && (
        <section className="mt-12" aria-labelledby="technologies-heading">
          <h2 id="technologies-heading" className="text-2xl font-medium">
            Technologies
          </h2>
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
            <a
              href={project.links.live}
              className="underline underline-offset-4"
            >
              Voir le site
            </a>
          )}
          {project.links.github && (
            <a
              href={project.links.github}
              className="underline underline-offset-4"
            >
              Code sur GitHub
            </a>
          )}
        </nav>
      )}

      <nav
        aria-label="Autres projets"
        className="mt-16 flex flex-wrap justify-between gap-8 border-t border-foreground/15 pt-8"
      >
        {previousProject && (
          <Link
            href={`/projects/${previousProject.slug}`}
            className="underline underline-offset-4"
          >
            <span aria-hidden="true">←</span> Précédent : {previousProject.name}
          </Link>
        )}
        {nextProject && (
          <Link
            href={`/projects/${nextProject.slug}`}
            className="ml-auto underline underline-offset-4"
          >
            Suivant : {nextProject.name} <span aria-hidden="true">→</span>
          </Link>
        )}
      </nav>
    </main>
  );
}
