import { defineConfig } from '@playwright/test'
import { projects, sharedConfig } from './playwright.config'

/*
 * Smoke tests against a deployment: no local server, only `@smoke` tests, on one desktop and one phone.
 *   PLAYWRIGHT_BASE_URL=https://promise-www.<account>.workers.dev bun run test:e2e:deployed
 */

const baseURL = process.env.PLAYWRIGHT_BASE_URL
if (!baseURL) {
  throw new Error(
    'PLAYWRIGHT_BASE_URL is required for deployed smoke tests, e.g. ' +
      'PLAYWRIGHT_BASE_URL=https://promise-www.example.workers.dev bun run test:e2e:deployed',
  )
}

const deployedProjects = new Set(['desktop-chromium', 'mobile-webkit'])

export default defineConfig({
  ...sharedConfig,
  grep: /@smoke/,
  use: { ...sharedConfig.use, baseURL },
  projects: projects.filter((project) => deployedProjects.has(project.name)),
})
