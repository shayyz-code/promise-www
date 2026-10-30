---
name: verify-ui
description: Check a UI change at 390 px and 1440 px in Myanmar and English against DESIGN.md. Use after changing a page, section, component or style in apps/web, before opening a pull request.
context: fork
background: false
---

# Verify a UI change

Work in the current checkout. Report what you find and do not fix it: the caller decides what to change.

1. Find what changed with `git status --short` and `git diff --name-only origin/main...HEAD`. Changes under
   `src/features/home` affect Home, and `src/features/desk` affect Promise Desk. Changes under `src/components`,
   `src/layouts`, `src/styles` or `src/i18n` can affect all four pages.

2. Take the screenshots. This rebuilds the site and takes about 10 seconds:

   ```sh
   VISUAL=1 bun run test:e2e -- --project=desktop-chromium --grep @visual --update-snapshots
   ```

   Do not use `bun run preview`: its fixed port may be serving another worktree's build.

3. Read the slices for the affected pages from `apps/web/test-results/slices/`. They are named
   `<section>-<locale>-<width>-<part>.png`, top of the page first, for example `home-my-390-1.png`. Skip pages the
   change cannot reach. Do not read the full-page PNGs in `e2e/visual.spec.ts-snapshots/`: a phone page is about
   12,000 px tall, and image readers shrink it until nothing is legible. Both folders are gitignored.

4. Compare them with `DESIGN.md`, and with the design artifact if you can read it (`AGENTS.md` explains how):
   - layout at both widths: nothing overflows, clips or overlaps;
   - Myanmar pages: taller line height, smaller display sizes, no text cut off by a fixed height;
   - English words inside Myanmar copy render in the Latin font;
   - tokens, tab bar below 768 px, and interactive targets of at least 44 px.

   The mobile tab bar is fixed, so at 390 px it appears once, over the content near the bottom of the first viewport
   (about 800 px down the first slice). That comes from the full-page capture and is not an overlap bug.

5. Report each problem with its page, language and width, what you expected, and the file to change if you can tell.
   If there are none, say so and list what you checked. Do not paste image content into the report.
