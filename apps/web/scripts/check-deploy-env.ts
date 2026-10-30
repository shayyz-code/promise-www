/**
 * Guards `bun run deploy`. The build bakes SITE_URL into canonical, hreflang, sitemap and share-image URLs,
 * so a deployment built for localhost would break link previews. (CI builds with the `production`
 * environment's SITE_URL and runs `wrangler deploy` directly.)
 *
 *   SITE_URL=https://promise-www.<account>.workers.dev bun run deploy
 */
import { existsSync } from 'node:fs'

// Variables already set in the environment take precedence over `.env`.
if (existsSync('.env')) process.loadEnvFile('.env')

const localHosts = new Set(['localhost', '127.0.0.1', '[::1]'])
const value = process.env.SITE_URL

if (!value || !URL.canParse(value) || localHosts.has(new URL(value).hostname)) {
  console.error(
    `SITE_URL must be the public origin to deploy (got ${JSON.stringify(value ?? '')}).\n` +
      'e.g. SITE_URL=https://promise-www.<account>.workers.dev bun run deploy',
  )
  process.exit(1)
}

console.log(`Deploying for ${new URL(value).origin}`)
