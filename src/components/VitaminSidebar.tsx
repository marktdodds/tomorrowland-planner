import { VITAMIN_DEFAULTS } from '../constants'
import type { VitaminDose } from '../types'

interface VitaminSidebarProps {
  doses: VitaminDose[]
  onChange: (doses: VitaminDose[]) => void
}

export function VitaminSidebar({ doses, onChange }: VitaminSidebarProps) {
  const updateDose = (id: string, patch: Partial<VitaminDose>) => {
    onChange(doses.map((dose) => (dose.id === id ? { ...dose, ...patch } : dose)))
  }

  const removeDose = (id: string) => {
    onChange(doses.filter((dose) => dose.id !== id))
  }

  const addDose = () => {
    onChange([
      ...doses,
      {
        id: crypto.randomUUID(),
        startTime: VITAMIN_DEFAULTS.startTime,
        kickInMinutes: VITAMIN_DEFAULTS.kickInMinutes,
        runMinutes: VITAMIN_DEFAULTS.runMinutes,
      },
    ])
  }

  return (
    <aside className="vitamin-sidebar">
      <div className="vitamin-sidebar-header">
        <h3>Vitamin schedule</h3>
        <p>Plan doses, kick-in, and your active window.</p>
      </div>

      {doses.length === 0 ? (
        <p className="vitamin-sidebar-empty muted">No doses for this day yet.</p>
      ) : (
        <ul className="vitamin-dose-list">
          {doses.map((dose, index) => (
            <li key={dose.id} className="vitamin-dose-card">
              <div className="vitamin-dose-card-header">
                <strong>Dose {index + 1}</strong>
                <button
                  type="button"
                  className="button button-ghost vitamin-remove"
                  onClick={() => removeDose(dose.id)}
                  aria-label={`Remove dose ${index + 1}`}
                >
                  ×
                </button>
              </div>

              <label className="vitamin-field">
                <span>Start</span>
                <input
                  type="time"
                  value={dose.startTime}
                  onChange={(event) => updateDose(dose.id, { startTime: event.target.value })}
                />
              </label>

              <label className="vitamin-field">
                <span>Kick in (min)</span>
                <input
                  type="number"
                  min={0}
                  step={5}
                  value={dose.kickInMinutes}
                  onChange={(event) =>
                    updateDose(dose.id, { kickInMinutes: Number(event.target.value) || 0 })
                  }
                />
              </label>

              <label className="vitamin-field">
                <span>Active (min)</span>
                <input
                  type="number"
                  min={0}
                  step={5}
                  value={dose.runMinutes}
                  onChange={(event) =>
                    updateDose(dose.id, { runMinutes: Number(event.target.value) || 0 })
                  }
                />
              </label>
            </li>
          ))}
        </ul>
      )}

      <button type="button" className="button button-ghost vitamin-add" onClick={addDose}>
        + Add dose
      </button>
    </aside>
  )
}
