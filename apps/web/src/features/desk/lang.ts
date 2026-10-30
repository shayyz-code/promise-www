import type { Locale } from '../../i18n/config'

/**
 * `lang` for English-only text (brand names, handles) inside a Myanmar page, so it is announced in
 * English and its fonts follow the English language island. Undefined on English pages.
 */
export const latinLang = (locale: Locale): 'en' | undefined => (locale === 'en' ? undefined : 'en')
