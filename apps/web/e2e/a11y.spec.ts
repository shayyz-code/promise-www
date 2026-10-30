import { AxeBuilder } from '@axe-core/playwright'
import { expect, test } from '@playwright/test'
import { pages } from './fixtures/pages'
import { revealAll, runningAnimations } from './helpers/motion'

const WCAG_TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa']

type AxeViolation = Awaited<ReturnType<AxeBuilder['analyze']>>['violations'][number]

/** One line per violation: rule id, impact and the offending nodes' selectors. */
const summarize = (violations: readonly AxeViolation[]): string[] =>
  violations.map((violation) => {
    const targets = violation.nodes.map((node) =>
      node.target.map((part) => (Array.isArray(part) ? part.join(' >>> ') : part)).join(' '),
    )
    return `${violation.id} (${violation.impact ?? 'n/a'}): ${targets.join(' | ')}`
  })

const explain = (violations: readonly AxeViolation[]): string =>
  violations
    .map((violation) => `${violation.id}: ${violation.help}\n  ${violation.helpUrl}`)
    .join('\n')

// Still pages: nothing mid-animation, so contrast and visibility are measured on the final state.
test.use({ reducedMotion: 'reduce' })

for (const sitePage of pages) {
  test.describe(sitePage.name, () => {
    test('stops animating under prefers-reduced-motion', async ({ page }) => {
      await page.goto(sitePage.path)
      await revealAll(page)
      await expect
        .poll(() => runningAnimations(page), {
          message: 'animations still running with prefers-reduced-motion: reduce',
        })
        .toEqual([])
    })

    test('has no WCAG 2.2 AA violations', async ({ page }) => {
      await page.goto(sitePage.path)
      // Scroll once through the page so scroll-revealed content is in its final state.
      await revealAll(page)

      const results = await new AxeBuilder({ page }).withTags(WCAG_TAGS).analyze()
      expect(summarize(results.violations), explain(results.violations)).toEqual([])
    })
  })
}
