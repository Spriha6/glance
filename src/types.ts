export type Priority = 'urgent' | 'important' | 'normal'

export type Category = 'work' | 'personal' | 'updates' | 'newsletter'

export type View = 'inbox' | 'action' | 'newsletters' | 'archive'

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
}
