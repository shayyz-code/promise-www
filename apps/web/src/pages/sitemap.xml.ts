import type { APIRoute } from 'astro'
import { allPages, alternates } from '../i18n/routes'

/** Sitemap with hreflang alternates. Built from `routes.ts` because each section has its own default language. */
export const GET: APIRoute = ({ site }) => {
  const absolute = (path: string) => new URL(path, site).href
  const urls = allPages()
    .map(({ section, path }) => {
      const links = alternates(section)
        .map(
          (alternate) =>
            `    <xhtml:link rel="alternate" hreflang="${alternate.hreflang}" href="${absolute(alternate.path)}"/>`,
        )
        .join('\n')
      return `  <url>\n    <loc>${absolute(path)}</loc>\n${links}\n  </url>`
    })
    .join('\n')

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urls}
</urlset>
`
  return new Response(xml, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } })
}
