import { defineConfig, devices } from '@playwright/test';

/**
 * Budgetery E2E config. See docs/design/E2E_PLAYWRIGHT_DESIGN.md
 *
 * Target is the static web export in dist/ (see `npm run e2e:build`),
 * served locally. A running dev server on the same port is reused
 * automatically (reuseExistingServer), e.g. `npx expo start --web --port 8081`.
 */
export default defineConfig({
  testDir: 'e2e/specs',

  /* Fail fast: smoke specs assert in seconds; no 30s hangs on broken flows. */
  timeout: 15 * 1000,

  expect: {
    timeout: 5 * 1000,
  },

  /* Run tests in parallel locally; serial on CI for determinism. */
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,

  reporter: [['list'], ['html', { open: 'never' }]],

  use: {
    baseURL: 'http://localhost:8081',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },

  /* Chromium only for now (speed); add firefox/webkit when needed. */
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  webServer: {
    command: 'npx -y serve dist -l 8081',
    url: 'http://localhost:8081',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },
});
