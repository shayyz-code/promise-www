import { defineCollection } from 'astro:content'
import {
  business,
  businessSchema,
  categories,
  categorySchema,
  featuredItemSchema,
  featuredItems,
  shelfItemSchema,
  shelfItems,
} from '@promise-www/content'
import { z } from 'astro/zod'

/*
 * Content comes from @promise-www/content. To source it from the admin panel later, swap these inline
 * loaders for ones that fetch at build time; pages read collections and stay unchanged.
 */
export const collections = {
  business: defineCollection({
    loader: async () => [{ id: 'promise', ...business }],
    schema: businessSchema.extend({ id: z.string() }),
  }),
  categories: defineCollection({ loader: async () => categories, schema: categorySchema }),
  featured: defineCollection({ loader: async () => featuredItems, schema: featuredItemSchema }),
  shelf: defineCollection({ loader: async () => shelfItems, schema: shelfItemSchema }),
}
