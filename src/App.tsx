import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { CatchUpCard } from './components/CatchUpCard'
import { CatchUpDialog } from './components/CatchUpDialog'
import { EmailDetail } from './components/EmailDetail'
import { EmailList } from './components/EmailList'
import { PriorityFilters } from './components/PriorityFilters'
import { Sidebar } from './components/Sidebar'
import { TopBar } from './components/TopBar'
import { initialEmails } from './data/emails'
import { useMediaQuery } from './hooks/useMediaQuery'
import {
  VIEWS,
  countByPriority,
  countUnreadByView,
  matchesPriority,
  matchesQuery,
  matchesView,
  sortNewestFirst,
} from './lib/filters'
import type { Email, PriorityFilter, View } from './types'
import './App.css'

// Below this width the detail panel becomes a slide-over drawer (keep in sync with App.css).
const DRAWER_QUERY = '(max-width: 1240px)'
// Below this width the sidebar becomes an off-canvas menu (keep in sync with App.css).
const MOBILE_QUERY = '(max-width: 820px)'

function initialSelection() {
  if (window.matchMedia(DRAWER_QUERY).matches) return null
  return sortNewestFirst(initialEmails.filter((email) => matchesView(email, 'inbox')))[0]?.id ?? null
}

function viewFor(email: Email): View {
  if (email.archived) return 'archive'
  return email.category === 'newsletter' ? 'newsletters' : 'inbox'
}

export default function App() {
  const [emails, setEmails] = useState<Email[]>(initialEmails)
  const [view, setView] = useState<View>('inbox')
  const [priority, setPriority] = useState<PriorityFilter>('all')
  const [query, setQuery] = useState('')
  const [selectedId, setSelectedId] = useState<string | null>(initialSelection)
  const [briefingOpen, setBriefingOpen] = useState(false)
  const [checkedIds, setCheckedIds] = useState<ReadonlySet<string>>(() => new Set())
  const [catchUpHidden, setCatchUpHidden] = useState(false)
  const [railCollapsed, setRailCollapsed] = useState(false)
  const [navOpen, setNavOpen] = useState(false)
  const isDrawer = useMediaQuery(DRAWER_QUERY)
  const isMobile = useMediaQuery(MOBILE_QUERY)
  const searchRef = useRef<HTMLInputElement>(null)

  const viewEmails = useMemo(() => sortNewestFirst(emails.filter((email) => matchesView(email, view))), [emails, view])
  const searchedEmails = useMemo(() => viewEmails.filter((email) => matchesQuery(email, query)), [viewEmails, query])
  const visibleEmails = useMemo(
    () => searchedEmails.filter((email) => matchesPriority(email, priority)),
    [searchedEmails, priority],
  )
  const priorityCounts = useMemo(() => countByPriority(searchedEmails), [searchedEmails])
  const unreadCounts = useMemo(() => countUnreadByView(emails), [emails])
  const selectedEmail = emails.find((email) => email.id === selectedId) ?? null

  const unreadTotal = emails.filter((email) => !email.archived && email.unread).length
  const isFiltered = query.trim() !== '' || priority !== 'all'
  const viewConfig = VIEWS.find((item) => item.id === view) ?? VIEWS[0]

  const updateEmail = useCallback((id: string, update: (email: Email) => Email) => {
    setEmails((current) => current.map((email) => (email.id === id ? update(email) : email)))
  }, [])

  const toggleRead = useCallback(
    (id: string) => updateEmail(id, (email) => ({ ...email, unread: !email.unread })),
    [updateEmail],
  )

  const toggleTask = useCallback(
    (emailId: string, taskId: string) =>
      updateEmail(emailId, (email) => ({
        ...email,
        actionItems: email.actionItems.map((item) => (item.id === taskId ? { ...item, done: !item.done } : item)),
      })),
    [updateEmail],
  )

  const setUnread = useCallback((ids: string[], unread: boolean) => {
    const targets = new Set(ids)
    setEmails((current) => current.map((email) => (targets.has(email.id) ? { ...email, unread } : email)))
    setCheckedIds(new Set())
  }, [])

  const markRead = useCallback((ids: string[]) => setUnread(ids, false), [setUnread])

  function setArchived(ids: string[], archived: boolean) {
    const targets = new Set(ids)
    const open = selectedId ? emails.find((item) => item.id === selectedId) : undefined
    // When the open email disappears from the list, move on to the nearest remaining neighbour.
    if (open && targets.has(open.id) && !matchesView({ ...open, archived }, view)) {
      const index = visibleEmails.findIndex((item) => item.id === open.id)
      const remaining = (item: Email) => !targets.has(item.id)
      const next =
        visibleEmails.slice(index + 1).find(remaining) ?? visibleEmails.slice(0, index).reverse().find(remaining)
      setSelectedId(isDrawer ? null : (next?.id ?? null))
    }
    setEmails((current) => current.map((email) => (targets.has(email.id) ? { ...email, archived } : email)))
    setCheckedIds(new Set())
  }

  function toggleArchive(id: string) {
    const email = emails.find((item) => item.id === id)
    if (email) setArchived([id], !email.archived)
  }

  function checkEmail(id: string, checked: boolean) {
    setCheckedIds((current) => {
      const next = new Set(current)
      if (checked) next.add(id)
      else next.delete(id)
      return next
    })
  }

  function checkAll(checked: boolean) {
    setCheckedIds(checked ? new Set(visibleEmails.map((email) => email.id)) : new Set())
  }

  function changeView(next: View) {
    setView(next)
    setPriority('all')
    setCheckedIds(new Set())
    setNavOpen(false)
  }

  function toggleNav() {
    if (isMobile) setNavOpen((current) => !current)
    else setRailCollapsed((current) => !current)
  }

  function openBriefing() {
    setNavOpen(false)
    setBriefingOpen(true)
  }

  function resetFilters() {
    setQuery('')
    setPriority('all')
  }

  function openFromBriefing(id: string) {
    const email = emails.find((item) => item.id === id)
    if (!email) return
    setView(viewFor(email))
    resetFilters()
    setSelectedId(id)
    setBriefingOpen(false)
  }

  // Keyboard shortcuts: "/" focuses search, Escape closes the drawer.
  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      const target = event.target
      const isTyping = target instanceof Element && target.closest('input, textarea, [contenteditable="true"]') !== null
      if (event.key === '/' && !isTyping && !briefingOpen) {
        event.preventDefault()
        searchRef.current?.focus()
      }
      if (event.key === 'Escape' && !briefingOpen) {
        if (navOpen) setNavOpen(false)
        else if (isDrawer && selectedId) setSelectedId(null)
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [isDrawer, selectedId, briefingOpen, navOpen])

  const showCatchUp = view === 'inbox' && !isFiltered && !catchUpHidden

  return (
    <div className={`app${railCollapsed ? ' is-rail-collapsed' : ''}`}>
      <TopBar
        query={query}
        onQueryChange={setQuery}
        onToggleNav={toggleNav}
        navExpanded={isMobile ? navOpen : !railCollapsed}
        searchRef={searchRef}
      />

      <Sidebar
        activeView={view}
        unreadCounts={unreadCounts}
        unreadTotal={unreadTotal}
        collapsed={railCollapsed && !isMobile}
        open={navOpen}
        onSelectView={changeView}
        onCatchUp={openBriefing}
      />
      <div className={`nav-backdrop${isMobile && navOpen ? ' is-open' : ''}`} onClick={() => setNavOpen(false)} aria-hidden="true" />

      <main className="main">
        <EmailList
          title={viewConfig.label}
          emails={visibleEmails}
          selectedId={selectedId}
          checkedIds={checkedIds}
          query={query}
          emptyMessage={viewConfig.emptyMessage}
          isFiltered={isFiltered}
          inArchive={view === 'archive'}
          tabs={<PriorityFilters value={priority} counts={priorityCounts} onChange={setPriority} />}
          banner={
            showCatchUp && (
              <CatchUpCard
                emails={emails}
                onOpenBriefing={openBriefing}
                onOpenEmail={openFromBriefing}
                onDismiss={() => setCatchUpHidden(true)}
              />
            )
          }
          onSelect={setSelectedId}
          onCheck={checkEmail}
          onCheckAll={checkAll}
          onToggleRead={toggleRead}
          onToggleArchive={toggleArchive}
          onSetUnread={setUnread}
          onSetArchived={setArchived}
          onResetFilters={resetFilters}
        />
      </main>

      <div
        className={`drawer-backdrop${isDrawer && selectedEmail ? ' is-open' : ''}`}
        onClick={() => setSelectedId(null)}
        aria-hidden="true"
      />

      <EmailDetail
        email={selectedEmail}
        isDrawer={isDrawer}
        onClose={() => setSelectedId(null)}
        onToggleRead={toggleRead}
        onToggleArchive={toggleArchive}
        onToggleTask={toggleTask}
      />

      <CatchUpDialog
        open={briefingOpen}
        emails={emails}
        onClose={() => setBriefingOpen(false)}
        onOpenEmail={openFromBriefing}
        onMarkRead={markRead}
      />
    </div>
  )
}
