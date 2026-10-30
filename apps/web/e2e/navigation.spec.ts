import { expect, test } from '@playwright/test'
import { anchorsByPath, pages, promiseStatement, scrollSpy, sectionIds } from './fixtures/pages'
import { collectConsoleErrors } from './helpers/console'
import { formatCspViolations, readCspViolations, trackCspViolations } from './helpers/csp'
import { linesPattern, requireBaseURL } from './helpers/text'

/** Below this width the mobile tab bar replaces the desktop nav. */
const PHONE_MAX = 767

for (const sitePage of pages) {
  test.describe(sitePage.name, () => {
    test('responds 200 in its language with the designed h1', { tag: '@smoke' }, async ({
      page,
    }) => {
      const response = await page.goto(sitePage.path)
      expect(response?.status()).toBe(200)
      await expect(page).toHaveURL((url) => url.pathname === sitePage.path)
      await expect(page.locator('html')).toHaveAttribute('lang', sitePage.locale)

      const heading = page.getByRole('heading', { level: 1 })
      await expect(heading).toHaveCount(1)
      await expect(heading).toHaveText(linesPattern(sitePage.h1))
    })

    test('loads without console errors or CSP violations', { tag: '@smoke' }, async ({ page }) => {
      const errors = collectConsoleErrors(page)
      await trackCspViolations(page)
      await page.goto(sitePage.path)
      await page.waitForLoadState('networkidle')

      expect(errors, `console errors:\n${errors.join('\n')}`).toEqual([])
      const violations = await readCspViolations(page)
      expect(violations, `CSP violations:\n${formatCspViolations(violations)}`).toEqual([])
    })

    test('has one banner, main#main and one contentinfo', { tag: '@once' }, async ({ page }) => {
      await page.goto(sitePage.path)
      await expect(page.getByRole('banner')).toHaveCount(1)
      await expect(page.locator('main')).toHaveCount(1)
      await expect(page.locator('main')).toHaveAttribute('id', 'main')
      await expect(page.getByRole('contentinfo')).toHaveCount(1)
    })

    test('keeps the selector-contract section ids, in order', { tag: '@once' }, async ({
      page,
    }) => {
      await page.goto(sitePage.path)
      const ids = await page
        .locator('main > section[id]')
        .evaluateAll((sections) => sections.map((section) => section.id))
      expect(ids).toEqual([...sectionIds[sitePage.section]])

      const duplicates = await page.evaluate(
        (contractIds) => {
          return contractIds.filter((id) => document.querySelectorAll(`[id="${id}"]`).length !== 1)
        },
        [...sectionIds[sitePage.section], 'main'],
      )
      expect(duplicates, 'ids that are missing or not unique').toEqual([])
    })

    test('starts with a skip link to #main', { tag: '@once' }, async ({ page }) => {
      await page.goto(sitePage.path)
      const first = await page.evaluate(() => {
        const focusable = [
          'a[href]',
          'area[href]',
          'button:not([disabled])',
          'input:not([disabled]):not([type="hidden"])',
          'select:not([disabled])',
          'textarea:not([disabled])',
          'summary',
          'iframe',
          '[contenteditable="true"]',
          '[tabindex]:not([tabindex="-1"])',
        ].join(', ')
        const element = [...document.querySelectorAll(focusable)].find(
          (candidate) => candidate.getClientRects().length > 0 && !candidate.closest('[inert]'),
        )
        if (!element) return null
        return {
          tag: element.localName,
          href: element.getAttribute('href'),
          text: (element.textContent ?? '').replace(/\s+/g, ' ').trim(),
        }
      })
      expect(first).toEqual({ tag: 'a', href: '#main', text: sitePage.skipLabel })
    })

    test('the skip link is the first Tab stop and jumps to main', async ({ page, browserName }) => {
      test.skip(
        browserName === 'webkit',
        'WebKit tabs to links only with the "Press Tab to highlight each item" setting on',
      )
      await page.goto(sitePage.path)
      await page.keyboard.press('Tab')
      const skipLink = page.getByRole('link', { name: sitePage.skipLabel, exact: true })
      await expect(skipLink).toBeFocused()
      await expect(skipLink).toHaveAttribute('href', '#main')
      await expect(skipLink).toBeInViewport()
      await page.keyboard.press('Enter')
      await expect(page).toHaveURL((url) => url.hash === '#main')
    })

    test('internal links point at existing pages and anchors', { tag: '@once' }, async ({
      page,
    }) => {
      await page.goto(sitePage.path)
      const hrefs = await page
        .locator('a[href]')
        .evaluateAll((anchors) => anchors.map((anchor) => anchor.getAttribute('href') ?? ''))
      const ids = new Set(
        await page.locator('[id]').evaluateAll((elements) => elements.map((element) => element.id)),
      )
      const here = page.url()
      const origin = new URL(here).origin

      const broken: string[] = []
      for (const href of hrefs) {
        if (href === '' || href === '#') {
          broken.push(`empty link target "${href}"`)
          continue
        }
        if (href.startsWith('#')) {
          if (!ids.has(decodeURIComponent(href.slice(1)))) broken.push(`${href}: no such id`)
          continue
        }
        const url = new URL(href, here)
        if (url.origin !== origin) continue // Off-site links are checked in contact-links.spec.ts.
        const anchors = anchorsByPath.get(url.pathname)
        if (!anchors) broken.push(`${href}: not one of the site's pages`)
        else if (url.hash && !anchors.includes(decodeURIComponent(url.hash.slice(1))))
          broken.push(`${href}: ${url.pathname} has no #${url.hash.slice(1)}`)
      }
      expect(broken, `broken links on ${sitePage.path}:\n${broken.join('\n')}`).toEqual([])
    })

    test('shows the tab bar on phones and the desktop nav from 768 px', async ({
      page,
      viewport,
    }) => {
      await page.goto(sitePage.path)
      const tabBar = page.getByTestId('tab-bar')
      const desktopNav = page.getByRole('navigation', {
        name: sitePage.navLabel,
        exact: true,
        includeHidden: true,
      })
      const width = viewport?.width ?? 0
      await expect(tabBar).toBeVisible({ visible: width <= PHONE_MAX })
      await expect(desktopNav).toBeVisible({ visible: width > PHONE_MAX })
    })

    if (sitePage.section === 'home') {
      test('keeps the spaces between the promise statement fragments', { tag: '@once' }, async ({
        page,
      }) => {
        await page.goto(sitePage.path)
        const statement = page.locator('#promise p')
        await expect(statement).toHaveCount(1)
        await expect
          .poll(() => statement.evaluate((element) => (element.textContent ?? '').trim()))
          .toBe(promiseStatement[sitePage.locale])
      })

      test('the tab bar highlights the Order tab while #orders is read', async ({
        page,
        viewport,
      }) => {
        test.skip(!viewport || viewport.width > PHONE_MAX, 'The tab bar exists below 768 px only')
        await page.goto(sitePage.path)
        const tabBar = page.getByTestId('tab-bar')
        const active = tabBar.locator('[aria-current="location"]')
        await expect(tabBar).toBeVisible()
        await expect(active).toHaveCount(1)
        await expect(tabBar.locator('a').first()).toHaveAttribute('aria-current', 'location')

        await page
          .locator(`#${scrollSpy.home.sectionId}`)
          .evaluate((section) => section.scrollIntoView({ block: 'start', behavior: 'instant' }))
        await expect(active).toHaveAttribute('data-tab', scrollSpy.home.tab)
        await expect(active).toHaveCount(1)
      })
    } else {
      test('the tab bar highlights the Visit tab at the bottom of the page', async ({
        page,
        viewport,
      }) => {
        test.skip(!viewport || viewport.width > PHONE_MAX, 'The tab bar exists below 768 px only')
        await page.goto(sitePage.path)
        const tabBar = page.getByTestId('tab-bar')
        const active = tabBar.locator('[aria-current="location"]')
        await expect(tabBar).toBeVisible()
        await expect(active).toHaveCount(1)
        await expect(tabBar.locator('a').first()).toHaveAttribute('aria-current', 'location')

        await page.evaluate(() =>
          window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'instant' }),
        )
        await expect(active).toHaveAttribute('data-tab', scrollSpy.desk.bottomTab)
        await expect(active).toHaveCount(1)
      })
    }
  })
}

test.describe('HTTP routing @once', () => {
  test('unknown paths return 404', async ({ request }) => {
    for (const path of ['/does-not-exist', '/does-not-exist/', '/en/nope/', '/desk/nope/']) {
      const response = await request.get(path, { maxRedirects: 0 })
      expect(response.status(), path).toBe(404)
    }
  })

  const trailingSlash = [
    ['/desk', '/desk/'],
    ['/en', '/en/'],
    ['/my/desk', '/my/desk/'],
  ] as const
  for (const [from, to] of trailingSlash) {
    test(`${from} redirects to ${to} with 307`, async ({ request, baseURL }) => {
      const response = await request.get(from, { maxRedirects: 0 })
      expect(response.status()).toBe(307)
      const location = response.headers().location ?? ''
      expect(new URL(location, requireBaseURL(baseURL)).pathname).toBe(to)
    })
  }
})
