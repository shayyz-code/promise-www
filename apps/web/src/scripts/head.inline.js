// Runs before first paint: flags JS support, then applies a saved language choice by moving to the
// matching hreflang alternate (keeping query and hash). Re-checked when restored from the bfcache.
;(() => {
  const root = document.documentElement
  root.classList.add('js')
  const apply = () => {
    let saved = null
    try {
      saved = localStorage.getItem('promise-lang')
    } catch {
      return // Storage blocked: keep the page's own language.
    }
    if ((saved !== 'en' && saved !== 'my') || saved === root.lang) return
    const alternate = document.querySelector(`link[rel="alternate"][hreflang="${saved}"]`)
    if (!(alternate instanceof HTMLLinkElement)) return
    const target = new URL(alternate.href)
    if (target.pathname === location.pathname) return
    location.replace(target.pathname + location.search + location.hash)
  }
  apply()
  addEventListener('pageshow', (event) => {
    if (event.persisted) apply()
  })
})()
