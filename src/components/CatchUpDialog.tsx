import { useEffect, useMemo, useRef } from 'react'
import type { ReactNode } from 'react'
import { buildBriefing } from '../lib/briefing'
import { formatDue, formatLongDate, formatTimestamp, isDueSoon } from '../lib/format'
import type { Email } from '../types'
import { Avatar } from './Avatar'
import { Icon } from './Icon'
import type { IconName } from './Icon'

interface CatchUpDialogProps {
  open: boolean
  emails: Email[]
  onClose: () => void
  onOpenEmail: (id: string) => void
  onMarkRead: (ids: string[]) => void
}

export function CatchUpDialog({ open, emails, onClose, onOpenEmail, onMarkRead }: CatchUpDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const briefing = useMemo(() => buildBriefing(emails), [emails])

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    if (open && !dialog.open) dialog.showModal()
    if (!open && dialog.open) dialog.close()
  }, [open])

  const unreadIds = briefing.newEmails.map((email) => email.id)

  return (
    <dialog
      ref={dialogRef}
      className="briefing"
      aria-labelledby="briefing-title"
      onClose={onClose}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
    >
      <div className="briefing__inner">
        <header className="briefing__header">
          <p className="briefing__eyebrow">
            <Icon name="sparkle" size={14} />
            Your briefing · {formatLongDate()}
          </p>
          <h2 id="briefing-title" className="briefing__title">
            Here’s what you missed
          </h2>
          <p className="briefing__intro">{briefing.intro}</p>
          <button type="button" className="icon-button briefing__close" onClick={onClose} aria-label="Close briefing">
            <Icon name="close" />
          </button>

          <dl className="briefing__stats">
            <Stat label="New emails" value={briefing.newEmails.length} accent="blue" />
            <Stat label="Urgent requests" value={briefing.urgentRequests.length} tone="urgent" accent="red" />
            <Stat label="Upcoming deadlines" value={briefing.deadlines.length} accent="yellow" />
          </dl>
        </header>

        <div className="briefing__body">
          <BriefingSection icon="alert" title="Urgent requests" tone="urgent" empty="No urgent requests. Nice.">
            {briefing.urgentRequests.map((email) => (
              <BriefingItem
                key={email.id}
                email={email}
                detail={email.actionItems.find((item) => !item.done)?.text ?? email.summary}
                aside={email.priority === 'urgent' ? 'Urgent' : 'Due soon'}
                asideTone="urgent"
                onOpen={onOpenEmail}
              />
            ))}
          </BriefingSection>

          <BriefingSection icon="calendar" title="Deadlines" empty="No upcoming deadlines.">
            {briefing.deadlines.map((email) =>
              email.deadline ? (
                <BriefingItem
                  key={email.id}
                  email={email}
                  detail={email.deadline.label}
                  aside={formatDue(email.deadline.due)}
                  asideTone={isDueSoon(email.deadline.due) ? 'urgent' : undefined}
                  onOpen={onOpenEmail}
                />
              ) : null,
            )}
          </BriefingSection>

          <BriefingSection icon="mail" title="New emails" empty="No new emails since you last checked.">
            {briefing.newEmails.map((email) => (
              <BriefingItem
                key={email.id}
                email={email}
                detail={email.subject}
                aside={formatTimestamp(email.receivedAt)}
                onOpen={onOpenEmail}
              />
            ))}
          </BriefingSection>
        </div>

        <footer className="briefing__footer">
          <button
            type="button"
            className="button"
            onClick={() => onMarkRead(unreadIds)}
            disabled={unreadIds.length === 0}
          >
            <Icon name="check" size={15} />
            Mark all as read
          </button>
          <button type="button" className="button button--primary" onClick={onClose}>
            Done
          </button>
        </footer>
      </div>
    </dialog>
  )
}

interface StatProps {
  label: string
  value: number
  tone?: 'urgent'
  accent: 'blue' | 'red' | 'yellow'
}

function Stat({ label, value, tone, accent }: StatProps) {
  return (
    <div className={`stat stat--${accent}${tone && value > 0 ? ` stat--${tone}` : ''}`}>
      <dt className="stat__label">{label}</dt>
      <dd className="stat__value">{value}</dd>
    </div>
  )
}

interface BriefingSectionProps {
  icon: IconName
  title: string
  empty: string
  tone?: 'urgent'
  children: ReactNode[]
}

function BriefingSection({ icon, title, empty, tone, children }: BriefingSectionProps) {
  const items = children.filter(Boolean)
  return (
    <section className="briefing__section">
      <h3 className={`section-title${tone ? ` section-title--${tone}` : ''}`}>
        <Icon name={icon} size={14} />
        {title}
      </h3>
      {items.length > 0 ? <ul className="brief-list">{items}</ul> : <p className="muted-note">{empty}</p>}
    </section>
  )
}

interface BriefingItemProps {
  email: Email
  detail: string
  aside: string
  asideTone?: 'urgent'
  onOpen: (id: string) => void
}

function BriefingItem({ email, detail, aside, asideTone, onOpen }: BriefingItemProps) {
  return (
    <li>
      <button type="button" className="brief-item" onClick={() => onOpen(email.id)}>
        <Avatar name={email.sender.name} size="sm" />
        <span className="brief-item__text">
          <span className="brief-item__title">{email.sender.name}</span>
          <span className="brief-item__detail">{detail}</span>
        </span>
        <span className={`brief-item__aside${asideTone ? ` is-${asideTone}` : ''}`}>{aside}</span>
      </button>
    </li>
  )
}
