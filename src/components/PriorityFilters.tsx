import { PRIORITY_FILTERS } from '../lib/filters'
import type { PriorityFilter } from '../types'

interface PriorityFiltersProps {
  value: PriorityFilter
  counts: Record<PriorityFilter, number>
  onChange: (value: PriorityFilter) => void
}

export function PriorityFilters({ value, counts, onChange }: PriorityFiltersProps) {
  return (
    <div className="filters" role="group" aria-label="Filter by priority">
      {PRIORITY_FILTERS.map((filter) => (
        <button
          key={filter.id}
          type="button"
          className={`filter filter--${filter.id}`}
          aria-pressed={value === filter.id}
          onClick={() => onChange(filter.id)}
        >
          {filter.id !== 'all' && <span className="filter__dot" aria-hidden="true" />}
          {filter.label}
          <span className="filter__count">{counts[filter.id]}</span>
        </button>
      ))}
    </div>
  )
}
