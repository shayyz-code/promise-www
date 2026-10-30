import type { Locale } from '../../i18n/config'
import type { IconName } from '../ui/icons'

export interface TabItem {
  id: string
  label: string
  href: string
  icon: IconName
  /** Section ids this tab highlights while they are on screen. Omit for links to another page. */
  sections?: string[]
  /** Desk variant: tab colour (default: card cream). */
  tone?: 'yellow' | 'cream' | 'navy'
  /** Home variant: the raised "Desk" sticker tab. */
  feature?: boolean
  /** Per-language targets for links to the other section (rewritten to the saved language). */
  hrefs?: Record<Locale, string>
}
