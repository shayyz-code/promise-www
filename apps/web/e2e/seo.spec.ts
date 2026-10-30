import { expect, test } from '@playwright/test'
import {
  defaultLocale,
  locales,
  ogLocale,
  otherLocale,
  pages,
  pathFor,
  type Section,
  sections,
} from './fixtures/pages'
import { requireBaseURL } from './helpers/text'

interface Alternate {
  hreflang: string
  href: string
}

const byHreflang = (a: Alternate, b: Alternate) => a.hreflang.localeCompare(b.hreflang)

/** The hreflang alternates every page of `section` must declare: both languages plus x-default. */
const expectedAlternates = (section: Section, absolute: (path: string) => string): Alternate[] =>
  [
    ...locales.map((locale) => ({ hreflang: locale, href: absolute(pathFor(section, locale)) })),
    { hreflang: 'x-default', href: absolute(pathFor(section, defaultLocale[section])) },
  ].sort(byHreflang)

test.describe('SEO @once', () => {
  for (const sitePage of pages) {
    test(`${sitePage.name}: title, canonical, hreflang, robots and Open Graph`, async ({
      page,
      baseURL,
    }) => {
      const absolute = (path: string) => new URL(path, requireBaseURL(baseURL)).href
      const canonical = absolute(sitePage.path)
      await page.goto(sitePage.path)

      await expect(page).toHaveTitle(/\S/)
      await expect(page.locator('meta[name="description"]')).toHaveAttribute('content', /\S/)

      const canonicalLink = page.locator('link[rel="canonical"]')
      await expect(canonicalLink).toHaveCount(1)
      await expect(canonicalLink).toHaveAttribute('href', canonical)

      const alternates = await page
        .locator('link[rel="alternate"][hreflang]')
        .evaluateAll((links) =>
          links.map((link) => ({
            hreflang: link.getAttribute('hreflang') ?? '',
            href: link.getAttribute('href') ?? '',
          })),
        )
      expect(alternates.sort(byHreflang)).toEqual(expectedAlternates(sitePage.section, absolute))

      // SITE_INDEXABLE=false in tests: pages stay out of search results until the domain is live.
      await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
        'content',
        'noindex, nofollow',
      )

      await expect(page.locator('meta[property="og:url"]')).toHaveAttribute('content', canonical)
      await expect(page.locator('meta[property="og:image"]')).toHaveAttribute(
        'content',
        absolute(`/og/${sitePage.section}-${sitePage.locale}.png`),
      )
      await expect(page.locator('meta[property="og:locale"]')).toHaveAttribute(
        'content',
        ogLocale[sitePage.locale],
      )
      await expect(page.locator('meta[property="og:locale:alternate"]')).toHaveAttribute(
        'content',
        ogLocale[otherLocale(sitePage.locale)],
      )
      await expect(page.locator('meta[property="og:title"]')).toHaveAttribute('content', /\S/)
    })

    test(`${sitePage.name}: Store structured data`, async ({ page }) => {
      await page.goto(sitePage.path)
      const blocks = await page
        .locator('script[type="application/ld+json"]')
        .evaluateAll((scripts) => scripts.map((script) => script.textContent ?? ''))
      expect(blocks.length, 'JSON-LD blocks').toBeGreaterThan(0)

      const types = blocks.map((block) => {
        const data: unknown = JSON.parse(block)
        return typeof data === 'object' && data !== null && '@type' in data ? data['@type'] : null
      })
      expect(types).toContain('Store')
    })
  }

  test('robots.txt blocks every crawler', async ({ request }) => {
    const response = await request.get('/robots.txt')
    expect(response.status()).toBe(200)
    expect(response.headers()['content-type']).toContain('text/plain')
    const body = await response.text()
    expect(body).toMatch(/^User-agent:\s*\*\s*$/m)
    expect(body).toMatch(/^Disallow:\s*\/\s*$/m)
  })

  test('sitemap.xml lists the four pages with their hreflang alternates', async ({
    page,
    request,
    baseURL,
  }) => {
    const absolute = (path: string) => new URL(path, requireBaseURL(baseURL)).href
    const response = await request.get('/sitemap.xml')
    expect(response.status()).toBe(200)
    expect(response.headers()['content-type']).toContain('xml')

    const entries = await page.evaluate(
      (source) => {
        const doc = new DOMParser().parseFromString(source, 'application/xml')
        if (doc.getElementsByTagName('parsererror').length > 0) return null
        const sitemapNs = 'http://www.sitemaps.org/schemas/sitemap/0.9'
        const xhtmlNs = 'http://www.w3.org/1999/xhtml'
        return [...doc.getElementsByTagNameNS(sitemapNs, 'url')].map((url) => ({
          loc: url.getElementsByTagNameNS(sitemapNs, 'loc')[0]?.textContent?.trim() ?? '',
          alternates: [...url.getElementsByTagNameNS(xhtmlNs, 'link')].map((link) => ({
            rel: link.getAttribute('rel') ?? '',
            hreflang: link.getAttribute('hreflang') ?? '',
            href: link.getAttribute('href') ?? '',
          })),
        }))
      },
      await response.text(),
    )

    expect(entries, 'sitemap.xml must be well-formed XML').not.toBeNull()
    const actual = (entries ?? [])
      .map((entry) => ({
        loc: entry.loc,
        alternates: entry.alternates
          .filter((link) => link.rel === 'alternate')
          .map(({ hreflang, href }) => ({ hreflang, href }))
          .sort(byHreflang),
      }))
      .sort((a, b) => a.loc.localeCompare(b.loc))

    const expected = sections
      .flatMap((section) =>
        locales.map((locale) => ({
          loc: absolute(pathFor(section, locale)),
          alternates: expectedAlternates(section, absolute),
        })),
      )
      .sort((a, b) => a.loc.localeCompare(b.loc))
    expect(actual).toEqual(expected)
  })
})
