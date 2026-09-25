import { expect, test } from "@playwright/test";

test("le thème suit le système, mémorise le choix et peut être réinitialisé", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  await page.emulateMedia({ colorScheme: "dark" });
  await page.goto("/");
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await page.getByRole("button", { name: "Activer le thème clair" }).click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  await page.getByRole("link", { name: "Voir les projets" }).click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  await page.getByRole("button", { name: "Menu", exact: true }).click();
  await page.getByRole("button", { name: "Suivre le thème système" }).click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await page.emulateMedia({ colorScheme: "light" });
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  expect(errors).toEqual([]);
});

test("le menu fonctionne au clavier, se ferme avec Échap et rend le focus", async ({
  page,
}) => {
  await page.goto("/");
  const trigger = page.getByRole("button", { name: "Menu", exact: true });
  const nav = page.getByRole("navigation", { name: "Navigation principale" });
  await trigger.focus();
  await page.keyboard.press("Enter");
  await expect(nav).toBeVisible();
  await page.keyboard.press("Tab");
  await expect(
    nav.getByRole("link", { name: "Accueil", exact: true }),
  ).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(nav).toBeHidden();
  await expect(trigger).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(
    page.getByRole("link", { name: "Voir les projets" }),
  ).toBeFocused();
  await trigger.click();
  await page.getByRole("link", { name: "Voir les projets" }).focus();
  await expect(nav).toBeHidden();
});

test("le menu se ferme hors du panneau et après une navigation", async ({
  page,
}) => {
  await page.goto("/");
  const nav = page.getByRole("navigation", { name: "Navigation principale" });
  await page.getByRole("button", { name: "Menu", exact: true }).click();
  await page.mouse.click(8, page.viewportSize()!.height - 8);
  await expect(nav).toBeHidden();
  await page.getByRole("button", { name: "Menu", exact: true }).click();
  await nav.getByRole("link", { name: "Projets", exact: true }).click();
  await expect(page).toHaveURL("/projects");
  await expect(nav).toBeHidden();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Projets");
  await page.getByRole("button", { name: "Menu", exact: true }).click();
  await expect(
    nav.getByRole("link", { name: "Projets", exact: true }),
  ).toHaveAttribute("aria-current", "page");
});

test("le bord supérieur ouvre le menu uniquement à la souris", async ({
  page,
  isMobile,
}) => {
  test.skip(isMobile, "Le tactile utilise le bouton Menu.");
  await page.goto("/");
  await page.mouse.move(600, page.viewportSize()!.height - 8);
  await page.mouse.move(600, 5);
  const nav = page.getByRole("navigation", { name: "Navigation principale" });
  await expect(nav).toBeVisible();
  await page.mouse.move(600, page.viewportSize()!.height - 8);
  await expect(nav).toBeHidden();
});

test("le lien d’évitement donne accès au contenu", async ({ page }) => {
  await page.goto("/");
  await page.keyboard.press("Tab");
  await expect(
    page.getByRole("link", { name: "Aller au contenu" }),
  ).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page.getByRole("main")).toBeFocused();
});

test("le catalogue mène à un projet puis au suivant", async ({ page }) => {
  await page.goto("/projects");
  await expect(page.locator(".project-list > li")).toHaveCount(11);
  await page.getByRole("link", { name: /Sélection \/ 01 The River/ }).click();
  await expect(page).toHaveURL("/projects/the-river");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("The River");
  await page.getByRole("link", { name: /Suivant/ }).click();
  await expect(page).toHaveURL("/projects/ramenetapoire");
  await page.getByRole("link", { name: "Tous les projets" }).click();
  await expect(page).toHaveURL("/projects");
});

test("les pages et le menu restent dans la largeur à 320 pixels", async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 740 });
  for (const path of [
    "/",
    "/projects",
    "/projects/ramenetapoire",
    "/page-inconnue",
  ]) {
    await page.goto(path);
    await page.evaluate(() => document.fonts.ready);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    ).toBe(true);
    await page.getByRole("button", { name: "Menu", exact: true }).click();
    await expect(
      page.getByRole("navigation", { name: "Navigation principale" }),
    ).toBeVisible();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    ).toBe(true);
  }
});

test("la préférence de mouvement réduit supprime les transitions", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await expect(page.locator("body")).toHaveCSS("transition-duration", "0s");
  await expect(page.getByRole("link", { name: "Voir les projets" })).toHaveCSS(
    "transition-duration",
    "0s",
  );
  await page.getByRole("button", { name: "Menu", exact: true }).click();
  await expect(
    page.getByRole("navigation", { name: "Navigation principale" }),
  ).toBeVisible();
});
