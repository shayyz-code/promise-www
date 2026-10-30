import type { common } from './en/common'
import type { desk } from './en/desk'
import type { home } from './en/home'

/**
 * English is the reference shape. Typing the Myanmar dictionaries against it turns a missing or extra
 * key into a type error.
 */
type Shape<T> = { readonly [K in keyof T]: string }

export type CommonDictionary = Shape<typeof common>
export type HomeDictionary = Shape<typeof home>
export type DeskDictionary = Shape<typeof desk>
