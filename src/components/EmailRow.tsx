import { formatTimestamp } from '../lib/format'
import type { Email } from '../types'
import { Avatar } from './Avatar'
import { Icon } from './Icon'
import { PriorityBadge } from './PriorityBadge'

interface EmailRowProps {
  email: Email
  selected: boolean
  checked: boolean
  onSelect: (id: string) => void
  onCheck: (id: string, checked: boolean) => void
  onToggleRead: (id: string) => void
  onToggleArchive: (id: string) => void
}

export function EmailRow({ email, selected, checked, onSelect, onCheck, onToggleRead, onToggleArchive }: EmailRowProps) {
  const className = ['email-row', email.unread && 'is-unread', selected && 'is-selected', checked && 'is-checked']
    .filter(Boolean)
    .join(' ')
  const readLabel = email.unread ? 'Mark as read' : 'Mark as unread'
  const archiveLabel = email.archived ? 'Move to inbox' : 'Archive'

  return (
    <li className={className}>
      <label className="email-row__check">
        <input
          type="checkbox"
          className="checkbox"
          checked={checked}
          onChange={(event) => onCheck(email.id, event.target.checked)}
        />
        <span className="visually-hidden">Select: {email.subject}</span>
      </label>

      <button
        type="button"
        className="email-row__main"
        aria-current={selected ? 'true' : undefined}
        onClick={() => onSelect(email.id)}
      >
        <Avatar name={email.sender.name} />
        {email.unread && <span className="visually-hidden">Unread. </span>}
        <span className="email-row__sender">{email.sender.name}</span>
        <span className="email-row__content">
          <PriorityBadge priority={email.priority} />
          <span className="email-row__subject">{email.subject}</span>
          <span className="email-row__preview">
            <span className="email-row__sep" aria-hidden="true">
              {' – '}
            </span>
            {email.preview}
          </span>
        </span>
        <time className="email-row__time" dateTime={email.receivedAt.toISOString()}>
          {formatTimestamp(email.receivedAt)}
        </time>
      </button>

      <div className="email-row__actions">
        <button
          type="button"
          className="icon-button icon-button--sm"
          onClick={() => onToggleArchive(email.id)}
          aria-label={`${archiveLabel}: ${email.subject}`}
          title={archiveLabel}
        >
          <Icon name={email.archived ? 'inbox' : 'archive'} size={17} />
        </button>
        <button
          type="button"
          className="icon-button icon-button--sm"
          onClick={() => onToggleRead(email.id)}
          aria-label={`${readLabel}: ${email.subject}`}
          title={readLabel}
        >
          <Icon name={email.unread ? 'mailOpen' : 'mail'} size={17} />
        </button>
      </div>
    </li>
  )
}
