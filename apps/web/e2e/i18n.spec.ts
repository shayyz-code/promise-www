import { expect, type Locator, test } from '@playwright/test'
import {
  defaultLocale,
  otherLocale,
  otherSection,
  pages,
  pathFor,
  sampleHash,
  sections,
} from './fixtures/pages'
import {
  expectCrossLinks,
  expectLanguage,
  expectLocation,
  expectPath,
  followCrossLink,
  savedLanguage,
  saveLanguage,
  switchLanguage,
} from './helpers/language'
import { requireBaseURL } from './helpers/text'

test.describe('without a saved choice', () => {
  for (const sitePage of pages) {
    test(`${sitePage.name} stays in ${sitePage.locale}`, async ({ page }) => {
      await page.goto(sitePage.path)
      await expectLanguage(page, sitePage.locale)
      await expectPath(page, sitePage.path)
      expect(await savedLanguage(page)).toBeNull()
    })

    test(`${sitePage.name} links to the other section in its default language`, async ({
      page,
    }) => {
      await page.goto(sitePage.path)
      await expectCrossLinks(page, sitePage.section, defaultLocale[otherSection(sitePage.section)])
    })
  }
})

test.describe('language switch', () => {
  for (const sitePage of pages) {
    test(`${sitePage.name} marks its language as current and links to the alternate`, async ({
      page,
    }) => {
      await page.goto(sitePage.path)
      const languageSwitch = page.getByTestId('lang-switch')
      await expect(languageSwitch).toBeVisible()

      const current = languageSwitch.locator(`a[hreflang="${sitePage.locale}"]`)
      const other = otherLocale(sitePage.locale)
      const alternate = languageSwitch.locator(`a[hreflang="${other}"]`)
      await expect(current).toHaveAttribute('aria-current', 'true')
      await expect(alternate).not.toHaveAttribute('aria-current')

      const pathOf = async (link: Locator) =>
        new URL((await link.getAttribute('href')) ?? '', page.url()).pathname
      expect(await pathOf(current)).toBe(sitePage.path)
      expect(await pathOf(alternate)).toBe(pathFor(sitePage.section, other))
    })
  }

  for (const section of sections) {
    test(`${section}: switching there and back saves each choice`, { tag: '@smoke' }, async ({
      page,
    }) => {
      const start = defaultLocale[section]
      const other = otherLocale(start)
      await page.goto(pathFor(section, start))

      await switchLanguage(page, other)
      await expectPath(page, pathFor(section, other))
      await expectLanguage(page, other)
      await expect.poll(() => savedLanguage(page)).toBe(other)

      await switchLanguage(page, start)
      await expectPath(page, pathFor(section, start))
      await expectLanguage(page, start)
      await expect.poll(() => savedLanguage(page)).toBe(start)
    })
  }
})

test.describe('a saved choice', () => {
  test('persists across reloads and direct visits', async ({ page }) => {
    await page.goto('/')
    await switchLanguage(page, 'en')
    await expectPath(page, '/en/')

    await page.reload()
    await expectPath(page, '/en/')
    await page.goto('/')
    await expectPath(page, '/en/')
    await expectLanguage(page, 'en')

    // The same choice applies to Promise Desk, whose default is already English.
    await page.goto('/desk/')
    await expectPath(page, '/desk/')
    await page.goto('/my/desk/')
    await expectPath(page, '/desk/')
  })

  for (const sitePage of pages) {
    const other = otherLocale(sitePage.locale)
    const alternate = pathFor(sitePage.section, other)
    const hash = sampleHash[sitePage.section]

    test(`${sitePage.name} moves to ${alternate} for a saved "${other}", keeping query and hash`, async ({
      page,
    }) => {
      await saveLanguage(page, other)
      await page.goto(`${sitePage.path}?ref=e2e#${hash}`)
      await expectLocation(page, `${alternate}?ref=e2e#${hash}`)
      await expectLanguage(page, other)
    })

    test(`${sitePage.name} stays put for a saved "${sitePage.locale}"`, async ({ page }) => {
      await saveLanguage(page, sitePage.locale)
      await page.goto(`${sitePage.path}?ref=e2e#${hash}`)
      await expectLanguage(page, sitePage.locale)
      await expectLocation(page, `${sitePage.path}?ref=e2e#${hash}`)
    })
  }

  test('is applied when coming back with the Back button', async ({ page }) => {
    await page.goto('/')
    await switchLanguage(page, 'en')
    await expectPath(page, '/en/')

    // Back to the Myanmar page (from the bfcache in WebKit, a fresh load in Chromium): it must move on
    // to the saved English alternate.
    await page.goBack()
    await expectPath(page, '/en/')
    await expectLanguage(page, 'en')
  })

  test('rewrites cross-section links on a page restored with the Back button', async ({ page }) => {
    await page.goto('/')
    await expectCrossLinks(page, 'home', 'en')
    await followCrossLink(page)
    await expectPath(page, '/desk/')

    await switchLanguage(page, 'my')
    await expectPath(page, '/my/desk/')

    // History is now / → /desk/ → /my/desk/. Back once: /desk/ moves on to /my/desk/ (replace).
    await page.goBack()
    await expectPath(page, '/my/desk/')
    // Back again: Home in Myanmar, whose Desk links must now follow the saved Myanmar choice.
    await page.goBack()
    await expectPath(page, '/')
    await expectCrossLinks(page, 'home', 'my')
  })
})

test.describe('cross-section links', () => {
  test('Home → Desk links follow a saved Myanmar choice', async ({ page }) => {
    await saveLanguage(page, 'my')
    await page.goto('/')
    await expectCrossLinks(page, 'home', 'my')
    await followCrossLink(page)
    await expectPath(page, '/my/desk/')
    await expectLanguage(page, 'my')
  })

  test('Desk → Home links follow a saved English choice', async ({ page }) => {
    await saveLanguage(page, 'en')
    await page.goto('/desk/')
    await expectCrossLinks(page, 'desk', 'en')
    await followCrossLink(page)
    await expectPath(page, '/en/')
    await expectLanguage(page, 'en')
  })

  test('a choice made on one section carries to the other and back', async ({ page }) => {
    await page.goto('/')
    await switchLanguage(page, 'en')
    await expectPath(page, '/en/')
    await expectCrossLinks(page, 'home', 'en')

    await followCrossLink(page)
    await expectPath(page, '/desk/')
    await expectLanguage(page, 'en')
    await expectCrossLinks(page, 'desk', 'en')

    await switchLanguage(page, 'my')
    await expectPath(page, '/my/desk/')
    await expectCrossLinks(page, 'desk', 'my')

    await followCrossLink(page)
    await expectPath(page, '/')
    await expectLanguage(page, 'my')
    await expectCrossLinks(page, 'home', 'my')
  })
})

test.describe('language redirects @once', () => {
  const redirects = [
    ['/my/', '/'],
    ['/my', '/'],
    ['/en/desk/', '/desk/'],
    ['/en/desk', '/desk/'],
  ] as const
  for (const [from, to] of redirects) {
    test(`${from} redirects permanently to ${to}`, async ({ request, baseURL }) => {
      const response = await request.get(from, { maxRedirects: 0 })
      expect(response.status()).toBe(301)
      const location = response.headers().location ?? ''
      expect(new URL(location, requireBaseURL(baseURL)).pathname).toBe(to)
    })
  }
})
