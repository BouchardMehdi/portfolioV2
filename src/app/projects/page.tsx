import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { getAllProjects, getProjectMediaPath } from "@/lib/projects";

export const metadata: Metadata = {
  title: "Projets",
};

export default function ProjectsPage() {
  const projects = getAllProjects();

  return (
    <main className="mx-auto min-h-svh max-w-360 px-5 py-16 sm:px-8 lg:px-16">
      <Link href="/" className="underline underline-offset-4">
        <span aria-hidden="true">←</span> Accueil
      </Link>
      <h1 className="mt-16 text-5xl font-medium tracking-tight sm:text-7xl">
        Projets
      </h1>
      {projects.some((project) => project.placeholder) && (
        <p className="mt-8 max-w-xl text-lg text-muted">
          Les entrées marquées « Démonstration » sont des contenus temporaires.
        </p>
      )}
      <ol className="mt-12 divide-y divide-foreground/15">
        {projects.map((project) => (
          <li key={project.slug} className="py-8">
            <Link
              href={`/projects/${project.slug}`}
              className="grid gap-6 sm:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] sm:items-center"
            >
              <Image
                src={getProjectMediaPath(project, project.media.thumbnail)}
                alt={
                  project.placeholder
                    ? `Visuel temporaire — ${project.name}`
                    : project.name
                }
                width={1200}
                height={750}
                className="h-auto w-full"
                sizes="(min-width: 640px) 33vw, 100vw"
              />
              <div>
                {project.placeholder && (
                  <p className="mb-3 text-sm text-muted">
                    Démonstration · contenu temporaire
                  </p>
                )}
                <h2 className="text-2xl font-medium">
                  {project.name} <span aria-hidden="true">↗</span>
                </h2>
                <p className="mt-3 max-w-xl text-muted">
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
