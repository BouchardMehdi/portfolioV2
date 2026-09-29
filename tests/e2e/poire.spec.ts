import { expect, test, type Page } from "@playwright/test";
import { riverDuration } from "../../src/features/selected-work/river-story";
import { poireDuration } from "../../src/features/selected-work/poire-story";

async function seek(page: Page, progress: number) {
  const time = riverDuration + 0.35 + poireDuration * progress;
  const ratio = time / (riverDuration + poireDuration + 1.35);
  await page.locator("#selected-work").evaluate((section, progress) => {
    const bounds = section.getBoundingClientRect();
    const height = section
      .querySelector(".selected-work__stage")!
      .getBoundingClientRect().height;
    window.scrollTo({
      top:
        bounds.top + window.scrollY - 80 + (bounds.height - height) * progress,
      behavior: "instant",
    });
  }, ratio);
}

test("RamèneTaPoire reste réversible, lisible et navigable dans ses neuf scènes", async ({
  page,
  isMobile,
}) => {
  test.skip(isMobile, "La version tactile conserve la présentation simple.");
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/#project-ramenetapoire");
  const panel = page.locator(".poire-panel");
  await expect(panel.locator(".work-preview")).toHaveAttribute(
    "data-three-ready",
    "true",
    { timeout: 20000 },
  );
  const steps = [
    [0.04, "intro"],
    [0.18, "discover"],
    [0.35, "table"],
    [0.48, "reserve"],
    [0.65, "share"],
    [0.77, "messages"],
    [0.85, "host"],
    [0.915, "reading"],
    [0.975, "exit"],
  ] as const;
  for (const size of [
    { width: 1440, height: 1000 },
    { width: 1024, height: 700 },
  ]) {
    await page.setViewportSize(size);
    await expect
      .poll(() =>
        page
          .locator("#selected-work")
          .evaluate((section) =>
            Math.round(
              section.getBoundingClientRect().height -
                section
                  .querySelector(".selected-work__stage")!
                  .getBoundingClientRect().height,
            ),
          ),
      )
      .toBe(
        Math.round(
          (riverDuration + poireDuration + 1.35) *
            Math.max(650, size.height * 0.85),
        ),
      );
    for (const [progress, phase] of [...steps, ...steps.toReversed()]) {
      await seek(page, progress);
      await expect(panel).toHaveAttribute("data-poire-phase", phase);
      await expect(panel.locator("[data-poire-beat]:visible")).toHaveCount(1);
      await expect(page.locator("[data-work-current]")).toHaveText("02");
      const copy = (await panel
        .locator("[data-poire-beat]:visible")
        .boundingBox())!;
      const button = panel.getByRole("link", { name: "Voir le projet" });
      const action = (await button.boundingBox())!;
      expect(
        copy.y + copy.height <= action.y || copy.x >= action.x + action.width,
      ).toBe(true);
      await expect(button).toBeInViewport({ ratio: 1 });
      await expect(
        page.getByRole("link", { name: "Continuer", exact: true }),
      ).toBeInViewport({ ratio: 1 });
      if (phase === "messages" || phase === "host" || phase === "reading") {
        await expect(panel.locator(".work-preview")).toHaveAttribute(
          "data-poire-screen-ready",
          "true",
        );
      }
    }
  }
  await page.getByRole("link", { name: "Projet suivant", exact: true }).click();
  await expect(page).toHaveURL("/#project-wankultcg");
  await expect(page.locator("[data-work-current]")).toHaveText("03");
  await page
    .getByRole("link", { name: "Afficher RamèneTaPoire", exact: true })
    .click();
  await expect(panel).toHaveAttribute("data-poire-phase", "intro");
  await seek(page, 0.65);
  await page.getByRole("link", { name: "Continuer", exact: true }).click();
  await expect(page.locator("#about")).toBeFocused();
  expect(errors).toEqual([]);
});

test("les interfaces sont différées et gardent un secours HTML si leur texture échoue", async ({
  page,
  isMobile,
}) => {
  test.skip(isMobile, "Le tactile n’utilise pas de textures.");
  const requests: string[] = [];
  page.on("request", (request) => {
    if (
      /\/projects\/ramenetapoire\/(page-messagerie-3|page-creation-evenement|page-fiche-repas)\.png$/.test(
        request.url(),
      )
    )
      requests.push(request.url());
  });
  await page.route("**/projects/ramenetapoire/page-messagerie-3.png", (route) =>
    route.abort(),
  );
  await page.goto("/#project-ramenetapoire");
  await expect(page.locator(".poire-panel .work-preview")).toHaveAttribute(
    "data-three-ready",
    "true",
    { timeout: 20000 },
  );
  expect(requests).toEqual([]);
  await seek(page, 0.77);
  const fallback = page.locator('[data-poire-screen="messages"] img');
  await expect(fallback).toBeVisible();
  await expect
    .poll(() =>
      fallback.evaluate((image: HTMLImageElement) => image.naturalWidth),
    )
    .toBeGreaterThan(0);
  await page
    .getByRole("link", { name: "Voir le projet : RamèneTaPoire" })
    .click();
  await expect(page).toHaveURL("/projects/ramenetapoire");
});

test("RamèneTaPoire conserve images et liens en mouvement réduit", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/#project-ramenetapoire");
  await expect(page.locator(".poire-copy")).toBeHidden();
  await expect(page.locator(".poire-details")).toBeHidden();
  await expect(page.locator(".poire-panel .work-description")).toBeVisible();
  await expect(page.locator(".poire-panel .work-preview img")).toBeVisible();
  await expect(page.locator("canvas")).toHaveCount(0);
});

test("une perte WebGL dans RamèneTaPoire conserve la capture et les commandes", async ({
  page,
  isMobile,
}) => {
  test.skip(isMobile, "Le tactile ne charge pas de scène WebGL.");
  await page.goto("/#project-ramenetapoire");
  const preview = page.locator(".poire-panel .work-preview");
  await expect(preview).toHaveAttribute("data-three-ready", "true", {
    timeout: 20000,
  });
  await seek(page, 0.77);
  await expect(preview).toHaveAttribute("data-poire-screen-ready", "true");
  await page.locator("canvas").evaluate((canvas: HTMLCanvasElement) => {
    const extension = canvas
      .getContext("webgl2")
      ?.getExtension("WEBGL_lose_context");
    if (!extension) throw new Error("Extension de perte de contexte absente");
    extension.loseContext();
  });
  await expect(page.locator("canvas")).toHaveCount(0);
  await expect(
    page.locator('[data-poire-screen="messages"] img'),
  ).toBeVisible();
  await seek(page, 0.65);
  await expect(preview.locator("img")).toHaveCSS("opacity", "1");
  await page.getByRole("link", { name: "Continuer", exact: true }).click();
  await expect(page.locator("#about")).toBeFocused();
});
