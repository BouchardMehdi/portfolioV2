import { expect, test, type Page } from "@playwright/test";
import { riverDuration } from "../../src/features/selected-work/river-story";

async function seek(page: Page, progress: number) {
  const range = await page.locator("#selected-work").evaluate((section) => ({
    start: section.getBoundingClientRect().top + window.scrollY - 80,
    distance:
      section.getBoundingClientRect().height -
      section.querySelector(".selected-work__stage")!.getBoundingClientRect()
        .height,
  }));
  await page.evaluate(
    (top) => window.scrollTo({ top, behavior: "instant" }),
    range.start +
      range.distance * (riverDuration / (riverDuration + 2)) * progress,
  );
}

test("The River déroule ses étapes dans les deux sens, y compris après redimensionnement", async ({
  page,
  isMobile,
}) => {
  test.skip(isMobile, "Le mobile conserve les captures simples.");
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/#selected-work");
  const river = page.locator(".river-panel");
  await expect(river.locator(".work-preview")).toHaveAttribute(
    "data-three-ready",
    "true",
    { timeout: 20000 },
  );
  const steps = [
    [0.04, "intro"],
    [0.17, "machine"],
    [0.4, "games"],
    [0.59, "realtime"],
    [0.78, "progression"],
    [0.9, "reading"],
    [0.99, "exit"],
  ] as const;
  for (const [progress, phase] of [...steps, ...steps.toReversed()]) {
    await seek(page, progress);
    await expect(river).toHaveAttribute("data-river-phase", phase);
    await expect(river.locator("[data-river-beat]:visible")).toHaveCount(1);
    const copy = (await river
      .locator("[data-river-beat]:visible")
      .boundingBox())!;
    const action = (await page
      .getByRole("link", { name: "Voir le projet : The River" })
      .boundingBox())!;
    expect(
      copy.x + copy.width <= action.x ||
        action.x + action.width <= copy.x ||
        copy.y + copy.height <= action.y ||
        action.y + action.height <= copy.y,
    ).toBe(true);
    await expect(
      page.getByRole("link", { name: "Voir le projet : The River" }),
    ).toBeInViewport();
    await expect(
      page.getByRole("link", { name: "Projet suivant", exact: true }),
    ).toBeInViewport();
    await expect(
      page.getByRole("link", { name: "Continuer", exact: true }),
    ).toBeInViewport();
    const view = await river.locator(".work-preview").boundingBox();
    expect(view!.width).toBe(page.viewportSize()!.width);
    expect(view!.height).toBeGreaterThan(page.viewportSize()!.height * 0.85);
    if (phase === "progression")
      await expect(river.locator(".work-preview")).toHaveAttribute(
        "data-river-screen-ready",
        "true",
      );
  }
  await seek(page, 0.995);
  await page.setViewportSize({ width: 1024, height: 700 });
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
    .toBe(Math.round((riverDuration + 2) * 650));
  await seek(page, 0.59);
  await expect(river).toHaveAttribute("data-river-phase", "realtime");
  await expect(page.locator("[data-work-current]")).toHaveText("01");
  await expect(river).toBeInViewport({ ratio: 0.999 });
  await expect(
    page.getByRole("link", { name: "Voir le projet : The River" }),
  ).toBeInViewport({ ratio: 1 });
  await seek(page, 0.04);
  await expect(river).toHaveAttribute("data-river-phase", "intro");
  await expect(page.locator("canvas")).toHaveCount(1);
  expect(errors).toEqual([]);
});

test("Projet suivant quitte The River, garde le retour possible et disparaît au dernier projet", async ({
  page,
  isMobile,
}) => {
  test.skip(isMobile, "Les raccourcis immersifs concernent le desktop.");
  await page.goto("/#selected-work");
  await expect(page.locator("#selected-work")).toHaveAttribute(
    "data-horizontal",
    "true",
  );
  await seek(page, 0.4);
  await page.getByRole("link", { name: "Projet suivant", exact: true }).click();
  await expect(page).toHaveURL("/#project-ramenetapoire");
  await expect(page.locator("#project-ramenetapoire")).toBeFocused();
  await expect(page.locator("[data-work-current]")).toHaveText("02");
  await page.getByRole("link", { name: "Projet suivant", exact: true }).click();
  await expect(page).toHaveURL("/#project-wankultcg");
  await expect(page.locator("[data-next-project]")).toBeHidden();
  await page
    .getByRole("link", { name: "Afficher The River", exact: true })
    .click();
  await expect(page.locator(".river-panel")).toHaveAttribute(
    "data-river-phase",
    "intro",
  );
  await seek(page, 0.59);
  await page.getByRole("link", { name: "Continuer", exact: true }).click();
  await expect(page.locator("#about")).toBeFocused();
  await expect(page).toHaveURL("/#about");
});

test("la présentation simple de The River reste disponible avec mouvement réduit", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/#selected-work");
  await expect(page.locator(".river-copy")).toBeHidden();
  await expect(page.locator(".river-screens")).toBeHidden();
  await expect(page.locator(".river-panel .work-description")).toBeVisible();
  await expect(page.locator(".river-panel .work-preview img")).toBeVisible();
  await expect(page.locator("canvas")).toHaveCount(0);
  await page.getByRole("link", { name: "Voir le projet : The River" }).click();
  await expect(page).toHaveURL("/projects/the-river");
});

test("la console conserve une capture lisible si sa texture ne charge pas", async ({
  page,
  isMobile,
}) => {
  test.skip(isMobile, "La console 3D concerne le desktop.");
  await page.route("**/projects/the-river/menu.png", (route) => route.abort());
  await page.goto("/#selected-work");
  const preview = page.locator(".river-panel .work-preview");
  await expect(preview).toHaveAttribute("data-three-ready", "true", {
    timeout: 20000,
  });
  await seek(page, 0.8);
  await expect(preview.locator("img")).toHaveCSS("opacity", "1");
  await expect
    .poll(() =>
      preview
        .locator("img")
        .evaluate((img: HTMLImageElement) => img.naturalWidth),
    )
    .toBeGreaterThan(0);
  await page.getByRole("link", { name: "Voir le projet : The River" }).click();
  await expect(page).toHaveURL("/projects/the-river");
});
