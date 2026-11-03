import type { Ref } from 'react'
import { Icon } from './Icon'

interface SearchFieldProps {
  value: string
  onChange: (value: string) => void
  ref?: Ref<HTMLInputElement>
}

export function SearchField({ value, onChange, ref }: SearchFieldProps) {
  return (
    <div className="search" role="search">
      <Icon name="search" size={20} className="search__icon" />
      <input
        ref={ref}
        type="search"
        className="search__input"
        placeholder="Search mail"
        aria-label="Search emails"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === 'Escape' && value) {
            event.stopPropagation()
            onChange('')
          }
        }}
      />
      {value ? (
        <button type="button" className="search__clear" onClick={() => onChange('')} aria-label="Clear search">
          <Icon name="close" size={14} />
        </button>
      ) : (
        <kbd className="search__kbd" aria-hidden="true">
          /
        </kbd>
      )}
    </div>
  )
}
