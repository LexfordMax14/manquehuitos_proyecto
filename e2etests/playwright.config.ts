import { defineConfig, devices } from '@playwright/test'

/**
 * Ver https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: './tests',
  /* Los tests comparten la base de datos del backend: se ejecutan de a uno */
  fullyParallel: false,
  workers: 1,
  /* Falla en CI si quedó un test.only */
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    /* El frontend redirige /api al backend con el proxy de Vite */
    baseURL: 'http://localhost:5173',
    trace: 'retain-on-failure',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  ],
  /*
   * Playwright levanta el backend en modo test (usa MONGODB_DBNAME_TEST y
   * habilita POST /api/testing/reset) y el frontend. Los puertos 3001 y 5173
   * deben estar libres antes de correr los tests.
   */
  webServer: [
    {
      command: 'npx tsx src/index.ts',
      cwd: '../backend',
      env: { NODE_ENV: 'test' },
      url: 'http://localhost:3001/api/cerros',
      reuseExistingServer: false,
    },
    {
      command: 'npm run dev -- --host localhost --port 5173 --strictPort',
      cwd: '../frontend',
      url: 'http://localhost:5173',
      reuseExistingServer: false,
    },
  ],
})
