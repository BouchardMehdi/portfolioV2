import Image from "next/image";
import Link from "next/link";
import { getFeaturedProjects, getProjectMediaPath } from "@/lib/projects";
import { RiverCopy } from "./RiverStory";
import { RiverScreens } from "./RiverScreens";
import { PoireCopy, PoireDetails } from "./PoireStory";

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
            {projects.map((project) => (
              <article
                id={`project-${project.slug}`}
                tabIndex={-1}
                aria-labelledby={`title-${project.slug}`}
                className={`work-panel layout-container${project.slug === "the-river" ? " river-panel" : project.slug === "ramenetapoire" ? " poire-panel" : ""}`}
                key={project.slug}
              >
                <div
                  className="work-preview"
                  data-project-preview={project.slug}
                >
                  <Image
                    src={getProjectMediaPath(project, project.media.cover)}
                    alt={`Aperçu de ${project.name}`}
                    width={600}
                    height={Math.round(
                      (600 * (project.media.coverSize?.height ?? 750)) /
                        (project.media.coverSize?.width ?? 1200),
                    )}
                    className="work-preview__image"
                  />
                </div>
                <div className="work-information">
                  <p className="eyebrow">{project.type}</p>
                  <h3 id={`title-${project.slug}`}>{project.name}</h3>
                  <p className="work-description">{project.shortDescription}</p>
                  {project.slug === "the-river" && <RiverCopy />}
                  {project.slug === "ramenetapoire" && <PoireCopy />}
                  <ul
                    className="work-technologies"
                    aria-label="Aperçu des technologies"
                  >
                    {(project.slug === "the-river"
                      ? project.technologies.filter((technology) =>
                          ["NestJS", "Socket.IO", "MySQL", "TypeORM"].includes(
                            technology,
                          ),
                        )
                      : project.slug === "ramenetapoire"
                        ? project.technologies.filter((technology) =>
                            [
                              "Next.js",
                              "NestJS",
                              "PostgreSQL",
                              "Socket.IO",
                            ].includes(technology),
                          )
                        : project.technologies.slice(0, 4)
                    ).map((technology) => (
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
                {project.slug === "the-river" && <RiverScreens />}
                {project.slug === "ramenetapoire" && <PoireDetails />}
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
          <a
            href={`#project-${projects[1].slug}`}
            data-next-project
            className="text-link"
            hidden
          >
            Projet suivant <span aria-hidden="true">→</span>
          </a>
          <Link href="/projects" className="text-link">
            Voir tous les projets <span aria-hidden="true">↗</span>
          </Link>
          <a href="#about" data-continue className="button button--ghost">
            Continuer <span aria-hidden="true">↓</span>
          </a>
        </footer>
        <div className="work-progress" aria-hidden="true">
          <span />
        </div>
      </div>
    </section>
  );
}
