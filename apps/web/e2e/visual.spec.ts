import { expect, test } from '@playwright/test'
import { pages } from './fixtures/pages'
import { revealAll } from './helpers/motion'

/*
 * Full-page screenshots of the four pages at the two design widths. Excluded unless VISUAL=1 (see
 * playwright.config.ts); create or refresh the baselines with `VISUAL=1 bun run test:e2e --update-snapshots`.
 */

const VIEWPORTS = [
  { width: 1440, height: 900 },
  { width: 390, height: 844 },
] as const

test.describe('visual @visual', () => {
  test.use({ reducedMotion: 'reduce' })

  for (const viewport of VIEWPORTS) {
    test.describe(`${viewport.width} px`, () => {
      test.use({ viewport })

      for (const sitePage of pages) {
        test(sitePage.name, async ({ page }) => {
          await page.goto(sitePage.path)
          await revealAll(page)
          await expect(page).toHaveScreenshot(
            `${sitePage.section}-${sitePage.locale}-${viewport.width}.png`,
            { fullPage: true, animations: 'disabled' },
          )
        })
      }
    })
  }
})
