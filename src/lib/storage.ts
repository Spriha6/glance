import type { Email, Preferences, ReplyDraft } from '../types'

/**
 * Demo persistence in localStorage. Every access is guarded: private windows or
 * blocked storage simply fall back to a fresh, in-memory session.
 */

const STORAGE_KEY = 'inbox-ai:v1'

interface StoredEmail {
  unread: boolean
  archived: boolean
  doneTaskIds: string[]
}

export interface StoredState {
  onboarded: boolean
  preferences: Preferences
  todoIds: string[]
  dismissedIds: string[]
  drafts: Record<string, ReplyDraft>
  emails: Record<string, StoredEmail>
  /** Local date ("2026-11-03") the user hid "Needs your attention"; they come back the next day. */
  highlightsHiddenOn?: string
}

/** Today's local date as YYYY-MM-DD. */
export const todayKey = (date = new Date()) => date.toLocaleDateString('en-CA')

export const DEFAULT_PREFERENCES: Preferences = { focus: ['deadlines', 'work'], importantSenders: [] }

export function loadState(): Partial<StoredState> {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as Partial<StoredState>) : {}
  } catch {
    return {}
  }
}

export function saveState(state: StoredState) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch {
    // Storage unavailable — keep working in memory.
  }
}

export function clearState() {
  try {
    window.localStorage.removeItem(STORAGE_KEY)
  } catch {
    // Nothing to clear.
  }
}

/** Snapshot of the per-email state worth keeping between visits. */
export function serializeEmails(emails: Email[]): Record<string, StoredEmail> {
  return Object.fromEntries(
    emails.map((email) => [
      email.id,
      {
        unread: email.unread,
        archived: email.archived,
        doneTaskIds: email.actionItems.filter((item) => item.done).map((item) => item.id),
      },
    ]),
  )
}

/** Re-applies saved read/archive/task state on top of the mock data. */
export function restoreEmails(emails: Email[], saved: Record<string, StoredEmail> | undefined): Email[] {
  if (!saved) return emails
  return emails.map((email) => {
    const stored = saved[email.id]
    if (!stored) return email
    const done = new Set(stored.doneTaskIds)
    return {
      ...email,
      unread: stored.unread,
      archived: stored.archived,
      actionItems: email.actionItems.map((item) => ({ ...item, done: done.has(item.id) })),
    }
  })
}
