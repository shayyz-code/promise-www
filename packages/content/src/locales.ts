export const locales = ['my', 'en'] as const

export type Locale = (typeof locales)[number]

export const isLocale = (value: unknown): value is Locale =>
  typeof value === 'string' && (locales as readonly string[]).includes(value)
