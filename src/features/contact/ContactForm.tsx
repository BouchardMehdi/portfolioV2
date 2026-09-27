"use client";

import { useRef, useState, type FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import { contactSchema } from "@/schemas/contact.schema";

export function ContactForm() {
  const pending = useRef(false);
  const [sending, setSending] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending.current) return;
    const form = event.currentTarget;
    const parsed = contactSchema.safeParse(
      Object.fromEntries(new FormData(form)),
    );
    setFeedback("");
    setErrors({});
    if (!parsed.success) {
      const fields: Record<string, string> = {};
      for (const issue of parsed.error.issues)
        fields[String(issue.path[0])] ??= issue.message;
      setErrors(fields);
      const field = form.elements.namedItem(Object.keys(fields)[0]);
      if (field instanceof HTMLElement) field.focus();
      return;
    }
    pending.current = true;
    setSending(true);
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
        signal: AbortSignal.timeout(15000),
      });
      const result = await response.json();
      setFeedback(
        typeof result.message === "string"
          ? result.message
          : "L’envoi n’a pas pu être confirmé. Réessaie plus tard.",
      );
      if (response.ok) form.reset();
    } catch {
      setFeedback(
        "L’envoi n’a pas pu être confirmé. Ton message est conservé ; tu peux réessayer ou utiliser mon adresse email.",
      );
    } finally {
      pending.current = false;
      setSending(false);
    }
  }

  return (
    <form
      className="contact-form"
      aria-labelledby="contact-form-heading"
      method="post"
      action="/api/contact"
      onSubmit={submit}
      noValidate
    >
      <h3 id="contact-form-heading">Envoyer un message</h3>
      <p className="contact-form-note">Tous les champs sont obligatoires.</p>
      <fieldset disabled={sending}>
        {(
          [
            {
              name: "name",
              label: "Nom",
              type: "text",
              autoComplete: "name",
              max: 100,
            },
            {
              name: "email",
              label: "Email",
              type: "email",
              autoComplete: "email",
              max: 254,
            },
            {
              name: "subject",
              label: "Sujet",
              type: "text",
              autoComplete: "off",
              max: 150,
            },
          ] as const
        ).map((field) => (
          <div className="contact-field" key={field.name}>
            <label htmlFor={`contact-${field.name}`}>{field.label}</label>
            <input
              id={`contact-${field.name}`}
              name={field.name}
              type={field.type}
              autoComplete={field.autoComplete}
              maxLength={field.max}
              required
              aria-invalid={Boolean(errors[field.name])}
              aria-describedby={
                errors[field.name] ? `contact-${field.name}-error` : undefined
              }
            />
            {errors[field.name] && (
              <p
                className="contact-field-error"
                id={`contact-${field.name}-error`}
              >
                {errors[field.name]}
              </p>
            )}
          </div>
        ))}
        <div className="contact-field">
          <label htmlFor="contact-message">Message</label>
          <textarea
            id="contact-message"
            name="message"
            rows={6}
            maxLength={5000}
            required
            aria-invalid={Boolean(errors.message)}
            aria-describedby={
              errors.message ? "contact-message-error" : undefined
            }
          />
          {errors.message && (
            <p className="contact-field-error" id="contact-message-error">
              {errors.message}
            </p>
          )}
        </div>
        <div className="contact-trap" aria-hidden="true">
          <label htmlFor="contact-website">Site web</label>
          <input
            id="contact-website"
            name="website"
            tabIndex={-1}
            autoComplete="off"
          />
        </div>
        <Button type="submit">
          {sending ? "Envoi en cours…" : "Envoyer le message"}
        </Button>
      </fieldset>
      <p className="contact-form-feedback" role="status" aria-atomic="true">
        {feedback}
      </p>
      <p className="contact-form-note">
        Ton nom, ton email et ton message servent à traiter ta demande et à te
        répondre.
      </p>
      <noscript>
        <style>{".contact-form fieldset { display: none; }"}</style>
        Pour m’écrire, utilise le lien email à côté du formulaire.
      </noscript>
    </form>
  );
}
