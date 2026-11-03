import { useEffect, useId, useRef, useState } from 'react'
import { APP_NAME } from '../lib/brand'
import type { Email, ReplyDraft } from '../types'
import { AiSpark } from './Brand'
import { Icon } from './Icon'

interface ReplyDraftEditorProps {
  email: Email & { suggestedReply: string }
  draft: ReplyDraft | undefined
  autoFocus: boolean
  onChange: (draft: ReplyDraft) => void
}

/** Editable AI reply suggestion. Approving saves it as a draft — nothing is ever sent. */
export function ReplyDraftEditor({ email, draft, autoFocus, onChange }: ReplyDraftEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const sectionRef = useRef<HTMLElement>(null)
  const [copied, setCopied] = useState(false)
  const id = useId()
  const text = draft?.text ?? email.suggestedReply
  const approved = draft?.approved ?? false

  useEffect(() => {
    if (!autoFocus) return
    sectionRef.current?.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
    textareaRef.current?.focus({ preventScroll: true })
  }, [autoFocus, email.id])

  async function copy() {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2000)
    } catch {
      setCopied(false)
    }
  }

  return (
    <section ref={sectionRef} className="reply-draft" aria-labelledby={`${id}-title`}>
      <h3 id={`${id}-title`} className="section-title section-title--accent">
        <AiSpark size={14} />
        Suggested reply
        <span className="summary__tag">AI · demo</span>
      </h3>

      {approved ? (
        <>
          <p className="reply-draft__status" role="status">
            <Icon name="check" size={15} />
            Approved and saved as a draft. {APP_NAME} never sends email — copy it into your email app when you’re ready.
          </p>
          <div className="reply-draft__preview">{text}</div>
          <div className="reply-draft__actions">
            <button type="button" className="button button--sm" onClick={copy}>
              <Icon name={copied ? 'check' : 'copy'} size={15} />
              {copied ? 'Copied' : 'Copy text'}
            </button>
            <button type="button" className="button button--ghost button--sm" onClick={() => onChange({ text, approved: false })}>
              Edit again
            </button>
          </div>
        </>
      ) : (
        <>
          <label htmlFor={`${id}-text`} className="visually-hidden">
            Reply to {email.sender.name} (editable)
          </label>
          <textarea
            ref={textareaRef}
            id={`${id}-text`}
            className="reply-draft__input"
            rows={7}
            value={text}
            onChange={(event) => onChange({ text: event.target.value, approved: false })}
            aria-describedby={`${id}-help`}
          />
          <p id={`${id}-help`} className="reply-draft__help">
            Edit anything you like. Nothing is sent until you send it yourself.
          </p>
          <div className="reply-draft__actions">
            <button
              type="button"
              className="button button--primary button--sm"
              onClick={() => onChange({ text, approved: true })}
              disabled={!text.trim()}
            >
              <Icon name="check" size={15} />
              Approve draft
            </button>
            {text !== email.suggestedReply && (
              <button
                type="button"
                className="button button--ghost button--sm"
                onClick={() => onChange({ text: email.suggestedReply, approved: false })}
              >
                Reset to suggestion
              </button>
            )}
          </div>
        </>
      )}
    </section>
  )
}
