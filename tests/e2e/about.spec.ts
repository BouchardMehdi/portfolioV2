import { expect, test } from "@playwright/test";

test("À propos présente le parcours confirmé et télécharge le CV", async ({
  page,
  request,
}) => {
  await page.goto("/#about");
  await expect(
    page.getByRole("heading", { name: "Derrière les projets." }),
  ).toBeInViewport();
  await expect(page.locator(".about-content")).toContainText(
    "première année de MBA développeur fullstack",
  );
  await expect(page.locator(".journey-entry")).toHaveCount(7);
  await expect(page.locator(".about-journey")).toContainText("2025 — 2026");
  await expect(page.locator(".about-journey")).toContainText("obtenu en 2026");
  await expect(page.locator(".about-portrait")).toHaveCount(0);
  const [download] = await Promise.all([
    page.waitForEvent("download"),
    page.getByRole("link", { name: "Télécharger mon CV" }).click(),
  ]);
  expect(download.suggestedFilename()).toBe("CV_Bouchard_Mehdi.pdf");
  const pdf = await request.get("/cv/CV_Bouchard_Mehdi.pdf");
  expect(pdf.ok()).toBe(true);
  expect((await pdf.body()).subarray(0, 5).toString()).toBe("%PDF-");
  await expect(page).toHaveURL("/#about");
});

test("les étapes apparaissent, disparaissent à la remontée et réapparaissent", async ({
  page,
  isMobile,
}) => {
  await page.goto("/#about");
  const entries = page.locator(".journey-entry");
  const last = entries.last();
  await expect(last).toHaveCSS("opacity", "0");
  for (const entry of await entries.all()) {
    await entry.scrollIntoViewIfNeeded();
    await expect(entry).toHaveCSS("opacity", "1");
  }
  await entries.first().scrollIntoViewIfNeeded();
  await expect(last).toHaveCSS("opacity", "0");
  await last.scrollIntoViewIfNeeded();
  await expect(last).toHaveCSS("opacity", "1");
  await entries.first().scrollIntoViewIfNeeded();
  await expect(last).toHaveCSS("opacity", "0");
  const cards = await page.locator(".journey-card").all();
  const first = (await cards[0].boundingBox())!;
  const second = (await cards[1].boundingBox())!;
  if (isMobile) expect(Math.round(first.x)).toBe(Math.round(second.x));
  else expect(first.x + first.width).toBeLessThan(second.x);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
});

test("le mouvement réduit rend toutes les étapes visibles immédiatement", async ({
  page,
}) => {
  await page.goto("/#about");
  await page.emulateMedia({ reducedMotion: "reduce" });
  for (const entry of await page.locator(".journey-entry").all()) {
    await expect(entry).toHaveCSS("opacity", "1");
    await expect(entry).toHaveCSS("transform", "none");
  }
  await page.setViewportSize({ width: 320, height: 800 });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
});

test("le parcours reste lisible sans JavaScript", async ({
  browser,
  baseURL,
}) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  try {
    await page.goto(`${baseURL}/#about`);
    await expect(page.locator(".journey-entry")).toHaveCount(7);
    for (const entry of await page.locator(".journey-entry").all())
      await expect(entry).toHaveCSS("opacity", "1");
    await expect(
      page.getByRole("link", { name: "Télécharger mon CV" }),
    ).toHaveAttribute("download", "CV_Bouchard_Mehdi.pdf");
  } finally {
    await context.close();
  }
});
