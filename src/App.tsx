import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { CatchUpDialog } from './components/CatchUpDialog'
import { ComposeWindow } from './components/ComposeWindow'
import { EmailDetail } from './components/EmailDetail'
import { EmailList } from './components/EmailList'
import { Icon } from './components/Icon'
import { Home } from './components/Home'
import { Onboarding } from './components/Onboarding'
import { PriorityFilters } from './components/PriorityFilters'
import { SettingsDialog } from './components/SettingsDialog'
import { Sidebar } from './components/Sidebar'
import { SubscriptionManager } from './components/SubscriptionManager'
import { Toast } from './components/Toast'
import type { ToastMessage } from './components/Toast'
import { TopBar } from './components/TopBar'
import { initialEmails } from './data/emails'
import { useMediaQuery } from './hooks/useMediaQuery'
import {
  VIEWS,
  countByPriority,
  countUnreadByView,
  hasPendingActions,
  matchesPriority,
  matchesQuery,
  matchesView,
  sortNewestFirst,
} from './lib/filters'
import { EMPTY_DRAFT, hasContent, sentEmail, storeSent } from './lib/compose'
import { pluralize } from './lib/format'
import { buildHighlights, highlightFor } from './lib/highlights'
import { peopleFrom } from './lib/preferences'
import { buildSubscriptions } from './lib/promotions'
import {
  DEFAULT_PREFERENCES,
  clearState,
  loadState,
  restoreEmails,
  saveState,
  serializeEmails,
  todayKey,
} from './lib/storage'
import type { ComposeDraft, Email, ListView, Preferences, PriorityFilter, ReplyDraft, View } from './types'
import './App.css'

// Below this width the detail panel becomes a slide-over drawer (keep in sync with App.css).
const DRAWER_QUERY = '(max-width: 1240px)'
// Below this width the sidebar becomes an off-canvas menu (keep in sync with App.css).
const MOBILE_QUERY = '(max-width: 820px)'

function viewFor(email: Email): ListView {
  if (email.archived) return 'archive'
  return email.category === 'newsletter' ? 'newsletters' : 'inbox'
}

export default function App() {
  const [saved] = useState(loadState)
  const [emails, setEmails] = useState<Email[]>(() => [
    ...(saved.sent ?? []).map(sentEmail),
    ...restoreEmails(initialEmails, saved.emails),
  ])
  const [onboarded, setOnboarded] = useState(saved.onboarded ?? false)
  const [preferences, setPreferences] = useState<Preferences>(saved.preferences ?? DEFAULT_PREFERENCES)
  const [todoIds, setTodoIds] = useState<ReadonlySet<string>>(() => new Set(saved.todoIds))
  const [dismissedIds, setDismissedIds] = useState<ReadonlySet<string>>(() => new Set(saved.dismissedIds))
  const [drafts, setDrafts] = useState<Record<string, ReplyDraft>>(saved.drafts ?? {})
  const [highlightsHiddenOn, setHighlightsHiddenOn] = useState(saved.highlightsHiddenOn)
  const [unsubscribed, setUnsubscribed] = useState<ReadonlySet<string>>(() => new Set(saved.unsubscribed))
  const [composeDraft, setComposeDraft] = useState<ComposeDraft | null>(null)
  const [composeOpen, setComposeOpen] = useState(false)
  const highlightsHidden = highlightsHiddenOn === todayKey()

  // Once today's highlights are put away, the app opens straight to the inbox until tomorrow.
  const [view, setView] = useState<View>(highlightsHidden ? 'inbox' : 'home')
  const [priority, setPriority] = useState<PriorityFilter>('all')
  const [query, setQuery] = useState('')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [replyFocusId, setReplyFocusId] = useState<string | null>(null)
  const [briefingOpen, setBriefingOpen] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [introOpen, setIntroOpen] = useState(!onboarded)
  const [toast, setToast] = useState<ToastMessage | null>(null)
  const [checkedIds, setCheckedIds] = useState<ReadonlySet<string>>(() => new Set())
  const [railCollapsed, setRailCollapsed] = useState(false)
  const [navOpen, setNavOpen] = useState(false)
  const isDrawer = useMediaQuery(DRAWER_QUERY)
  const isMobile = useMediaQuery(MOBILE_QUERY)
  const searchRef = useRef<HTMLInputElement>(null)

  // Persist preferences and progress so the demo picks up where the user left off.
  useEffect(() => {
    saveState({
      onboarded,
      preferences,
      todoIds: [...todoIds],
      dismissedIds: [...dismissedIds],
      drafts,
      emails: serializeEmails(emails),
      highlightsHiddenOn,
      unsubscribed: [...unsubscribed],
      sent: emails.filter((email) => email.category === 'sent').map(storeSent),
    })
  }, [onboarded, preferences, todoIds, dismissedIds, drafts, emails, highlightsHiddenOn, unsubscribed])

  const listView: ListView = view === 'home' ? 'inbox' : view
  const viewEmails = useMemo(
    () => sortNewestFirst(emails.filter((email) => matchesView(email, listView))),
    [emails, listView],
  )
  const searchedEmails = useMemo(() => viewEmails.filter((email) => matchesQuery(email, query)), [viewEmails, query])
  const visibleEmails = useMemo(
    () => searchedEmails.filter((email) => matchesPriority(email, priority)),
    [searchedEmails, priority],
  )
  const priorityCounts = useMemo(() => countByPriority(searchedEmails), [searchedEmails])
  const unreadCounts = useMemo(() => countUnreadByView(emails), [emails])
  const highlights = useMemo(() => buildHighlights(emails, preferences, dismissedIds), [emails, preferences, dismissedIds])
  const people = useMemo(() => peopleFrom(initialEmails), [])
  const subscriptions = useMemo(() => buildSubscriptions(emails, unsubscribed), [emails, unsubscribed])
  const selectedEmail = emails.find((email) => email.id === selectedId) ?? null

  // Promotions never count toward "new email" totals.
  const unreadTotal = emails.filter((email) => !email.archived && email.unread && email.category !== 'promotion').length
  const isFiltered = query.trim() !== '' || priority !== 'all'
  const viewConfig = VIEWS.find((item) => item.id === listView) ?? VIEWS[0]

  const showToast = useCallback((text: string, undo?: () => void) => setToast({ id: Date.now(), text, undo }), [])
  const hideToast = useCallback(() => setToast(null), [])

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
    if (view !== 'home' && open && targets.has(open.id) && !matchesView({ ...open, archived }, view)) {
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

  function changeQuery(next: string) {
    setQuery(next)
    // Searching from the daily home jumps to the inbox results.
    if (view === 'home' && next.trim()) changeView('inbox')
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

  function openEmail(id: string) {
    setReplyFocusId(null)
    setSelectedId(id)
  }

  function replyTo(id: string) {
    setReplyFocusId(id)
    setSelectedId(id)
  }

  function openFromBriefing(id: string) {
    const email = emails.find((item) => item.id === id)
    if (!email) return
    setView(viewFor(email))
    resetFilters()
    openEmail(id)
    setBriefingOpen(false)
  }

  // ---- Highlights & to-dos ----

  function addTodo(id: string) {
    setTodoIds((current) => new Set(current).add(id))
    showToast('Added to your to-dos', () =>
      setTodoIds((current) => new Set([...current].filter((item) => item !== id))),
    )
  }

  function markDone(id: string) {
    const before = emails.find((email) => email.id === id)
    if (!before) return
    updateEmail(id, (email) => ({
      ...email,
      unread: false,
      actionItems: email.actionItems.map((item) => ({ ...item, done: true })),
    }))
    showToast('Marked done', () => updateEmail(id, () => before))
  }

  function dismissHighlight(id: string) {
    setDismissedIds((current) => new Set(current).add(id))
    showToast('Moved to your regular inbox', () =>
      setDismissedIds((current) => new Set([...current].filter((item) => item !== id))),
    )
  }

  function hideHighlights() {
    setHighlightsHiddenOn(todayKey())
    changeView('inbox')
    showToast('Highlights hidden for today', () => {
      setHighlightsHiddenOn(undefined)
      changeView('home')
    })
  }

  function showHighlights() {
    setHighlightsHiddenOn(undefined)
    changeView('home')
  }

  // ---- Promotions ----

  function unsubscribe(senderEmails: string[]) {
    const senders = new Set(senderEmails)
    const archivedIds = emails
      .filter((email) => email.category === 'promotion' && !email.archived && senders.has(email.sender.email))
      .map((email) => email.id)
    const names = subscriptions.filter((item) => senders.has(item.sender.email)).map((item) => item.sender.name)

    setUnsubscribed((current) => new Set([...current, ...senderEmails]))
    if (archivedIds.length > 0) setArchived(archivedIds, true)

    const who = names.length === 1 ? names[0] : `${names.length} senders`
    const archivedNote = archivedIds.length > 0 ? ` and archived ${pluralize(archivedIds.length, 'email')}` : ''
    showToast(`Unsubscribed from ${who}${archivedNote}`, () => {
      setUnsubscribed((current) => new Set([...current].filter((item) => !senders.has(item))))
      const restore = new Set(archivedIds)
      setEmails((current) => current.map((email) => (restore.has(email.id) ? { ...email, archived: false } : email)))
    })
  }

  // ---- Compose ----

  function openCompose(prefill?: ComposeDraft) {
    setComposeDraft((current) => prefill ?? current ?? EMPTY_DRAFT)
    setComposeOpen(true)
    setNavOpen(false)
  }

  function closeCompose() {
    setComposeOpen(false)
    if (composeDraft && hasContent(composeDraft)) showToast('Draft saved')
    else setComposeDraft(null)
  }

  function discardCompose() {
    const discarded = composeDraft
    setComposeOpen(false)
    setComposeDraft(null)
    if (discarded && hasContent(discarded)) {
      showToast('Draft discarded', () => {
        setComposeDraft(discarded)
        setComposeOpen(true)
      })
    }
  }

  function sendCompose(draft: ComposeDraft) {
    const message = sentEmail({ ...draft, id: `sent-${Date.now()}`, sentAt: new Date().toISOString() })
    setEmails((current) => [message, ...current])
    setComposeOpen(false)
    setComposeDraft(null)
    // Like Gmail's "Undo send": pulls the message back into the Compose window.
    showToast('Message sent', () => {
      setEmails((current) => current.filter((email) => email.id !== message.id))
      setComposeDraft(draft)
      setComposeOpen(true)
    })
  }

  function resubscribe(senderEmail: string) {
    setUnsubscribed((current) => new Set([...current].filter((item) => item !== senderEmail)))
  }

  function clearCompletedTodos() {
    setTodoIds(
      (current) =>
        new Set([...current].filter((id) => emails.find((email) => email.id === id && hasPendingActions(email)))),
    )
  }

  function changeDraft(id: string, draft: ReplyDraft) {
    setDrafts((current) => ({ ...current, [id]: draft }))
  }

  const todoEmails = [...todoIds]
    .map((id) => emails.find((email) => email.id === id))
    .filter((email): email is Email => email !== undefined && !email.archived)

  const attentionIds = new Set(highlights.attention.map((item) => item.email.id))
  const inboxEmails = emails.filter((email) => matchesView(email, 'inbox'))

  // ---- Onboarding & settings ----

  function finishOnboarding(next: Preferences) {
    setPreferences(next)
    setOnboarded(true)
    setIntroOpen(false)
    changeView('home')
  }

  function skipOnboarding() {
    setOnboarded(true)
    setIntroOpen(false)
  }

  function savePreferences(next: Preferences) {
    setPreferences(next)
    setSettingsOpen(false)
    showToast('Preferences saved')
  }

  function openSettings() {
    setNavOpen(false)
    setSettingsOpen(true)
  }

  function replayIntro() {
    setSettingsOpen(false)
    setIntroOpen(true)
  }

  function resetDemo() {
    clearState()
    setEmails(initialEmails)
    setPreferences(DEFAULT_PREFERENCES)
    setTodoIds(new Set())
    setDismissedIds(new Set())
    setDrafts({})
    setHighlightsHiddenOn(undefined)
    setUnsubscribed(new Set())
    setComposeDraft(null)
    setComposeOpen(false)
    setSelectedId(null)
    setSettingsOpen(false)
    setOnboarded(false)
    setIntroOpen(true)
    changeView('home')
  }

  const dialogOpen = briefingOpen || settingsOpen || introOpen

  // Keyboard shortcuts: "/" focuses search, "c" composes, Escape closes the menu or drawer.
  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (dialogOpen) return
      const target = event.target
      const isTyping = target instanceof Element && target.closest('input, textarea, [contenteditable="true"]') !== null
      if (event.key === '/' && !isTyping) {
        event.preventDefault()
        searchRef.current?.focus()
      }
      if (event.key === 'c' && !isTyping && !event.metaKey && !event.ctrlKey && !event.altKey) {
        event.preventDefault()
        setComposeDraft((current) => current ?? EMPTY_DRAFT)
        setComposeOpen(true)
      }
      if (event.key === 'Escape') {
        if (navOpen) setNavOpen(false)
        else if (isDrawer && selectedId) setSelectedId(null)
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [isDrawer, selectedId, dialogOpen, navOpen])

  const appClass = ['app', railCollapsed && 'is-rail-collapsed', !selectedEmail && 'no-detail'].filter(Boolean).join(' ')

  return (
    <div className={appClass}>
      <TopBar
        query={query}
        onQueryChange={changeQuery}
        onToggleNav={toggleNav}
        navExpanded={isMobile ? navOpen : !railCollapsed}
        onOpenSettings={openSettings}
        onOpenHelp={() => setIntroOpen(true)}
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
        onCompose={() => openCompose()}
        onOpenSettings={openSettings}
      />
      <div className={`nav-backdrop${isMobile && navOpen ? ' is-open' : ''}`} onClick={() => setNavOpen(false)} aria-hidden="true" />

      <main className="main">
        {view === 'home' ? (
          <Home
            highlights={highlights}
            highlightsHidden={highlightsHidden}
            onHideHighlights={hideHighlights}
            onShowHighlights={showHighlights}
            todoEmails={todoEmails}
            todoIds={todoIds}
            newCount={unreadTotal}
            otherNewCount={
              inboxEmails.filter((email) => email.unread && (highlightsHidden || !attentionIds.has(email.id))).length
            }
            inboxCount={inboxEmails.length}
            newsletterUnread={unreadCounts.newsletters}
            promotionUnread={unreadCounts.promotions}
            unsubscribeSuggestions={subscriptions.filter((item) => item.suggested && !item.unsubscribed).length}
            actionCount={emails.filter((email) => matchesView(email, 'action')).length}
            onOpen={openEmail}
            onReply={replyTo}
            onAddTodo={addTodo}
            onDone={markDone}
            onDismiss={dismissHighlight}
            onToggleTask={toggleTask}
            onClearCompleted={clearCompletedTodos}
            onBrowse={changeView}
          />
        ) : (
          <EmailList
            title={viewConfig.label}
            emails={visibleEmails}
            selectedId={selectedId}
            checkedIds={checkedIds}
            query={query}
            emptyMessage={viewConfig.emptyMessage}
            isFiltered={isFiltered}
            inArchive={view === 'archive'}
            tabs={
              // Priority tabs only make sense for mail people send you.
              view === 'promotions' || view === 'sent' ? undefined : (
                <PriorityFilters value={priority} counts={priorityCounts} onChange={setPriority} />
              )
            }
            banner={
              view === 'promotions' && !query.trim() ? (
                <SubscriptionManager subscriptions={subscriptions} onUnsubscribe={unsubscribe} onResubscribe={resubscribe} />
              ) : undefined
            }
            onSelect={openEmail}
            onCheck={checkEmail}
            onCheckAll={checkAll}
            onToggleRead={toggleRead}
            onToggleArchive={toggleArchive}
            onSetUnread={setUnread}
            onSetArchived={setArchived}
            onResetFilters={resetFilters}
          />
        )}
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
        highlight={selectedId ? highlightFor(highlights, selectedId) : undefined}
        onTodo={selectedId !== null && todoIds.has(selectedId)}
        draft={selectedId ? drafts[selectedId] : undefined}
        focusReply={selectedId !== null && replyFocusId === selectedId}
        onAddTodo={addTodo}
        onDismissHighlight={dismissHighlight}
        onDraftChange={changeDraft}
        subscription={
          selectedEmail?.category === 'promotion'
            ? subscriptions.find((item) => item.sender.email === selectedEmail.sender.email)
            : undefined
        }
        onUnsubscribe={unsubscribe}
        onResubscribe={resubscribe}
        onCompose={openCompose}
      />

      <CatchUpDialog
        open={briefingOpen}
        emails={emails}
        onClose={() => setBriefingOpen(false)}
        onOpenEmail={openFromBriefing}
        onMarkRead={markRead}
      />

      <SettingsDialog
        open={settingsOpen}
        people={people}
        preferences={preferences}
        onSave={savePreferences}
        onClose={() => setSettingsOpen(false)}
        onReplayIntro={replayIntro}
        onResetDemo={resetDemo}
      />

      {introOpen && (
        <Onboarding
          people={people}
          initialPreferences={preferences}
          onFinish={finishOnboarding}
          onSkip={skipOnboarding}
        />
      )}

      {isMobile && !composeOpen && !selectedEmail && (
        <button type="button" className="button compose-fab" onClick={() => openCompose()}>
          <Icon name="pencil" size={20} />
          Compose
        </button>
      )}

      {composeOpen && composeDraft && (
        <ComposeWindow
          draft={composeDraft}
          contacts={people}
          onChange={setComposeDraft}
          onSend={sendCompose}
          onClose={closeCompose}
          onDiscard={discardCompose}
        />
      )}

      <Toast toast={toast} onDismiss={hideToast} />
    </div>
  )
}
