import { useEffect, useId, useRef, useState } from 'react'
import { answerQuestion } from '../lib/assistant'
import type { Email } from '../types'
import { AiSpark } from './Brand'
import { Icon } from './Icon'

const SUGGESTIONS = ['What do I need to do?', 'When is this due?', 'Draft a quick reply']
const RESPONSE_DELAY_MS = 650

interface Exchange {
  id: number
  question: string
  answer?: string
}

/** Mock Q&A about a single email. Mount with `key={email.id}` so each email gets a fresh thread. */
export function AskEmail({ email }: { email: Email }) {
  const inputId = useId()
  const [question, setQuestion] = useState('')
  const [thread, setThread] = useState<Exchange[]>([])
  const nextId = useRef(0)
  const timer = useRef<number | undefined>(undefined)
  const isThinking = thread.some((exchange) => exchange.answer === undefined)

  useEffect(() => () => window.clearTimeout(timer.current), [])

  function ask(text: string) {
    const trimmed = text.trim()
    if (!trimmed || isThinking) return
    const id = nextId.current++
    setThread((current) => [...current, { id, question: trimmed }])
    setQuestion('')
    timer.current = window.setTimeout(() => {
      setThread((current) =>
        current.map((exchange) =>
          exchange.id === id ? { ...exchange, answer: answerQuestion(email, trimmed) } : exchange,
        ),
      )
    }, RESPONSE_DELAY_MS)
  }

  return (
    <section className="ask">
      <label className="section-title" htmlFor={inputId}>
        <AiSpark size={14} />
        Ask about this email
      </label>

      {thread.length > 0 && (
        <div className="ask__thread" aria-live="polite">
          {thread.map((exchange) => (
            <div key={exchange.id} className="ask__exchange">
              <p className="ask__question">{exchange.question}</p>
              <div className="ask__answer">
                <span className="ask__answer-icon" aria-hidden="true">
                  <AiSpark size={13} />
                </span>
                {exchange.answer === undefined ? (
                  <span className="ask__typing" aria-label="Thinking">
                    <span />
                    <span />
                    <span />
                  </span>
                ) : (
                  <p>{exchange.answer}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <form
        className="ask__form"
        onSubmit={(event) => {
          event.preventDefault()
          ask(question)
        }}
      >
        <input
          id={inputId}
          className="ask__input"
          placeholder="e.g. What’s the deadline?"
          autoComplete="off"
          value={question}
          onChange={(event) => setQuestion(event.target.value)}
        />
        <button type="submit" className="ask__send" disabled={!question.trim() || isThinking} aria-label="Ask">
          <Icon name="arrowUp" size={17} />
        </button>
      </form>

      {thread.length === 0 && (
        <div className="ask__suggestions">
          {SUGGESTIONS.map((suggestion) => (
            <button key={suggestion} type="button" className="chip" onClick={() => ask(suggestion)}>
              {suggestion}
            </button>
          ))}
        </div>
      )}
    </section>
  )
}
