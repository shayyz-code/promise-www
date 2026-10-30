import { defineConfig, devices, type PlaywrightTestConfig, type Project } from '@playwright/test'

/*
 * End-to-end tests against a fresh production build served by `wrangler dev`, so the real `_headers`,
 * `_redirects` and asset handling apply. `playwright.deployed.config.ts` reuses this for deployed smoke tests.
 *
 * Tags:
 * - `@once`: device-independent checks (HTTP, headers, SEO, width sweeps, budgets); desktop-chromium only.
 * - `@visual`: screenshot comparisons; desktop-chromium only, and only with `VISUAL=1`.
 * - `@smoke`: the subset run against a deployment.
 * Tests take tags through `{ tag }`; describe blocks carry them in their title (`'SEO @once'`), because
 * Biome's Playwright rules do not accept the `describe(title, details, callback)` form.
 */

const isCI = Boolean(process.env.CI)
const runVisual = process.env.VISUAL === '1'

const ONCE = /@once/
const VISUAL = /@visual/

export const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? 'http://localhost:8787'

export const projects = [
  {
    name: 'desktop-chromium',
    use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 } },
    ...(runVisual ? {} : { grepInvert: VISUAL }),
  },
  {
    name: 'tablet-webkit',
    use: { ...devices['iPad Mini'] },
    grepInvert: [ONCE, VISUAL],
  },
  {
    name: 'mobile-chromium',
    use: { ...devices['Pixel 7'] },
    grepInvert: [ONCE, VISUAL],
  },
  {
    name: 'mobile-webkit',
    use: { ...devices['iPhone 15'] },
    grepInvert: [ONCE, VISUAL],
  },
] satisfies Project[]

/** Everything except the web server, shared with the deployed config. */
export const sharedConfig = {
  testDir: 'e2e',
  fullyParallel: true,
  forbidOnly: isCI,
  retries: isCI ? 2 : 0,
  reporter: isCI
    ? [['github'], ['html', { open: 'never' }]]
    : [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL,
    trace: 'on-first-retry',
  },
  projects,
} satisfies PlaywrightTestConfig

export default defineConfig({
  ...sharedConfig,
  webServer: {
    command: 'bun run build && bunx wrangler dev --port 8787 --ip 127.0.0.1',
    url: 'http://localhost:8787/',
    reuseExistingServer: !isCI,
    timeout: 180_000,
    env: {
      SITE_URL: 'http://localhost:8787',
      SITE_INDEXABLE: 'false',
      WRANGLER_SEND_METRICS: 'false',
    },
  },
})
