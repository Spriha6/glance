import { useEffect, useRef } from 'react'
import { formatDue, formatFullDate, isDueSoon } from '../lib/format'
import type { Highlight } from '../lib/highlights'
import type { Email, ReplyDraft } from '../types'
import { AskEmail } from './AskEmail'
import { Avatar } from './Avatar'
import { AiSpark } from './Brand'
import { Icon } from './Icon'
import { PriorityBadge } from './PriorityBadge'
import { ReplyDraftEditor } from './ReplyDraftEditor'

interface EmailDetailProps {
  email: Email | null
  isDrawer: boolean
  onClose: () => void
  onToggleRead: (id: string) => void
  onToggleArchive: (id: string) => void
  onToggleTask: (emailId: string, taskId: string) => void
  highlight?: Highlight
  onTodo: boolean
  draft: ReplyDraft | undefined
  focusReply: boolean
  onAddTodo: (id: string) => void
  onDismissHighlight: (id: string) => void
  onDraftChange: (id: string, draft: ReplyDraft) => void
}

export function EmailDetail({
  email,
  isDrawer,
  onClose,
  onToggleRead,
  onToggleArchive,
  onToggleTask,
  highlight,
  onTodo,
  draft,
  focusReply,
  onAddTodo,
  onDismissHighlight,
  onDraftChange,
}: EmailDetailProps) {
  const headingRef = useRef<HTMLHeadingElement>(null)
  const emailId = email?.id

  // In drawer mode, move focus into the panel when an email opens.
  useEffect(() => {
    if (isDrawer && emailId && !focusReply) headingRef.current?.focus()
  }, [isDrawer, emailId, focusReply])

  const hasOpenTasks = email?.actionItems.some((item) => !item.done) ?? false

  return (
    <aside className={`detail${email ? ' is-open' : ''}`} aria-label="Email details">
      {email ? (
        <>
          <div className="detail__toolbar">
            {isDrawer && (
              <button type="button" className="icon-button" onClick={onClose} aria-label="Close email">
                <Icon name="arrowLeft" />
              </button>
            )}
            <span className="detail__toolbar-spacer" />
            <button type="button" className="button button--ghost button--sm" onClick={() => onToggleRead(email.id)}>
              <Icon name={email.unread ? 'mailOpen' : 'mail'} size={15} />
              {email.unread ? 'Mark as read' : 'Mark as unread'}
            </button>
            <button type="button" className="button button--ghost button--sm" onClick={() => onToggleArchive(email.id)}>
              <Icon name={email.archived ? 'inbox' : 'archive'} size={15} />
              {email.archived ? 'Move to inbox' : 'Archive'}
            </button>
          </div>

          <div className="detail__scroll">
            <header className="detail__header">
              <div className="detail__badges">
                <PriorityBadge priority={email.priority} />
                {email.unread && <span className="badge badge--unread">Unread</span>}
                {email.archived && <span className="badge">Archived</span>}
              </div>
              <h2 ref={headingRef} tabIndex={-1} className="detail__subject">
                {email.subject}
              </h2>
              <div className="sender">
                <Avatar name={email.sender.name} size="lg" />
                <div className="sender__text">
                  <p className="sender__name">
                    {email.sender.name}
                    {email.sender.organization && <span className="sender__org"> · {email.sender.organization}</span>}
                  </p>
                  <p className="sender__email">{email.sender.email}</p>
                </div>
                <time className="sender__date" dateTime={email.receivedAt.toISOString()}>
                  {formatFullDate(email.receivedAt)}
                </time>
              </div>
            </header>

            {highlight && (
              <p className="why-note">
                <AiSpark size={14} />
                <span>
                  <strong>Highlighted:</strong> {highlight.reasons.map((reason) => reason.label).join(' · ')}
                </span>
                <button type="button" className="why-note__dismiss" onClick={() => onDismissHighlight(email.id)}>
                  Not now
                </button>
              </p>
            )}

            <section className="summary" aria-labelledby="summary-title">
              <h3 id="summary-title" className="section-title section-title--accent">
                <AiSpark size={14} />
                Summary
                <span className="summary__tag">AI · demo</span>
              </h3>
              <p className="summary__text">{email.summary}</p>
              {email.deadline && (
                <p className={`deadline-chip${isDueSoon(email.deadline.due) ? ' is-soon' : ''}`}>
                  <Icon name="clock" size={14} />
                  <span>
                    {email.deadline.label} · <strong>{formatDue(email.deadline.due)}</strong>
                  </span>
                </p>
              )}
            </section>

            <section aria-labelledby="tasks-title">
              <h3 id="tasks-title" className="section-title">
                Suggested next steps
                {email.actionItems.length > 0 && (
                  <span className="section-title__meta">
                    {email.actionItems.filter((item) => item.done).length}/{email.actionItems.length} done
                  </span>
                )}
              </h3>
              {email.actionItems.length > 0 ? (
                <ul className="tasks">
                  {email.actionItems.map((item) => (
                    <li key={item.id} className="task">
                      <label>
                        <input type="checkbox" checked={item.done} onChange={() => onToggleTask(email.id, item.id)} />
                        <span>{item.text}</span>
                      </label>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="muted-note">Nothing to do — this one is just for your information.</p>
              )}
              {hasOpenTasks &&
                (onTodo ? (
                  <p className="todo-note">
                    <Icon name="check" size={14} />
                    On your to-do list
                  </p>
                ) : (
                  <button type="button" className="button button--sm tasks__add" onClick={() => onAddTodo(email.id)}>
                    <Icon name="listPlus" size={15} />
                    Add to to-do
                  </button>
                ))}
            </section>

            {email.suggestedReply && (
              <ReplyDraftEditor
                key={`reply-${email.id}`}
                email={{ ...email, suggestedReply: email.suggestedReply }}
                draft={draft}
                autoFocus={focusReply}
                onChange={(next) => onDraftChange(email.id, next)}
              />
            )}

            <AskEmail key={email.id} email={email} />

            <section aria-labelledby="message-title">
              <h3 id="message-title" className="section-title">
                Original message
              </h3>
              <div className="message">
                {email.body.map((paragraph, index) => (
                  <p key={index}>{paragraph}</p>
                ))}
              </div>
            </section>
          </div>
        </>
      ) : (
        <div className="detail__empty">
          <span className="empty__icon">
            <Icon name="mail" size={20} />
          </span>
          <p className="empty__title">No email selected</p>
          <p className="empty__text">Choose an email to see its summary, action items, and more.</p>
        </div>
      )}
    </aside>
  )
}
