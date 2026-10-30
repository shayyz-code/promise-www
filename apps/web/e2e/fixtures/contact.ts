import type { Section } from './pages'

/*
 * Contact links each page must offer, copied from the design artifact. Hard-coded on purpose: this is the
 * contract the rendered pages are checked against, independent of `@promise-www/content`.
 */

const tel = ['tel:09965072801', 'tel:095072801', 'tel:09957626698'] as const

/** All three numbers are on Viber; the `+` is percent-encoded. */
const viberAll = [
  'viber://chat?number=%2B959965072801',
  'viber://chat?number=%2B9595072801',
  'viber://chat?number=%2B959957626698',
] as const

const shared = [
  'https://t.me/promisemmdotcom',
  'https://t.me/promisemmbot',
  'https://discord.gg/NhfFd8ZX8',
  'mailto:hi@promisemm.com',
  'https://maps.app.goo.gl/PSKScHszoEyGHuUP8',
  'https://www.rustraccoon.com',
] as const

export const contactHrefs = {
  /** Home lists every number for calls and for Viber in the visit section. */
  home: [...tel, ...viberAll, ...shared],
  /** Promise Desk's receipt lists all three numbers for calls, but Viber only for the primary number. */
  desk: [...tel, 'viber://chat?number=%2B959965072801', ...shared],
} as const satisfies Record<Section, readonly string[]>

/** Every off-site href the design uses. Any other external link on a page is unexpected. */
export const knownExternalHrefs: ReadonlySet<string> = new Set([
  ...contactHrefs.home,
  ...contactHrefs.desk,
])
