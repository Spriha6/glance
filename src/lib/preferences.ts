import type { IconName } from '../components/Icon'
import type { Email, FocusArea, Sender } from '../types'

export const FOCUS_OPTIONS: { id: FocusArea; label: string; description: string; icon: IconName }[] = [
  { id: 'deadlines', label: 'Deadlines', description: 'Things due in the next few days', icon: 'clock' },
  { id: 'work', label: 'Work', description: 'Requests and decisions from colleagues and clients', icon: 'flag' },
  { id: 'people', label: 'Important people', description: 'Anyone you pick in the next step', icon: 'star' },
  { id: 'personal', label: 'Personal messages', description: 'Friends and family, not just work', icon: 'user' },
]

/** People (not newsletters or automated senders) from the mock inbox, most recent first. */
export function peopleFrom(emails: Email[]): Sender[] {
  const seen = new Map<string, Sender>()
  for (const email of emails) {
    if (email.category !== 'work' && email.category !== 'personal') continue
    if (!seen.has(email.sender.email)) seen.set(email.sender.email, email.sender)
  }
  return [...seen.values()]
}
