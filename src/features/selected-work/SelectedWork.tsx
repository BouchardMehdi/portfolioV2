import Link from "next/link";
import type { CSSProperties } from "react";
import { getFeaturedProjects } from "@/lib/projects";

export function SelectedWork() {
  const projects = getFeaturedProjects();
  return (
    <section
      id="selected-work"
      tabIndex={-1}
      aria-labelledby="selected-work-heading"
      className="selected-work"
    >
      <div className="selected-work__stage">
        <header className="selected-work__header layout-container">
          <div>
            <p className="eyebrow">02 / Selected Work</p>
            <h2 id="selected-work-heading">Projets sélectionnés</h2>
          </div>
          <p
            className="work-counter"
            aria-label={`${projects.length} projets sélectionnés`}
          >
            <span data-work-current>01</span>
            <span className="text-muted">
              {" "}
              / {String(projects.length).padStart(2, "0")}
            </span>
          </p>
        </header>
        <div className="selected-work__viewport">
          <div className="selected-work__track">
            {projects.map((project, index) => (
              <article
                id={`project-${project.slug}`}
                tabIndex={-1}
                aria-labelledby={`title-${project.slug}`}
                className="work-panel layout-container"
                key={project.slug}
                style={{ "--project-accent": project.accent } as CSSProperties}
              >
                <div
                  className="work-preview"
                  aria-label={`Visuel temporaire pour ${project.name}`}
                >
                  <span className="eyebrow">Écran projet · placeholder</span>
                  <span className="work-preview__number" aria-hidden="true">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span>{project.name}</span>
                </div>
                <div className="work-information">
                  <p className="eyebrow">{project.type}</p>
                  <h3 id={`title-${project.slug}`}>{project.name}</h3>
                  <p className="work-description">{project.shortDescription}</p>
                  <ul
                    className="work-technologies"
                    aria-label="Aperçu des technologies"
                  >
                    {project.technologies.slice(0, 4).map((technology) => (
                      <li key={technology}>{technology}</li>
                    ))}
                  </ul>
                  <Link
                    href={`/projects/${project.slug}`}
                    className="button button--primary"
                  >
                    Voir le projet
                    <span className="sr-only"> : {project.name}</span>
                    <span aria-hidden="true">↗</span>
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </div>
        <footer className="selected-work__footer layout-container">
          <nav className="work-pagination" aria-label="Parcourir la sélection">
            {projects.map((project, index) => (
              <a
                key={project.slug}
                href={`#project-${project.slug}`}
                aria-label={`Afficher ${project.name}`}
              >
                {String(index + 1).padStart(2, "0")}
              </a>
            ))}
          </nav>
          <Link href="/projects" className="text-link">
            Voir tous les projets <span aria-hidden="true">↗</span>
          </Link>
          <a href="#about" data-continue className="button button--ghost">
            Continuer <span aria-hidden="true">↓</span>
          </a>
        </footer>
      </div>
    </section>
  );
}
