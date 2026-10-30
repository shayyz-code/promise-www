import { describe, expect, test } from 'bun:test'
import { allPages, alternates, localizedPath } from './routes'

describe('localizedPath', () => {
  test('home is Myanmar-first', () => {
    expect(localizedPath('home', 'my')).toBe('/')
    expect(localizedPath('home', 'en')).toBe('/en/')
  })

  test('Promise Desk is English-first', () => {
    expect(localizedPath('desk', 'en')).toBe('/desk/')
    expect(localizedPath('desk', 'my')).toBe('/my/desk/')
  })

  test('appends a hash target', () => {
    expect(localizedPath('home', 'en', 'orders')).toBe('/en/#orders')
  })
})

describe('alternates', () => {
  test('lists every language and an x-default pointing at the section default', () => {
    expect(alternates('home')).toEqual([
      { hreflang: 'my', path: '/' },
      { hreflang: 'en', path: '/en/' },
      { hreflang: 'x-default', path: '/' },
    ])
    expect(alternates('desk')).toEqual([
      { hreflang: 'my', path: '/my/desk/' },
      { hreflang: 'en', path: '/desk/' },
      { hreflang: 'x-default', path: '/desk/' },
    ])
  })
})

test('allPages lists the four pages once each', () => {
  const paths = allPages().map((page) => page.path)
  expect(paths.sort()).toEqual(['/', '/desk/', '/en/', '/my/desk/'])
})
