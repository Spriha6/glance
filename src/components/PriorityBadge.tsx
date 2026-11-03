import type { Priority } from '../types'

const LABELS: Record<Priority, string | null> = {
  urgent: 'Urgent',
  important: 'Important',
  normal: null,
}

export function PriorityBadge({ priority }: { priority: Priority }) {
  const label = LABELS[priority]
  if (!label) return null
  return <span className={`badge badge--${priority}`}>{label}</span>
}

/** Compact list marker: red dot for urgent, blue for important, an empty slot otherwise (keeps subjects aligned). */
export function PriorityDot({ priority }: { priority: Priority }) {
  const label = LABELS[priority]
  if (!label) return <span className="priority-dot" aria-hidden="true" />
  return (
    <span className={`priority-dot priority-dot--${priority}`} title={label}>
      <span className="visually-hidden">{label}. </span>
    </span>
  )
}
