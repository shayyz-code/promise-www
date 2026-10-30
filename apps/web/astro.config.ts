import { createHash } from 'node:crypto'
import { existsSync, readFileSync } from 'node:fs'
import { defineConfig, envField, fontProviders } from 'astro/config'

// The Astro CLI runs on Node, which does not load `.env` into `process.env` for the config itself.
if (existsSync('.env')) process.loadEnvFile('.env')

const site = new URL(process.env.SITE_URL ?? 'http://localhost:8787').href

// The head bootstrap script must run before first paint, so it is a classic inline script. Astro does not
// hash `is:inline` scripts for the CSP, so the hash is computed here from the same source file.
const headScript = readFileSync(new URL('./src/scripts/head.inline.js', import.meta.url), 'utf8')
const headScriptHash = `sha256-${createHash('sha256').update(headScript).digest('base64')}` as const

export default defineConfig({
  site,
  trailingSlash: 'always',
  // `true` keeps the spaces between inline sentence fragments (the default `'jsx'` mode drops them).
  compressHTML: true,
  build: {
    format: 'directory',
    inlineStylesheets: 'always',
  },
  devToolbar: { enabled: false },
  env: {
    schema: {
      SITE_INDEXABLE: envField.boolean({ context: 'server', access: 'public', default: false }),
    },
  },
  fonts: [
    {
      provider: fontProviders.google(),
      name: 'Bricolage Grotesque',
      cssVariable: '--font-bricolage',
      weights: ['400 800'],
      styles: ['normal'],
      subsets: ['latin'],
      fallbacks: ['system-ui', 'sans-serif'],
      options: { experimental: { variableAxis: { opsz: [['12', '96']] } } },
    },
    {
      provider: fontProviders.google(),
      name: 'Baloo 2',
      cssVariable: '--font-baloo',
      weights: ['500 800'],
      styles: ['normal'],
      subsets: ['latin'],
      fallbacks: ['Arial Rounded MT Bold', 'system-ui', 'sans-serif'],
    },
    {
      // Static weights from Fontsource are ~40% smaller than Google's variable Myanmar file.
      provider: fontProviders.fontsource(),
      name: 'Noto Sans Myanmar',
      cssVariable: '--font-myanmar',
      weights: [400, 700],
      styles: ['normal'],
      subsets: ['myanmar'],
      fallbacks: ['sans-serif'],
    },
  ],
  security: {
    csp: {
      directives: [
        "default-src 'self'",
        "img-src 'self' data:",
        "font-src 'self'",
        "connect-src 'self'",
        "base-uri 'self'",
        "form-action 'none'",
        "object-src 'none'",
      ],
      scriptDirective: { hashes: [headScriptHash] },
    },
  },
})
