import { getCollection, getEntry } from 'astro:content'
import type { Business, Category, FeaturedItem, ShelfItem } from '@promise-www/content'

const byOrder = (a: { order: number }, b: { order: number }) => a.order - b.order

export const getBusiness = async (): Promise<Business> => {
  const entry = await getEntry('business', 'promise')
  if (!entry) throw new Error('Business content is missing (collection "business", id "promise").')
  return entry.data
}

export const getCategories = async (): Promise<Category[]> =>
  (await getCollection('categories')).map((entry) => entry.data).sort(byOrder)

export const getFeaturedItems = async (): Promise<FeaturedItem[]> =>
  (await getCollection('featured')).map((entry) => entry.data).sort(byOrder)

export const getShelfItems = async (): Promise<ShelfItem[]> =>
  (await getCollection('shelf')).map((entry) => entry.data).sort(byOrder)
