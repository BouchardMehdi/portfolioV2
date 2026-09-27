import { expect, test } from "@playwright/test";

test("le formulaire conserve la saisie en cas d’échec puis confirme un envoi réussi", async ({
  page,
}) => {
  let calls = 0;
  await page.route("**/api/contact", async (route) => {
    calls++;
    await route.fulfill({
      status: calls === 1 ? 502 : 200,
      json: {
        message:
          calls === 1
            ? "L’envoi a échoué."
            : "Ton message a été envoyé. Merci !",
      },
    });
  });
  await page.goto("/#contact");
  const form = page.getByRole("form", { name: "Envoyer un message" });
  await form.getByRole("button", { name: "Envoyer le message" }).click();
  await expect(form.getByLabel("Nom", { exact: true })).toBeFocused();
  expect(calls).toBe(0);
  await form.getByLabel("Nom", { exact: true }).fill("Camille Martin");
  await form.getByLabel("Email", { exact: true }).fill("camille@example.com");
  await form.getByLabel("Sujet", { exact: true }).fill("Un projet web");
  await form
    .getByLabel("Message", { exact: true })
    .fill("Bonjour, je souhaite vous parler d’un projet.");
  await form.getByRole("button", { name: "Envoyer le message" }).click();
  await expect(form.getByRole("status")).toHaveText("L’envoi a échoué.");
  await expect(form.getByLabel("Message", { exact: true })).toHaveValue(
    "Bonjour, je souhaite vous parler d’un projet.",
  );
  await form.getByRole("button", { name: "Envoyer le message" }).click();
  await expect(form.getByRole("status")).toContainText("a été envoyé");
  await expect(form.getByLabel("Message", { exact: true })).toBeEmpty();
  expect(calls).toBe(2);
});

test("le contact est accessible depuis un projet et permet de copier l’email", async ({
  page,
  context,
}) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await page.goto("/projects/the-river");
  await page.getByRole("button", { name: "Menu", exact: true }).click();
  await page.getByRole("link", { name: "Contact", exact: true }).click();
  await expect(page).toHaveURL("/#contact");
  await expect(
    page.getByRole("heading", { name: "On en parle ?" }),
  ).toBeInViewport();
  await page.getByRole("button", { name: "Copier l’adresse email" }).click();
  await expect(page.locator(".contact-copy").getByRole("status")).toHaveText(
    "Adresse copiée.",
  );
  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(
    "bouchardmehdi35@gmail.com",
  );
  await page
    .getByRole("contentinfo")
    .getByRole("link", { name: "Retour à l’accueil" })
    .click();
  await expect(page).toHaveURL("/#hero");
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(0);
});

test("un refus de copie conserve le contact direct et une mise en page étroite", async ({
  page,
}) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, "clipboard", {
      value: {
        writeText: () => Promise.reject(new Error("Permission refusée")),
      },
    });
  });
  await page.setViewportSize({ width: 320, height: 740 });
  await page.emulateMedia({ reducedMotion: "reduce", colorScheme: "light" });
  await page.goto("/#contact");
  await page.getByRole("button", { name: "Copier l’adresse email" }).click();
  await expect(page.locator(".contact-copy").getByRole("status")).toContainText(
    "Copie indisponible",
  );
  await expect(
    page.getByRole("link", { name: "bouchardmehdi35@gmail.com" }),
  ).toHaveAttribute("href", "mailto:bouchardmehdi35@gmail.com");
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
});
