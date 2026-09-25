import projectsData from "../data/projects.json";
import {
  parseProjects,
  type FeaturedProject,
  type Project,
} from "../schemas/project.schema";

const { projects } = parseProjects(projectsData);

export function getAllProjects(): Project[] {
  return projects
    .filter((project) => project.published)
    .sort((first, second) => {
      if (first.featured && second.featured) {
        return first.featuredOrder - second.featuredOrder;
      }

      if (first.featured !== second.featured) {
        return first.featured ? -1 : 1;
      }

      return (
        (second.year ?? 0) - (first.year ?? 0) ||
        first.name.localeCompare(second.name, "fr")
      );
    });
}

export function getProjectBySlug(slug: string) {
  return getAllProjects().find((project) => project.slug === slug);
}

export function getFeaturedProjects(): FeaturedProject[] {
  return getAllProjects().filter(
    (project): project is FeaturedProject => project.featured,
  );
}

export function getNextProject(slug: string) {
  const publishedProjects = getAllProjects();
  const index = publishedProjects.findIndex((project) => project.slug === slug);

  return index === -1 ? undefined : publishedProjects[index + 1];
}

export function getPreviousProject(slug: string) {
  const publishedProjects = getAllProjects();
  const index = publishedProjects.findIndex((project) => project.slug === slug);

  return index <= 0 ? undefined : publishedProjects[index - 1];
}

export function getTechnologies(): string[] {
  return [
    ...new Set(getAllProjects().flatMap((project) => project.technologies)),
  ].sort((first, second) => first.localeCompare(second, "fr"));
}

export function getProjectMediaPath(
  project: Pick<Project, "slug">,
  filename: string,
) {
  return `/projects/${project.slug}/${filename}`;
}
