import type { Ref } from 'react'
import { APP_NAME } from '../lib/brand'
import { Avatar } from './Avatar'
import { LogoMark } from './Brand'
import { Icon } from './Icon'
import { SearchField } from './SearchField'

interface TopBarProps {
  query: string
  onQueryChange: (value: string) => void
  onToggleNav: () => void
  navExpanded: boolean
  onOpenSettings: () => void
  onOpenHelp: () => void
  searchRef?: Ref<HTMLInputElement>
}

export function TopBar({ query, onQueryChange, onToggleNav, navExpanded, onOpenSettings, onOpenHelp, searchRef }: TopBarProps) {
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
          <LogoMark size={28} />
          <span className="brand__name">{APP_NAME}</span>
        </span>
      </div>

      <SearchField ref={searchRef} value={query} onChange={onQueryChange} />

      <div className="topbar__end">
        <button
          type="button"
          className="icon-button icon-button--lg topbar__help"
          aria-label={`How ${APP_NAME} works`}
          title={`How ${APP_NAME} works`}
          onClick={onOpenHelp}
        >
          <Icon name="help" size={20} />
        </button>
        <button
          type="button"
          className="icon-button icon-button--lg"
          aria-label="Settings"
          title="Settings"
          onClick={onOpenSettings}
        >
          <Icon name="settings" size={20} />
        </button>
        <button type="button" className="profile-button" aria-label="Spriha Sahni (demo account)" title="Spriha Sahni · demo account">
          <Avatar name="Spriha Sahni" size="sm" />
        </button>
      </div>
    </header>
  )
}
