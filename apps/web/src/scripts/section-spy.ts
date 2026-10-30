/*
 * Highlights the mobile tab for the section being read. Each tab lists the section ids it covers in
 * `data-sections`; sections without a tab belong to the closest tab above them. A section counts as
 * "being read" once its top crosses 35% of the viewport height, as in the design.
 */

const ACTIVE = 'location'

const initTabBar = (nav: HTMLElement): void => {
  const tabs = [...nav.querySelectorAll<HTMLAnchorElement>('a[data-tab]')]
  const tabBySectionId = new Map<string, HTMLAnchorElement>()
  for (const tab of tabs) {
    for (const id of tab.dataset.sections?.split(' ').filter(Boolean) ?? [])
      tabBySectionId.set(id, tab)
  }

  const sections = [...document.querySelectorAll<HTMLElement>('main > section')]
  const tabForSection = new Map<Element, HTMLAnchorElement>()
  let owner = tabs[0]
  for (const section of sections) {
    owner = tabBySectionId.get(section.id) ?? owner
    if (owner) tabForSection.set(section, owner)
  }

  const bottomTab = tabs.find((tab) => tab.dataset.tab === nav.dataset.bottomTab)
  const visible = new Set<Element>()
  let atBottom = false

  const setActive = (active: HTMLAnchorElement | undefined): void => {
    if (!active) return
    for (const tab of tabs) {
      if (tab === active) tab.setAttribute('aria-current', ACTIVE)
      else tab.removeAttribute('aria-current')
    }
  }

  const update = (): void => {
    if (atBottom && bottomTab) {
      setActive(bottomTab)
      return
    }
    const last = sections.findLast((section) => visible.has(section))
    if (last) setActive(tabForSection.get(last))
  }

  const bandObserver = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) visible.add(entry.target)
        else visible.delete(entry.target)
      }
      update()
    },
    { rootMargin: '0px 0px -65% 0px' },
  )
  for (const section of sections) bandObserver.observe(section)

  if (bottomTab) {
    const sentinel = document.createElement('div')
    sentinel.setAttribute('aria-hidden', 'true')
    document.body.append(sentinel)
    new IntersectionObserver(([entry]) => {
      atBottom = entry?.isIntersecting ?? false
      update()
    }).observe(sentinel)
  }

  nav.addEventListener('click', (event) => {
    if (!(event.target instanceof Element)) return
    const tab = event.target.closest<HTMLAnchorElement>('a[data-tab]')
    if (tab?.dataset.sections) setActive(tab)
  })
}

for (const nav of document.querySelectorAll<HTMLElement>('[data-tab-bar]')) initTabBar(nav)
