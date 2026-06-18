import { GRID_START_HOUR } from '../constants'
import type { VitaminDose } from '../types'
import { formatVitaminDoseSummary } from '../utils/vitamin'

interface VitaminSidebarReadOnlyProps {
  doses: VitaminDose[]
}

export function VitaminSidebarReadOnly({ doses }: VitaminSidebarReadOnlyProps) {
  return (
    <aside className="vitamin-sidebar vitamin-sidebar-readonly">
      <div className="vitamin-sidebar-header">
        <h3>Vitamin schedule</h3>
        <p>Read-only view of your doses for this day.</p>
      </div>

      {doses.length === 0 ? (
        <p className="vitamin-sidebar-empty muted">No doses planned for this day.</p>
      ) : (
        <ul className="vitamin-dose-list">
          {doses.map((dose, index) => {
            const summary = formatVitaminDoseSummary(dose, GRID_START_HOUR)
            return (
              <li key={dose.id} className="vitamin-dose-card vitamin-dose-card-readonly">
                <strong>Dose {index + 1}</strong>
                <span className="vitamin-readonly-row">
                  <span>Start</span>
                  <span>{summary.doseLabel}</span>
                </span>
                <span className="vitamin-readonly-row">
                  <span>Kick in</span>
                  <span>{dose.kickInMinutes}m</span>
                </span>
                <span className="vitamin-readonly-row">
                  <span>Active</span>
                  <span>{summary.activeLabel}</span>
                </span>
                <span className="vitamin-readonly-row">
                  <span>Redose</span>
                  <span>{summary.redoseLabel}</span>
                </span>
              </li>
            )
          })}
        </ul>
      )}
    </aside>
  )
}
