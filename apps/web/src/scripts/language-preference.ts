import { isLocale } from '@promise-www/content/locales'
import { LANGUAGE_STORAGE_KEY, type Locale } from '../i18n/config'

/*
 * An explicit language choice (a click on the language switch) is remembered and applied to links
 * between Home and Promise Desk, which otherwise point at each section's default language. The redirect
 * for direct visits happens earlier, in `head.inline.js`.
 */

const readSaved = (): Locale | null => {
  try {
    const saved = localStorage.getItem(LANGUAGE_STORAGE_KEY)
    return isLocale(saved) ? saved : null
  } catch {
    return null // Storage blocked: fall back to each section's default language.
  }
}

const save = (locale: Locale): void => {
  try {
    localStorage.setItem(LANGUAGE_STORAGE_KEY, locale)
  } catch {
    // Storage blocked: the switch link still navigates, the choice just isn't remembered.
  }
}

document.addEventListener('click', (event) => {
  if (!(event.target instanceof Element)) return
  const choice = event.target.closest<HTMLAnchorElement>('a[data-lang-choice]')?.dataset.langChoice
  if (isLocale(choice)) save(choice)
})

const applySavedLanguageToLinks = (): void => {
  const saved = readSaved()
  if (!saved) return
  for (const link of document.querySelectorAll<HTMLAnchorElement>(
    'a[data-href-en][data-href-my]',
  )) {
    const href = saved === 'en' ? link.dataset.hrefEn : link.dataset.hrefMy
    if (href) link.href = href
  }
}

applySavedLanguageToLinks()
window.addEventListener('pageshow', (event) => {
  if (event.persisted) applySavedLanguageToLinks()
})
