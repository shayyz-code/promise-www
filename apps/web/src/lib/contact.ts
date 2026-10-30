/** Builders for the contact links used across the site. Pure functions of the business data. */

/** `09XXXXXXXXX` → `+959XXXXXXXXX` */
export const toInternational = (localNumber: string): string =>
  `+95${localNumber.replace(/^0/, '')}`

export const telHref = (localNumber: string): string => `tel:${localNumber}`

/** Opens a Viber chat. The `+` must be percent-encoded for Viber to accept the number. */
export const viberHref = (localNumber: string): string =>
  `viber://chat?number=${encodeURIComponent(toInternational(localNumber))}`

export const telegramHref = (handle: string): string => `https://t.me/${handle}`

export const discordHref = (invite: string): string => `https://discord.gg/${invite}`

export const discordLabel = (invite: string): string => `discord.gg/${invite}`

export const mailtoHref = (email: string): string => `mailto:${email}`
