import { z } from "zod";
import { contactSchema } from "@/schemas/contact.schema";

export const runtime = "nodejs";

const configuration = z.object({
  key: z.string().trim().min(1),
  sender: z.string().email(),
  recipient: z.string().email(),
});
const windowMs = 15 * 60 * 1000;
let attempts: { email: string; time: number }[] = [];

function reply(status: number, message: string, headers?: HeadersInit) {
  return Response.json(
    { message },
    { status, headers: { "Cache-Control": "no-store", ...headers } },
  );
}

export async function POST(request: Request) {
  const origin = process.env.CONTACT_ORIGIN || new URL(request.url).origin;
  if (request.headers.get("origin") !== origin)
    return reply(403, "Cette demande n’est pas autorisée.");
  if (request.headers.get("content-type")?.split(";")[0] !== "application/json")
    return reply(415, "Format de message non pris en charge.");

  let payload: unknown;
  try {
    const reader = request.body?.getReader();
    if (!reader) return reply(400, "Le message est vide.");
    const chunks: Uint8Array[] = [];
    let size = 0;
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > 24000) {
        await reader.cancel();
        return reply(413, "Le message est trop long.");
      }
      chunks.push(value);
    }
    payload = JSON.parse(Buffer.concat(chunks).toString("utf8"));
  } catch {
    return reply(400, "Le message n’a pas pu être lu.");
  }
  const parsed = contactSchema.safeParse(payload);
  if (!parsed.success) return reply(400, "Vérifie les champs du formulaire.");

  const config = configuration.safeParse({
    key: process.env.BREVO_API_KEY,
    sender: process.env.BREVO_SENDER_EMAIL,
    recipient: process.env.CONTACT_RECIPIENT_EMAIL,
  });
  if (!config.success)
    return reply(
      503,
      "L’envoi est momentanément indisponible. Tu peux utiliser mon adresse email directement.",
    );

  const now = Date.now();
  const data = parsed.data;
  const email = data.email.toLowerCase();
  // Limite locale au processus : le proxy devra aussi limiter les requêtes en production.
  attempts = attempts.filter((attempt) => now - attempt.time < windowMs);
  if (
    attempts.length >= 20 ||
    attempts.filter((attempt) => attempt.email === email).length >= 3
  )
    return reply(
      429,
      "Trop de tentatives. Réessaie dans 15 minutes ou utilise mon adresse email.",
      { "Retry-After": "900" },
    );
  attempts.push({ email, time: now });

  try {
    const response = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "api-key": config.data.key,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      signal: AbortSignal.timeout(10000),
      body: JSON.stringify({
        sender: {
          email: config.data.sender,
          name: "Portfolio — Mehdi Bouchard",
        },
        to: [{ email: config.data.recipient }],
        replyTo: { email: data.email, name: data.name },
        subject: `[Portfolio] ${data.subject}`,
        textContent: `Nom : ${data.name}\nEmail : ${data.email}\n\n${data.message}`,
      }),
    });
    if (response.status !== 201)
      return reply(
        502,
        "L’envoi a échoué. Réessaie plus tard ou utilise mon adresse email.",
      );
    return reply(200, "Ton message a été envoyé. Merci !");
  } catch {
    return reply(
      502,
      "L’envoi n’a pas pu être confirmé. Tu peux me contacter directement par email.",
    );
  }
}
