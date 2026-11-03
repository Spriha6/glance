import type { Email } from '../types'
import { hasPendingActions, sortNewestFirst } from './filters'
import { formatDueInSentence, isDueSoon, pluralize } from './format'

export interface Briefing {
  intro: string
  newEmails: Email[]
  urgentRequests: Email[]
  deadlines: Email[]
}

const PRIORITY_RANK = { urgent: 0, important: 1, normal: 2 } as const

const dueTime = (email: Email) => email.deadline?.due.getTime() ?? Number.POSITIVE_INFINITY

/** Builds the "Catch me up" briefing from the current mock inbox state. */
export function buildBriefing(emails: Email[], now = new Date()): Briefing {
  const active = emails.filter((email) => !email.archived)

  const newEmails = sortNewestFirst(active.filter((email) => email.unread))

  // Urgent = flagged urgent, or anything still open that's due within ~36 hours.
  const urgentRequests = active
    .filter(
      (email) =>
        hasPendingActions(email) &&
        (email.priority === 'urgent' || (email.deadline !== undefined && isDueSoon(email.deadline.due, now))),
    )
    .sort((a, b) => PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority] || dueTime(a) - dueTime(b))

  const deadlines = active
    .filter((email) => email.deadline && email.deadline.due.getTime() > now.getTime() && hasPendingActions(email))
    .sort((a, b) => dueTime(a) - dueTime(b))

  return { intro: buildIntro(newEmails, urgentRequests, deadlines, now), newEmails, urgentRequests, deadlines }
}

function buildIntro(newEmails: Email[], urgent: Email[], deadlines: Email[], now: Date) {
  if (newEmails.length === 0 && urgent.length === 0 && deadlines.length === 0) {
    return 'You’re all caught up. Nothing new needs your attention.'
  }

  const sentences: string[] = []
  sentences.push(
    newEmails.length > 0
      ? `You have ${pluralize(newEmails.length, 'unread email')}.`
      : 'No new email since you last checked.',
  )
  if (urgent.length > 0) {
    const first = urgent[0]
    sentences.push(
      `${pluralize(urgent.length, 'request needs', 'requests need')} your attention — start with ${first.sender.name.split(' ')[0]}’s.`,
    )
  }
  const next = deadlines[0]?.deadline
  if (next) {
    sentences.push(`Next deadline: ${next.label}, ${formatDueInSentence(next.due, now)}.`)
  }
  return sentences.join(' ')
}
