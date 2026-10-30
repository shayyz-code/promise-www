import { defaultLocale, type Locale, locales, type Section } from './config'

const sectionBase = {
  home: '/',
  desk: '/desk/',
} as const satisfies Record<Section, `/${string}`>

/**
 * Path of a section in a language. The section's default language has no prefix; the other one is
 * prefixed: `/` and `/en/` for home, `/desk/` and `/my/desk/` for Promise Desk.
 */
export const localizedPath = (section: Section, locale: Locale, hash?: string): string => {
  const base = sectionBase[section]
  const path = locale === defaultLocale[section] ? base : `/${locale}${base}`
  return hash ? `${path}#${hash}` : path
}

export interface Alternate {
  hreflang: Locale | 'x-default'
  path: string
}

/** hreflang alternates for a section: every language plus `x-default` (the section's default). */
export const alternates = (section: Section): Alternate[] => [
  ...locales.map((locale) => ({ hreflang: locale, path: localizedPath(section, locale) })),
  { hreflang: 'x-default', path: localizedPath(section, defaultLocale[section]) },
]

/** Every page of the site, for the sitemap. */
export const allPages = (): { section: Section; locale: Locale; path: string }[] =>
  (Object.keys(sectionBase) as Section[]).flatMap((section) =>
    locales.map((locale) => ({ section, locale, path: localizedPath(section, locale) })),
  )
