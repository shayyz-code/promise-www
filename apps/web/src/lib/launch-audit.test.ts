import { expect, test } from 'bun:test'
import { auditIndexableBuild, type BuiltSite } from './launch-audit'

const requirements = {
  siteUrl: 'https://promisemm.com',
  domain: 'promisemm.com',
  placeholders: ['[Product photo]', '[ပစ္စည်းဓာတ်ပုံ]'],
}

const readySite: BuiltSite = {
  pages: {
    '/': '<html><head><title>Home</title></head></html>',
    '/desk/': '<html><head><title>Desk</title></head></html>',
  },
  robots: 'User-agent: *\nAllow: /\n\nSitemap: https://promisemm.com/sitemap.xml\n',
  sitemap: `<urlset>
    <url><loc>https://promisemm.com/</loc><xhtml:link rel="alternate" hreflang="my" href="https://promisemm.com/"/></url>
    <url><loc>https://promisemm.com/desk/</loc></url>
  </urlset>`,
}

test('passes a build that is ready to be indexed', () => {
  expect(auditIndexableBuild(readySite, requirements)).toEqual([])
})

test.each([
  ['the workers.dev host', 'https://promise-www.example.workers.dev'],
  ['plain http', 'http://promisemm.com'],
  ['an empty value', ''],
])('refuses %s as SITE_URL', (_, siteUrl) => {
  const problems = auditIndexableBuild(readySite, { ...requirements, siteUrl })
  expect(problems).toEqual([
    `SITE_URL must be https://promisemm.com, not ${JSON.stringify(siteUrl)}.`,
  ])
})

test('accepts SITE_URL with a trailing slash', () => {
  const problems = auditIndexableBuild(readySite, {
    ...requirements,
    siteUrl: 'https://promisemm.com/',
  })
  expect(problems).toEqual([])
})

test('reports a page marked noindex', () => {
  const pages = { ...readySite.pages, '/desk/': '<meta name="robots" content="noindex, nofollow">' }
  expect(auditIndexableBuild({ ...readySite, pages }, requirements)).toEqual([
    '/desk/ is marked noindex.',
  ])
})

test('reports a placeholder in either language', () => {
  const pages = {
    '/': '<div class="photo">[ပစ္စည်းဓာတ်ပုံ]</div>',
    '/desk/': '<div class="photo">[Product photo]</div>',
  }
  expect(auditIndexableBuild({ ...readySite, pages }, requirements)).toEqual([
    '/ still shows [ပစ္စည်းဓာတ်ပုံ].',
    '/desk/ still shows [Product photo].',
  ])
})

test('reports a robots.txt that blocks crawlers', () => {
  const problems = auditIndexableBuild(
    { ...readySite, robots: 'User-agent: *\nDisallow: /\n' },
    requirements,
  )
  expect(problems).toEqual([
    'robots.txt does not allow crawling.',
    'robots.txt does not point to https://promisemm.com/sitemap.xml.',
  ])
})

test('reports a page missing from the sitemap', () => {
  const sitemap = '<url><loc>https://promisemm.com/</loc></url>'
  expect(auditIndexableBuild({ ...readySite, sitemap }, requirements)).toEqual([
    'sitemap.xml does not list https://promisemm.com/desk/.',
  ])
})

test('reports a sitemap built for another host', () => {
  const sitemap = `${readySite.sitemap}<url><loc>http://localhost:8787/</loc></url>`
  expect(auditIndexableBuild({ ...readySite, sitemap }, requirements)).toEqual([
    'sitemap.xml lists another host: http://localhost:8787/.',
  ])
})
