import { describe, expect, test } from 'bun:test'
import type { z } from 'zod'
import { businessSchema } from '../schemas/business'
import { categorySchema, featuredItemSchema, shelfItemSchema } from '../schemas/catalog'
import { business } from './business'
import { categories } from './categories'
import { featuredItems } from './featured'
import { shelfItems } from './shelf'

const collections = [
  { name: 'categories', schema: categorySchema, entries: categories },
  { name: 'featuredItems', schema: featuredItemSchema, entries: featuredItems },
  { name: 'shelfItems', schema: shelfItemSchema, entries: shelfItems },
] satisfies { name: string; schema: z.ZodType; entries: { id: string; order: number }[] }[]

describe('business', () => {
  test('matches the schema', () => {
    expect(businessSchema.safeParse(business).success).toBe(true)
  })

  test('has a primary phone that is reachable on Viber', () => {
    expect(business.phones[0]?.viber).toBe(true)
  })
})

describe.each(collections)('$name', ({ schema, entries }) => {
  test('every entry matches the schema', () => {
    for (const entry of entries) {
      expect(schema.safeParse(entry).success).toBe(true)
    }
  })

  test('ids are unique', () => {
    const ids = entries.map((entry) => entry.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  test('order values are unique', () => {
    const orders = entries.map((entry) => entry.order)
    expect(new Set(orders).size).toBe(orders.length)
  })
})

test('schemas reject copy that is missing a language', () => {
  const [first] = categories
  const broken = { ...first, title: { en: 'Paper', my: ' ' } }
  expect(categorySchema.safeParse(broken).success).toBe(false)
})
