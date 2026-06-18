import { DAY_LABELS, DAY_ORDER } from '../constants'

interface DayTabsProps {
  activeDay: (typeof DAY_ORDER)[number]
  counts: Record<string, number>
  onChange: (day: (typeof DAY_ORDER)[number]) => void
}

export function DayTabs({ activeDay, counts, onChange }: DayTabsProps) {
  return (
    <div className="day-tabs" role="tablist" aria-label="Festival days">
      {DAY_ORDER.map((day) => (
        <button
          key={day}
          type="button"
          role="tab"
          aria-selected={activeDay === day}
          className={`day-tab ${activeDay === day ? 'active' : ''}`}
          onClick={() => onChange(day)}
        >
          <span>{DAY_LABELS[day]}</span>
          <small>{counts[day] ?? 0} sets</small>
        </button>
      ))}
    </div>
  )
}
