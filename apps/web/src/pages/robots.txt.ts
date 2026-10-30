import { SITE_INDEXABLE } from 'astro:env/server'
import type { APIRoute } from 'astro'

/** Blocks crawlers until the production domain is live (`SITE_INDEXABLE=true`). */
export const GET: APIRoute = ({ site }) => {
  const body = SITE_INDEXABLE
    ? `User-agent: *\nAllow: /\n\nSitemap: ${new URL('/sitemap.xml', site).href}\n`
    : 'User-agent: *\nDisallow: /\n'
  return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } })
}
