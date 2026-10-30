/**
 * Renders the social share images (`public/og/<section>-<locale>.png`, 1200×630) and the Apple touch icon
 * with headless Chromium, so Myanmar text is shaped by a real browser. Copy comes from the dictionaries.
 * Fonts load from Google Fonts at generation time only; the committed PNGs are self-hosted.
 *
 *   bun run og:generate
 */
import { mkdir } from 'node:fs/promises'
import { chromium } from '@playwright/test'
import { desk as enDesk } from '../src/i18n/dictionaries/en/desk.ts'
import { home as enHome } from '../src/i18n/dictionaries/en/home.ts'
import { desk as myDesk } from '../src/i18n/dictionaries/my/desk.ts'
import { home as myHome } from '../src/i18n/dictionaries/my/home.ts'

type Locale = 'en' | 'my'

const outDir = new URL('../public/og/', import.meta.url)

const fonts =
  'https://fonts.googleapis.com/css2?family=Baloo+2:wght@700..800&family=Bricolage+Grotesque:opsz,wght@12..96,500..800&family=Noto+Sans+Myanmar:wght@500;700&display=block'

const logo = (cut: string) => `
<svg viewBox="46 -16 152 208" width="64" height="88" aria-hidden="true"><g fill="none" stroke-width="20">
<path d="M64 176V72A40 40 0 1 1 89.02 109.09" stroke="#1E3152" stroke-linecap="round"/>
<path d="M180 0V104A40 40 0 1 1 154.98 66.91" stroke="#D5A52E" stroke-linecap="round"/>
<path d="M114.29 73.36A40 40 0 0 1 154.98 66.91" stroke="${cut}" stroke-width="32"/>
<circle cx="154.98" cy="66.91" r="15" fill="${cut}"/>
<path d="M114.29 73.36A40 40 0 0 1 154.98 66.91" stroke="#D5A52E" stroke-linecap="round"/>
<path d="M129.71 102.64A40 40 0 0 1 89.02 109.09" stroke="${cut}" stroke-width="32"/>
<circle cx="89.02" cy="109.09" r="15" fill="${cut}"/>
<path d="M129.71 102.64A40 40 0 0 1 89.02 109.09" stroke="#1E3152" stroke-linecap="round"/>
</g></svg>`

const escapeHtml = (text: string) =>
  text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

const page = (lang: Locale, body: string, background: string) => `<!doctype html>
<html lang="${lang}"><head><meta charset="utf-8"><link rel="stylesheet" href="${fonts}">
<style>
  html, body { margin: 0; width: 1200px; height: 630px; }
  body { box-sizing: border-box; padding: 64px 72px; display: flex; flex-direction: column; justify-content: space-between;
    color: #1E3152; font-family: 'Bricolage Grotesque', sans-serif; ${background} }
  :lang(my) { font-family: 'Noto Sans Myanmar', 'Bricolage Grotesque', sans-serif; letter-spacing: normal; }
  [lang="en"] { font-family: 'Bricolage Grotesque', sans-serif; }
  .brand { display: flex; align-items: center; gap: 18px; }
  .word { display: flex; flex-direction: column; gap: 8px; }
  .word b { font-size: 52px; font-weight: 800; line-height: .86; letter-spacing: -.04em; }
  .word small { font-size: 14px; font-weight: 600; letter-spacing: .2em; }
  .foot { display: flex; justify-content: space-between; align-items: center; font-size: 24px; font-weight: 700; }
  .dot { color: #D5A52E; }
</style></head><body>${body}</body></html>`

const brand = (cut: string) =>
  `<div class="brand" lang="en">${logo(cut)}<span class="word"><b>Promise</b><small>PAPER &amp; STATIONERY</small></span></div>`

const homeCard = (lang: Locale) => {
  const t = lang === 'en' ? enHome : myHome
  const h1 =
    lang === 'en'
      ? 'font-size:68px;line-height:1.02;letter-spacing:-.04em'
      : 'font-size:52px;line-height:1.45'
  return page(
    lang,
    `${brand('#FBF7EE')}
     <h1 style="margin:0;font-weight:800;${h1}">${escapeHtml(t.h1a)}<br>${escapeHtml(t.h1b)}<br>${escapeHtml(t.h1c0)}<span style="box-shadow:inset 0 -0.16em 0 #D5A52E">${escapeHtml(t.h1cU)}</span>${escapeHtml(t.h1c1)}</h1>
     <div class="foot"><span>${escapeHtml(t.sloganQ)} <span class="dot">•</span> ${escapeHtml(t.sloganP)} <span class="dot">•</span> ${escapeHtml(t.sloganS)}</span><span lang="en">promisemm.com</span></div>`,
    'background-color:#FBF7EE;background-image:repeating-linear-gradient(to bottom,transparent 0 41px,rgba(30,49,82,.12) 41px 42px);',
  )
}

const deskCard = (lang: Locale) => {
  const t = lang === 'en' ? enDesk : myDesk
  const display =
    lang === 'en'
      ? "font-family:'Baloo 2',sans-serif;font-size:96px;line-height:1.02"
      : 'font-size:66px;line-height:1.5'
  const chip = (text: string, bg: string, fg: string, shadow: string, rotate: string) =>
    `<span style="display:inline-block;padding:.04em .2em 0;border:4px solid #1E3152;border-radius:22px;background:${bg};color:${fg};box-shadow:6px 6px 0 ${shadow};transform:rotate(${rotate})">${escapeHtml(text)}</span>`
  return page(
    lang,
    `<div class="brand" lang="en">${logo('#F7F0E1')}<span style="font-family:'Baloo 2',sans-serif;font-size:56px;font-weight:800">Promise</span><span style="font-family:'Baloo 2',sans-serif;font-size:30px;font-weight:800;padding:2px 14px 0;border:3px solid #1E3152;border-radius:14px;background:#FFD23F;box-shadow:3px 3px 0 #1E3152;transform:rotate(-4deg)">desk</span></div>
     <h1 style="margin:0;font-weight:800;${display}">${escapeHtml(t.h1a)}${chip(t.h1Desk, '#FFD23F', '#1E3152', '#1E3152', '-2deg')}${escapeHtml(t.h1b)}${chip(t.h1You, '#1E3152', '#F7F0E1', '#FFD23F', '1.5deg')}${escapeHtml(t.h1c)}</h1>
     <div class="foot"><span lang="en">By Promise Paper &amp; Stationery</span><span lang="en">promisemm.com/desk</span></div>`,
    'background-color:#F7F0E1;background-image:radial-gradient(rgba(30,49,82,.16) 2px,transparent 2.4px);background-size:30px 30px;',
  )
}

const touchIcon = `<!doctype html><html><head><style>html,body{margin:0;width:180px;height:180px;background:#F7F0E1;display:flex;align-items:center;justify-content:center}</style></head>
<body>${logo('#F7F0E1').replace('width="64" height="88"', 'width="96" height="132"')}</body></html>`

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
