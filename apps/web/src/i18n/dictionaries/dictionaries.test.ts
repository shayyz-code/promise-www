import { describe, expect, test } from 'bun:test'
import { dictionaries } from '../index'

const namespaces = ['common', 'home', 'desk'] as const

describe.each(namespaces)('%s dictionary', (namespace) => {
  const en: Record<string, string> = dictionaries.en[namespace]
  const my: Record<string, string> = dictionaries.my[namespace]

  test('Myanmar has exactly the English keys', () => {
    expect(Object.keys(my).sort()).toEqual(Object.keys(en).sort())
  })

  // Sentence fragments may be empty in one language (word order differs), never in both.
  test('every key has copy in at least one language', () => {
    const empty = Object.keys(en).filter((key) => !en[key]?.trim() && !my[key]?.trim())
    expect(empty).toEqual([])
  })
})
