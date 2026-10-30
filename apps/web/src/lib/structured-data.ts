import type { Business } from '@promise-www/content'
import { locales } from '@promise-www/content/locales'
import { discordHref, telegramHref, toInternational } from './contact'

const storeId = (siteUrl: string): string => `${siteUrl}#store`

/**
 * schema.org `OfficeEquipmentStore`, the `Store` subtype for this kind of shop, for local search results:
 * address, phones, opening hours and chat profiles. Serialised into a JSON-LD script in the page head.
 */
export const storeJsonLd = (business: Business, siteUrl: string) => {
  const [primaryPhone] = business.phones
  if (!primaryPhone) throw new Error('The store needs a phone number.')

  return {
    '@context': 'https://schema.org',
    '@type': 'OfficeEquipmentStore',
    '@id': storeId(siteUrl),
    name: business.name,
    url: siteUrl,
    logo: new URL('/apple-touch-icon.png', siteUrl).href,
    email: business.email,
    telephone: toInternational(primaryPhone.number),
    contactPoint: business.phones.map((phone) => ({
      '@type': 'ContactPoint',
      telephone: toInternational(phone.number),
      contactType: 'customer service',
    })),
    address: {
      '@type': 'PostalAddress',
      streetAddress: `${business.address.street}, ${business.address.area}`,
      addressLocality: business.address.city,
      postalCode: business.address.postalCode,
      addressCountry: business.address.countryCode,
    },
    hasMap: business.mapUrl,
    openingHoursSpecification: business.hours.schedule.map((slot) => ({
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: slot.days,
      opens: slot.opens,
      closes: slot.closes,
    })),
    sameAs: [telegramHref(business.telegram.shop), discordHref(business.discordInvite)],
  }
}

/** schema.org `WebSite`, which Google reads from the home page to name the site in its results. */
export const websiteJsonLd = (business: Business, siteUrl: string) => ({
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  '@id': `${siteUrl}#website`,
  name: business.name,
  alternateName: ['Promise', business.domain],
  url: siteUrl,
  inLanguage: locales,
  publisher: { '@id': storeId(siteUrl) },
})

/** JSON for a `<script type="application/ld+json">`, with `<` escaped so it cannot close the tag. */
export const serializeJsonLd = (data: unknown): string =>
  JSON.stringify(data).replace(/</g, '\\u003c')
