import { expect, test } from '@playwright/test'
import { contactHrefs, knownExternalHrefs } from './fixtures/contact'
import { pages } from './fixtures/pages'

for (const sitePage of pages) {
  test.describe(sitePage.name, () => {
    test('offers every contact link of the design, visibly', async ({ page }) => {
      await page.goto(sitePage.path)
      const missing: string[] = []
      for (const href of contactHrefs[sitePage.section]) {
        const visible = await page.locator(`a[href="${href}"]`).filter({ visible: true }).count()
        if (visible === 0) missing.push(href)
      }
      expect(missing, `no visible link on ${sitePage.path} for:\n${missing.join('\n')}`).toEqual([])
    })

    test('links off-site only to known contact links', { tag: '@once' }, async ({ page }) => {
      await page.goto(sitePage.path)
      const here = page.url()
      const origin = new URL(here).origin
      const hrefs = await page
        .locator('a[href]')
        .evaluateAll((anchors) => anchors.map((anchor) => anchor.getAttribute('href') ?? ''))
      const unexpected = [
        ...new Set(
          hrefs.filter(
            (href) => new URL(href, here).origin !== origin && !knownExternalHrefs.has(href),
          ),
        ),
      ]
      expect(unexpected, `unexpected off-site links on ${sitePage.path}`).toEqual([])
    })
  })
}
