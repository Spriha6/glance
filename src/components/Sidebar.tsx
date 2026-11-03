import { VIEWS } from '../lib/filters'
import type { ListView, View } from '../types'
import { AiSpark } from './Brand'
import { Icon } from './Icon'

interface SidebarProps {
  activeView: View
  unreadCounts: Record<ListView, number>
  unreadTotal: number
  collapsed: boolean
  open: boolean
  onSelectView: (view: View) => void
  onCatchUp: () => void
  onCompose: () => void
  onOpenSettings: () => void
}

export function Sidebar({
  activeView,
  unreadCounts,
  unreadTotal,
  collapsed,
  open,
  onSelectView,
  onCatchUp,
  onCompose,
  onOpenSettings,
}: SidebarProps) {
  const className = ['sidebar', collapsed && 'is-collapsed', open && 'is-open'].filter(Boolean).join(' ')

  return (
    <aside id="sidebar" className={className}>
      <button type="button" className="button compose-button" onClick={onCompose} aria-label="Compose" title={collapsed ? 'Compose' : undefined}>
        <Icon name="pencil" size={20} />
        <span className="compose-button__label">Compose</span>
      </button>

      <button
        type="button"
        className="button catch-up-button"
        onClick={onCatchUp}
        title={collapsed ? 'Catch me up' : undefined}
      >
        <AiSpark size={20} />
        <span className="catch-up-button__label">Catch me up</span>
        {unreadTotal > 0 && (
          <span className="button__badge">
            {unreadTotal}
            <span className="visually-hidden"> unread</span>
          </span>
        )}
      </button>

      <nav className="nav" aria-label="Mailboxes">
        <ul className="nav__list">
          <li>
            <button
              type="button"
              className="nav__item"
              aria-current={activeView === 'home' ? 'page' : undefined}
              onClick={() => onSelectView('home')}
              title={collapsed ? 'Today' : undefined}
            >
              <Icon name="today" className="nav__icon" size={20} />
              <span className="nav__text">Today</span>
            </button>
          </li>
          {VIEWS.map((view) => {
            const count = unreadCounts[view.id]
            return (
              <li key={view.id}>
                <button
                  type="button"
                  className="nav__item"
                  aria-current={activeView === view.id ? 'page' : undefined}
                  onClick={() => onSelectView(view.id)}
                  title={collapsed ? view.label : undefined}
                >
                  <Icon name={view.icon} className="nav__icon" size={20} />
                  <span className="nav__text">{view.label}</span>
                  {count > 0 && (
                    <span className="nav__count">
                      {count}
                      <span className="visually-hidden"> unread</span>
                    </span>
                  )}
                </button>
              </li>
            )
          })}
        </ul>

        <ul className="nav__list nav__list--secondary">
          <li>
            <button type="button" className="nav__item" onClick={onOpenSettings} title={collapsed ? 'Settings' : undefined}>
              <Icon name="settings" className="nav__icon" size={20} />
              <span className="nav__text">Settings</span>
            </button>
          </li>
        </ul>
      </nav>

      <div className="sidebar__footer">
        <div className="demo-note">
          <strong>Demo workspace</strong>
          You’re viewing sample emails. Connecting a real inbox comes next.
        </div>
      </div>
    </aside>
  )
}
