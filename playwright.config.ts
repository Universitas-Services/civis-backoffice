import { defineConfig, devices } from "@playwright/test";

const backofficeUrl = process.env.BACKOFFICE_E2E_URL ?? "http://127.0.0.1:3102";
const landingUrl = process.env.LANDING_E2E_URL ?? "http://127.0.0.1:3100";
const apiUrl = process.env.API_E2E_URL ?? "http://127.0.0.1:3101";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false,
  workers: process.env.CI ? 1 : undefined,
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI
    ? [["line"], ["html", { open: "never" }]]
    : [["list"], ["html", { open: "never" }]],
  use: {
    baseURL: backofficeUrl,
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
    locale: "es-VE",
    timezoneId: "America/Caracas",
  },
  expect: { timeout: 10_000 },
  timeout: 45_000,
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "mobile-chromium",
      testMatch: /public\.spec\.ts/,
      use: { ...devices["Pixel 7"] },
    },
  ],
  webServer:
    process.env.PLAYWRIGHT_EXTERNAL_SERVERS === "true"
      ? undefined
      : [
          {
            command: "npm --prefix ../api run dev",
            url: `${apiUrl}/health/live`,
            reuseExistingServer: false,
            timeout: 120_000,
            env: {
              ...process.env,
              API_PORT: "3101",
              DATABASE_URL:
                process.env.E2E_DATABASE_URL ??
                "postgresql://cp_user:cp_dev_password@127.0.0.1:5442/credential_platform?schema=public",
            },
          },
          {
            command: "cd ../landing && node node_modules/next/dist/bin/next dev --port 3100",
            url: landingUrl,
            reuseExistingServer: false,
            timeout: 120_000,
            env: {
              ...process.env,
              NEXT_PUBLIC_API_URL: `${apiUrl}/api/v1`,
              NEXT_PUBLIC_DOCUMENT_ORIGIN: "http://127.0.0.1:9000",
              NEXT_PUBLIC_SITE_URL: landingUrl,
            },
          },
          {
            command: "node node_modules/next/dist/bin/next start --port 3102",
            url: `${backofficeUrl}/login`,
            reuseExistingServer: false,
            timeout: 120_000,
            env: {
              ...process.env,
              API_INTERNAL_URL: `${apiUrl}/api/v1`,
              NEXT_PUBLIC_API_URL: `${apiUrl}/api/v1`,
              NEXT_PUBLIC_DOCUMENT_ORIGIN: "http://127.0.0.1:9000",
              SESSION_SECRET:
                process.env.SESSION_SECRET ??
                "e2e_only_session_secret_with_more_than_32_characters",
            },
          },
        ],
});
