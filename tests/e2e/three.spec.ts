import { expect, test } from "@playwright/test";

test("la sculpture accompagne Intention puis arrête son rendu avant les projets", async ({
  page,
  isMobile,
}) => {
  test.skip(isMobile, "Le mobile utilise la sculpture fixe.");
  await page.addInitScript(() => {
    const state = Object.assign(window, { drawCalls: 0 });
    const original = WebGL2RenderingContext.prototype.drawElements;
    WebGL2RenderingContext.prototype.drawElements = function (...args) {
      state.drawCalls++;
      return original.apply(this, args);
    };
    const arrays = WebGL2RenderingContext.prototype.drawArrays;
    WebGL2RenderingContext.prototype.drawArrays = function (...args) {
      state.drawCalls++;
      return arrays.apply(this, args);
    };
  });
  const draws = () =>
    page.evaluate(() => Reflect.get(window, "drawCalls") as number);
  await page.goto("/");
  await expect(page.locator(".hero-volume")).toHaveAttribute(
    "data-three-ready",
    "true",
    { timeout: 20000 },
  );
  const start = await draws();
  await expect.poll(draws).toBeGreaterThan(start + 24);
  await page.getByRole("link", { name: "Explorer", exact: true }).click();
  await expect(page.locator("#statement")).toBeFocused();
  const sculpture = page.locator(".hero-volume");
  await expect
    .poll(async () => Math.round((await sculpture.boundingBox())!.y))
    .toBe(80);
  const statement = await page.locator("#statement-heading").boundingBox();
  expect(statement!.x + statement!.width).toBeLessThan(
    (await sculpture.boundingBox())!.x,
  );
  const reading = await draws();
  await expect.poll(draws).toBeGreaterThan(reading + 24);
  await page.reload();
  await expect(sculpture).toHaveAttribute("data-three-ready", "true", {
    timeout: 20000,
  });
  await expect
    .poll(async () => Math.round((await sculpture.boundingBox())!.y))
    .toBe(80);
  await page.getByRole("button", { name: "Menu", exact: true }).click();
  await page
    .getByRole("navigation", { name: "Navigation principale" })
    .getByRole("link", { name: "Sélection", exact: true })
    .click();
  await expect(
    page.locator('[data-project-preview="the-river"]'),
  ).toHaveAttribute("data-three-ready", "true", { timeout: 20000 });
  await page.getByRole("link", { name: "Continuer", exact: true }).click();
  await expect(page.locator("#about")).toBeFocused();
  await page.waitForTimeout(700);
  const stopped = await draws();
  await page.waitForTimeout(400);
  expect(await draws()).toBe(stopped);
  await page.getByRole("button", { name: "Menu", exact: true }).click();
  await page
    .getByRole("navigation", { name: "Navigation principale" })
    .getByRole("link", { name: "Accueil", exact: true })
    .click();
  await expect.poll(draws).toBeGreaterThan(stopped + 24);
});

test("un seul Canvas accompagne le Hero et les trois projets", async ({
  page,
  isMobile,
}) => {
  test.skip(isMobile, "La 3D est réservée au mode desktop.");
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/");
  await expect(page.locator(".hero-volume")).toHaveAttribute(
    "data-three-ready",
    "true",
    { timeout: 20000 },
  );
  const canvas = await page.locator("canvas").elementHandle();
  await expect(page.locator("canvas")).toHaveCount(1);
  for (const [name, slug] of [
    ["The River", "the-river"],
    ["RamèneTaPoire", "ramenetapoire"],
    ["Wankul TCG", "wankultcg"],
  ]) {
    if (slug === "the-river")
      await page
        .getByRole("link", { name: "Voir les projets", exact: true })
        .click();
    else await page.getByRole("link", { name: `Afficher ${name}` }).click();
    await expect(
      page.locator(`[data-project-preview="${slug}"]`),
    ).toHaveAttribute("data-three-ready", "true", { timeout: 20000 });
    await expect(
      page.getByRole("link", { name: `Voir le projet : ${name}` }),
    ).toBeInViewport();
    expect(await canvas!.evaluate((element) => element.isConnected)).toBe(true);
    await expect(page.locator("canvas")).toHaveCount(1);
  }
  await page.getByRole("link", { name: "Continuer", exact: true }).click();
  await expect(page.locator("#about")).toBeFocused();
  await expect(
    page.getByRole("heading", { name: "Derrière les projets." }),
  ).toBeInViewport();
  expect(errors).toEqual([]);
});

test("changer de thème conserve le Canvas puis une route projet le libère", async ({
  page,
  isMobile,
}) => {
  test.skip(isMobile, "Pas de Canvas sur mobile.");
  await page.emulateMedia({ colorScheme: "light" });
  await page.goto("/#project-ramenetapoire");
  await expect(
    page.locator('[data-project-preview="ramenetapoire"]'),
  ).toHaveAttribute("data-three-ready", "true", { timeout: 20000 });
  const canvas = await page.locator("canvas").elementHandle();
  await page.getByRole("button", { name: "Activer le thème sombre" }).click();
  await expect(page.locator(".portfolio-canvas")).toHaveAttribute(
    "data-theme",
    "dark",
  );
  expect(await canvas!.evaluate((element) => element.isConnected)).toBe(true);
  await page
    .getByRole("link", { name: "Voir le projet : RamèneTaPoire" })
    .click();
  await expect(page).toHaveURL("/projects/ramenetapoire");
  await expect(page.locator("canvas")).toHaveCount(0);
  await page.goBack();
  await expect(
    page.locator('[data-project-preview="ramenetapoire"]'),
  ).toHaveAttribute("data-three-ready", "true", { timeout: 20000 });
  await expect(page.locator("canvas")).toHaveCount(1);
});

test("une perte de contexte rétablit les captures et conserve la navigation", async ({
  page,
  isMobile,
}) => {
  test.skip(isMobile, "Pas de contexte WebGL sur mobile.");
  await page.goto("/#selected-work");
  const preview = page.locator('[data-project-preview="the-river"]');
  await expect(preview).toHaveAttribute("data-three-ready", "true", {
    timeout: 20000,
  });
  await page.locator("canvas").evaluate((canvas: HTMLCanvasElement) => {
    const extension = canvas
      .getContext("webgl2")
      ?.getExtension("WEBGL_lose_context");
    if (!extension) throw new Error("Extension de perte de contexte absente");
    extension.loseContext();
  });
  await expect(page.locator("canvas")).toHaveCount(0);
  await expect(preview.locator("img")).toHaveCSS("opacity", "1");
  await page.getByRole("link", { name: "Continuer", exact: true }).click();
  await expect(page.locator("#about")).toBeFocused();
});

test("sans WebGL le contenu et les liens restent disponibles", async ({
  page,
}) => {
  await page.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext;
    Object.defineProperty(HTMLCanvasElement.prototype, "getContext", {
      value: function (
        this: HTMLCanvasElement,
        type: string,
        ...args: unknown[]
      ) {
        if (
          type === "webgl" ||
          type === "webgl2" ||
          type === "experimental-webgl"
        )
          return null;
        return Reflect.apply(original, this, [type, ...args]);
      },
    });
  });
  await page.goto("/#selected-work");
  const image = page.locator('[data-project-preview="the-river"] img');
  await expect(image).toHaveCSS("opacity", "1");
  await expect(image).toHaveJSProperty("complete", true);
  await page.getByRole("link", { name: "Voir le projet : The River" }).click();
  await expect(page).toHaveURL("/projects/the-river");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("The River");
});

test("une texture indisponible laisse sa capture DOM visible", async ({
  page,
  isMobile,
}) => {
  test.skip(isMobile, "Aucune texture 3D sur mobile.");
  await page.route("**/_next/image?*", (route) => {
    const url = new URL(route.request().url());
    if (url.searchParams.get("w") === "1200") return route.abort();
    return route.continue();
  });
  await page.goto("/#selected-work");
  const image = page.locator('[data-project-preview="the-river"] img');
  await expect(image).toHaveCSS("opacity", "1");
  await expect
    .poll(() => image.evaluate((img: HTMLImageElement) => img.naturalWidth))
    .toBeGreaterThan(0);
  await page.getByRole("link", { name: "Voir le projet : The River" }).click();
  await expect(page).toHaveURL("/projects/the-river");
});

test("le mouvement réduit et le mobile utilisent les images sans Canvas", async ({
  page,
  isMobile,
}) => {
  if (!isMobile) await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await expect(page.locator(".hero-structure-fallback")).toBeVisible();
  await expect(page.locator("canvas")).toHaveCount(0);
  await page.goto("/#selected-work");
  await expect(page.locator(".work-preview img")).toHaveCount(3);
  await expect(page.locator("canvas")).toHaveCount(0);
  await page.getByRole("link", { name: "Continuer", exact: true }).click();
  await expect(page.locator("#about")).toBeFocused();
  await expect(page.locator("canvas")).toHaveCount(0);
});

test("le changement de préférence démonte puis recrée une seule scène", async ({
  page,
  isMobile,
}) => {
  test.skip(isMobile, "Pas de scène sur mobile.");
  await page.goto("/#selected-work");
  await expect(
    page.locator('[data-project-preview="the-river"]'),
  ).toHaveAttribute("data-three-ready", "true", { timeout: 20000 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(page.locator("canvas")).toHaveCount(0);
  await expect(page.locator("[data-three-ready]")).toHaveCount(0);
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.getByRole("link", { name: "Afficher The River" }).click();
  await expect(
    page.locator('[data-project-preview="the-river"]'),
  ).toHaveAttribute("data-three-ready", "true", { timeout: 20000 });
  await expect(page.locator("canvas")).toHaveCount(1);
});
