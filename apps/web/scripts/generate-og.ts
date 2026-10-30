/**
 * Renders the social share images (`public/og/<section>-<locale>.png`, 1200×630) and the Apple touch icon
 * with headless Chromium, so Myanmar text is shaped by a real browser. The layouts follow the `Og*` boards
 * in the design artifact. Copy comes from the dictionaries and the shelf, the domain and paths from the
 * content package and the routes. Fonts load from Google Fonts at generation time only; the committed PNGs
 * are self-hosted.
 *
 *   bun run og:generate
 */
import { mkdir } from 'node:fs/promises'
import { chromium } from '@playwright/test'
import { business, shelfItems } from '@promise-www/content'
import type { Locale } from '../src/i18n/config'
import { getDictionary, localize } from '../src/i18n/index'
import { localizedPath } from '../src/i18n/routes'

const outDir = new URL('../public/og/', import.meta.url)

const fonts =
  'https://fonts.googleapis.com/css2?family=Baloo+2:wght@600..800&family=Bricolage+Grotesque:opsz,wght@12..96,400..800&family=Noto+Sans+Myanmar:wght@400..800&display=block'

const logo = (primary: string, cut: string, width: number, height: number) => `
<svg viewBox="46 -16 152 208" width="${width}" height="${height}" aria-hidden="true"><g fill="none" stroke-width="20">
<path d="M64 176V72A40 40 0 1 1 89.02 109.09" stroke="${primary}" stroke-linecap="round"/>
<path d="M180 0V104A40 40 0 1 1 154.98 66.91" stroke="#D5A52E" stroke-linecap="round"/>
<path d="M114.29 73.36A40 40 0 0 1 154.98 66.91" stroke="${cut}" stroke-width="32"/>
<circle cx="154.98" cy="66.91" r="15" fill="${cut}"/>
<path d="M114.29 73.36A40 40 0 0 1 154.98 66.91" stroke="#D5A52E" stroke-linecap="round"/>
<path d="M129.71 102.64A40 40 0 0 1 89.02 109.09" stroke="${cut}" stroke-width="32"/>
<circle cx="89.02" cy="109.09" r="15" fill="${cut}"/>
<path d="M129.71 102.64A40 40 0 0 1 89.02 109.09" stroke="${primary}" stroke-linecap="round"/>
</g></svg>`

const escapeHtml = (text: string) =>
  text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

const page = (lang: Locale, body: string) => `<!doctype html>
<html lang="${lang}"><head><meta charset="utf-8"><link rel="stylesheet" href="${fonts}">
<style>
  html, body { margin: 0; width: 1200px; height: 630px; overflow: hidden; }
  body { color: #1E3152; font-family: 'Bricolage Grotesque', system-ui, sans-serif; }
  :lang(my) { font-family: 'Noto Sans Myanmar', 'Bricolage Grotesque', sans-serif; letter-spacing: normal; }
  [lang="en"] { font-family: 'Bricolage Grotesque', system-ui, sans-serif; }
  h1, p { margin: 0; }
  h1 span.line { display: block; }

  .home { display: flex; height: 630px; }
  .sheet { flex: 1 1 0; min-width: 0; box-sizing: border-box; padding: 56px 40px 52px 72px; display: flex;
    flex-direction: column; justify-content: space-between; background-color: #FBF7EE;
    background-image: repeating-linear-gradient(to bottom, transparent 0 41px, rgba(30,49,82,.13) 41px 42px); }
  .panel { position: relative; flex: 0 0 330px; display: flex; align-items: center; justify-content: center;
    background: #1E3152; color: #F7F0E1; }
  .panel span { position: absolute; left: 0; right: 0; bottom: 52px; text-align: center; font-size: 25px;
    font-weight: 700; line-height: 1.4; }
  .word { display: flex; flex-direction: column; gap: 9px; }
  .word b { font-size: 58px; font-weight: 800; line-height: .86; letter-spacing: -.04em; }
  .word small { font-size: 15px; font-weight: 600; letter-spacing: .2em; padding-left: 2px; }
  .home h1 { font-size: 84px; font-weight: 800; line-height: 1.02; letter-spacing: -.04em; }
  .home h1:lang(my) { font-size: 62px; font-weight: 700; line-height: 1.38; letter-spacing: normal; }
  .underlined { position: relative; display: inline-block; white-space: nowrap; }
  .underlined svg { position: absolute; left: 0; bottom: -.13em; width: 98%; height: .24em; overflow: visible; }
  .underlined svg:lang(my) { left: .08em; bottom: -.25em; width: 94%; }
  .slogan { display: flex; align-items: center; gap: 14px; font-size: 26px; font-weight: 700; line-height: 1.4; }
  .slogan i { color: #D5A52E; font-style: normal; }

  .desk { position: relative; box-sizing: border-box; height: 630px; padding: 52px 72px; display: flex;
    flex-direction: column; justify-content: space-between; background-color: #F7F0E1;
    background-image: radial-gradient(rgba(30,49,82,.16) 1.8px, transparent 2.2px); background-size: 28px 28px; }
  .display:lang(en) { font-family: 'Baloo 2', 'Arial Rounded MT Bold', system-ui, sans-serif; }
  .brand { display: flex; align-items: center; gap: 14px; }
  .brand b { font-size: 48px; font-weight: 800; line-height: 1; letter-spacing: -.01em; }
  .brand span { padding: 3px 13px 0; border: 3px solid #1E3152; border-radius: 13px; background: #FFD23F;
    box-shadow: 3px 3px 0 #1E3152; font-size: 26px; font-weight: 800; transform: rotate(-4deg); }
  .desk h1 { font-size: 104px; font-weight: 800; line-height: 1.02; letter-spacing: -.02em; }
  .desk h1 .line:last-child { margin-top: .08em; }
  .desk h1:lang(my) { font-size: 84px; font-weight: 700; line-height: 1.3; letter-spacing: normal; }
  .desk h1:lang(my) .line:last-child { margin-top: .3em; }
  .chip { display: inline-block; padding: .06em .2em 0; border: 4px solid #1E3152; border-radius: 22px; }
  .chip:lang(my) { padding: .02em .2em .06em; }
  .chip--gold { background: #FFD23F; color: #1E3152; box-shadow: 6px 6px 0 #1E3152; transform: rotate(-2deg); }
  .chip--navy { background: #1E3152; color: #F7F0E1; box-shadow: 6px 6px 0 #FFD23F; transform: rotate(1.5deg); }
  .foot { font-size: 24px; font-weight: 700; line-height: 1.4; }
  .url { position: absolute; right: 72px; bottom: 52px; z-index: 4; }
  .sticker { position: absolute; box-sizing: border-box; width: 214px; padding: 18px 20px; display: flex;
    flex-direction: column; gap: 8px; border: 3px solid #1E3152; border-radius: 20px; }
  .sticker svg { width: 84px; height: 84px; fill: none; stroke-width: 1.6; stroke-linecap: round; stroke-linejoin: round; }
  .sticker--pens { left: 726px; top: 84px; background: #1E3152; color: #F7F0E1; box-shadow: 7px 7px 0 #FFD23F;
    transform: rotate(-7deg); }
  .sticker--pens svg { stroke: #FFD23F; }
  .sticker--tape { left: 934px; top: 42px; background: #FFD23F; box-shadow: 7px 7px 0 #1E3152; transform: rotate(6deg); }
  .sticker--tape svg, .sticker--journals svg { stroke: #1E3152; }
  .sticker--journals { left: 834px; top: 296px; background: #FFFDF7; box-shadow: 7px 7px 0 #1E3152;
    transform: rotate(-2deg); }
  .sticker__num { font-size: 16px; font-weight: 600; line-height: 1.4; }
  .sticker__num:lang(en) { font-family: ui-monospace, 'SF Mono', 'Cascadia Code', Menlo, Consolas, monospace; }
  .sticker__name { font-size: 31px; font-weight: 800; line-height: 1; }
  .sticker__name:lang(my) { font-size: 25px; font-weight: 700; line-height: 1.4; }
</style></head><body>${body}</body></html>`

const homeCard = (lang: Locale) => {
  const t = getDictionary(lang, 'home')
  const underline = `<svg viewBox="0 0 100 12" preserveAspectRatio="none" aria-hidden="true"><path d="M1 8C22 3 48 10 70 6S92 3 99 5" fill="none" stroke="#D5A52E" stroke-width="5.5" stroke-linecap="round"/></svg>`
  const dot = '<i aria-hidden="true">•</i>'
  return page(
    lang,
    `<div class="home">
      <div class="sheet">
        <div class="word" lang="en"><b>Promise</b><small>PAPER &amp; STATIONERY</small></div>
        <h1>
          <span class="line">${escapeHtml(t.h1a)}</span>
          <span class="line">${escapeHtml(t.h1b)}</span>
          <span class="line">${escapeHtml(t.h1c0)}<span class="underlined">${escapeHtml(t.h1cU)}${underline}</span>${escapeHtml(t.h1c1)}</span>
        </h1>
        <p class="slogan"><span>${escapeHtml(t.sloganQ)}</span>${dot}<span>${escapeHtml(t.sloganP)}</span>${dot}<span>${escapeHtml(t.sloganS)}</span></p>
      </div>
      <div class="panel">${logo('#F7F0E1', '#1E3152', 196, 268)}<span lang="en">${escapeHtml(business.domain)}</span></div>
    </div>`,
  )
}

const stickerIcons = {
  pens: '<path d="M4 20l4-1 11-11-3-3L5 16z"/><path d="m14 7 3 3"/><path d="M4 20l1-4"/>',
  tape: '<circle cx="11" cy="12" r="8"/><circle cx="11" cy="12" r="3"/><path d="M11 20h10v-4"/>',
  journals:
    '<rect x="6" y="3" width="14" height="18" rx="2"/><path d="M10 8h6"/><path d="M10 12h6"/><path d="M3 7h3"/><path d="M3 12h3"/><path d="M3 17h3"/>',
} as const

/** Name of the shelf item at a 1-based position, as on the Promise Desk hero cards. */
const shelfName = (position: number, lang: Locale): string => {
  const item = shelfItems[position - 1]
  if (!item)
    throw new Error(`The share image needs shelf item ${position}, but the shelf is shorter.`)
  return localize(item.name, lang)
}

const deskCard = (lang: Locale) => {
  const t = getDictionary(lang, 'desk')
  const chip = (text: string, tone: 'gold' | 'navy') =>
    `<span class="chip chip--${tone}">${escapeHtml(text)}</span>`
  const deskChip = chip(t.h1Desk, 'gold')
  const youChip = chip(t.h1You, 'navy')
  // The headline is one sentence on the site. Here it breaks at the space inside `h1b`, on three lines in
  // English and two in Myanmar, to leave room for the stickers.
  const [beforeBreak = '', afterBreak = ''] = t.h1b.trim().split(' ')
  const lines =
    lang === 'en'
      ? [t.h1a.trim(), `${deskChip} ${beforeBreak}`, `${afterBreak} ${youChip}${t.h1c}`]
      : [`${t.h1a}${deskChip}${beforeBreak}`, `${afterBreak}${youChip}${t.h1c}`]
  const sticker = (id: keyof typeof stickerIcons, num: string, name: string) => `
    <div class="sticker sticker--${id}">
      <span class="sticker__num">${escapeHtml(t.num)} ${num}</span>
      <svg viewBox="0 0 24 24" aria-hidden="true">${stickerIcons[id]}</svg>
      <span class="sticker__name display">${escapeHtml(name)}</span>
    </div>`
  const tag = escapeHtml(t.heroTag).replace(
    escapeHtml(business.name),
    `<span lang="en">${escapeHtml(business.name)}</span>`,
  )
  const url = `${business.domain}${localizedPath('desk', lang).replace(/\/$/, '')}`
  return page(
    lang,
    `<div class="desk">
      <div class="brand display" lang="en">${logo('#1E3152', '#F7F0E1', 44, 60)}<b>Promise</b><span>desk</span></div>
      <h1 class="display">${lines.map((line) => `<span class="line">${line}</span>`).join('')}</h1>
      <p class="foot">${tag}</p>
      <span class="foot url" lang="en">${escapeHtml(url)}</span>
      ${sticker('pens', '01', shelfName(1, lang))}
      ${sticker('tape', '02', shelfName(3, lang))}
      ${sticker('journals', '03', t.heroJournals)}
    </div>`,
  )
}

const touchIcon = `<!doctype html><html><head><style>html,body{margin:0;width:180px;height:180px;background:#F7F0E1;display:flex;align-items:center;justify-content:center}</style></head>
<body>${logo('#1E3152', '#F7F0E1', 96, 132)}</body></html>`

const browser = await chromium.launch()
try {
  const context = await browser.newContext({
    viewport: { width: 1200, height: 630 },
    deviceScaleFactor: 1,
  })
  const tab = await context.newPage()
  await mkdir(outDir, { recursive: true })

  const cards: [string, string][] = [
    ['home-my', homeCard('my')],
    ['home-en', homeCard('en')],
    ['desk-en', deskCard('en')],
    ['desk-my', deskCard('my')],
  ]
  for (const [name, html] of cards) {
    await tab.setContent(html, { waitUntil: 'networkidle' })
    await tab.evaluate(() => document.fonts.ready)
    await tab.screenshot({ path: new URL(`${name}.png`, outDir).pathname })
    console.log(`og/${name}.png`)
  }

  await tab.setViewportSize({ width: 180, height: 180 })
  await tab.setContent(touchIcon)
  await tab.screenshot({
    path: new URL('../public/apple-touch-icon.png', import.meta.url).pathname,
  })
  console.log('apple-touch-icon.png')
} finally {
  await browser.close()
}
