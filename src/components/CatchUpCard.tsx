import { useMemo } from 'react'
import { buildBriefing } from '../lib/briefing'
import { formatDue, formatLongDate, greeting, isDueSoon } from '../lib/format'
import type { Email } from '../types'
import { Icon } from './Icon'

interface CatchUpCardProps {
  emails: Email[]
  onOpenBriefing: () => void
  onOpenEmail: (id: string) => void
  onDismiss: () => void
}

const MAX_HIGHLIGHTS = 3

/** Daily catch-up banner shown at the top of the inbox, like a Gmail nudge. */
export function CatchUpCard({ emails, onOpenBriefing, onOpenEmail, onDismiss }: CatchUpCardProps) {
  const briefing = useMemo(() => buildBriefing(emails), [emails])

  // Urgent requests first, then the next deadlines — without repeating an email.
  const highlights = useMemo(() => {
    const seen = new Set<string>()
    return [...briefing.urgentRequests, ...briefing.deadlines]
      .filter((email) => !seen.has(email.id) && seen.add(email.id))
      .slice(0, MAX_HIGHLIGHTS)
  }, [briefing])

  return (
    <section className="catchup" aria-labelledby="catchup-title">
      <div className="catchup__header">
        <p className="catchup__eyebrow">
          <Icon name="sparkle" size={14} />
          Daily catch-up · {formatLongDate()}
        </p>
        <button type="button" className="icon-button icon-button--sm" onClick={onDismiss} aria-label="Hide catch-up for now">
          <Icon name="close" size={16} />
        </button>
      </div>

      <h2 id="catchup-title" className="catchup__title">
        {greeting()}
      </h2>
      <p className="catchup__intro">{briefing.intro}</p>

      <ul className="catchup__stats" aria-label="Today at a glance">
        <li className="status-chip status-chip--blue">
          <strong>{briefing.newEmails.length}</strong> new
        </li>
        <li className="status-chip status-chip--red">
          <strong>{briefing.urgentRequests.length}</strong> urgent
        </li>
        <li className="status-chip status-chip--yellow">
          <strong>{briefing.deadlines.length}</strong> upcoming {briefing.deadlines.length === 1 ? 'deadline' : 'deadlines'}
        </li>
      </ul>

      {highlights.length > 0 && (
        <ul className="catchup__list">
          {highlights.map((email) => {
            const soon = email.deadline && isDueSoon(email.deadline.due)
            return (
              <li key={email.id}>
                <button type="button" className="catchup__item" onClick={() => onOpenEmail(email.id)}>
                  <span className={`catchup__marker${email.priority === 'urgent' || soon ? ' is-urgent' : ''}`} aria-hidden="true" />
                  <span className="catchup__sender">{email.sender.name}</span>
                  <span className="catchup__task">
                    {email.actionItems.find((item) => !item.done)?.text ?? email.subject}
                  </span>
                  {email.deadline && (
                    <span className={`catchup__due${soon ? ' is-soon' : ''}`}>{formatDue(email.deadline.due)}</span>
                  )}
                </button>
              </li>
            )
          })}
        </ul>
      )}

      <div className="catchup__actions">
        <button type="button" className="button button--primary button--pill" onClick={onOpenBriefing}>
          <Icon name="sparkle" size={16} />
          Open full briefing
        </button>
      </div>
    </section>
  )
}
