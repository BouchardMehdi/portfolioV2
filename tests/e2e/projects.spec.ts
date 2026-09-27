import { expect, test } from "@playwright/test";
import { getAllProjects } from "../../src/lib/projects";

test("la visionneuse navigue sans quitter la page et restitue le focus", async ({
  page,
  context,
}) => {
  await page.goto("/projects/the-river");
  const trigger = page.locator(".project-gallery a").first();
  const dialog = page.getByRole("dialog", {
    name: "Visionneuse des captures du projet",
  });
  await trigger.click();
  await expect(dialog).toBeVisible();
  await expect(dialog.locator("figcaption")).toHaveText(
    "Table de poker multijoueur.",
  );
  const close = dialog.getByRole("button", { name: "Fermer la visionneuse" });
  await expect(close).toBeFocused();
  await page.keyboard.press("Shift+Tab");
  await expect(
    dialog.getByRole("button", { name: "Image suivante" }),
  ).toBeFocused();
  await page.keyboard.press("ArrowRight");
  await expect(dialog.locator("figcaption")).toHaveText(
    "Table de blackjack et commandes de jeu.",
  );
  await dialog.getByRole("button", { name: "Image précédente" }).click();
  await expect(dialog.locator("figcaption")).toHaveText(
    "Table de poker multijoueur.",
  );
  await dialog.locator("figure").dispatchEvent("touchstart", {
    touches: [{ identifier: 0, clientX: 260, clientY: 200 }],
  });
  await dialog.locator("figure").dispatchEvent("touchend", {
    changedTouches: [{ identifier: 0, clientX: 100, clientY: 205 }],
  });
  await expect(dialog.locator("figcaption")).toHaveText(
    "Table de blackjack et commandes de jeu.",
  );
  expect(await page.evaluate(() => document.body.style.overflow)).toBe(
    "hidden",
  );
  await page.keyboard.press("Escape");
  await expect(dialog).not.toBeVisible();
  await expect(trigger).toBeFocused();
  expect(await page.evaluate(() => document.body.style.overflow)).toBe("");
  await trigger.click();
  await close.click();
  await expect(dialog).not.toBeVisible();
  await page.locator(".project-cover-link").click();
  await expect(dialog.locator("figcaption")).toHaveText("The River");
  await dialog.click({ position: { x: 5, y: 120 } });
  await expect(dialog).not.toBeVisible();
  await expect(page).toHaveURL(/\/projects\/the-river$/);
  expect(context.pages()).toHaveLength(1);
});

test("le survol des technologies respecte la réduction des animations", async ({
  page,
  isMobile,
}) => {
  test.skip(isMobile, "Le survol est réservé aux pointeurs précis.");
  await page.goto("/projects/the-river");
  const technology = page.locator(".project-technologies li").first();
  await technology.hover();
  await expect(technology).toHaveCSS("transform", "matrix(1, 0, 0, 1, 0, -3)");
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(technology).toHaveCSS("transform", "none");
});

for (const project of getAllProjects()) {
  test(`${project.name} : contenu, captures et navigation`, async ({
    page,
  }) => {
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await page.goto(`/projects/${project.slug}`);
    await expect(
      page.getByRole("heading", { level: 1, name: project.name }),
    ).toBeVisible();
    for (const section of project.content?.sections ?? []) {
      await expect(
        page.getByRole("heading", { name: section.title, exact: true }),
      ).toBeAttached();
    }
    for (const image of await page.locator(".project-gallery img").all()) {
      await image.scrollIntoViewIfNeeded();
      await expect
        .poll(() =>
          image.evaluate(
            (element: HTMLImageElement) =>
              element.complete && element.naturalWidth > 0,
          ),
        )
        .toBe(true);
    }
    for (const video of await page.locator("video").all()) {
      await video.scrollIntoViewIfNeeded();
      await expect(video).not.toHaveAttribute("controls");
      await expect(video).toHaveAttribute("loop", "");
      await expect(video).toHaveCSS("pointer-events", "none");
      expect(
        await video.evaluate(
          (element: HTMLVideoElement) =>
            element.autoplay && element.muted && element.playsInline,
        ),
      ).toBe(true);
      await expect
        .poll(() =>
          video.evaluate(
            (element: HTMLVideoElement) =>
              !element.paused && element.currentTime > 0,
          ),
        )
        .toBe(true);
      const source = await video.getAttribute("src");
      const response = await page.request.head(source!);
      expect(response.ok()).toBe(true);
    }
    for (const link of await page.locator('a[href^="https://"]').all()) {
      await expect(link).toHaveAttribute("target", "_blank");
      await expect(link).toHaveAttribute("rel", "noopener noreferrer");
    }
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    ).toBe(true);
    await expect(
      page.getByRole("navigation", { name: "Autres projets" }),
    ).toBeAttached();
    expect(errors).toEqual([]);
  });
}

test("les pages détaillées restent lisibles sans JavaScript", async ({
  browser,
}) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto("http://127.0.0.1:3100/projects/bde-eco");
  await expect(
    page.getByText("Site associatif · Stage", { exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Gérer le contenu sans CMS" }),
  ).toBeVisible();
  await page
    .getByRole("link", { name: "Tous les projets", exact: true })
    .click();
  await expect(page).toHaveURL(/\/projects$/);
  await context.close();
});
