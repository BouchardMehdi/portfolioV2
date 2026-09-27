import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ProjectImageViewer } from "@/components/projects/ProjectImageViewer";
import { ProjectVideo } from "@/components/projects/ProjectVideo";

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
  const coverPath = getProjectMediaPath(project, project.media.cover);
  const images = [
    {
      src: coverPath,
      caption: project.name,
      width: project.media.coverSize?.width ?? 1200,
      height: project.media.coverSize?.height ?? 750,
    },
    ...(project.content?.sections ?? []).flatMap((section) =>
      (section.images ?? []).map((image) => ({
        ...image,
        src: getProjectMediaPath(project, image.file),
      })),
    ),
  ].filter(
    (image, index, entries) =>
      entries.findIndex((entry) => entry.src === image.src) === index,
  );

  return (
    <ProjectImageViewer images={images}>
      <main
        id="main-content"
        tabIndex={-1}
        className="layout-container page-shell"
      >
        <Link href="/projects" className="text-link">
          <span aria-hidden="true">←</span> Tous les projets
        </Link>

        <header className="page-heading content-column">
          <p className="eyebrow text-muted">
            {project.type}
            {project.year ? ` · ${project.year}` : ""}
          </p>
          {project.placeholder && (
            <p className="mb-4 text-sm text-muted">
              Démonstration · contenu et visuel temporaires
            </p>
          )}
          <h1>{project.name}</h1>
          <p className="body-large text-muted">{project.shortDescription}</p>
        </header>

        <a
          href={coverPath}
          data-project-image={coverPath}
          className="project-cover-link"
          aria-label={`Agrandir l’aperçu de ${project.name}`}
        >
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
        </a>

        {project.content?.overview && (
          <section
            className="project-section content-column"
            aria-labelledby="overview-heading"
          >
            <h2 id="overview-heading">Présentation</h2>
            <p className="body-large text-muted">{project.content.overview}</p>
            {project.content.features && (
              <ul className="project-points text-muted">
                {project.content.features.map((feature) => (
                  <li key={feature}>{feature}</li>
                ))}
              </ul>
            )}
          </section>
        )}

        {project.content?.sections?.map((section, index) => (
          <section
            key={section.title}
            className="project-section project-detail"
            aria-labelledby={`detail-${index}`}
          >
            <div className="content-column">
              <h2 id={`detail-${index}`}>{section.title}</h2>
              <p className="text-muted">{section.description}</p>
            </div>
            {section.images && (
              <div className="project-gallery">
                {section.images.map((image) => (
                  <figure key={image.file}>
                    <a
                      href={getProjectMediaPath(project, image.file)}
                      data-project-image={getProjectMediaPath(
                        project,
                        image.file,
                      )}
                      aria-label={`${image.caption} Agrandir l’image.`}
                    >
                      <Image
                        src={getProjectMediaPath(project, image.file)}
                        alt={image.caption}
                        width={image.width}
                        height={image.height}
                        sizes={
                          section.images!.length === 1
                            ? "(min-width: 1440px) 1312px, 100vw"
                            : "(min-width: 1440px) 640px, (min-width: 768px) 50vw, 100vw"
                        }
                      />
                    </a>
                    <figcaption>{image.caption}</figcaption>
                  </figure>
                ))}
              </div>
            )}
            {section.videos?.map((video) => (
              <figure className="project-video" key={video.file}>
                <ProjectVideo
                  src={getProjectMediaPath(project, video.file)}
                  caption={video.caption}
                />
                <figcaption>{video.caption}</figcaption>
              </figure>
            ))}
          </section>
        ))}

        {project.caseStudy && (
          <section
            className="project-section project-detail content-column"
            aria-labelledby="architecture-heading"
          >
            <h2 id="architecture-heading">Choix techniques</h2>
            <dl className="project-decisions">
              {project.caseStudy.technicalDecisions.map((decision) => (
                <div key={decision.title}>
                  <dt>{decision.title}</dt>
                  <dd className="text-muted">{decision.description}</dd>
                </div>
              ))}
            </dl>
          </section>
        )}

        {project.content?.deployment && (
          <section
            className="project-section content-column"
            aria-labelledby="deployment-heading"
          >
            <h2 id="deployment-heading">Hébergement et déploiement</h2>
            <p className="text-muted">{project.content.deployment}</p>
          </section>
        )}

        {project.content?.future && (
          <section
            className="project-section content-column"
            aria-labelledby="future-heading"
          >
            <h2 id="future-heading">Évolutions envisagées</h2>
            <p className="text-muted">
              Ces pistes ne font pas partie des fonctionnalités présentées.
            </p>
            <ul className="project-points text-muted">
              {project.content.future.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </section>
        )}

        {project.technologies.length > 0 && (
          <section
            className="project-section"
            aria-labelledby="technologies-heading"
          >
            <h2 id="technologies-heading">Technologies</h2>
            <ul className="project-technologies">
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
                className="text-link"
                target="_blank"
                rel="noopener noreferrer"
              >
                Voir le site
              </a>
            )}
            {project.links.github && (
              <a
                href={project.links.github}
                className="text-link"
                target="_blank"
                rel="noopener noreferrer"
              >
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
              <span aria-hidden="true">←</span> Précédent :{" "}
              {previousProject.name}
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
    </ProjectImageViewer>
  );
}
