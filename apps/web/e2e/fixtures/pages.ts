/*
 * The four pages of the site as the design defines them. These values are the test contract: they are
 * hard-coded from the design artifact (copy) and DESIGN.md (selector contract) on purpose, so a change in
 * the app's routes or dictionaries cannot silently change what the tests expect.
 */

export type Locale = 'en' | 'my'
export type Section = 'home' | 'desk'

export const locales = ['en', 'my'] as const satisfies readonly Locale[]
export const sections = ['home', 'desk'] as const satisfies readonly Section[]

/** Each section's default language has no path prefix. */
export const defaultLocale = { home: 'my', desk: 'en' } as const satisfies Record<Section, Locale>

export const paths = {
  home: { my: '/', en: '/en/' },
  desk: { en: '/desk/', my: '/my/desk/' },
} as const satisfies Record<Section, Record<Locale, string>>

/** `<main> > <section id>` ids, in document order (the Home who-we-serve section has no id). */
export const sectionIds = {
  home: ['top', 'chat', 'promise', 'orders', 'range', 'desk', 'community', 'visit'],
  desk: ['top', 'shelf', 'how', 'community', 'visit'],
} as const satisfies Record<Section, readonly string[]>

/** A section id on each page that is far enough down to prove a hash survives a redirect. */
export const sampleHash = { home: 'orders', desk: 'shelf' } as const satisfies Record<
  Section,
  string
>

export const ogLocale = { en: 'en_US', my: 'my_MM' } as const satisfies Record<Locale, string>

export const pathFor = (section: Section, locale: Locale): string => paths[section][locale]

export const otherLocale = (locale: Locale): Locale => (locale === 'en' ? 'my' : 'en')

export const otherSection = (section: Section): Section => (section === 'home' ? 'desk' : 'home')

export interface SitePage {
  /** Unique, readable label for test titles. */
  readonly name: string
  readonly path: string
  readonly locale: Locale
  readonly section: Section
  /** The h1 as designed, one entry per visual line. */
  readonly h1: readonly string[]
  /** Accessible name of the desktop `<nav>` (hidden below 768 px). */
  readonly navLabel: string
  /** Text of the skip link. */
  readonly skipLabel: string
}

export const pages = [
  {
    name: 'Home (my, /)',
    path: '/',
    locale: 'my',
    section: 'home',
    // h1a · h1b · h1c0 + h1cU + h1c1
    h1: ['ယုံကြည်စိတ်ချရတဲ့ စက္ကူ။', 'အမြဲမျှတတဲ့ ဈေးနှုန်း။', 'ကတိတည်တဲ့ ဝန်ဆောင်မှု။'],
    navLabel: 'အဓိက လမ်းညွှန်',
    skipLabel: 'အဓိကအကြောင်းအရာသို့ ကျော်ရန်',
  },
  {
    name: 'Home (en, /en/)',
    path: '/en/',
    locale: 'en',
    section: 'home',
    h1: ['Paper you can trust.', 'Prices that stay fair.', 'Service, as promised.'],
    navLabel: 'Main',
    skipLabel: 'Skip to main content',
  },
  {
    name: 'Desk (en, /desk/)',
    path: '/desk/',
    locale: 'en',
    section: 'desk',
    // h1a + h1Desk + h1b + h1You + h1c
    h1: ['Make your desk feel like you.'],
    navLabel: 'Main',
    skipLabel: 'Skip to content',
  },
  {
    name: 'Desk (my, /my/desk/)',
    path: '/my/desk/',
    locale: 'my',
    section: 'desk',
    h1: ['ကိုယ့်စားပွဲ၊ ကိုယ့်စတိုင်။'],
    navLabel: 'ပင်မ မီနူး',
    skipLabel: 'အဓိကအကြောင်းအရာသို့ ကျော်သွားရန်',
  },
] as const satisfies readonly SitePage[]

/**
 * The Home promise statement (`#promise p`), joined from its fragments: pr0 + prU1 + pr1 + prU2 + pr2 +
 * prU3 + pr3. The underlined words are separate elements, so a lost or extra space between fragments
 * shows up here.
 */
export const promiseStatement = {
  en: [
    'We promise ',
    'quality',
    ' you can feel in every sheet, ',
    'prices',
    ' that stay fair whether you buy one pen or a hundred reams, and ',
    'service',
    ' that gets your order right the first time.',
  ].join(''),
  my: [
    'စာရွက်တိုင်းမှာ ခံစားသိနိုင်တဲ့ ',
    'အရည်အသွေး',
    '၊ ဘောပင်တစ်ချောင်း ဝယ်ဝယ်၊ စက္ကူ အထုပ်တစ်ရာ ဝယ်ဝယ် မျှတနေမယ့် ',
    'ဈေးနှုန်း',
    '၊ အော်ဒါကို ပထမအကြိမ်ကတည်းက မှန်ကန်စွာ စီစဉ်ပေးမယ့် ',
    'ဝန်ဆောင်မှု',
    ' တို့ကို ကတိပေးပါတယ်။',
  ].join(''),
} as const satisfies Record<Locale, string>

/** Mobile tab bar scroll-spy expectations (`data-tab` of the tab that should be active). */
export const scrollSpy = {
  /** Home: scrolling `#orders` to the top of the viewport activates the `order` tab. */
  home: { sectionId: 'orders', tab: 'order' },
  /** Promise Desk: at the very bottom of the page the `visit` tab is active. */
  desk: { bottomTab: 'visit' },
} as const

/** Every page path and the in-page targets it offers (its section ids plus `main`). */
export const anchorsByPath: ReadonlyMap<string, readonly string[]> = new Map(
  pages.map((page) => [page.path, ['main', ...sectionIds[page.section]]]),
)
