const escapeRegExp = (text: string): string => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

/**
 * Matches an element's text against designed lines: whitespace inside a line must be present (any amount),
 * whitespace between lines is optional, and leading/trailing whitespace is ignored. So a lost space
 * between two sentence fragments fails, but block-level line wrappers without spaces between them pass.
 */
export const linesPattern = (lines: readonly string[]): RegExp =>
  new RegExp(
    `^\\s*${lines.map((line) => escapeRegExp(line.trim()).replace(/\s+/g, '\\s+')).join('\\s*')}\\s*$`,
  )

/** Requires the configured `baseURL` (always set by the Playwright configs). */
export const requireBaseURL = (baseURL: string | undefined): string => {
  if (!baseURL) throw new Error('baseURL is not configured (see playwright.config.ts).')
  return baseURL
}
