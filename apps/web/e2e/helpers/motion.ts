import type { Page } from '@playwright/test'

/*
 * Helpers that bring a page to a still, fully revealed state. Pair them with
 * `test.use({ reducedMotion: 'reduce' })` (or `useReducedMotion`) so no element is mid-animation.
 */

/** Emulates `prefers-reduced-motion: reduce` for the page. Call before `page.goto`. */
export const useReducedMotion = (page: Page): Promise<void> =>
  page.emulateMedia({ reducedMotion: 'reduce' })

/**
 * Scrolls through the page one viewport at a time, waiting two frames per step so IntersectionObserver
 * callbacks (scroll reveals, the tab bar scroll-spy) run. Ends at the very bottom.
 */
export const scrollThrough = (page: Page): Promise<void> =>
  page.evaluate(async () => {
    const frames = () =>
      new Promise<void>((resolve) => {
        requestAnimationFrame(() => requestAnimationFrame(() => resolve()))
      })
    const step = Math.max(200, Math.floor(window.innerHeight * 0.75))
    for (let top = 0; top < document.documentElement.scrollHeight; top += step) {
      window.scrollTo({ top, behavior: 'instant' })
      await frames()
    }
    window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'instant' })
    await frames()
  })

export const scrollToTop = (page: Page): Promise<void> =>
  page.evaluate(async () => {
    window.scrollTo({ top: 0, behavior: 'instant' })
    await new Promise<void>((resolve) => {
      requestAnimationFrame(() => requestAnimationFrame(() => resolve()))
    })
  })

/** Reveals every scroll-triggered section, then returns to the top and waits for web fonts. */
export const revealAll = async (page: Page): Promise<void> => {
  await scrollThrough(page)
  await scrollToTop(page)
  await page.evaluate(async () => {
    await document.fonts.ready
  })
}

/** Names of animations and transitions that are still running (empty once the page is still). */
export const runningAnimations = (page: Page): Promise<string[]> =>
  page.evaluate(() =>
    document
      .getAnimations()
      .filter((animation) => animation.playState === 'running')
      .map((animation) => {
        const target =
          animation.effect instanceof KeyframeEffect && animation.effect.target
            ? animation.effect.target.localName +
              (animation.effect.target.id ? `#${animation.effect.target.id}` : '') +
              [...animation.effect.target.classList].map((name) => `.${name}`).join('')
            : '(unknown target)'
        if (animation instanceof CSSAnimation)
          return `animation ${animation.animationName} on ${target}`
        if (animation instanceof CSSTransition)
          return `transition ${animation.transitionProperty} on ${target}`
        return `animation ${animation.id || '(script)'} on ${target}`
      }),
  )
