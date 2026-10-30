import { expect, type Request, type Response, test } from '@playwright/test'
import { pages } from './fixtures/pages'
import { collectConsoleErrors } from './helpers/console'
import { formatCspViolations, readCspViolations, trackCspViolations } from './helpers/csp'
import { scrollThrough } from './helpers/motion'
import { requireBaseURL } from './helpers/text'

/** Uncompressed JavaScript per page: external scripts plus inline ones (JSON-LD excluded). */
const JS_BUDGET_BYTES = 20 * 1024

const FONT_DIR = '/_astro/fonts/'
const GOOGLE_FONTS = ['fonts.googleapis.com', 'fonts.gstatic.com']

const JS_TYPES = new Set(['', 'module', 'text/javascript', 'application/javascript'])

test.describe('performance and first-party loading @once', () => {
  for (const sitePage of pages) {
    test(`${sitePage.name} loads only first-party resources within budget`, async ({
      page,
      baseURL,
    }) => {
      const origin = new URL(requireBaseURL(baseURL)).origin
      const requests: Request[] = []
      const scriptResponses: Response[] = []
      page.on('request', (request) => requests.push(request))
      page.on('response', (response) => {
        if (response.request().resourceType() === 'script') scriptResponses.push(response)
      })
      const errors = collectConsoleErrors(page)
      await trackCspViolations(page)

      await page.goto(sitePage.path)
      await scrollThrough(page)
      await page.evaluate(async () => {
        await document.fonts.ready
      })
      await page.waitForLoadState('networkidle')

      const web = requests
        .map((request) => ({ request, url: new URL(request.url()) }))
        .filter(({ url }) => url.protocol === 'http:' || url.protocol === 'https:')

      const thirdParty = web.filter(({ url }) => url.origin !== origin).map(({ url }) => url.href)
      expect(thirdParty, `third-party requests:\n${thirdParty.join('\n')}`).toEqual([])

      const googleFonts = web
        .filter(({ url }) => GOOGLE_FONTS.includes(url.hostname))
        .map(({ url }) => url.href)
      expect(googleFonts, 'Google Fonts requests').toEqual([])

      const fonts = web.filter(({ request }) => request.resourceType() === 'font')
      expect(fonts.length, 'web fonts requested').toBeGreaterThan(0)
      const strayFonts = fonts
        .filter(({ url }) => !url.pathname.startsWith(FONT_DIR))
        .map(({ url }) => url.href)
      expect(strayFonts, `fonts outside ${FONT_DIR}`).toEqual([])

      let externalBytes = 0
      const scripts: string[] = []
      for (const response of scriptResponses) {
        if (!response.ok()) continue
        const size = (await response.body()).byteLength
        externalBytes += size
        scripts.push(`${new URL(response.url()).pathname}: ${size} B`)
      }
      const inlineBytes = await page
        .locator('script:not([src])')
        .evaluateAll(
          (elements, jsTypes) =>
            elements
              .filter((element) => jsTypes.includes((element.getAttribute('type') ?? '').trim()))
              .reduce(
                (total, element) =>
                  total + new TextEncoder().encode(element.textContent ?? '').length,
                0,
              ),
          [...JS_TYPES],
        )
      scripts.push(`inline: ${inlineBytes} B`)
      expect(
        externalBytes + inlineBytes,
        `JavaScript over ${JS_BUDGET_BYTES} B:\n${scripts.join('\n')}`,
      ).toBeLessThanOrEqual(JS_BUDGET_BYTES)

      expect(errors, `console errors:\n${errors.join('\n')}`).toEqual([])
      const violations = await readCspViolations(page)
      expect(violations, `CSP violations:\n${formatCspViolations(violations)}`).toEqual([])
    })
  }
})
