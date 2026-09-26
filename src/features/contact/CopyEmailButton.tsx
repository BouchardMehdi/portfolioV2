"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";

export function CopyEmailButton({ email }: { email: string }) {
  const [message, setMessage] = useState("");
  const [copying, setCopying] = useState(false);

  async function copyEmail() {
    setCopying(true);
    setMessage("");
    try {
      await navigator.clipboard.writeText(email);
      setMessage("Adresse copiée.");
    } catch {
      setMessage(
        "Copie indisponible. Tu peux sélectionner l’adresse ci-dessus.",
      );
    } finally {
      setCopying(false);
    }
  }

  return (
    <div className="contact-copy">
      <Button variant="ghost" onClick={copyEmail} disabled={copying}>
        Copier l’adresse email
      </Button>
      <p className="contact-copy-status" role="status">
        {message}
      </p>
    </div>
  );
}
