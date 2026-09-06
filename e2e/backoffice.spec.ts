import { expect, test } from "@playwright/test";

test("el administrador inicia sesión y ve los gráficos operativos", async ({ page }) => {
  const loginPage = await page.goto("/login");
  expect(loginPage?.headers()["x-robots-tag"]).toContain("noindex");
  await page.getByLabel("Correo institucional").fill("admin@demo.local");
  await page.getByLabel("Contraseña").fill("Demo.Plataforma.2026");
  await page.getByRole("button", { name: "Ingresar al sistema" }).click();

  await expect(page).toHaveURL(/\/dashboard$/);
  await expect(page.getByRole("heading", { name: "Estado del proceso" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Expedientes por etapa" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Evaluaciones por banda" })).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Actividad de los últimos 14 días" }),
  ).toBeVisible();
  await expect(page.getByRole("heading", { name: "Objeciones por estado" })).toBeVisible();
});
