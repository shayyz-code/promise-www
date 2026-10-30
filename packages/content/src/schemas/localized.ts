import { z } from 'zod'

/** Copy that exists in every supported language. */
export const localizedTextSchema = z.object({
  en: z.string().trim().min(1),
  my: z.string().trim().min(1),
})

export type LocalizedText = z.infer<typeof localizedTextSchema>

/** Stable kebab-case identifier, used as a collection entry id. */
export const slugSchema = z
  .string()
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Expected a kebab-case slug')

/** Optional product photo, served from the site's own assets. */
export const imageSchema = z.object({
  src: z.string().min(1),
  alt: localizedTextSchema,
})

export type ContentImage = z.infer<typeof imageSchema>
