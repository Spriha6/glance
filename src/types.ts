export type Priority = 'urgent' | 'important' | 'normal'

export type Category = 'work' | 'personal' | 'updates' | 'newsletter'

/** Mailbox lists in the sidebar. */
export type ListView = 'inbox' | 'action' | 'newsletters' | 'archive'

/** Everything the main area can show: the daily home or a mailbox list. */
export type View = 'home' | ListView

export type PriorityFilter = 'all' | Priority

export interface Sender {
  name: string
  email: string
  organization?: string
}

export interface ActionItem {
  id: string
  text: string
  done: boolean
}

export interface Deadline {
  label: string
  due: Date
}

export interface Email {
  id: string
  sender: Sender
  subject: string
  preview: string
  body: string[]
  receivedAt: Date
  unread: boolean
  archived: boolean
  priority: Priority
  category: Category
  summary: string
  actionItems: ActionItem[]
  deadline?: Deadline
  /** A direct question the sender asked you, if any. */
  asksYou?: string
  /** Mock AI-suggested reply. Never sent — the user edits and approves it. */
  suggestedReply?: string
}

/** What the user told onboarding matters most. */
export type FocusArea = 'deadlines' | 'work' | 'people' | 'personal'

export interface Preferences {
  focus: FocusArea[]
  /** Sender email addresses the user marked as important. */
  importantSenders: string[]
}

export interface ReplyDraft {
  text: string
  approved: boolean
}
