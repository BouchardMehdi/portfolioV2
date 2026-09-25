import { expect, test, type Page } from "@playwright/test";

async function openGallery(page: Page) {
  await page.goto("/#selected-work");
  await expect(page.locator("#selected-work")).toHaveAttribute(
    "data-horizontal",
    "true",
  );
  await expect
    .poll(async () =>
      Math.round(
        (await page.locator(".selected-work__stage").boundingBox())!.y,
      ),
    )
    .toBe(80);
}

async function assertAbout(page: Page) {
  await expect(page).toHaveURL("/#about");
  await expect(page.locator("#about")).toBeFocused();
  await expect
    .poll(async () =>
      Math.round((await page.locator("#about").boundingBox())!.y),
    )
    .toBe(80);
}

test("le scroll vertical parcourt les trois projets puis libère la page", async ({
  page,
  isMobile,
}) => {
  test.skip(isMobile, "La galerie mobile reste verticale.");
  await openGallery(page);
  const range = await page.locator("#selected-work").evaluate((section) => {
    const stage = section.querySelector(".selected-work__stage")!;
    return {
      start: window.scrollY,
      distance:
        section.getBoundingClientRect().height -
        stage.getBoundingClientRect().height,
    };
  });
  await page.mouse.wheel(0, range.distance * 0.48);
  await expect(page.locator("[data-work-current]")).toHaveText("02");
  await expect(page.locator("#project-ramenetapoire")).toHaveJSProperty(
    "inert",
    false,
  );
  await expect(page.locator("#project-the-river")).toHaveJSProperty(
    "inert",
    true,
  );
  await expect
    .poll(async () =>
      Math.round(
        (await page.locator(".selected-work__stage").boundingBox())!.y,
      ),
    )
    .toBe(80);
  await page.mouse.wheel(0, range.distance * 0.42);
  await expect(page.locator("[data-work-current]")).toHaveText("03");
  await page.mouse.wheel(0, 1400);
  await expect(
    page.getByRole("heading", { name: "Derrière les projets." }),
  ).toBeInViewport();
  await page.mouse.wheel(0, -1500);
  await expect
    .poll(
      async () =>
        (await page.locator(".selected-work__stage").boundingBox())!.y,
    )
    .toBeGreaterThanOrEqual(79);
  expect(await page.evaluate(() => window.scrollX)).toBe(0);
});

for (const name of ["The River", "RamèneTaPoire", "Wankul TCG"]) {
  test(`Continuer quitte la galerie depuis ${name}`, async ({
    page,
    isMobile,
  }) => {
    test.skip(isMobile, "La sortie animée concerne le desktop.");
    await openGallery(page);
    await page
      .getByRole("link", { name: `Afficher ${name}`, exact: true })
      .click();
    await page.getByRole("link", { name: "Continuer", exact: true }).click();
    await assertAbout(page);
    await page.getByRole("button", { name: "Menu", exact: true }).click();
    await page
      .getByRole("navigation", { name: "Navigation principale" })
      .getByRole("link", { name: "Sélection", exact: true })
      .click();
    await expect(page.locator("[data-work-current]")).toHaveText("01");
    await expect
      .poll(async () =>
        Math.round(
          (await page.locator(".selected-work__stage").boundingBox())!.y,
        ),
      )
      .toBe(80);
  });
}

test("les ancres du menu quittent la galerie et la navigation reste prioritaire", async ({
  page,
  isMobile,
}) => {
  test.skip(isMobile, "Pas de pin sur mobile.");
  await openGallery(page);
  await page.getByRole("link", { name: "Afficher RamèneTaPoire" }).click();
  await page.getByRole("link", { name: "Continuer", exact: true }).click();
  await page.getByRole("button", { name: "Menu", exact: true }).click();
  // Le menu reste ouvert au-delà de la durée de sortie de la galerie (550 ms).
  await page.waitForTimeout(700);
  await expect(
    page.getByRole("navigation", { name: "Navigation principale" }),
  ).toBeVisible();
  await page
    .getByRole("navigation", { name: "Navigation principale" })
    .getByRole("link", { name: "Intention", exact: true })
    .click();
  await expect(page).toHaveURL("/#statement");
  await expect(page.locator("#statement")).toBeFocused();
  await expect(
    page.getByRole("heading", {
      name: "Je conçois et développe des produits numériques.",
    }),
  ).toBeInViewport();
});

test("le clavier accède au projet choisi sans tabuler dans les panneaux masqués", async ({
  page,
  isMobile,
}) => {
  test.skip(isMobile, "Tous les panneaux sont accessibles sur mobile.");
  await openGallery(page);
  const third = page.getByRole("link", { name: "Afficher Wankul TCG" });
  await third.focus();
  await page.keyboard.press("Enter");
  await expect(page.locator("#project-wankultcg")).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(
    page.getByRole("link", { name: "Voir le projet : Wankul TCG" }),
  ).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(
    page.getByRole("link", { name: "Afficher The River" }),
  ).toBeFocused();
});

test("le retour navigateur retrouve le troisième projet et nettoie le pin hors accueil", async ({
  page,
  isMobile,
}) => {
  test.skip(isMobile, "Parcours de retour dans la galerie horizontale.");
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await openGallery(page);
  await page.getByRole("link", { name: "Afficher Wankul TCG" }).click();
  await page.getByRole("link", { name: "Voir le projet : Wankul TCG" }).click();
  await expect(page).toHaveURL("/projects/wankultcg");
  await expect(page.locator(".pin-spacer")).toHaveCount(0);
  await expect(page.locator("html")).not.toHaveClass(/lenis/);
  await page.goBack();
  await expect(page).toHaveURL("/#project-wankultcg");
  await expect(page.locator("[data-work-current]")).toHaveText("03");
  await expect(
    page.getByRole("link", { name: "Voir le projet : Wankul TCG" }),
  ).toBeInViewport();
  await page.getByRole("link", { name: "Voir tous les projets" }).click();
  await expect(page).toHaveURL("/projects");
  expect(errors).toEqual([]);
});

test("les ancres fonctionnent depuis le catalogue et après rechargement", async ({
  page,
}) => {
  await page.goto("/projects");
  await page.getByRole("button", { name: "Menu", exact: true }).click();
  await page
    .getByRole("navigation", { name: "Navigation principale" })
    .getByRole("link", { name: "À propos", exact: true })
    .click();
  await expect(page).toHaveURL("/#about");
  await expect
    .poll(async () =>
      Math.round((await page.locator("#about").boundingBox())!.y),
    )
    .toBe(80);
  await page.reload();
  await expect
    .poll(async () =>
      Math.round((await page.locator("#about").boundingBox())!.y),
    )
    .toBe(80);
});

test("le mode réduit conserve les trois projets sans pin ni lissage", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/#selected-work");
  await expect(page.locator(".work-panel")).toHaveCount(3);
  await expect(page.locator(".pin-spacer")).toHaveCount(0);
  await expect(page.locator("html")).not.toHaveClass(/lenis/);
  for (const panel of await page.locator(".work-panel").all())
    await expect(panel).toHaveJSProperty("inert", false);
  await page.getByRole("link", { name: "Continuer", exact: true }).click();
  await assertAbout(page);
});

test("le changement de taille et de préférence démonte puis rétablit la galerie", async ({
  page,
  isMobile,
}) => {
  test.skip(isMobile, "Le pointeur tactile conserve le mode vertical.");
  await openGallery(page);
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(page.locator(".pin-spacer")).toHaveCount(0);
  await expect(page.locator("html")).not.toHaveClass(/lenis/);
  await page.setViewportSize({ width: 1440, height: 1000 });
  await expect(page.locator(".pin-spacer")).toHaveCount(1);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(page.locator(".pin-spacer")).toHaveCount(0);
  await expect(page.locator(".selected-work__track")).toHaveCSS(
    "transform",
    "none",
  );
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await expect(page.locator(".pin-spacer")).toHaveCount(1);
});

test("sans JavaScript les projets et les ancres restent utilisables", async ({
  browser,
  baseURL,
}) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto(`${baseURL}/`);
  await expect(page.locator(".work-panel")).toHaveCount(3);
  await expect(page.locator(".pin-spacer")).toHaveCount(0);
  await page.getByRole("link", { name: "Voir le projet : The River" }).click();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("The River");
  await context.close();
});

test("le mobile affiche une liste verticale sans débordement", async ({
  page,
  isMobile,
}) => {
  test.skip(!isMobile, "Parcours tactile.");
  await page.goto("/#selected-work");
  await expect(page.locator(".pin-spacer")).toHaveCount(0);
  await expect(page.locator(".work-panel")).toHaveCount(3);
  await page.getByRole("link", { name: "Afficher Wankul TCG" }).click();
  await expect(
    page.getByRole("link", { name: "Voir le projet : Wankul TCG" }),
  ).toBeInViewport();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
  await page.getByRole("link", { name: "Continuer", exact: true }).click();
  await assertAbout(page);
});

test("une ancre saisie dans la page ouverte retrouve le début du pin", async ({
  page,
  isMobile,
}) => {
  test.skip(isMobile, "Pas de pin sur mobile.");
  await page.goto("/");
  await expect(page.locator("#selected-work")).toHaveAttribute(
    "data-horizontal",
    "true",
  );
  await page.goto("/#selected-work");
  await expect
    .poll(async () =>
      Math.round(
        (await page.locator(".selected-work__stage").boundingBox())!.y,
      ),
    )
    .toBe(80);
  await page.goto("/#about");
  await expect
    .poll(async () =>
      Math.round((await page.locator("#about").boundingBox())!.y),
    )
    .toBe(80);
  await page.goBack();
  await expect
    .poll(async () =>
      Math.round(
        (await page.locator(".selected-work__stage").boundingBox())!.y,
      ),
    )
    .toBe(80);
});
