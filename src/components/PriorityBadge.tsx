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
