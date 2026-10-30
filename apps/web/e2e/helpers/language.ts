import { expect, type Page } from '@playwright/test'
import { type Locale, otherSection, pathFor, type Section } from '../fixtures/pages'

/** localStorage key of an explicit language choice. */
export const LANGUAGE_KEY = 'promise-lang'

/** Links from Home to Promise Desk and back. */
export const CROSS_LINKS = 'a[data-href-en][data-href-my]'

/**
 * Saves a language choice without visiting one of the pages (which would apply it straight away):
 * `robots.txt` is a same-origin document without scripts.
 */
export const saveLanguage = async (page: Page, locale: Locale): Promise<void> => {
  await page.goto('/robots.txt')
  await page.evaluate(({ key, value }) => localStorage.setItem(key, value), {
    key: LANGUAGE_KEY,
    value: locale,
  })
}

export const savedLanguage = (page: Page): Promise<string | null> =>
  page.evaluate((key) => localStorage.getItem(key), LANGUAGE_KEY)

/** Clicks a language in the language switch. */
export const switchLanguage = async (page: Page, locale: Locale): Promise<void> => {
  await page.getByTestId('lang-switch').locator(`a[hreflang="${locale}"]`).click()
}

/** Waits until the URL path is `pathname` (query and hash ignored). */
export const expectPath = async (page: Page, pathname: string): Promise<void> => {
  await expect(page, `expected to be on ${pathname}`).toHaveURL((url) => url.pathname === pathname)
}

/** Waits until path + query + hash equal `location` exactly, e.g. `/en/?ref=x#orders`. */
export const expectLocation = async (page: Page, location: string): Promise<void> => {
  await expect(page, `expected to be on ${location}`).toHaveURL(
    (url) => `${url.pathname}${url.search}${url.hash}` === location,
  )
}

export const expectLanguage = async (page: Page, locale: Locale): Promise<void> => {
  await expect(page.locator('html')).toHaveAttribute('lang', locale)
}

/**
 * Problems with the cross-section links on a page of `section`: each must carry `data-href-en` and
 * `data-href-my` pointing at the other section in that language, and its `href` must currently equal
 * the one for `expected`. Returns an empty list when all is well, so it can be polled.
 */
export const crossLinkProblems = async (
  page: Page,
  section: Section,
  expected: Locale,
): Promise<string[]> => {
  const links = await page.locator(CROSS_LINKS).evaluateAll((anchors) =>
    anchors.map((anchor) => ({
      href: anchor.getAttribute('href') ?? '',
      en: anchor.getAttribute('data-href-en') ?? '',
      my: anchor.getAttribute('data-href-my') ?? '',
      text: (anchor.textContent ?? '').replace(/\s+/g, ' ').trim(),
    })),
  )
  if (links.length === 0) return [`no ${CROSS_LINKS} links on this ${section} page`]

  const target = otherSection(section)
  const pathOf = (href: string) => new URL(href, page.url()).pathname
  const problems: string[] = []
  for (const link of links) {
    const label = `"${link.text}"`
    if (pathOf(link.en) !== pathFor(target, 'en'))
      problems.push(`${label}: data-href-en is ${link.en}, expected ${pathFor(target, 'en')}`)
    if (pathOf(link.my) !== pathFor(target, 'my'))
      problems.push(`${label}: data-href-my is ${link.my}, expected ${pathFor(target, 'my')}`)
    const want = expected === 'en' ? link.en : link.my
    if (link.href !== want) problems.push(`${label}: href is ${link.href}, expected ${want}`)
  }
  return problems
}

/** Polls until every cross-section link points at the other section in `expected`. */
export const expectCrossLinks = async (
  page: Page,
  section: Section,
  expected: Locale,
): Promise<void> => {
  await expect
    .poll(() => crossLinkProblems(page, section, expected), {
      message: `cross-section links on ${section} should point at the ${expected} pages`,
    })
    .toEqual([])
}

/** Follows the first visible link to the other section. */
export const followCrossLink = async (page: Page): Promise<void> => {
  await page.locator(CROSS_LINKS).filter({ visible: true }).first().click()
}
