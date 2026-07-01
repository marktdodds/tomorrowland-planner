import { FESTIVAL_WEEKENDS, WEEKEND_LABELS, type FestivalWeekend } from '../constants'

interface WeekendSwitcherProps {
  activeWeekend: FestivalWeekend
  onChange: (weekend: FestivalWeekend) => void
}

export function WeekendSwitcher({ activeWeekend, onChange }: WeekendSwitcherProps) {
  return (
    <div className="weekend-switcher" role="group" aria-label="Festival weekend">
      {FESTIVAL_WEEKENDS.map((weekend) => (
        <button
          key={weekend}
          type="button"
          className={`weekend-switcher-btn ${activeWeekend === weekend ? 'active' : ''}`}
          aria-pressed={activeWeekend === weekend}
          onClick={() => onChange(weekend)}
        >
          {WEEKEND_LABELS[weekend]}
        </button>
      ))}
    </div>
  )
}
