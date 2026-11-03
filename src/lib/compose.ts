import type { ComposeDraft, Email } from '../types'
import { DEMO_USER } from './brand'

/** What's kept in storage for each sent message. */
export interface StoredSent extends ComposeDraft {
  id: string
  sentAt: string
}

export const EMPTY_DRAFT: ComposeDraft = { to: '', subject: '', body: '' }

export const hasContent = (draft: ComposeDraft) => Boolean(draft.to.trim() || draft.subject.trim() || draft.body.trim())

/** "Priya Raman <priya@…>" → "Priya Raman"; a bare address stays as is. */
export const recipientName = (to: string) => to.split('<')[0].trim() || to.trim()

/** Turns a sent draft into a message in the Sent mailbox. */
export function sentEmail({ id, to, subject, body, sentAt }: StoredSent): Email {
  const paragraphs = body.split(/\n{2,}/).map((part) => part.trim()).filter(Boolean)
  return {
    id,
    sender: DEMO_USER,
    to,
    subject: subject.trim() || '(no subject)',
    body: paragraphs.length > 0 ? paragraphs : [''],
    preview: paragraphs[0]?.replace(/\n/g, ' ') ?? '',
    receivedAt: new Date(sentAt),
    unread: false,
    archived: false,
    priority: 'normal',
    category: 'sent',
    summary: '',
    actionItems: [],
  }
}

export function storeSent(email: Email): StoredSent {
  return {
    id: email.id,
    to: email.to ?? '',
    subject: email.subject,
    body: email.body.join('\n\n'),
    sentAt: email.receivedAt.toISOString(),
  }
}
