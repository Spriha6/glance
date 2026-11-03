import { useId, useRef, useState } from 'react'
import type { ComposeDraft, Sender } from '../types'
import { Icon } from './Icon'

interface ComposeWindowProps {
  draft: ComposeDraft
  contacts: Sender[]
  onChange: (draft: ComposeDraft) => void
  onSend: (draft: ComposeDraft) => void
  onClose: () => void
  onDiscard: () => void
}

/** Gmail-style "New message" window, docked to the bottom right. */
export function ComposeWindow({ draft, contacts, onChange, onSend, onClose, onDiscard }: ComposeWindowProps) {
  const id = useId()
  const toRef = useRef<HTMLInputElement>(null)
  const [minimized, setMinimized] = useState(false)
  const [error, setError] = useState('')
  const title = draft.subject.trim() || 'New message'

  // Start typing where it's most useful: the recipient, or the body when it's already addressed.
  const [startInBody] = useState(() => Boolean(draft.to.trim()))

  function update(field: keyof ComposeDraft, value: string) {
    if (field === 'to') setError('')
    onChange({ ...draft, [field]: value })
  }

  function send() {
    if (!draft.to.trim()) {
      setError('Add at least one recipient.')
      toRef.current?.focus()
      return
    }
    onSend(draft)
  }

  return (
    <section
      className={`compose${minimized ? ' is-minimized' : ''}`}
      role="dialog"
      aria-labelledby={`${id}-title`}
      onKeyDown={(event) => {
        if (event.key === 'Escape') {
          event.stopPropagation()
          onClose()
        }
        if (event.key === 'Enter' && (event.metaKey || event.ctrlKey)) send()
      }}
    >
      <header className="compose__header">
        <button
          type="button"
          className="compose__title"
          id={`${id}-title`}
          onClick={() => setMinimized((current) => !current)}
          aria-expanded={!minimized}
        >
          {title}
        </button>
        <button
          type="button"
          className="icon-button icon-button--sm"
          onClick={() => setMinimized((current) => !current)}
          aria-label={minimized ? 'Expand message' : 'Minimize message'}
          title={minimized ? 'Expand' : 'Minimize'}
        >
          <Icon name={minimized ? 'arrowUp' : 'minus'} size={16} />
        </button>
        <button type="button" className="icon-button icon-button--sm" onClick={onClose} aria-label="Save draft and close" title="Save & close">
          <Icon name="close" size={16} />
        </button>
      </header>

      {!minimized && (
        <form
          className="compose__form"
          onSubmit={(event) => {
            event.preventDefault()
            send()
          }}
        >
          <label className="compose__field">
            <span className="compose__label">To</span>
            <input
              ref={toRef}
              autoFocus={!startInBody}
              className="compose__input"
              type="text"
              list={`${id}-contacts`}
              value={draft.to}
              onChange={(event) => update('to', event.target.value)}
              aria-invalid={error ? true : undefined}
              aria-describedby={error ? `${id}-error` : undefined}
              autoComplete="off"
            />
            <datalist id={`${id}-contacts`}>
              {contacts.map((contact) => (
                <option key={contact.email} value={`${contact.name} <${contact.email}>`} />
              ))}
            </datalist>
          </label>
          {error && (
            <p id={`${id}-error`} className="compose__error" role="alert">
              {error}
            </p>
          )}
          <label className="compose__field">
            <span className="visually-hidden">Subject</span>
            <input
              className="compose__input"
              type="text"
              placeholder="Subject"
              value={draft.subject}
              onChange={(event) => update('subject', event.target.value)}
            />
          </label>
          <label className="compose__body">
            <span className="visually-hidden">Message</span>
            <textarea
              autoFocus={startInBody}
              className="compose__textarea"
              value={draft.body}
              onChange={(event) => update('body', event.target.value)}
            />
          </label>

          <footer className="compose__footer">
            <button type="submit" className="button button--primary compose__send">
              Send
              <Icon name="send" size={16} />
            </button>
            <span className="compose__note">Demo · nothing leaves your browser</span>
            <button type="button" className="icon-button icon-button--sm" onClick={onDiscard} aria-label="Discard draft" title="Discard draft">
              <Icon name="trash" size={17} />
            </button>
          </footer>
        </form>
      )}
    </section>
  )
}
