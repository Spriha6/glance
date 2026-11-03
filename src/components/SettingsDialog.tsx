import { useEffect, useRef, useState } from 'react'
import { APP_NAME } from '../lib/brand'
import type { Preferences, Sender } from '../types'
import { Icon } from './Icon'
import { FocusPicker, PeoplePicker } from './PreferenceFields'

interface SettingsDialogProps {
  open: boolean
  people: Sender[]
  preferences: Preferences
  onSave: (preferences: Preferences) => void
  onClose: () => void
  onReplayIntro: () => void
  onResetDemo: () => void
}

export function SettingsDialog({ open, people, preferences, onSave, onClose, onReplayIntro, onResetDemo }: SettingsDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const [draft, setDraft] = useState(preferences)

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    if (open && !dialog.open) {
      setDraft(preferences)
      dialog.showModal()
    }
    if (!open && dialog.open) dialog.close()
  }, [open, preferences])

  return (
    <dialog
      ref={dialogRef}
      className="settings"
      aria-labelledby="settings-title"
      onClose={onClose}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
    >
      <form
        className="settings__inner"
        onSubmit={(event) => {
          event.preventDefault()
          onSave(draft)
        }}
      >
        <header className="settings__header">
          <h2 id="settings-title" className="settings__title">
            Settings
          </h2>
          <button type="button" className="icon-button" onClick={onClose} aria-label="Close settings">
            <Icon name="close" />
          </button>
        </header>

        <div className="settings__body">
          <section className="settings__section">
            <h3 className="settings__heading">What matters most</h3>
            <p className="settings__help">{APP_NAME} uses these to pick what goes in “Needs your attention”.</p>
            <FocusPicker value={draft.focus} onChange={(focus) => setDraft((current) => ({ ...current, focus }))} />
          </section>

          <section className="settings__section">
            <h3 className="settings__heading">Important people</h3>
            <p className="settings__help">Their emails are highlighted when they need a reply.</p>
            <PeoplePicker
              people={people}
              value={draft.importantSenders}
              onChange={(importantSenders) => setDraft((current) => ({ ...current, importantSenders }))}
            />
          </section>

          <section className="settings__section settings__section--quiet">
            <h3 className="settings__heading">Demo</h3>
            <p className="settings__help">
              You’re using sample emails. Your choices, to-dos and drafts are saved in this browser only.
            </p>
            <div className="settings__row">
              <button type="button" className="button button--sm" onClick={onReplayIntro}>
                Replay intro
              </button>
              <button type="button" className="button button--sm" onClick={onResetDemo}>
                Reset demo data
              </button>
            </div>
          </section>
        </div>

        <footer className="settings__footer">
          <button type="button" className="button" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="button button--primary">
            Save preferences
          </button>
        </footer>
      </form>
    </dialog>
  )
}
