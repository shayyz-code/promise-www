import type { Page } from '@playwright/test'

export interface CspViolation {
  directive: string
  blocked: string
  sample: string
  source: string
}

declare global {
  interface Window {
    /** Filled by `trackCspViolations` in end-to-end tests only. */
    __e2eCspViolations?: CspViolation[]
  }
}

/**
 * Records every `securitypolicyviolation` event of each document the page loads. Call it before
 * `page.goto`; read the result with `readCspViolations` once the page has settled.
 */
export const trackCspViolations = async (page: Page): Promise<void> => {
  await page.addInitScript(() => {
    const violations: CspViolation[] = []
    window.__e2eCspViolations = violations
    document.addEventListener('securitypolicyviolation', (event) => {
      violations.push({
        directive: event.effectiveDirective,
        blocked: event.blockedURI,
        sample: event.sample,
        source: `${event.sourceFile}:${event.lineNumber}:${event.columnNumber}`,
      })
    })
  })
}

/** Violations reported by the current document (see `trackCspViolations`). */
export const readCspViolations = (page: Page): Promise<CspViolation[]> =>
  page.evaluate(() => window.__e2eCspViolations ?? [])

export const formatCspViolations = (violations: readonly CspViolation[]): string =>
  violations
    .map((v) => `${v.directive} blocked ${v.blocked || '(inline)'} at ${v.source} ${v.sample}`)
    .join('\n')
