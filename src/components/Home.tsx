import { formatLongDate, formatTimestamp, greeting, pluralize } from '../lib/format'
import type { Highlight, HighlightResult, ReasonKind } from '../lib/highlights'
import type { Email, ListView } from '../types'
import { Avatar } from './Avatar'
import { AiSpark } from './Brand'
import { Icon } from './Icon'
import type { IconName } from './Icon'

interface HomeProps {
  highlights: HighlightResult
  highlightsHidden: boolean
  onHideHighlights: () => void
  onShowHighlights: () => void
  todoEmails: Email[]
  todoIds: ReadonlySet<string>
  newCount: number
  otherNewCount: number
  inboxCount: number
  newsletterUnread: number
  promotionUnread: number
  unsubscribeSuggestions: number
  actionCount: number
  onOpen: (id: string) => void
  onReply: (id: string) => void
  onAddTodo: (id: string) => void
  onDone: (id: string) => void
  onDismiss: (id: string) => void
  onToggleTask: (emailId: string, taskId: string) => void
  onClearCompleted: () => void
  onBrowse: (view: ListView) => void
}

const REASON_ICONS: Record<ReasonKind, IconName> = {
  deadline: 'clock',
  question: 'chat',
  sender: 'star',
  personal: 'user',
}

export function Home({
  highlights,
  highlightsHidden,
  onHideHighlights,
  onShowHighlights,
  todoEmails,
  todoIds,
  newCount,
  otherNewCount,
  inboxCount,
  newsletterUnread,
  promotionUnread,
  unsubscribeSuggestions,
  actionCount,
  onOpen,
  onReply,
  onAddTodo,
  onDone,
  onDismiss,
  onToggleTask,
  onClearCompleted,
  onBrowse,
}: HomeProps) {
  const { attention, overflow } = highlights
  const todos = todoEmails.flatMap((email) => email.actionItems.map((item) => ({ email, item })))
  const doneCount = todos.filter(({ item }) => item.done).length

  return (
    <section className="mail-panel home" aria-labelledby="home-title">
      <div className="home__inner">
        <header className="home__header">
          <p className="home__eyebrow">{formatLongDate()}</p>
          <h1 id="home-title" className="home__title">
            {greeting()}
          </h1>
          <p className="home__summary">
            {highlightsHidden
              ? 'You’ve put today’s highlights away. Everything is still in your inbox.'
              : attention.length > 0
              ? `${attention.length === 1 ? 'One email needs' : `${attention.length} emails need`} you today. The rest can wait.`
              : 'Nothing needs you right now. Your inbox is in good shape.'}
          </p>
          <p className="home__counts">
            {pluralize(newCount, 'new email')}
            {todos.length > 0 && ` · ${pluralize(todos.length - doneCount, 'open to-do')}`}
          </p>
        </header>

        {highlightsHidden ? (
          <section className="home-card home-card--collapsed" aria-labelledby="attention-title">
            <h2 id="attention-title" className="home-card__title">
              <AiSpark size={18} />
              Needs your attention
            </h2>
            <span className="home-card__hint">Hidden for today</span>
            <button type="button" className="button button--tonal button--sm home-card__show" onClick={onShowHighlights}>
              Show highlights
            </button>
          </section>
        ) : (
          <section className="home-card home-card--ai" aria-labelledby="attention-title">
            <div className="home-card__header">
              <div>
                <h2 id="attention-title" className="home-card__title">
                  <AiSpark size={18} />
                  Needs your attention
                </h2>
                <p className="home-card__hint">Based on deadlines, questions and people you chose</p>
              </div>
              <button
                type="button"
                className="button button--sm home-card__hide"
                onClick={onHideHighlights}
                aria-label="Done for now: hide today’s highlights and go to the inbox"
                title="Hide for today and go to the inbox"
              >
                <Icon name="inbox" size={15} />
                Done for now
              </button>
            </div>

            {attention.length > 0 ? (
              <ul className="attention-list">
                {attention.map((highlight) => (
                  <AttentionItem
                    key={highlight.email.id}
                    highlight={highlight}
                    onTodo={todoIds.has(highlight.email.id)}
                    onOpen={onOpen}
                    onReply={onReply}
                    onAddTodo={onAddTodo}
                    onDone={onDone}
                    onDismiss={onDismiss}
                  />
                ))}
              </ul>
            ) : (
              <div className="home-empty">
                <span className="empty__icon">
                  <Icon name="check" size={20} />
                </span>
                <p className="empty__title">You’re all set</p>
                <p className="empty__text">Nothing time-sensitive is waiting on you. New highlights will appear here.</p>
              </div>
            )}

            {overflow > 0 && (
              <button type="button" className="home-card__more" onClick={() => onBrowse('action')}>
                {pluralize(overflow, 'more email')} with open to-dos
                <span aria-hidden="true">→</span>
              </button>
            )}
          </section>
        )}

        {todos.length > 0 && (
          <section className="home-card" aria-labelledby="todo-title">
            <div className="home-card__header">
              <h2 id="todo-title" className="home-card__title">
                <Icon name="check" size={16} />
                Your to-dos
              </h2>
              <span className="home-card__hint">
                {doneCount} of {todos.length} done
              </span>
            </div>
            <ul className="tasks home-todos">
              {todos.map(({ email, item }) => (
                <li key={item.id} className="task">
                  <label>
                    <input type="checkbox" checked={item.done} onChange={() => onToggleTask(email.id, item.id)} />
                    <span className="home-todos__text">
                      <span>{item.text}</span>
                      <span className="home-todos__from">{email.sender.name}</span>
                    </span>
                  </label>
                </li>
              ))}
            </ul>
            {doneCount > 0 && (
              <button type="button" className="button button--ghost button--sm home-card__action" onClick={onClearCompleted}>
                Clear completed
              </button>
            )}
          </section>
        )}

        <section className="home-card" aria-labelledby="else-title">
          <div className="home-card__header">
            <h2 id="else-title" className="home-card__title">
              <Icon name="inbox" size={16} />
              Everything else
            </h2>
            <span className="home-card__hint">No rush</span>
          </div>
          <ul className="browse-list">
            <BrowseRow
              icon="inbox"
              label="Inbox"
              meta={`${otherNewCount} other new · ${inboxCount} total`}
              onClick={() => onBrowse('inbox')}
            />
            <BrowseRow
              icon="flag"
              label="Action Needed"
              meta={pluralize(actionCount, 'email', 'emails') + ' with open to-dos'}
              onClick={() => onBrowse('action')}
            />
            <BrowseRow
              icon="newspaper"
              label="Newsletters"
              meta={newsletterUnread > 0 ? `${newsletterUnread} unread · read when you have time` : 'All read'}
              onClick={() => onBrowse('newsletters')}
            />
            <BrowseRow
              icon="tag"
              label="Promotions"
              meta={[
                promotionUnread > 0 ? `${promotionUnread} unread` : 'All read',
                unsubscribeSuggestions > 0 &&
                  `${unsubscribeSuggestions} you could unsubscribe from`,
              ]
                .filter(Boolean)
                .join(' · ')}
              onClick={() => onBrowse('promotions')}
            />
          </ul>
          <button type="button" className="button button--pill home__browse" onClick={() => onBrowse('inbox')}>
            <Icon name="inbox" size={17} />
            Browse inbox
          </button>
        </section>

        <p className="home__demo">
          <span className="demo-tag">Demo</span> Sample emails and mock AI — no real account is connected.
        </p>
      </div>
    </section>
  )
}

interface AttentionItemProps {
  highlight: Highlight
  onTodo: boolean
  onOpen: (id: string) => void
  onReply: (id: string) => void
  onAddTodo: (id: string) => void
  onDone: (id: string) => void
  onDismiss: (id: string) => void
}

function AttentionItem({ highlight, onTodo, onOpen, onReply, onAddTodo, onDone, onDismiss }: AttentionItemProps) {
  const { email, reasons, action } = highlight
  const hasTasks = email.actionItems.some((item) => !item.done)

  return (
    <li className={`attention${email.unread ? ' is-unread' : ''}`}>
      <Avatar name={email.sender.name} />
      <div className="attention__body">
        <p className="attention__meta">
          <span className="attention__sender">{email.sender.name}</span>
          <time dateTime={email.receivedAt.toISOString()}>{formatTimestamp(email.receivedAt)}</time>
        </p>
        <h3 className="attention__subject">
          <button type="button" onClick={() => onOpen(email.id)}>
            {email.subject}
          </button>
        </h3>
        <p className="attention__summary">{email.summary}</p>

        <ul className="reasons" aria-label="Why this is highlighted">
          {reasons.map((reason) => (
            <li key={reason.kind} className={`reason reason--${reason.kind}`}>
              <Icon name={REASON_ICONS[reason.kind]} size={13} />
              {reason.label}
            </li>
          ))}
        </ul>

        <div className="attention__actions">
          {action === 'reply' ? (
            <button type="button" className="button button--tonal button--sm" onClick={() => onReply(email.id)}>
              <Icon name="reply" size={15} />
              Reply
            </button>
          ) : (
            <button type="button" className="button button--tonal button--sm" onClick={() => onOpen(email.id)}>
              <Icon name="mailOpen" size={15} />
              Review
            </button>
          )}
          {hasTasks &&
            (onTodo ? (
              <span className="attention__note">
                <Icon name="check" size={14} />
                On your to-dos
              </span>
            ) : (
              <button type="button" className="button button--ghost button--sm" onClick={() => onAddTodo(email.id)}>
                <Icon name="listPlus" size={15} />
                Add to to-do
              </button>
            ))}
          <button type="button" className="button button--ghost button--sm" onClick={() => onDone(email.id)}>
            <Icon name="check" size={15} />
            Mark done
          </button>
        </div>
      </div>
      <button
        type="button"
        className="icon-button icon-button--sm attention__dismiss"
        onClick={() => onDismiss(email.id)}
        aria-label={`Not now: move “${email.subject}” back to the regular inbox`}
        title="Not now — keep it in the inbox without highlighting"
      >
        <Icon name="close" size={16} />
      </button>
    </li>
  )
}

function BrowseRow({ icon, label, meta, onClick }: { icon: IconName; label: string; meta: string; onClick: () => void }) {
  return (
    <li>
      <button type="button" className="browse-row" onClick={onClick}>
        <Icon name={icon} size={18} className="browse-row__icon" />
        <span className="browse-row__label">{label}</span>
        <span className="browse-row__meta">{meta}</span>
        <span className="browse-row__chevron" aria-hidden="true">
          ›
        </span>
      </button>
    </li>
  )
}
