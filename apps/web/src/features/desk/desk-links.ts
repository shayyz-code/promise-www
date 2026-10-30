import type { Business } from '@promise-www/content'
import { defaultLocale } from '../../i18n/config'
import { localizedPath } from '../../i18n/routes'
import {
  discordHref,
  discordLabel,
  mailtoHref,
  telegramHref,
  telHref,
  viberHref,
} from '../../lib/contact'

export interface Phone {
  number: string
  tel: string
}

/** Every link the Desk page uses, built from the business content. */
export interface DeskLinks {
  bot: { handle: string; href: string }
  shop: { handle: string; href: string }
  discord: { href: string; label: string }
  /** The primary number: shown in copy, called and messaged on Viber. */
  primary: Phone
  viber: string
  /** The other numbers ("Also" on the receipt). */
  others: Phone[]
  email: { address: string; href: string }
  map: string
  /** Main site. Home is Myanmar-first; a script rewrites it to a saved language choice. */
  home: { href: string; en: string; my: string }
}

const toPhone = (number: string): Phone => ({ number, tel: telHref(number) })

export const deskLinks = (business: Business): DeskLinks => {
  const [primary, ...others] = business.phones
  if (!primary) throw new Error('Business content has no phone number.')
  return {
    bot: { handle: `@${business.telegram.bot}`, href: telegramHref(business.telegram.bot) },
    shop: { handle: `@${business.telegram.shop}`, href: telegramHref(business.telegram.shop) },
    discord: {
      href: discordHref(business.discordInvite),
      label: discordLabel(business.discordInvite),
    },
    primary: toPhone(primary.number),
    viber: viberHref(primary.number),
    others: others.map((phone) => toPhone(phone.number)),
    email: { address: business.email, href: mailtoHref(business.email) },
    map: business.mapUrl,
    home: {
      href: localizedPath('home', defaultLocale.home),
      en: localizedPath('home', 'en'),
      my: localizedPath('home', 'my'),
    },
  }
}
