import { z } from "zod";

const singleLine = z
  .string()
  .trim()
  .regex(/^[^\r\n]*$/, "Utilise une seule ligne.");

export const contactSchema = z.object({
  name: singleLine
    .min(2, "Indique ton nom.")
    .max(100, "100 caractères maximum."),
  email: z.string().trim().email("Indique une adresse email valide.").max(254),
  subject: singleLine
    .min(3, "Précise le sujet de ton message.")
    .max(150, "150 caractères maximum."),
  message: z
    .string()
    .trim()
    .min(10, "Écris au moins 10 caractères.")
    .max(5000, "5 000 caractères maximum."),
  website: z.string().max(0).optional(),
});
