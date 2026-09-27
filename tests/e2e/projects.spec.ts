import { expect, test } from "@playwright/test";
import { getAllProjects } from "../../src/lib/projects";

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
      await expect(video).toHaveAttribute("controls", "");
      await expect(video).toHaveAttribute("preload", "none");
      expect(
        await video.evaluate(
          (element: HTMLVideoElement) => element.paused && !element.autoplay,
        ),
      ).toBe(true);
      const source = await video.locator("source").getAttribute("src");
      const response = await page.request.head(source!);
      expect(response.ok()).toBe(true);
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
