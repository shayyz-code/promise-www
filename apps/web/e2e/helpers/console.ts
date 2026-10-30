import type { Page } from '@playwright/test'

/**
 * Collects console errors and uncaught exceptions from the moment it is called. Returns a live array:
 * read it after the interaction under test. Failed subresource loads (404s, CSP blocks) show up here too,
 * because browsers report them as console errors.
 */
export const collectConsoleErrors = (page: Page): string[] => {
  const errors: string[] = []
  page.on('console', (message) => {
    if (message.type() !== 'error') return
    const { url, lineNumber } = message.location()
    errors.push(url ? `${message.text()} (${url}:${lineNumber})` : message.text())
  })
  page.on('pageerror', (error) => {
    errors.push(`Uncaught ${error.name}: ${error.message}`)
  })
  return errors
}
