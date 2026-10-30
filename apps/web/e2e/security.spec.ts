import { expect, test } from '@playwright/test'
import { pages } from './fixtures/pages'

const FONT_DIR = '/_astro/fonts/'

test.describe('security @once', () => {
  for (const sitePage of pages) {
    test(`${sitePage.name} sends the security headers`, {
      tag: sitePage.path === '/' ? '@smoke' : [],
    }, async ({ request }) => {
      const response = await request.get(sitePage.path)
      expect(response.status()).toBe(200)
      const headers = response.headers()
      expect(headers['x-content-type-options']).toBe('nosniff')
      expect(headers['x-frame-options']).toBe('DENY')
      expect(headers['referrer-policy']).toBe('strict-origin-when-cross-origin')
      expect(headers['permissions-policy'], 'permissions-policy').toBeTruthy()
      expect(headers['content-security-policy']).toContain("frame-ancestors 'none'")
      expect(headers['strict-transport-security'], 'strict-transport-security').toBeTruthy()
    })

    test(`${sitePage.name} has a strict CSP meta tag`, async ({ page }) => {
      await page.goto(sitePage.path)
      const meta = page.locator('meta[http-equiv="content-security-policy" i]')
      await expect(meta).toHaveCount(1)
      const policy = (await meta.getAttribute('content')) ?? ''
      expect(policy).toContain("default-src 'self'")
      expect(policy).toContain("object-src 'none'")
      expect(policy).toMatch(/script-src [^;]*'sha256-/)
      expect(policy).not.toContain("'unsafe-inline'")
      expect(policy).not.toContain("'unsafe-eval'")
    })

    test(`${sitePage.name} ships no style attributes or inline event handlers`, async ({
      page,
      request,
    }) => {
      const html = await (await request.get(sitePage.path)).text()
      // Parse the served HTML without running it: scripts may set styles through the CSSOM, which the
      // CSP allows, so the live DOM is not the right place to look.
      const offenders = await page.evaluate((source) => {
        const doc = new DOMParser().parseFromString(source, 'text/html')
        const found: string[] = []
        for (const element of doc.querySelectorAll('*')) {
          for (const attribute of element.attributes) {
            if (attribute.name === 'style' || /^on/i.test(attribute.name))
              found.push(
                `<${element.localName} ${attribute.name}="${attribute.value.slice(0, 60)}">`,
              )
          }
        }
        return found
      }, html)
      expect(offenders, offenders.join('\n')).toEqual([])
    })
  }

  test('self-hosted fonts are cached as immutable', async ({ page, request }) => {
    const fontRequests: string[] = []
    page.on('request', (fontRequest) => {
      if (fontRequest.resourceType() === 'font') fontRequests.push(fontRequest.url())
    })
    await page.goto('/')
    await page.evaluate(async () => {
      await document.fonts.ready
    })
    const preloads = await page
      .locator('link[rel="preload"][as="font"]')
      .evaluateAll((links) =>
        links.map((link) => (link instanceof HTMLLinkElement ? link.href : '')),
      )

    const fontURL = [...preloads, ...fontRequests].find(
      (url) => url !== '' && new URL(url).pathname.startsWith(FONT_DIR),
    )
    expect(fontURL, `a font under ${FONT_DIR} (preloaded or requested by /)`).toBeDefined()

    const response = await request.get(fontURL ?? '')
    expect(response.status()).toBe(200)
    expect(response.headers()['cache-control']).toContain('immutable')
  })
})
