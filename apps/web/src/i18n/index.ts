import type { LocalizedText } from '@promise-www/content'
import type { Locale } from './config'
import { common as enCommon } from './dictionaries/en/common'
import { desk as enDesk } from './dictionaries/en/desk'
import { home as enHome } from './dictionaries/en/home'
import { common as myCommon } from './dictionaries/my/common'
import { desk as myDesk } from './dictionaries/my/desk'
import { home as myHome } from './dictionaries/my/home'
import type { CommonDictionary, DeskDictionary, HomeDictionary } from './dictionaries/types'

interface Dictionaries {
  common: CommonDictionary
  home: HomeDictionary
  desk: DeskDictionary
}

export type Namespace = keyof Dictionaries

export const dictionaries = {
  en: { common: enCommon, home: enHome, desk: enDesk },
  my: { common: myCommon, home: myHome, desk: myDesk },
} as const satisfies Record<Locale, Dictionaries>

export const getDictionary = <N extends Namespace>(locale: Locale, namespace: N): Dictionaries[N] =>
  dictionaries[locale][namespace]

/** Picks the right language from bilingual content. */
export const localize = (text: LocalizedText, locale: Locale): string => text[locale]

/** Fills `{name}` placeholders, e.g. `format('Open {hours}', { hours })`. */
export const format = (template: string, values: Record<string, string>): string =>
  template.replace(/\{(\w+)\}/g, (match, key: string) => values[key] ?? match)
