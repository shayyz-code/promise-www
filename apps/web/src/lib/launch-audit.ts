/** The parts of a production build that decide whether search engines can index it. */
export interface BuiltSite {
  /** HTML of each page, by path. */
  pages: Record<string, string>
  robots: string
  sitemap: string
}

export interface LaunchRequirements {
  siteUrl: string
  /** The public domain, from the business content. */
  domain: string
  /** Text that must be gone before launch, such as photo placeholders. */
  placeholders: readonly string[]
}

/**
 * Everything that must be true before a build may be indexed. Every test runs with indexing off, so this is
 * what proves the production path works. Returns the problems found; an empty list means the build is ready.
 */
export const auditIndexableBuild = (
  site: BuiltSite,
  { siteUrl, domain, placeholders }: LaunchRequirements,
): string[] => {
  const origin = URL.canParse(siteUrl) ? new URL(siteUrl) : null
  if (origin?.protocol !== 'https:' || origin.hostname !== domain) {
    return [`SITE_URL must be https://${domain}, not ${JSON.stringify(siteUrl)}.`]
  }

  const problems: string[] = []

  for (const [path, html] of Object.entries(site.pages)) {
    if (/<meta\s[^>]*name="robots"[^>]*noindex/.test(html)) {
      problems.push(`${path} is marked noindex.`)
    }
    for (const placeholder of placeholders) {
      if (html.includes(placeholder)) problems.push(`${path} still shows ${placeholder}.`)
    }
  }

  if (!/^Allow:\s*\/\s*$/m.test(site.robots) || /^Disallow:\s*\/\s*$/m.test(site.robots)) {
    problems.push('robots.txt does not allow crawling.')
  }
  const sitemapUrl = new URL('/sitemap.xml', origin).href
  if (!site.robots.includes(`Sitemap: ${sitemapUrl}`)) {
    problems.push(`robots.txt does not point to ${sitemapUrl}.`)
  }

  const listed = [...site.sitemap.matchAll(/<loc>([^<]+)<\/loc>|href="([^"]+)"/g)].map(
    (match) => match[1] ?? match[2] ?? '',
  )
  for (const path of Object.keys(site.pages)) {
    const url = new URL(path, origin).href
    if (!listed.includes(url)) problems.push(`sitemap.xml does not list ${url}.`)
  }
  for (const url of listed) {
    if (!url.startsWith(origin.origin)) problems.push(`sitemap.xml lists another host: ${url}.`)
  }

  return problems
}
