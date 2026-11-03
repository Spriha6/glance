import { VIEWS } from '../lib/filters'
import type { View } from '../types'
import { Icon } from './Icon'

interface SidebarProps {
  activeView: View
  unreadCounts: Record<View, number>
  unreadTotal: number
  collapsed: boolean
  open: boolean
  onSelectView: (view: View) => void
  onCatchUp: () => void
}

export function Sidebar({ activeView, unreadCounts, unreadTotal, collapsed, open, onSelectView, onCatchUp }: SidebarProps) {
  const className = ['sidebar', collapsed && 'is-collapsed', open && 'is-open'].filter(Boolean).join(' ')

  return (
    <aside id="sidebar" className={className}>
      <button type="button" className="button button--primary button--pill catch-up-button" onClick={onCatchUp}>
        <Icon name="sparkle" size={18} />
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
            <button type="button" className="nav__item" aria-disabled="true" title="Settings · coming soon">
              <Icon name="settings" className="nav__icon" size={20} />
              <span className="nav__text">Settings</span>
              <span className="nav__soon">Soon</span>
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
