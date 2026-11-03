const DAY_MS = 86_400_000

function startOfDay(date: Date) {
  const copy = new Date(date)
  copy.setHours(0, 0, 0, 0)
  return copy
}

function dayDifference(date: Date, now: Date) {
  return Math.round((startOfDay(date).getTime() - startOfDay(now).getTime()) / DAY_MS)
}

export const formatTime = (date: Date) => date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })

const formatMonthDay = (date: Date) => date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })

/** Compact timestamp for list rows: "9:42 AM", "Yesterday", "Mon", "Oct 14". */
export function formatTimestamp(date: Date, now = new Date()) {
  const diff = dayDifference(date, now)
  if (diff === 0) return formatTime(date)
  if (diff === -1) return 'Yesterday'
  if (diff > -7) return date.toLocaleDateString('en-US', { weekday: 'short' })
  return formatMonthDay(date)
}

/** Full timestamp for the detail view: "Mon, Oct 20 · 9:42 AM". */
export function formatFullDate(date: Date) {
  const day = date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
  return `${day} · ${formatTime(date)}`
}

/** Deadline label: "Today, 5:00 PM", "Tomorrow, 12:00 PM", "Thu, 5:00 PM", "Oct 30, 5:00 PM". */
export function formatDue(date: Date, now = new Date()) {
  const diff = dayDifference(date, now)
  const time = formatTime(date)
  if (diff === 0) return `Today, ${time}`
  if (diff === 1) return `Tomorrow, ${time}`
  if (diff > 1 && diff < 7) return `${date.toLocaleDateString('en-US', { weekday: 'short' })}, ${time}`
  return `${formatMonthDay(date)}, ${time}`
}

/** Deadline phrased for a sentence: "tomorrow at 5:00 PM", "on Thursday at 12:00 PM". */
export function formatDueInSentence(date: Date, now = new Date()) {
  const diff = dayDifference(date, now)
  const time = formatTime(date)
  if (diff === 0) return `today at ${time}`
  if (diff === 1) return `tomorrow at ${time}`
  if (diff > 1 && diff < 7) return `on ${date.toLocaleDateString('en-US', { weekday: 'long' })} at ${time}`
  return `on ${formatMonthDay(date)} at ${time}`
}

/** True when a deadline falls within the next 36 hours. */
export function isDueSoon(date: Date, now = new Date()) {
  const remaining = date.getTime() - now.getTime()
  return remaining > 0 && remaining < 36 * 3_600_000
}

export function greeting(now = new Date()) {
  const hour = now.getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 18) return 'Good afternoon'
  return 'Good evening'
}

export const formatLongDate = (date = new Date()) =>
  date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })

export const pluralize = (count: number, singular: string, plural = `${singular}s`) =>
  `${count} ${count === 1 ? singular : plural}`
