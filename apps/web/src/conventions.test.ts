import { describe, expect, test } from 'bun:test'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { business } from '@promise-www/content'

/*
 * The rules from AGENTS.md and DESIGN.md that Biome and the compiler cannot see. They read the source, so a
 * violation fails `bun run check` in milliseconds. The e2e security spec still checks the built pages.
 */

const root = import.meta.dir

const sources = [...new Bun.Glob('**/*.{astro,ts,js,css}').scanSync(root)]
  .filter((path) => !path.endsWith('.test.ts'))
  .map((path) => ({ path, text: readFileSync(join(root, path), 'utf8') }))

const astroSources = sources.filter(({ path }) => path.endsWith('.astro'))

const offenders = (files: typeof sources, pattern: RegExp) =>
  files.filter(({ text }) => pattern.test(text)).map(({ path }) => path)

describe('.astro files', () => {
  const rules: { name: string; pattern: RegExp; allowed?: string[] }[] = [
    { name: 'have no style attributes', pattern: /\sstyle=/ },
    { name: 'do not use define:vars', pattern: /define:vars/ },
    { name: 'have no inline event handlers', pattern: /\son[a-z]+=/ },
    {
      name: 'use is:inline only for the head script',
      pattern: /is:inline/,
      allowed: ['layouts/base-layout.astro'],
    },
    {
      name: 'build internal URLs with localizedPath()',
      pattern: /\b(?:href|src|action)=(?:"|\{['"`])\/(?!favicon\.svg|apple-touch-icon\.png)/,
    },
    {
      name: 'take accessible text from the dictionaries',
      pattern: /\b(?:aria-label|alt|title)="[^"]/,
    },
  ]

  for (const { name, pattern, allowed = [] } of rules) {
    test(name, () => {
      expect(offenders(astroSources, pattern).filter((path) => !allowed.includes(path))).toEqual([])
    })
  }
})

test('Myanmar script lives in the Myanmar dictionaries', () => {
  const isAllowed = (path: string) =>
    path.startsWith('i18n/dictionaries/my/') || path === 'i18n/config.ts'
  expect(offenders(sources, /[က-႟]/).filter((path) => !isAllowed(path))).toEqual([])
})

test('business facts come from @promise-www/content', () => {
  const facts = [
    ...business.phones.map(({ number }) => number),
    business.telegram.shop,
    business.telegram.bot,
    business.discordInvite,
    business.email,
    business.domain,
    business.mapUrl,
    business.address.street,
    business.address.area,
  ]
  const found = facts.flatMap((fact) =>
    sources.filter(({ text }) => text.includes(fact)).map(({ path }) => `${path}: ${fact}`),
  )
  expect(found).toEqual([])
})
