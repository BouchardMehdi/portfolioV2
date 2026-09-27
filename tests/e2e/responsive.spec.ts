import { expect, test } from "@playwright/test";

for (const colorScheme of ["light", "dark"] as const) {
  test(`tablette et paysage : menu et contenu restent accessibles en thème ${colorScheme}`, async ({
    page,
  }) => {
    await page.emulateMedia({ colorScheme, reducedMotion: "reduce" });
    for (const viewport of [
      { width: 768, height: 1024 },
      { width: 844, height: 390 },
    ]) {
      await page.setViewportSize(viewport);
      for (const route of ["/", "/projects", "/projects/ramenetapoire"]) {
        await page.goto(route);
        expect(
          await page.evaluate(
            () => document.documentElement.scrollWidth <= innerWidth,
          ),
        ).toBe(true);
        await page.getByRole("button", { name: "Menu", exact: true }).click();
        const navigation = page.getByRole("navigation", {
          name: "Navigation principale",
        });
        const contact = navigation.getByRole("link", {
          name: "Contact",
          exact: true,
        });
        await contact.scrollIntoViewIfNeeded();
        await expect(contact).toBeInViewport();
        await contact.click();
        await expect(
          page.getByRole("heading", { name: "On en parle ?" }),
        ).toBeInViewport();
        await expect(navigation).toBeHidden();
      }
    }
  });

  test(`les textes secondaires et les champs conservent leur contraste en thème ${colorScheme}`, async ({
    page,
  }) => {
    await page.emulateMedia({ colorScheme, reducedMotion: "reduce" });
    await page.goto("/#contact");
    const ratios = await page.evaluate(() => {
      const style = getComputedStyle(document.documentElement);
      const canvas = document.createElement("canvas");
      canvas.width = canvas.height = 1;
      const context = canvas.getContext("2d")!;
      function luminance(color: string) {
        context.fillStyle = color;
        context.fillRect(0, 0, 1, 1);
        const values = [...context.getImageData(0, 0, 1, 1).data]
          .slice(0, 3)
          .map((value) => {
            const channel = value / 255;
            return channel <= 0.04045
              ? channel / 12.92
              : ((channel + 0.055) / 1.055) ** 2.4;
          });
        return values[0] * 0.2126 + values[1] * 0.7152 + values[2] * 0.0722;
      }
      function contrast(first: string, second: string) {
        const a = luminance(first),
          b = luminance(second);
        return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
      }
      const background = style.getPropertyValue("--background");
      const surface = style.getPropertyValue("--surface");
      return {
        text: ["--accent", "--muted"].flatMap((token) =>
          [background, surface].map((color) =>
            contrast(style.getPropertyValue(token), color),
          ),
        ),
        border: contrast(
          getComputedStyle(document.querySelector("#contact-email")!)
            .borderColor,
          background,
        ),
      };
    });
    for (const ratio of ratios.text) expect(ratio).toBeGreaterThanOrEqual(4.5);
    expect(ratios.border).toBeGreaterThanOrEqual(3);
  });
}

test("les petits écrans desktop gardent les commandes des trois projets dans la zone visible", async ({
  page,
  isMobile,
}) => {
  test.skip(isMobile, "Le tactile conserve une liste verticale.");
  for (const viewport of [
    { width: 1024, height: 700 },
    { width: 1280, height: 720 },
  ]) {
    await page.setViewportSize(viewport);
    await page.goto("/#selected-work");
    await expect(page.locator(".selected-work")).toHaveAttribute(
      "data-horizontal",
      "true",
    );
    for (let index = 0; index < 3; index++) {
      await page.locator(".work-pagination a").nth(index).click();
      const panel = page.locator(".work-panel").nth(index);
      await expect(
        panel.getByRole("link", { name: "Voir le projet" }),
      ).toBeInViewport({ ratio: 1 });
      await expect(
        page.getByRole("link", { name: "Continuer" }),
      ).toBeInViewport({ ratio: 1 });
      const fits = await panel
        .locator(".work-information")
        .evaluate((element) => {
          const content = element.getBoundingClientRect();
          const viewport = element
            .closest(".selected-work__viewport")!
            .getBoundingClientRect();
          return (
            content.top >= viewport.top && content.bottom <= viewport.bottom
          );
        });
      expect(fits).toBe(true);
    }
  }
});

test("les vidéos attendent leur section puis démarrent automatiquement en boucle", async ({
  page,
}) => {
  const requests: string[] = [];
  page.on("request", (request) => {
    if (request.url().endsWith(".mp4")) requests.push(request.url());
  });
  await page.goto("/projects/laradex");
  const video = page.locator("video.project-video__player").first();
  await expect(video).not.toHaveAttribute("src");
  expect(requests).toEqual([]);
  await video.scrollIntoViewIfNeeded();
  await expect(video).toHaveAttribute("src", "/projects/laradex/home.mp4");
  await expect
    .poll(() =>
      video.evaluate(
        (element: HTMLVideoElement) =>
          element.currentTime > 0 && !element.paused,
      ),
    )
    .toBe(true);
  await video.evaluate((element: HTMLVideoElement) => {
    element.currentTime = element.duration - 0.15;
  });
  await expect
    .poll(() =>
      video.evaluate(
        (element: HTMLVideoElement) =>
          element.currentTime < 2 && !element.paused,
      ),
    )
    .toBe(true);
});

test("la vidéo reste disponible sans JavaScript", async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  try {
    const page = await context.newPage();
    await page.goto("http://127.0.0.1:3100/projects/scratchwin");
    const video = page.locator("video:visible");
    await expect(video).toHaveCount(1);
    await expect(video).toHaveAttribute(
      "src",
      "/projects/scratchwin/grattage-ticket.mp4",
    );
    await expect(video).toHaveAttribute("autoplay", "");
  } finally {
    await context.close();
  }
});
