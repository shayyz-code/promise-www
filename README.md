# promise-www

Website of **Promise Paper & Stationery**, a stationery shop in Magway, Myanmar. It covers two sections:

- **Home**: paper and office supplies for offices and schools.
- **Promise Desk**: stationery for students and creators.

Both are in Myanmar and English.

|         |                                                                                                 |
| ------- | ----------------------------------------------------------------------------------------------- |
| Stack   | Astro 7 (static), plain CSS, Cloudflare Workers static assets                                   |
| Tooling | Bun workspaces, Biome, TypeScript, Playwright, Lighthouse CI, lefthook + commitlint             |
| Design  | [Design artifact](https://claude.ai/artifact/MYn7brXigESbFbTwSJeTEY) · [`DESIGN.md`](DESIGN.md) |

## Getting started

Requirements: [Bun](https://bun.com) ≥ 1.3.14 and Node ≥ 22.23.

```sh
bun install                              # dependencies and git hooks
cp apps/web/.env.example apps/web/.env   # optional: local overrides
bun run dev                              # http://localhost:4321
```

## Scripts

| Command                 | What it does                                                      |
| ----------------------- | ----------------------------------------------------------------- |
| `bun run dev`           | Astro dev server                                                  |
| `bun run build`         | Static build into `apps/web/dist`                                 |
| `bun run preview`       | Serve the build with `wrangler dev` on http://localhost:8787      |
| `bun run check`         | Biome, type checks and unit tests                                 |
| `bun run test:e2e`      | Playwright end-to-end suite (installs: `bunx playwright install`) |
| `bun run test:e2e:fast` | The same suite on the two Chromium projects                       |
| `bun run lhci`          | Lighthouse CI performance budgets                                 |
| `bun run deploy`        | Build and deploy to Cloudflare (needs `SITE_URL`, see below)      |

## Structure

```
apps/web            Astro site (@promise-www/web)
  src/pages         Thin route files: / · /en/ · /desk/ · /my/desk/
  src/features      Page sections (home, desk)
  src/components    Shared UI and layout components
  src/i18n          Locales, localized routes, dictionaries
  src/lib           Content access, contact links, structured data
  e2e               Playwright specs
packages/content    Typed bilingual content shared with the future admin panel
```

## Environment

See [`apps/web/.env.example`](apps/web/.env.example).

| Variable         | Default                 | Purpose                                                                                 |
| ---------------- | ----------------------- | --------------------------------------------------------------------------------------- |
| `SITE_URL`       | `http://localhost:8787` | Public origin for canonical URLs, hreflang, the sitemap and share images                |
| `SITE_INDEXABLE` | `false`                 | Allow search engines to index the site. Set it to `true` only on the production domain. |

To deploy from your machine, run `bunx wrangler login` once, then
`SITE_URL=https://promise-www.<account>.workers.dev bun run deploy`. The script refuses a missing or
localhost `SITE_URL`, because the build bakes it into canonical and share-image URLs.

CI deploys need the `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` secrets, plus `SITE_URL` and
`SITE_INDEXABLE` variables, in the GitHub `production` environment. Keep them on the environment rather than the
repository: only jobs that pass its required review can read them. Every deploy from `main` waits for that approval.

## Contributing

Use Conventional Commits (`feat(home): …`, `fix(i18n): …`). Read [`AGENTS.md`](AGENTS.md) for the full contract.
