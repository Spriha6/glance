import { useEffect, useRef } from 'react'
import type { ReactNode } from 'react'
import type { Email } from '../types'
import { EmailRow } from './EmailRow'
import { Icon } from './Icon'

interface EmailListProps {
  title: string
  emails: Email[]
  selectedId: string | null
  checkedIds: ReadonlySet<string>
  query: string
  emptyMessage: string
  isFiltered: boolean
  inArchive: boolean
  tabs?: ReactNode
  onSelect: (id: string) => void
  onCheck: (id: string, checked: boolean) => void
  onCheckAll: (checked: boolean) => void
  onToggleRead: (id: string) => void
  onToggleArchive: (id: string) => void
  onSetUnread: (ids: string[], unread: boolean) => void
  onSetArchived: (ids: string[], archived: boolean) => void
  onResetFilters: () => void
}

export function EmailList({
  title,
  emails,
  selectedId,
  checkedIds,
  query,
  emptyMessage,
  isFiltered,
  inArchive,
  tabs,
  onSelect,
  onCheck,
  onCheckAll,
  onToggleRead,
  onToggleArchive,
  onSetUnread,
  onSetArchived,
  onResetFilters,
}: EmailListProps) {
  const selectAllRef = useRef<HTMLInputElement>(null)
  const unreadIds = emails.filter((email) => email.unread).map((email) => email.id)
  const checked = emails.filter((email) => checkedIds.has(email.id)).map((email) => email.id)
  const allChecked = emails.length > 0 && checked.length === emails.length
  const someChecked = checked.length > 0 && !allChecked

  useEffect(() => {
    if (selectAllRef.current) selectAllRef.current.indeterminate = someChecked
  }, [someChecked])

  return (
    <section className="mail-panel" aria-labelledby="list-title">
      <h2 id="list-title" className="visually-hidden">
        {title}
      </h2>

      <div className="list-toolbar">
        <label className="list-toolbar__check" title={allChecked ? 'Deselect all' : 'Select all'}>
          <input
            ref={selectAllRef}
            type="checkbox"
            className="checkbox"
            checked={allChecked}
            disabled={emails.length === 0}
            onChange={(event) => onCheckAll(event.target.checked)}
          />
          <span className="visually-hidden">Select all emails</span>
        </label>

        {checked.length > 0 ? (
          <div className="list-toolbar__actions" role="group" aria-label="Bulk actions">
            <span className="list-toolbar__selected">{checked.length} selected</span>
            <button type="button" className="button button--ghost button--sm" onClick={() => onSetArchived(checked, !inArchive)}>
              <Icon name={inArchive ? 'inbox' : 'archive'} size={16} />
              {inArchive ? 'Move to inbox' : 'Archive'}
            </button>
            <button type="button" className="button button--ghost button--sm" onClick={() => onSetUnread(checked, false)}>
              <Icon name="mailOpen" size={16} />
              Mark as read
            </button>
            <button type="button" className="button button--ghost button--sm" onClick={() => onSetUnread(checked, true)}>
              <Icon name="mail" size={16} />
              Mark as unread
            </button>
          </div>
        ) : (
          <div className="list-toolbar__actions">
            <button
              type="button"
              className="button button--ghost button--sm"
              onClick={() => onSetUnread(unreadIds, false)}
              disabled={unreadIds.length === 0}
            >
              <Icon name="check" size={16} />
              Mark all as read
            </button>
          </div>
        )}

        <span className="list-toolbar__range">
          {emails.length > 0 ? `1–${emails.length} of ${emails.length}` : '0'}
          {unreadIds.length > 0 && <span className="list-toolbar__unread"> · {unreadIds.length} unread</span>}
        </span>
      </div>

      {tabs}

      {emails.length > 0 ? (
        <ul className="email-list">
          {emails.map((email) => (
            <EmailRow
              key={email.id}
              email={email}
              selected={email.id === selectedId}
              checked={checkedIds.has(email.id)}
              onSelect={onSelect}
              onCheck={onCheck}
              onToggleRead={onToggleRead}
              onToggleArchive={onToggleArchive}
            />
          ))}
        </ul>
      ) : (
        <div className="empty" role="status">
          <span className="empty__icon">
            <Icon name={isFiltered ? 'search' : 'check'} size={20} />
          </span>
          <p className="empty__title">{isFiltered ? 'No matching emails' : 'All caught up'}</p>
          <p className="empty__text">
            {isFiltered
              ? query.trim()
                ? `Nothing here matches “${query.trim()}”.`
                : 'No emails match this priority filter.'
              : emptyMessage}
          </p>
          {isFiltered && (
            <button type="button" className="button button--sm" onClick={onResetFilters}>
              Clear search and filters
            </button>
          )}
        </div>
      )}
    </section>
  )
}
