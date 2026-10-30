/*
 * Scroll reveal for Promise Desk. Each `[data-reveal]` container gets `.is-revealed` once its top is above
 * 88% of the viewport height (or it is already scrolled past), and is then left alone. The CSS hides the
 * `.reveal` items only while `html.js` is set and the container is not revealed yet (see `desk.css`).
 */

const REVEALED = 'is-revealed'

const containers = [...document.querySelectorAll<HTMLElement>('[data-reveal]')]

if (typeof IntersectionObserver === 'undefined') {
  for (const container of containers) container.classList.add(REVEALED)
} else {
  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        // The root box is the viewport minus the bottom 12%: reveal once the top crosses its bottom edge,
        // which also covers containers above the viewport (e.g. after jumping to #visit).
        const line = entry.rootBounds?.bottom ?? window.innerHeight * 0.88
        if (!entry.isIntersecting && entry.boundingClientRect.top >= line) continue
        entry.target.classList.add(REVEALED)
        observer.unobserve(entry.target)
      }
    },
    { rootMargin: '0px 0px -12% 0px' },
  )
  for (const container of containers) observer.observe(container)
}
