import type { Email, Sender } from '../types'

export interface Subscription {
  sender: Sender
  perWeek: number
  lastOpenedDaysAgo: number | null
  /** Promotional emails from this sender still in the mailbox (not archived). */
  activeCount: number
  unsubscribed: boolean
  /** Suggested for unsubscribing: never opened, or not opened in a month. */
  suggested: boolean
}

const STALE_DAYS = 30

/** One entry per promotional sender, suggested ones first, then the noisiest. */
export function buildSubscriptions(emails: Email[], unsubscribed: ReadonlySet<string>): Subscription[] {
  const bySender = new Map<string, Subscription>()

  for (const email of emails) {
    if (email.category !== 'promotion' || !email.promo) continue
    const existing = bySender.get(email.sender.email)
    if (existing) {
      if (!email.archived) existing.activeCount += 1
      continue
    }
    const { perWeek, lastOpenedDaysAgo } = email.promo
    bySender.set(email.sender.email, {
      sender: email.sender,
      perWeek,
      lastOpenedDaysAgo,
      activeCount: email.archived ? 0 : 1,
      unsubscribed: unsubscribed.has(email.sender.email),
      suggested: lastOpenedDaysAgo === null || lastOpenedDaysAgo >= STALE_DAYS,
    })
  }

  return [...bySender.values()].sort(
    (a, b) => Number(b.suggested) - Number(a.suggested) || b.perWeek - a.perWeek,
  )
}

/** "Never opened", "Opened this week", "Last opened 1 week ago", "Not opened in 6 weeks". */
export function describeLastOpened(days: number | null) {
  if (days === null) return 'Never opened'
  if (days < 7) return 'Opened this week'
  const weeks = Math.floor(days / 7)
  const unit = weeks === 1 ? 'week' : 'weeks'
  return days >= STALE_DAYS ? `Not opened in ${weeks} ${unit}` : `Last opened ${weeks} ${unit} ago`
}

export const describeFrequency = (perWeek: number) =>
  perWeek === 1 ? 'About 1 email a week' : `About ${perWeek} emails a week`
