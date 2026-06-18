import type { ScheduleViewOptions } from '../utils/performances'

interface ScheduleViewTogglesProps {
  view: ScheduleViewOptions
  hasArtistFilter: boolean
  onChange: (view: ScheduleViewOptions) => void
}

export function ScheduleViewToggles({ view, hasArtistFilter, onChange }: ScheduleViewTogglesProps) {
  const disabled = !hasArtistFilter

  return (
    <div className="schedule-view-toggles" role="group" aria-label="Schedule view options">
      <label className={`view-toggle ${view.expandStages ? 'active' : ''} ${disabled || view.fullLineup ? 'disabled' : ''}`}>
        <input
          type="checkbox"
          checked={view.expandStages}
          disabled={disabled || view.fullLineup}
          onChange={(event) =>
            onChange({ ...view, expandStages: event.target.checked })
          }
        />
        <span className="view-toggle-copy">
          <strong>All sets on my stages</strong>
          <small>Every performance on stages where your artists play</small>
        </span>
      </label>

      <label className={`view-toggle ${view.fullLineup ? 'active' : ''} ${disabled ? 'disabled' : ''}`}>
        <input
          type="checkbox"
          checked={view.fullLineup}
          disabled={disabled}
          onChange={(event) =>
            onChange({
              expandStages: event.target.checked ? false : view.expandStages,
              fullLineup: event.target.checked,
            })
          }
        />
        <span className="view-toggle-copy">
          <strong>Full weekend lineup</strong>
          <small>All stages and sets — useful for filling gaps</small>
        </span>
      </label>
    </div>
  )
}
