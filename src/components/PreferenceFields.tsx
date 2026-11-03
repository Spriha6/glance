import { FOCUS_OPTIONS } from '../lib/preferences'
import type { FocusArea, Sender } from '../types'
import { Avatar } from './Avatar'
import { Icon } from './Icon'

interface FocusPickerProps {
  value: FocusArea[]
  onChange: (value: FocusArea[]) => void
}

export function FocusPicker({ value, onChange }: FocusPickerProps) {
  const selected = new Set(value)

  function toggle(id: FocusArea, checked: boolean) {
    // Keep the original option order so stored preferences stay stable.
    onChange(FOCUS_OPTIONS.map((option) => option.id).filter((option) => (option === id ? checked : selected.has(option))))
  }

  return (
    <fieldset className="pref-fieldset">
      <legend className="visually-hidden">What matters most to you?</legend>
      <div className="focus-grid">
        {FOCUS_OPTIONS.map((option) => (
          <label key={option.id} className="focus-option">
            <input
              type="checkbox"
              className="checkbox focus-option__input"
              checked={selected.has(option.id)}
              onChange={(event) => toggle(option.id, event.target.checked)}
            />
            <span className="focus-option__icon" aria-hidden="true">
              <Icon name={option.icon} size={18} />
            </span>
            <span className="focus-option__text">
              <span className="focus-option__label">{option.label}</span>
              <span className="focus-option__description">{option.description}</span>
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  )
}

interface PeoplePickerProps {
  people: Sender[]
  value: string[]
  onChange: (value: string[]) => void
}

export function PeoplePicker({ people, value, onChange }: PeoplePickerProps) {
  const selected = new Set(value)

  function toggle(email: string, checked: boolean) {
    onChange(people.map((person) => person.email).filter((item) => (item === email ? checked : selected.has(item))))
  }

  return (
    <fieldset className="pref-fieldset">
      <legend className="visually-hidden">Who is important to you?</legend>
      <div className="people-grid">
        {people.map((person) => (
          <label key={person.email} className="person-option">
            <input
              type="checkbox"
              className="visually-hidden person-option__input"
              checked={selected.has(person.email)}
              onChange={(event) => toggle(person.email, event.target.checked)}
            />
            <Avatar name={person.name} size="sm" />
            <span className="person-option__text">
              <span className="person-option__name">{person.name}</span>
              {person.organization && <span className="person-option__org">{person.organization}</span>}
            </span>
            <span className="person-option__check" aria-hidden="true">
              <Icon name="check" size={14} />
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  )
}
