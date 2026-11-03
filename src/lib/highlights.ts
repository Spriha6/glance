import type { Email, FocusArea, Preferences } from '../types'
import { hasPendingActions } from './filters'
import { formatDue } from './format'

export type ReasonKind = 'deadline' | 'question' | 'sender' | 'personal'

export interface HighlightReason {
  kind: ReasonKind
  label: string
}

export interface Highlight {
  email: Email
  reasons: HighlightReason[]
  /** The single clearest next step for this email. */
  action: 'reply' | 'review'
}

export interface HighlightResult {
  /** The few emails shown under "Needs your attention". */
  attention: Highlight[]
  /** Other emails that also qualified but were left out to keep the list short. */
  overflow: number
}

export const MAX_HIGHLIGHTS = 3

const DAY_MS = 86_400_000
const THRESHOLD = 3

/**
 * Mock prioritisation. Scores each open email by a few explainable signals,
 * weighted by what the user said matters to them in onboarding.
 */
export function buildHighlights(
  emails: Email[],
  preferences: Preferences,
  dismissedIds: ReadonlySet<string>,
  now = new Date(),
): HighlightResult {
  const focus = new Set<FocusArea>(preferences.focus)
  const important = new Set(preferences.importantSenders)

  const scored = emails
    .filter((email) => !email.archived && email.category !== 'newsletter' && !dismissedIds.has(email.id))
    .filter((email) => hasPendingActions(email) || (important.has(email.sender.email) && email.unread))
    .map((email) => {
      const reasons: HighlightReason[] = []
      let score = 0

      const due = email.deadline?.due
      const remaining = due ? due.getTime() - now.getTime() : Number.POSITIVE_INFINITY
      if (due && remaining > 0 && remaining < 3 * DAY_MS) {
        score += 2 + (remaining < 1.5 * DAY_MS ? 1 : 0) + (focus.has('deadlines') ? 2 : 0)
        reasons.push({ kind: 'deadline', label: `Due ${relativeDue(formatDue(due, now))}` })
      }

      if (important.has(email.sender.email)) {
        score += focus.has('people') ? 4 : 3
        reasons.push({ kind: 'sender', label: 'Important sender' })
      }

      if (email.asksYou) {
        score += 2
        reasons.push({ kind: 'question', label: 'Asks you a question' })
      }

      if (email.category === 'work' && focus.has('work')) score += 1
      if (email.category === 'personal' && focus.has('personal')) {
        score += 2
        reasons.push({ kind: 'personal', label: 'Personal' })
      }

      if (email.priority === 'urgent') score += 1
      if (email.unread) score += 0.5

      return { email, reasons, score }
    })
    .filter((item) => item.score >= THRESHOLD && item.reasons.length > 0)
    .sort((a, b) => b.score - a.score || b.email.receivedAt.getTime() - a.email.receivedAt.getTime())

  const attention = scored.slice(0, MAX_HIGHLIGHTS).map(({ email, reasons }) => ({
    email,
    reasons: reasons.slice(0, 2),
    action: email.suggestedReply ? ('reply' as const) : ('review' as const),
  }))

  return { attention, overflow: scored.length - attention.length }
}

/** Reasons for a single email, for the "Why this is highlighted" note in the detail panel. */
export function highlightFor(result: HighlightResult, id: string) {
  return result.attention.find((item) => item.email.id === id)
}

// "Tomorrow, 5:00 PM" → "tomorrow, 5:00 PM"; weekday and date labels stay capitalised.
const relativeDue = (label: string) => label.replace(/^(Today|Tomorrow)/, (word) => word.toLowerCase())
