import { readFileSync, statSync } from "node:fs";
import { fileURLToPath } from "node:url";

import { parseProjects } from "../src/schemas/project.schema";

try {
  const data: unknown = JSON.parse(
    readFileSync(new URL("../src/data/projects.json", import.meta.url), "utf8"),
  );
  const { projects } = parseProjects(data);
  const missingMedia: string[] = [];

  for (const project of projects.filter((entry) => entry.published)) {
    const filenames = new Set([
      project.media.cover,
      project.media.thumbnail,
      ...(project.media.gallery ?? []),
      ...(project.media.video ? [project.media.video] : []),
      ...(project.media.videos ?? []),
    ]);

    for (const filename of filenames) {
      const relativePath = `public/projects/${project.slug}/${filename}`;
      const path = fileURLToPath(
        new URL(`../${relativePath}`, import.meta.url),
      );

      try {
        if (!statSync(path).isFile()) missingMedia.push(relativePath);
      } catch {
        missingMedia.push(relativePath);
      }
    }
  }

  if (missingMedia.length > 0) {
    throw new Error(
      `Médias introuvables :\n${missingMedia.map((path) => `- ${path}`).join("\n")}`,
    );
  }

  console.log(
    `${projects.length} projets validés, dont ${projects.filter((project) => project.featured).length} mis en avant. Médias publiés vérifiés.`,
  );
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
}
