import { expect, test } from "@playwright/test";

const apiUrl = process.env.API_E2E_URL ?? "http://127.0.0.1:3101";

test("las métricas internas están cerradas por defecto", async ({ request }) => {
  const response = await request.get(`${apiUrl}/api/v1/internal/dashboard`);
  expect(response.status()).toBe(401);
});

test("la proyección pública no filtra campos internos", async ({ request }) => {
  const response = await request.get(`${apiUrl}/api/v1/public/candidates?page=1&pageSize=10`);
  expect(response.ok()).toBe(true);
  const payload = JSON.stringify(await response.json());

  expect(payload).not.toContain("nationalId");
  expect(payload).not.toContain("internalNotes");
  expect(payload).not.toContain("storageKey");
  expect(payload).not.toContain("objectorEmail");
});

test("el administrador autenticado puede consultar el resumen agregado", async ({ request }) => {
  const login = await request.post(`${apiUrl}/api/v1/auth/login`, {
    data: { email: "admin@demo.local", password: "Demo.Plataforma.2026" },
  });
  expect(login.ok()).toBe(true);
  const { accessToken } = (await login.json()) as { accessToken: string };

  const dashboard = await request.get(`${apiUrl}/api/v1/internal/dashboard`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  expect(dashboard.ok()).toBe(true);
  const data = (await dashboard.json()) as {
    candidateTotal: number;
    workflow: unknown[];
    activity: unknown[];
  };
  expect(data.candidateTotal).toBeGreaterThan(0);
  expect(data.workflow).toHaveLength(9);
  expect(data.activity).toHaveLength(14);
});
