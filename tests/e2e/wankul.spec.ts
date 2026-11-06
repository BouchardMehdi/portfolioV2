import { expect, test, type Page } from "@playwright/test";
import { riverDuration } from "../../src/features/selected-work/river-story";
import { poireDuration } from "../../src/features/selected-work/poire-story";
import { wankulDuration } from "../../src/features/selected-work/wankul-story";

async function seek(page: Page, progress: number) {
  const time = riverDuration + poireDuration + 0.7 + wankulDuration * progress;
  const ratio = time / (riverDuration + poireDuration + wankulDuration + 0.7);
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

test("Wankul reste réversible, lisible et navigable jusqu’à la sortie", async ({
  page,
  isMobile,
}) => {
  test.setTimeout(60000);
  test.skip(isMobile, "Le tactile conserve les captures simples.");
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/#project-wankultcg");
  const panel = page.locator(".wankul-panel");
  await expect(panel.locator(".work-preview")).toHaveAttribute(
    "data-three-ready",
    "true",
    { timeout: 20000 },
  );
  const steps = [
    [0.04, "intro"],
    [0.2, "booster"],
    [0.33, "reveal"],
    [0.425, "rare"],
    [0.565, "collection"],
    [0.71, "market"],
    [0.81, "economy"],
    [0.91, "reading"],
    [0.99, "exit"],
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
          (riverDuration + poireDuration + wankulDuration + 0.7) *
            Math.max(650, size.height * 0.85),
        ),
      );
    for (const [progress, phase] of [...steps, ...steps.toReversed()]) {
      await seek(page, progress);
      await expect(panel).toHaveAttribute("data-wankul-phase", phase);
      await expect(panel.locator("[data-wankul-beat]:visible")).toHaveCount(1);
      await expect(page.locator("[data-work-current]")).toHaveText("03");
      await expect(page.locator("[data-next-project]")).toBeHidden();
      await expect(panel.locator(".wankul-disclaimer")).toBeInViewport({
        ratio: 1,
      });
      await expect(
        panel.getByRole("link", { name: "Voir le projet" }),
      ).toBeInViewport({ ratio: 1 });
      await expect(
        page.getByRole("link", { name: "Continuer", exact: true }),
      ).toBeInViewport({ ratio: 1 });
      if (phase === "collection" || phase === "market") {
        const image = panel.locator(`[data-wankul-screen="${phase}"] img`);
        const crop = panel.locator(
          `[data-wankul-screen="${phase}"] .wankul-screen-crop`,
        );
        await expect(crop).toBeInViewport({ ratio: 1 });
        await expect
          .poll(() =>
            image.evaluate((element: HTMLImageElement) => element.naturalWidth),
          )
          .toBeGreaterThan(0);
        const copy = (await panel
          .locator("[data-wankul-beat]:visible")
          .boundingBox())!;
        const screen = (await crop.boundingBox())!;
        const footer = (await page
          .locator(".selected-work__footer")
          .boundingBox())!;
        expect(screen.y).toBeGreaterThan(copy.y + copy.height);
        expect(screen.y + screen.height).toBeLessThan(footer.y);
      }
    }
  }
  await seek(page, 0.81);
  await page.getByRole("link", { name: "Continuer", exact: true }).click();
  await expect(page.locator("#about")).toBeFocused();
  expect(errors).toEqual([]);
});

test("la collection passe directement au marché dans les deux sens", async ({
  page,
  isMobile,
}) => {
  test.skip(isMobile, "Pas de transition immersive sur mobile.");
  await page.goto("/#project-wankultcg");
  const panel = page.locator(".wankul-panel");
  await expect(panel.locator(".work-preview")).toHaveAttribute(
    "data-three-ready",
    "true",
    { timeout: 20000 },
  );
  const positions = [0.59, 0.6, 0.612, 0.62, 0.64, 0.68];
  for (const progress of [...positions, ...positions.toReversed()]) {
    await seek(page, progress);
    await expect
      .poll(() =>
        panel.evaluate((element) => {
          const screens = Array.from(
            element.querySelectorAll<HTMLElement>("[data-wankul-screen]"),
          );
          return screens.reduce((opacity, screen) => {
            const style = getComputedStyle(screen);
            return (
              opacity + (style.display === "none" ? 0 : Number(style.opacity))
            );
          }, 0);
        }),
      )
      .toBeCloseTo(1, 4);
    await expect(panel).toHaveAttribute(
      "data-wankul-phase",
      progress < 0.61 ? "collection" : "market",
    );
  }
});

test("les visuels Wankul attendent leur univers et la perte WebGL garde les commandes", async ({
  page,
  isMobile,
}) => {
  test.skip(isMobile, "Aucune texture sur mobile.");
  const requests: string[] = [];
  page.on("request", (request) => {
    if (request.url().includes("/wankultcg/scene/"))
      requests.push(request.url());
  });
  await page.goto("/#selected-work");
  await expect(page.locator(".river-panel .work-preview")).toHaveAttribute(
    "data-three-ready",
    "true",
    { timeout: 20000 },
  );
  expect(requests).toEqual([]);
  await page
    .getByRole("link", { name: "Afficher Wankul TCG", exact: true })
    .click();
  const preview = page.locator(".wankul-panel .work-preview");
  await expect(preview).toHaveAttribute("data-three-ready", "true", {
    timeout: 20000,
  });
  expect(requests.length).toBeGreaterThan(0);
  await seek(page, 0.565);
  await page.locator("canvas").evaluate((canvas: HTMLCanvasElement) => {
    const extension = canvas
      .getContext("webgl2")
      ?.getExtension("WEBGL_lose_context");
    if (!extension) throw new Error("Extension de perte de contexte absente");
    extension.loseContext();
  });
  await expect(page.locator("canvas")).toHaveCount(0);
  await expect(
    page.locator('[data-wankul-screen="collection"] img'),
  ).toBeVisible();
  await seek(page, 0.2);
  await expect(preview.locator("img")).toHaveCSS("opacity", "1");
  await page.getByRole("link", { name: "Voir le projet : Wankul TCG" }).click();
  await expect(page).toHaveURL("/projects/wankultcg");
});

test("Wankul reste accessible sans immersion sur mobile et en mouvement réduit", async ({
  page,
  isMobile,
}) => {
  if (!isMobile) await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/#project-wankultcg");
  await expect(page.locator(".wankul-copy")).toBeHidden();
  await expect(page.locator(".wankul-details")).toBeHidden();
  await expect(page.locator(".wankul-panel .work-description")).toBeVisible();
  await expect(page.locator(".wankul-panel .work-preview img")).toBeVisible();
  await expect(page.locator("canvas")).toHaveCount(0);
  await expect(page.locator(".wankul-panel")).toHaveJSProperty("inert", false);
});
