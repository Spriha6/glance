import { useState } from 'react'
import { pluralize } from '../lib/format'
import { describeFrequency, describeLastOpened } from '../lib/promotions'
import type { Subscription } from '../lib/promotions'
import { Avatar } from './Avatar'
import { AiSpark } from './Brand'
import { Icon } from './Icon'

interface SubscriptionManagerProps {
  subscriptions: Subscription[]
  onUnsubscribe: (senderEmails: string[]) => void
  onResubscribe: (senderEmail: string) => void
}

/** Sender-by-sender view of promotional mail with one-click unsubscribe. */
export function SubscriptionManager({ subscriptions, onUnsubscribe, onResubscribe }: SubscriptionManagerProps) {
  const [expanded, setExpanded] = useState(true)
  const active = subscriptions.filter((item) => !item.unsubscribed)
  const suggested = active.filter((item) => item.suggested)
  const perWeek = active.reduce((total, item) => total + item.perWeek, 0)

  if (subscriptions.length === 0) return null

  return (
    <section className="subs" aria-labelledby="subs-title">
      <div className="subs__header">
        <div>
          <h2 id="subs-title" className="subs__title">
            <AiSpark size={16} />
            Manage subscriptions
          </h2>
          <p className="subs__summary">
            {active.length === 0
              ? 'You’ve unsubscribed from every promotional sender here.'
              : `About ${pluralize(perWeek, 'promotional email')} a week from ${pluralize(active.length, 'sender')}.`}
            {suggested.length > 0 && ` You haven’t opened ${suggested.length} of them in over a month.`}
          </p>
        </div>
        <button
          type="button"
          className="icon-button icon-button--sm"
          onClick={() => setExpanded((current) => !current)}
          aria-expanded={expanded}
          aria-controls="subs-list"
          aria-label={expanded ? 'Collapse subscriptions' : 'Expand subscriptions'}
        >
          <Icon name="chevronDown" size={18} className={expanded ? 'subs__chevron is-open' : 'subs__chevron'} />
        </button>
      </div>

      {expanded && (
        <>
          {suggested.length > 0 && (
            <button
              type="button"
              className="button button--tonal button--sm subs__bulk"
              onClick={() => onUnsubscribe(suggested.map((item) => item.sender.email))}
            >
              <Icon name="bellOff" size={15} />
              Unsubscribe from {suggested.length} you don’t open
            </button>
          )}

          <ul id="subs-list" className="subs__list">
            {subscriptions.map((item) => (
              <li key={item.sender.email} className={`subs__row${item.unsubscribed ? ' is-unsubscribed' : ''}`}>
                <Avatar name={item.sender.name} size="sm" />
                <span className="subs__text">
                  <span className="subs__name">
                    {item.sender.name}
                    {item.suggested && !item.unsubscribed && <span className="subs__tag">Suggested</span>}
                  </span>
                  <span className="subs__meta">
                    {item.unsubscribed
                      ? 'Unsubscribed · no new emails from this sender'
                      : `${describeFrequency(item.perWeek)} · ${describeLastOpened(item.lastOpenedDaysAgo)}`}
                  </span>
                </span>
                {item.unsubscribed ? (
                  <button type="button" className="button button--ghost button--sm" onClick={() => onResubscribe(item.sender.email)}>
                    Resubscribe
                  </button>
                ) : (
                  <button
                    type="button"
                    className="button button--sm"
                    onClick={() => onUnsubscribe([item.sender.email])}
                    aria-label={`Unsubscribe from ${item.sender.name}`}
                  >
                    Unsubscribe
                  </button>
                )}
              </li>
            ))}
          </ul>

          <p className="subs__note">
            Unsubscribing also archives that sender’s promos. Demo only — no request is sent to any real sender.
          </p>
        </>
      )}
    </section>
  )
}
