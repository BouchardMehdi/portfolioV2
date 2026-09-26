import { expect, test } from "@playwright/test";

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
  await expect(page.getByRole("status")).toHaveText("Adresse copiée.");
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
  await expect(page.getByRole("status")).toContainText("Copie indisponible");
  await expect(
    page.getByRole("link", { name: "bouchardmehdi35@gmail.com" }),
  ).toHaveAttribute("href", "mailto:bouchardmehdi35@gmail.com");
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
});
