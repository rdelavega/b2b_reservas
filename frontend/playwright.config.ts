import { defineConfig, devices } from "@playwright/test";

/**
 * Pruebas E2E de la integración frontend <-> backend (Fase 4).
 *
 * `webServer` levanta el backend (con seed de datos de demostración) y el
 * frontend antes de correr las pruebas. Requiere una base PostgreSQL disponible
 * según `backend/.env` (por ejemplo el contenedor `reservas-pg`).
 */
export default defineConfig({
  testDir: "./e2e",
  timeout: 30_000,
  fullyParallel: false,
  workers: 1,
  reporter: [["list"], ["html", { open: "never", outputFolder: "playwright-report" }]],
  use: {
    baseURL: "http://localhost:3100",
    trace: "on-first-retry",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: [
    {
      command: "npm run prisma:seed && npm run dev",
      cwd: "../backend",
      env: { PORT: "4100" },
      url: "http://localhost:4100/health",
      timeout: 60_000,
      reuseExistingServer: !process.env.CI,
    },
    {
      command: "npm run dev -- --port 3100",
      env: { NEXT_PUBLIC_API_URL: "http://localhost:4100" },
      url: "http://localhost:3100",
      timeout: 60_000,
      reuseExistingServer: !process.env.CI,
    },
  ],
});
