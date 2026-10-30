# Design system

The website implements the design artifact
[Promise Paper & Stationery Website](https://claude.ai/artifact/MYn7brXigESbFbTwSJeTEY). It has four boards: Home
(1440 px), Promise Desk (1440 px), and both pages on a phone (390 px). Treat the artifact as the source of truth for
copy, layout, sizes and motion. This document records the decisions you need to implement it consistently.

## Principles

- **Two voices, one brand.** Home ("Promise Paper & Stationery") is calm and editorial: ruled paper, navy and gold,
  underline sweeps. Promise Desk is playful: dotted paper, sticker cards with hard offset shadows, rounded Baloo 2
  display type, tilted chips.
- **Bilingual by design.** Every string exists in English and Myanmar (`my`). Myanmar copy is reviewed copy. Never
  machine-translate it or edit it casually.
- **Fast and accessible first.** No framework JS. Every interactive target is at least 44 px. Content is visible
  without JS. Motion respects `prefers-reduced-motion`.

## Tokens (`apps/web/src/styles/tokens.css`)

| Token                                                         | Value                                                     | Use                                                 |
| ------------------------------------------------------------- | --------------------------------------------------------- | --------------------------------------------------- |
| `--color-navy`                                                | `#1E3152`                                                 | Primary ink, dark surfaces, borders, offset shadows |
| `--color-navy-deep`                                           | `#172742`                                                 | Home footer                                         |
| `--color-navy-map`                                            | `#24395F`                                                 | Map card grid                                       |
| `--color-gold`                                                | `#D5A52E`                                                 | Accent, hand-drawn underlines, community band       |
| `--color-gold-ink`                                            | `#8A6414`                                                 | Step numbers and row numbers (AA on cream)          |
| `--color-cream`                                               | `#F7F0E1`                                                 | Page background, text on navy                       |
| `--color-paper`                                               | `#FBF7EE`                                                 | Ruled paper, range section, home tab bar            |
| `--color-card`                                                | `#FFFDF7`                                                 | Desk cards, the shelf, the seam badge               |
| `--color-ink-soft` / `--color-ink-muted` / `--color-ink-desk` | `#3A4865` / `#46546F` / `#33415E`                         | Body copy                                           |
| `--color-on-navy` / `--color-on-navy-muted`                   | `#E6DECD` / `#D9D1C0`                                     | Secondary text on navy                              |
| `--color-desk-yellow`                                         | `#FFD23F`                                                 | Promise Desk primary accent                         |
| `--color-pink` / `-blue` / `-yellow` / `-green` / `-orange`   | `#FFC2D1` / `#B5DDFF` / `#FFE08A` / `#C4E8B3` / `#FFC08F` | Desk tags, chips, photo placeholders                |
| `--color-photo-slate` / `-sand` / `-parchment`                | `#D8DEE8` / `#F2E2B4` / `#E9DFC8`                         | Home polaroid placeholders                          |
| `--color-telegram` / `--color-discord`                        | `#2481CC` / `#5865F2`                                     | Chat cards and buttons                              |

Easings: `--ease-out` (reveals), `--ease-in-out` (sweeps and draws), `--ease-pop` (Desk pops and tabs),
`--ease-soft` (Desk rise).

Layout: content max width `--page-max` (1200 px); side padding `--gutter` (`clamp(16px, 4vw, 48px)`).

## Typography

Fonts are self-hosted through the Astro Fonts API. Never link Google Fonts.

| Role                  | Family                                                       | Token             |
| --------------------- | ------------------------------------------------------------ | ----------------- |
| Body and Home display | Bricolage Grotesque (variable `wght` 400–800, `opsz` 12–96)  | `--font-sans`     |
| Promise Desk display  | Baloo 2 (500–800)                                            | `--font-display`  |
| Myanmar (all roles)   | Noto Sans Myanmar 400 / 700, then Bricolage for Latin glyphs | set automatically |
| Desk labels, receipt  | system monospace                                             | `--font-mono`     |

**Language islands.** Any element with `lang="en"` or `lang="my"` resets `--font-sans` and `--font-display` for its
subtree (see `global.css`). Components must use `var(--font-sans)` and `var(--font-display)`, never a family name.
That way Myanmar pages get Noto everywhere, and English words inside Myanmar copy (brand names, handles, phone
numbers) carry `lang="en"` and render in Bricolage.

**Myanmar overrides.** These come from the artifact; apply them under `:global(html[lang='my'])`:
- line-height 1.7 for body copy, 1.35–1.45 for headings;
- `text-transform: none` and `letter-spacing: normal`;
- display sizes about 15% smaller (see the `.pr-root[lang="my"]` and `[lang="my"] .pd-*` rules in the artifact);
- no fixed heights around Myanmar text.

Sizes are fluid `clamp()` values copied verbatim from the artifact (e.g. Home h1 `clamp(40px, 4.1vw, 56px)`, Desk h1
`clamp(52px, 7.4vw, 104px)`).

## Breakpoints

All are `max-width` queries, copied from the artifact:
- 419 px: hide the wordmark tagline;
- 767 px: phone layout, bottom tab bar, hide desktop nav;
- 1099 px: Desk hides header Telegram;
- 1119 px: Home hero stacks and hides the logo seam;
- 1199 px: Home nav wraps to its own row (from 768 px);
- 1279 px: Desk hides header Discord;
- 400 and 480 px: small Desk tweaks.

## Motion

- Home load: headline lines rise (`pr-rise`), the underline draws (`pr-draw`), the lead fades up, and Desk chips pop
  (`pd-pop`).
- Home scroll: CSS scroll-driven animations under `@supports (animation-timeline: view())` (`pr-up-view`,
  `pr-draw-view`, `pr-grow-view`). No JS.
- Desk load: `pd-rise` and `pd-pop`.
- Desk scroll reveal: sections with `data-reveal` get `.is-revealed` from an IntersectionObserver. Children animate
  with a staggered `pd-in`, with delays set by modifier classes. Content is hidden only when `html.js` is set.
- Hovers: underline sweeps (`background-size`), fill sweeps on buttons and rows, offset-shadow lifts on Desk buttons.
- `prefers-reduced-motion: reduce` disables all animation and transition globally.

## Components (`apps/web/src/components`)

| Component                      | Variants                             | Notes                                                                                               |
| ------------------------------ | ------------------------------------ | --------------------------------------------------------------------------------------------------- |
| `ui/logo-mark.astro`           | `default`, `inverse`, `mono`; `draw` | The crossing is masked with `--logo-cut`, which must equal the background behind it. Size with CSS. |
| `ui/icon.astro`                | `name` from `ui/icons.ts`            | 24-grid stroke icons in `currentColor`. Add new icons to `icons.ts`.                                |
| `layout/language-switch.astro` | `home` (pill), `desk` (boxed)        | Links, not buttons. Clicking one saves the choice.                                                  |
| `layout/tab-bar.astro`         | `home`, `desk`                       | Mobile only (below 768 px). Includes its spacer. Each tab lists the section ids it covers.          |
| `layout/skip-link.astro`       | `home`, `desk`                       | Targets `#main`.                                                                                    |
| `layout/seo-head.astro`        | —                                    | Title, description, canonical, hreflang, OG, robots.                                                |

Page-specific building blocks (buttons, rows, cards, polaroids, receipt) live in `src/features/<page>/`.

## CSP rules

The CSP is a hashed `<meta>` tag generated by Astro. To keep it strict:
- No `style=""` attributes and no `define:vars`. Express per-element variation (rotation `--r`, delay `--d`, colour)
  as modifier classes.
- No inline event handlers (`onclick=`) and no `is:inline` scripts. The only exception is `scripts/head.inline.js`,
  whose hash is computed in `astro.config.ts`.
- No third-party origins: fonts and images are self-hosted.

## Selector contract (used by Playwright)

Tests select by role and accessible name first. These ids and hooks are stable API: change them only together with
the tests.

- **Landmarks:** one `<header>`, `<main id="main">`, one `<footer>` per page. The desktop nav is
  `<nav aria-label={navMain}>`.
- **Home section ids**, in order: `top`, `chat`, `promise`, (the who-we-serve section, which has no id), `orders`, `range`,
  `desk`, `community`, `visit`.
- **Desk section ids**, in order: `top`, `shelf`, `how`, `community`, `visit`.
- **Hooks:**
  - `data-testid="lang-switch"` on the language switch group, with links `a[hreflang="en"]` and
    `a[hreflang="my"]`;
  - `data-testid="tab-bar"` on the mobile tab bar, whose active tab has `aria-current="location"`.
- **Cross-section links:** every link from Home to Desk, and back, carries `data-href-en` / `data-href-my`.

## Content

Business details, range categories, featured polaroids and shelf products come from `@promise-www/content`, via
`src/lib/content.ts`. Never hard-code a phone number, handle or address in a component. Build links with
`src/lib/contact.ts`.
