import { z } from "zod";

const text = z.string().trim().min(1, "Le texte ne peut pas être vide.");
const imageFile = z
  .string()
  .regex(
    /^[a-zA-Z0-9][a-zA-Z0-9_-]*\.(?:avif|webp|png|jpe?g|svg)$/,
    "Indiquer un nom de fichier image, sans chemin.",
  );
const webUrl = z.httpUrl();
const imageSize = z.strictObject({
  width: z.number().int().positive(),
  height: z.number().int().positive(),
});
const accent = z
  .string()
  .regex(
    /^#[0-9a-fA-F]{6}$/,
    "Utiliser une couleur hexadécimale à six chiffres.",
  );

const caseStudySchema = z.strictObject({
  context: text,
  problem: text,
  role: text,
  solution: text,
  technicalDecisions: z
    .array(z.strictObject({ title: text, description: text }))
    .min(1),
  results: z.array(text).min(1),
  conclusion: text,
});

const commonFields = {
  slug: z
    .string()
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      "Utiliser un slug en minuscules avec des tirets.",
    ),
  name: text,
  shortDescription: text,
  year: z
    .number()
    .int()
    .min(2000)
    .max(new Date().getFullYear() + 1)
    .nullable(),
  type: text,
  status: z.enum(["ongoing", "completed"]),
  published: z.boolean(),
  placeholder: z.boolean().default(false),
  technologies: z.array(text),
  accent: accent.optional(),
  links: z
    .strictObject({ live: webUrl.optional(), github: webUrl.optional() })
    .optional(),
  media: z.strictObject({
    cover: imageFile,
    thumbnail: imageFile,
    coverSize: imageSize.optional(),
    thumbnailSize: imageSize.optional(),
    gallery: z.array(imageFile).optional(),
    video: z
      .string()
      .regex(/^[a-zA-Z0-9][a-zA-Z0-9_-]*\.(?:mp4|webm)$/)
      .nullable()
      .optional(),
    videos: z
      .array(z.string().regex(/^[a-zA-Z0-9][a-zA-Z0-9_-]*\.(?:mp4|webm)$/))
      .optional(),
  }),
  content: z
    .strictObject({
      overview: text,
      features: z.array(text).optional(),
      challenges: z.array(text).optional(),
      lessons: text.optional(),
    })
    .optional(),
  caseStudy: caseStudySchema.optional(),
};

export const projectSchema = z.discriminatedUnion("featured", [
  z.strictObject({
    ...commonFields,
    featured: z.literal(true),
    published: z.literal(true, {
      error: "Un projet mis en avant doit être publié.",
    }),
    featuredOrder: z.number().int().min(1).max(4),
    accent,
    caseStudy: caseStudySchema,
  }),
  z.strictObject({
    ...commonFields,
    featured: z.literal(false),
  }),
]);

export const projectsSchema = z
  .strictObject({ projects: z.array(projectSchema) })
  .superRefine(({ projects }, context) => {
    const slugs = new Set<string>();
    const featuredOrders = new Set<number>();

    projects.forEach((project, index) => {
      if (slugs.has(project.slug)) {
        context.addIssue({
          code: "custom",
          path: ["projects", index, "slug"],
          message: `Le slug « ${project.slug} » est déjà utilisé.`,
        });
      }
      slugs.add(project.slug);

      if (project.featured) {
        if (featuredOrders.has(project.featuredOrder)) {
          context.addIssue({
            code: "custom",
            path: ["projects", index, "featuredOrder"],
            message: `L’ordre ${project.featuredOrder} est déjà utilisé.`,
          });
        }
        featuredOrders.add(project.featuredOrder);
      }
    });

    const featuredCount = projects.filter((project) => project.featured).length;
    if (featuredCount < 3 || featuredCount > 4) {
      context.addIssue({
        code: "custom",
        path: ["projects"],
        message:
          "La sélection doit contenir trois ou quatre projets mis en avant.",
      });
    }

    projects.forEach((project, index) => {
      if (project.featured && project.featuredOrder > featuredCount) {
        context.addIssue({
          code: "custom",
          path: ["projects", index, "featuredOrder"],
          message:
            "Les projets mis en avant doivent être numérotés à partir de 1, sans interruption.",
        });
      }
    });
  });

export type Project = z.infer<typeof projectSchema>;
export type FeaturedProject = Extract<Project, { featured: true }>;

export function parseProjects(input: unknown) {
  const result = projectsSchema.safeParse(input);

  if (!result.success) {
    const details = result.error.issues
      .map(
        (issue) => `- ${issue.path.join(".") || "projects"} : ${issue.message}`,
      )
      .join("\n");

    throw new Error(`projects.json invalide :\n${details}`);
  }

  return result.data;
}
