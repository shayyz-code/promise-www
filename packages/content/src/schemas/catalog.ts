import { z } from 'zod'
import { imageSchema, localizedTextSchema, slugSchema } from './localized'

/** A product category in "The range" list on the home page. */
export const categorySchema = z.object({
  id: slugSchema,
  order: z.number().int().nonnegative(),
  title: localizedTextSchema,
  description: localizedTextSchema,
  /** Office categories point to the ordering steps; desk categories point to Promise Desk. */
  audience: z.enum(['office', 'desk']),
})

/** A highlighted desk item shown as a polaroid on the home page. */
export const featuredItemSchema = z.object({
  id: slugSchema,
  order: z.number().int().nonnegative(),
  title: localizedTextSchema,
  description: localizedTextSchema,
  image: imageSchema.optional(),
})

export const shelfIconSchema = z.enum([
  'pen',
  'highlighter',
  'tape',
  'sticker',
  'journal',
  'organiser',
])

export const accentSchema = z.enum(['pink', 'blue', 'yellow', 'green', 'orange'])

/** A product card on the Promise Desk shelf. */
export const shelfItemSchema = z.object({
  id: slugSchema,
  order: z.number().int().nonnegative(),
  name: localizedTextSchema,
  description: localizedTextSchema,
  /** Call-to-action label, e.g. "Ask about gel pens". */
  ask: localizedTextSchema,
  icon: shelfIconSchema,
  accent: accentSchema,
  image: imageSchema.optional(),
})

export type Category = z.infer<typeof categorySchema>
export type FeaturedItem = z.infer<typeof featuredItemSchema>
export type ShelfItem = z.infer<typeof shelfItemSchema>
export type ShelfIcon = z.infer<typeof shelfIconSchema>
export type Accent = z.infer<typeof accentSchema>
