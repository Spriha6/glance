import { useEffect, useRef, useState } from 'react'
import { APP_NAME } from '../lib/brand'
import type { Preferences, Sender } from '../types'
import { LogoMark } from './Brand'
import { Icon } from './Icon'
import type { IconName } from './Icon'
import { FocusPicker, PeoplePicker } from './PreferenceFields'

interface OnboardingProps {
  people: Sender[]
  initialPreferences: Preferences
  onFinish: (preferences: Preferences) => void
  onSkip: () => void
}

const STEPS = ['Welcome', 'What matters', 'Important people'] as const

const HOW_IT_WORKS: { icon: IconName; title: string; text: string }[] = [
  {
    icon: 'today',
    title: 'A calm start to your day',
    text: `${APP_NAME} opens to a short overview instead of a wall of email.`,
  },
  {
    icon: 'sparkle',
    title: 'A few emails that need you',
    text: 'It picks at most three — and always tells you why, like a deadline or a direct question.',
  },
  {
    icon: 'inbox',
    title: 'Everything else stays put',
    text: 'The rest of your inbox is one click away, in the usual order. Nothing is hidden or sent for you.',
  },
]

export function Onboarding({ people, initialPreferences, onFinish, onSkip }: OnboardingProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const headingRef = useRef<HTMLHeadingElement>(null)
  const [step, setStep] = useState(0)
  const [preferences, setPreferences] = useState(initialPreferences)
  const isLast = step === STEPS.length - 1

  useEffect(() => {
    const dialog = dialogRef.current
    if (dialog && !dialog.open) dialog.showModal()
  }, [])

  // Move focus to each new step's heading so screen readers announce it.
  useEffect(() => {
    if (step > 0) headingRef.current?.focus()
  }, [step])

  return (
    <dialog
      ref={dialogRef}
      className="onboarding"
      aria-labelledby="onboarding-title"
      onCancel={(event) => {
        event.preventDefault()
        onSkip()
      }}
    >
      <div className="onboarding__top">
        <span className="brand">
          <LogoMark size={28} />
          <span className="onboarding__brand">{APP_NAME}</span>
        </span>
        <span className="demo-tag">Demo · sample emails</span>
      </div>

      <ol className="onboarding__progress" aria-label={`Step ${step + 1} of ${STEPS.length}`}>
        {STEPS.map((label, index) => (
          <li key={label} className={index <= step ? 'is-done' : undefined} aria-current={index === step ? 'step' : undefined}>
            <span className="visually-hidden">{label}</span>
          </li>
        ))}
      </ol>

      <div className="onboarding__body">
        {step === 0 && (
          <>
            <h2 id="onboarding-title" ref={headingRef} tabIndex={-1} className="onboarding__title">
              Email that’s easy to catch up on
            </h2>
            <p className="onboarding__lead">
              Here’s how {APP_NAME} keeps important email from getting buried. Setup takes under a minute.
            </p>
            <ul className="how-list">
              {HOW_IT_WORKS.map((item) => (
                <li key={item.title} className="how-list__item">
                  <span className="how-list__icon" aria-hidden="true">
                    <Icon name={item.icon} size={18} />
                  </span>
                  <span>
                    <strong>{item.title}</strong>
                    {item.text}
                  </span>
                </li>
              ))}
            </ul>
            <p className="onboarding__note">
              No account needed — this demo uses sample emails, so you can explore freely.
            </p>
          </>
        )}

        {step === 1 && (
          <>
            <h2 id="onboarding-title" ref={headingRef} tabIndex={-1} className="onboarding__title">
              What matters most to you?
            </h2>
            <p className="onboarding__lead">Pick any that apply. We’ll use these to choose what to highlight.</p>
            <FocusPicker value={preferences.focus} onChange={(focus) => setPreferences((current) => ({ ...current, focus }))} />
          </>
        )}

        {step === 2 && (
          <>
            <h2 id="onboarding-title" ref={headingRef} tabIndex={-1} className="onboarding__title">
              Anyone you never want to miss?
            </h2>
            <p className="onboarding__lead">
              Emails from these people get highlighted when they need a reply. Optional — you can skip this.
            </p>
            <PeoplePicker
              people={people}
              value={preferences.importantSenders}
              onChange={(importantSenders) => setPreferences((current) => ({ ...current, importantSenders }))}
            />
          </>
        )}
      </div>

      <div className="onboarding__footer">
        <button type="button" className="button button--ghost" onClick={onSkip}>
          Skip setup
        </button>
        <span className="onboarding__spacer" />
        {step > 0 && (
          <button type="button" className="button" onClick={() => setStep(step - 1)}>
            Back
          </button>
        )}
        {isLast ? (
          <button type="button" className="button button--primary button--pill" onClick={() => onFinish(preferences)}>
            <Icon name="check" size={16} />
            Finish setup
          </button>
        ) : (
          <button type="button" className="button button--primary button--pill" onClick={() => setStep(step + 1)}>
            {step === 0 ? 'Get started' : 'Continue'}
          </button>
        )}
      </div>
      <p className="onboarding__later">You can change these anytime in Settings.</p>
    </dialog>
  )
}
