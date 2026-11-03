import type { Ref } from 'react'
import { Avatar } from './Avatar'
import { Icon } from './Icon'
import { SearchField } from './SearchField'

interface TopBarProps {
  query: string
  onQueryChange: (value: string) => void
  onToggleNav: () => void
  navExpanded: boolean
  searchRef?: Ref<HTMLInputElement>
}

export function TopBar({ query, onQueryChange, onToggleNav, navExpanded, searchRef }: TopBarProps) {
  return (
    <header className="topbar">
      <div className="topbar__start">
        <button
          type="button"
          className="icon-button icon-button--lg"
          onClick={onToggleNav}
          aria-label="Main menu"
          aria-expanded={navExpanded}
          aria-controls="sidebar"
        >
          <Icon name="menu" size={20} />
        </button>
        <span className="brand">
          <span className="brand__mark" aria-hidden="true">
            <Icon name="sparkle" size={16} />
          </span>
          <span className="brand__name">Inbox AI</span>
        </span>
      </div>

      <SearchField ref={searchRef} value={query} onChange={onQueryChange} />

      <div className="topbar__end">
        <button type="button" className="icon-button icon-button--lg topbar__help" aria-label="Help (coming soon)" title="Help · coming soon" aria-disabled="true">
          <Icon name="help" size={20} />
        </button>
        <button type="button" className="icon-button icon-button--lg" aria-label="Settings (coming soon)" title="Settings · coming soon" aria-disabled="true">
          <Icon name="settings" size={20} />
        </button>
        <button type="button" className="profile-button" aria-label="Demo account" title="Demo account">
          <Avatar name="Demo User" size="sm" />
        </button>
      </div>
    </header>
  )
}
