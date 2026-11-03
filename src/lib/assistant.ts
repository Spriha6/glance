import type { Email } from '../types'
import { formatDueInSentence } from './format'

/**
 * Mock "Ask about this email" responder. Answers come from the email's own mock
 * data using simple keyword matching; a real model will replace this later.
 */
export function answerQuestion(email: Email, question: string, now = new Date()): string {
  const q = question.toLowerCase()
  const firstName = email.sender.name.split(' ')[0]
  const pending = email.actionItems.filter((item) => !item.done)

  if (/\b(reply|respond|draft|write back|answer)\b/.test(q)) {
    const commitment = email.deadline
      ? `I’ll have this to you ${formatDueInSentence(email.deadline.due, now)}.`
      : 'I’ll follow up shortly.'
    return `Here’s a short draft:\n\nHi ${firstName},\n\nThanks for the note — I’m on it. ${commitment}\n\nBest,`
  }

  if (/\b(deadline|due|when|by when|date|time)\b/.test(q)) {
    if (!email.deadline) return 'This email doesn’t mention a specific deadline.'
    return `It’s due ${formatDueInSentence(email.deadline.due, now)} (${email.deadline.label}).`
  }

  if (/\b(do|todo|to-do|action|actions|task|tasks|need|should)\b/.test(q)) {
    if (email.actionItems.length === 0) return 'Nothing — this one is informational. No reply or follow-up needed.'
    if (pending.length === 0) return 'You’ve already completed every action item from this email. 🎉'
    return `You have ${pending.length} open item${pending.length === 1 ? '' : 's'}:\n${pending.map((item) => `• ${item.text}`).join('\n')}`
  }

  if (/\b(who|sender|from)\b/.test(q)) {
    const org = email.sender.organization ? ` from ${email.sender.organization}` : ''
    return `This is from ${email.sender.name}${org} (${email.sender.email}).`
  }

  return email.summary
}
