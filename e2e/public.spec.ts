import { expect, test } from "@playwright/test";

const landingUrl = process.env.LANDING_E2E_URL ?? "http://127.0.0.1:3100";

test("la ciudadanía puede recorrer portada, ranking y un perfil publicado", async ({ page }) => {
  const portada = await page.goto(landingUrl);
  const csp = portada?.headers()["content-security-policy"] ?? "";
  expect(csp).toContain("connect-src 'self' http://127.0.0.1:3101");
  expect(csp).toContain("frame-src 'self' blob: http://127.0.0.1:9000");
  await expect(
    page.getByRole("heading", { name: "La transparencia no se declara: se verifica." }),
  ).toBeVisible();

  await page.getByRole("link", { name: "Ver ranking de idoneidad" }).click();
  await expect(page).toHaveURL(/\/ranking$/);
  await expect(page.getByRole("heading", { name: /ranking/i })).toBeVisible();

  const firstCandidate = page.locator('main a[href^="/postulados/"]:visible').first();
  await expect(firstCandidate).toBeVisible();
  await firstCandidate.click();
  await expect(page).toHaveURL(/\/postulados\//);
  await expect(page.locator('main a[href^="/objetar/"]:visible')).toBeVisible();
});

test("la landing no provoca desplazamiento horizontal en móvil", async ({ page }) => {
  await page.goto(landingUrl);
  const overflows = await page.evaluate(
    () => document.documentElement.scrollWidth > window.innerWidth,
  );
  expect(overflows).toBe(false);
});
