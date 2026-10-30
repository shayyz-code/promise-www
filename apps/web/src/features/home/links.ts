import { defaultLocale, type Locale } from '../../i18n/config'
import { localizedPath } from '../../i18n/routes'

/** Promise Desk in each language, for links that `language-preference.ts` rewrites to a saved choice. */
export const deskHrefs = {
  en: localizedPath('desk', 'en'),
  my: localizedPath('desk', 'my'),
} as const satisfies Record<Locale, string>

/** Promise Desk is English-first (a product decision), so Home links to its default language. */
export const deskHref = localizedPath('desk', defaultLocale.desk)

/** Attributes for every `<a>` from Home to Promise Desk: `<a {...deskLinkAttrs}>`. */
export const deskLinkAttrs = {
  href: deskHref,
  'data-href-en': deskHrefs.en,
  'data-href-my': deskHrefs.my,
} as const
