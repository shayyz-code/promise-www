import type { Business } from '@promise-www/content'
import { discordHref, telegramHref, toInternational } from './contact'

/**
 * schema.org `Store` for local search results: address, phones, opening hours and chat profiles.
 * Serialised into a JSON-LD script in the page head.
 */
export const storeJsonLd = (business: Business, siteUrl: string) => ({
  '@context': 'https://schema.org',
  '@type': 'Store',
  '@id': `${siteUrl}#store`,
  name: business.name,
  url: siteUrl,
  email: business.email,
  telephone: business.phones.map((phone) => toInternational(phone.number)),
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
})

/** JSON for a `<script type="application/ld+json">`, with `<` escaped so it cannot close the tag. */
export const serializeJsonLd = (data: unknown): string =>
  JSON.stringify(data).replace(/</g, '\\u003c')
