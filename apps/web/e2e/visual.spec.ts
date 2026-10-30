import { join } from 'node:path'
import { expect, test } from '@playwright/test'
import { pages } from './fixtures/pages'
import { revealAll } from './helpers/motion'

/*
 * Full-page screenshots of the four pages at the two design widths. Excluded unless VISUAL=1 (see
 * playwright.config.ts); create or refresh the baselines with `VISUAL=1 bun run test:e2e --update-snapshots`.
 *
 * Each page is also saved in slices under `test-results/slices`, top of the page first. A phone page is about
 * 12,000 px tall, and image readers shrink it until nothing is legible, so the verify-ui skill reads the slices.
 */

const VIEWPORTS = [
  { width: 1440, height: 900 },
  { width: 390, height: 844 },
] as const

const SLICE_HEIGHT = 1600

test.describe('visual @visual', () => {
  test.use({ reducedMotion: 'reduce' })

  for (const viewport of VIEWPORTS) {
    test.describe(`${viewport.width} px`, () => {
      test.use({ viewport })

      for (const sitePage of pages) {
        test(sitePage.name, async ({ page }, testInfo) => {
          const name = `${sitePage.section}-${sitePage.locale}-${viewport.width}`
          await page.goto(sitePage.path)
          await revealAll(page)
          await expect(page).toHaveScreenshot(`${name}.png`, {
            fullPage: true,
            animations: 'disabled',
          })

          const pageHeight = await page.evaluate(() => document.documentElement.scrollHeight)
          for (let y = 0, part = 1; y < pageHeight; y += SLICE_HEIGHT, part += 1) {
            await page.screenshot({
              path: join(testInfo.project.outputDir, 'slices', `${name}-${part}.png`),
              fullPage: true,
              animations: 'disabled',
              clip: {
                x: 0,
                y,
                width: viewport.width,
                height: Math.min(SLICE_HEIGHT, pageHeight - y),
              },
            })
          }
        })
      }
    })
  }
})
