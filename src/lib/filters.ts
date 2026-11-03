import type { IconName } from '../components/Icon'
import type { Email, ListView, Priority, PriorityFilter } from '../types'

export const VIEWS: { id: ListView; label: string; icon: IconName; emptyMessage: string }[] = [
  { id: 'inbox', label: 'Inbox', icon: 'inbox', emptyMessage: 'Your inbox is clear. Enjoy the quiet.' },
  { id: 'action', label: 'Action Needed', icon: 'flag', emptyMessage: 'Nothing is waiting on you right now.' },
  { id: 'newsletters', label: 'Newsletters', icon: 'newspaper', emptyMessage: 'No newsletters to read.' },
  { id: 'promotions', label: 'Promotions', icon: 'tag', emptyMessage: 'No promotions. Nice and quiet.' },
  { id: 'sent', label: 'Sent', icon: 'send', emptyMessage: 'Messages you send will show up here.' },
  { id: 'archive', label: 'Archive', icon: 'archive', emptyMessage: 'Archived emails will show up here.' },
]

export const PRIORITY_FILTERS: { id: PriorityFilter; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'urgent', label: 'Urgent' },
  { id: 'important', label: 'Important' },
  { id: 'normal', label: 'Normal' },
]

export const hasPendingActions = (email: Email) => email.actionItems.some((item) => !item.done)

export function matchesView(email: Email, view: ListView) {
  switch (view) {
    case 'inbox':
      return (
        !email.archived &&
        email.category !== 'newsletter' &&
        email.category !== 'promotion' &&
        email.category !== 'sent'
      )
    case 'action':
      return !email.archived && hasPendingActions(email)
    case 'newsletters':
      return !email.archived && email.category === 'newsletter'
    case 'promotions':
      return !email.archived && email.category === 'promotion'
    case 'sent':
      return !email.archived && email.category === 'sent'
    case 'archive':
      return email.archived
  }
}

export const matchesPriority = (email: Email, filter: PriorityFilter) => filter === 'all' || email.priority === filter

export function matchesQuery(email: Email, query: string) {
  const terms = query.trim().toLowerCase().split(/\s+/).filter(Boolean)
  if (terms.length === 0) return true
  const haystack = [email.sender.name, email.sender.email, email.to ?? '', email.subject, email.summary, ...email.body]
    .join(' ')
    .toLowerCase()
  return terms.every((term) => haystack.includes(term))
}

export const sortNewestFirst = (emails: Email[]) =>
  [...emails].sort((a, b) => b.receivedAt.getTime() - a.receivedAt.getTime())

export function countUnreadByView(emails: Email[]): Record<ListView, number> {
  const counts: Record<ListView, number> = { inbox: 0, action: 0, newsletters: 0, promotions: 0, sent: 0, archive: 0 }
  for (const email of emails) {
    if (!email.unread) continue
    for (const { id } of VIEWS) if (matchesView(email, id)) counts[id] += 1
  }
  return counts
}

export function countByPriority(emails: Email[]): Record<PriorityFilter, number> {
  const counts: Record<PriorityFilter, number> = { all: emails.length, urgent: 0, important: 0, normal: 0 }
  for (const email of emails) counts[email.priority satisfies Priority] += 1
  return counts
}
