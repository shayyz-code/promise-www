# AGENTS.md

The operating contract for coding agents (and humans) working in this repository.

## Read before changing code

1. Read `README.md`, and `DESIGN.md` for any UI change.
2. Inspect the implementation and its tests; do not infer behaviour from file names.
3. Check `git status --short` and preserve unrelated changes.

In a new worktree, run `bun install` first.

The design artifact is private. With the `claude-artifacts` MCP, read `project/Main.dc.html` (Home, 81 KB) and
`project/Desk.dc.html` (Desk, 54 KB) from slug `a666a1e7-c06e-4180-ba23-7af5a6cecbb1`, in ranges rather than whole.
Without it, work from `DESIGN.md` and ask about anything it does not cover.

## Architecture

- `apps/web` (`@promise-www/web`): the public website. Astro 7, fully static, no UI framework. Deployed as an
  assets-only Cloudflare Worker (`wrangler.jsonc`), so no server code runs in production.
- `packages/content` (`@promise-www/content`): zod schemas and bilingual seed data (business details, range,
  featured items, shelf). The website reads it through Astro content collections (`src/content.config.ts`). The
  future admin panel (`apps/admin`) will manage this content; only the collection loaders should need to change.

Routing is bilingual with a different default per section:

| Page         | Myanmar       | English            |
| ------------ | ------------- | ------------------ |
| Home         | `/` (default) | `/en/`             |
| Promise Desk | `/my/desk/`   | `/desk/` (default) |

Build every internal URL with `localizedPath()` from `src/i18n/routes.ts`. Never hand-write paths.

## Commands

Use Bun for installs and scripts (`packageManager` is pinned). The Astro CLI and the Playwright runner execute on
Node 24.

- `bun install`: install dependencies and git hooks (lefthook).
- `bun run dev`: Astro dev server.
- `bun run build`: static build into `apps/web/dist`.
- `bun run preview`: serve the build with `wrangler dev` (real `_headers` and `_redirects`) on port 8787.
- `bun run check`: Biome, type checks (`astro check`, `tsc`) and unit tests (`bun test`). `bun run lint:fix` repairs
  formatting and import order.
- `bun run test:e2e`: Playwright against a fresh build served by `wrangler dev`.
- `bun run test:e2e:fast`: the same on the two Chromium projects only.
- `PLAYWRIGHT_BASE_URL=https://… bun run test:e2e:deployed`: smoke-test a deployed URL.
- `bun run lhci`: Lighthouse CI performance budgets.
- `bun run deploy:dry-run` / `bun run deploy`: validate or publish the Worker. Agents only use the dry run.

## Feedback loop

Run the cheapest check that can fail. Local timings:

1. `bun run check` (5 s): after every meaningful edit.
2. `bun run test:e2e:fast` (20 s): while iterating. Narrow it with `-- e2e/i18n.spec.ts` or `-- --last-failed`.
3. `bun run test:e2e` (40 s): before opening a pull request. Allow 5 minutes on a slow machine.

Each e2e run rebuilds and serves on a port derived from the checkout path, so worktrees can run in parallel and never
test each other's build. `E2E_PORT` overrides the port. `bun run preview` always uses 8787, so do not rely on it to
verify work in a worktree. For UI changes, the `verify-ui` skill in `.agents/skills` takes the screenshots.

## Change rules

- Implement UI against `DESIGN.md` and the design artifact. Keep the selector contract stable.
- Use kebab-case file names. Components live in `src/components/{ui,layout}` (shared) or `src/features/<page>/`
  (page-specific).
- Every user-facing string goes in `src/i18n/dictionaries/{en,my}/<namespace>.ts`. Myanmar copy is reviewed copy:
  keep the design's wording, and change it only intentionally. Keep sentence fragments (e.g. `h1c0` / `h1cU` /
  `h1c1`) where word order differs between languages.
- Never write or translate Myanmar copy yourself. If a string has no reviewed wording, stop and ask.
- Business facts (phones, handles, address, hours) come from `@promise-www/content`. Never hard-code them.
- Keep the CSP strict: no `style=""` attributes, no inline handlers, no third-party origins (see `DESIGN.md`).
- No `any`, unchecked casts, ignored errors or silent catches. Comment every intentional catch.
- Do not add a framework, service or dependency without a clear need and a note in the PR.
- Never commit secrets or `.env` files. Configuration goes through `astro:env` (see `apps/web/.env.example`).

## Git and completion

- Branches use `feat/`, `fix/`, `refactor/`, `docs/`, `test/`, `ci/` or `chore/`.
- Every commit follows Conventional Commits. The commit-msg hook and CI enforce it.
- Never push to `main` or skip git hooks. Open a pull request, using the `ship` skill in `.agents/skills`.
- Merge only with `gh pr merge --rebase`, and only after `gh pr checks` reports that every check passed. GitHub does
  not enforce this. Leave pull requests that change Myanmar copy or `packages/content/src/data` for the owner.
- Merging does not deploy: the deploy job waits for the owner to approve the `production` environment. Never approve
  a deployment, change environments, secrets or variables, or run `bun run deploy`.
- Before finishing: `bun run check`, `bun run build` and `bun run test:e2e` pass. UI changes are checked at 390 px
  and 1440 px in both languages.
