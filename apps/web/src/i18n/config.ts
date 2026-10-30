import { type Locale, locales } from '@promise-www/content/locales'

export { type Locale, locales }

/** The two parts of the site. Each has its own default language. */
export const sections = ['home', 'desk'] as const

export type Section = (typeof sections)[number]

/** Home is Myanmar-first; Promise Desk (students and creators) is English-first. */
export const defaultLocale = {
  home: 'my',
  desk: 'en',
} as const satisfies Record<Section, Locale>

/** Labels shown in the language switch, always in their own language. */
export const localeLabels = {
  en: 'EN',
  my: 'မြန်မာ',
} as const satisfies Record<Locale, string>

/** Open Graph `og:locale` values. */
export const ogLocales = {
  en: 'en_US',
  my: 'my_MM',
} as const satisfies Record<Locale, string>

/** localStorage key for an explicit language choice. Must match `scripts/head.inline.js`. */
export const LANGUAGE_STORAGE_KEY = 'promise-lang'
