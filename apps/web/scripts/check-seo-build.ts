/**
 * Guards a production build before it ships. With SITE_INDEXABLE=true it fails unless the build can be
 * indexed and is finished (see `src/lib/launch-audit.ts`). Run it after `astro build`, with the same settings.
 *
 *   SITE_URL=https://promisemm.com SITE_INDEXABLE=true bun run check:seo-build
 */
import { readFile } from 'node:fs/promises'
import { business } from '@promise-www/content'
import { locales } from '../src/i18n/config'
import { getDictionary } from '../src/i18n/index'
import { allPages } from '../src/i18n/routes'
import { auditIndexableBuild } from '../src/lib/launch-audit'

if (process.env.SITE_INDEXABLE !== 'true') {
  console.log(
    'Indexing is off: the build stays out of search results, so there is nothing to audit.',
  )
  process.exit(0)
}

const dist = new URL('../dist/', import.meta.url)
const read = (path: string) => readFile(new URL(path, dist), 'utf8')

const pages = await Promise.all(
  allPages().map(async ({ path }) => [path, await read(`.${path}index.html`)] as const),
)
const placeholders = locales.flatMap((locale) => [
  getDictionary(locale, 'home').photo,
  getDictionary(locale, 'desk').photo,
])

const problems = auditIndexableBuild(
  {
    pages: Object.fromEntries(pages),
    robots: await read('robots.txt'),
    sitemap: await read('sitemap.xml'),
  },
  {
    siteUrl: process.env.SITE_URL ?? '',
    domain: business.domain,
    placeholders: [...new Set(placeholders)],
  },
)

if (problems.length > 0) {
  console.error(`This build must not be indexed:\n${problems.map((p) => `- ${p}`).join('\n')}`)
  process.exit(1)
}

console.log(`The build for ${process.env.SITE_URL} is ready to be indexed.`)
