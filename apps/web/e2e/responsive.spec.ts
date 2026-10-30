import { expect, type Page, test } from '@playwright/test'
import { pages } from './fixtures/pages'

const WIDTHS = [320, 360, 390, 768, 1024, 1280, 1440, 1920] as const

/** WCAG 2.5.5 (AAA) size, which DESIGN.md adopts for every interactive target. */
const MIN_TARGET = 44

const viewportFor = (width: number) => ({ width, height: width < 768 ? 844 : 900 })

/** Horizontal overflow at the current viewport, with the elements that stick out. */
const measureOverflow = (page: Page) =>
  page.evaluate(() => {
    const viewport = window.innerWidth
    const scrollWidth = document.documentElement.scrollWidth
    if (scrollWidth <= viewport) return { viewport, scrollWidth, offenders: [] }
    const offenders = [...document.body.querySelectorAll('*')]
      .filter((element) => {
        const rect = element.getBoundingClientRect()
        return rect.width > 0 && rect.right > viewport + 1
      })
      .slice(0, 8)
      .map((element) => {
        const id = element.id ? `#${element.id}` : ''
        const classes = [...element.classList].map((name) => `.${name}`).join('')
        return `${element.localName}${id}${classes} (right edge ${Math.round(element.getBoundingClientRect().right)})`
      })
    return { viewport, scrollWidth, offenders }
  })

/** Visible links and buttons in the landmarks that are shorter than `minimum`. */
const findSmallTargets = (page: Page) =>
  page.evaluate((minimum) => {
    const label = (element: Element) => {
      const id = element.id ? `#${element.id}` : ''
      const classes = [...element.classList].map((name) => `.${name}`).join('')
      const href = element.getAttribute('href')
      const text = (element.textContent ?? '').replace(/\s+/g, ' ').trim().slice(0, 40)
      return `${element.localName}${id}${classes}${href ? `[href="${href}"]` : ''} "${text}"`
    }
    const isShown = (element: Element) => {
      const rect = element.getBoundingClientRect()
      // 1 px boxes are visually hidden (sr-only) content, not targets.
      if (rect.width <= 1 || rect.height <= 1) return false
      return (
        element.getClientRects().length > 0 && getComputedStyle(element).visibility !== 'hidden'
      )
    }

    const targets = new Set<Element>()
    for (const root of document.querySelectorAll(
      'header, nav, main, footer, [data-testid="tab-bar"]',
    )) {
      for (const target of root.querySelectorAll('a[href], button')) targets.add(target)
    }

    const offenders: string[] = []
    for (const target of targets) {
      // Links inside running text are exempt (WCAG 2.5.8 inline exception).
      if (target.closest('p')) continue
      // The language switch is measured as a group below.
      if (target.closest('[data-testid="lang-switch"]')) continue
      if (!isShown(target)) continue
      const { height } = target.getBoundingClientRect()
      if (height + 0.5 < minimum) offenders.push(`${label(target)}: ${height.toFixed(1)} px tall`)
    }
    for (const group of document.querySelectorAll('[data-testid="lang-switch"]')) {
      if (!isShown(group)) continue
      const { height } = group.getBoundingClientRect()
      if (height + 0.5 < minimum)
        offenders.push(`language switch group: ${height.toFixed(1)} px tall`)
    }
    return offenders
  }, MIN_TARGET)

test.describe('responsive layout @once', () => {
  for (const sitePage of pages) {
    test(`${sitePage.name}: no horizontal scrolling from 320 to 1920 px`, async ({ page }) => {
      await page.goto(sitePage.path)
      const failures: string[] = []
      for (const width of WIDTHS) {
        await page.setViewportSize(viewportFor(width))
        const { viewport, scrollWidth, offenders } = await measureOverflow(page)
        if (scrollWidth > viewport)
          failures.push(
            `${width} px: scrollWidth ${scrollWidth} > ${viewport}; sticking out: ${offenders.join(', ')}`,
          )
      }
      expect(failures, failures.join('\n')).toEqual([])
    })

    test(`${sitePage.name}: tab bar below 768 px, desktop nav from 768 px`, async ({ page }) => {
      await page.goto(sitePage.path)
      const tabBar = page.getByTestId('tab-bar')
      const desktopNav = page.getByRole('navigation', {
        name: sitePage.navLabel,
        exact: true,
        includeHidden: true,
      })
      for (const [width, phone] of [
        [390, true],
        [767, true],
        [768, false],
        [1440, false],
      ] as const) {
        await page.setViewportSize(viewportFor(width))
        await expect(tabBar, `tab bar at ${width} px`).toBeVisible({ visible: phone })
        await expect(desktopNav, `desktop nav at ${width} px`).toBeVisible({ visible: !phone })
      }
    })

    for (const width of [390, 1440] as const) {
      test(`${sitePage.name}: tap targets are at least ${MIN_TARGET} px tall at ${width} px`, async ({
        page,
      }) => {
        await page.setViewportSize(viewportFor(width))
        await page.goto(sitePage.path)
        const offenders = await findSmallTargets(page)
        expect(offenders, `targets under ${MIN_TARGET} px:\n${offenders.join('\n')}`).toEqual([])
      })
    }
  }
})
