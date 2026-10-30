import { z } from 'zod'
import { localizedTextSchema } from './localized'

/** Myanmar phone number in local format, e.g. `09965072801`. */
export const localPhoneSchema = z
  .string()
  .regex(/^09\d{7,9}$/, 'Expected a local Myanmar number (09…)')

const timeSchema = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Expected HH:mm')

export const dayOfWeekSchema = z.enum([
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
])

export const businessSchema = z.object({
  name: z.string().min(1),
  domain: z.string().min(1),
  email: z.email(),
  address: z.object({
    street: z.string().min(1),
    area: z.string().min(1),
    city: z.string().min(1),
    postalCode: z.string().min(1),
    country: z.string().min(1),
    countryCode: z.string().length(2),
  }),
  /** The first number is the primary contact. */
  phones: z.array(z.object({ number: localPhoneSchema, viber: z.boolean() })).min(1),
  telegram: z.object({
    shop: z.string().min(1),
    bot: z.string().min(1),
  }),
  discordInvite: z.string().min(1),
  mapUrl: z.url(),
  geo: z.object({
    latitude: z.number().min(-90).max(90),
    longitude: z.number().min(-180).max(180),
  }),
  hours: z.object({
    days: localizedTextSchema,
    time: localizedTextSchema,
    schedule: z
      .array(
        z.object({
          days: z.array(dayOfWeekSchema).min(1),
          opens: timeSchema,
          closes: timeSchema,
        }),
      )
      .min(1),
  }),
})

export type Business = z.infer<typeof businessSchema>
export type DayOfWeek = z.infer<typeof dayOfWeekSchema>
