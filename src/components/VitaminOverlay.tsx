import { PIXELS_PER_HOUR } from '../constants'
import type { VitaminDoseWindow } from '../types'
import type { ScheduleTimeScale } from '../utils/compactSchedule'

interface VitaminOverlayProps {
  windows: VitaminDoseWindow[]
  gridHeight: number
  totalMinutes: number
  timeScale?: ScheduleTimeScale
}

export function VitaminOverlay({
  windows,
  gridHeight,
  totalMinutes,
  timeScale,
}: VitaminOverlayProps) {
  if (windows.length === 0) {
    return null
  }

  const pixelsPerMinute = PIXELS_PER_HOUR / 60

  return (
    <div className="vitamin-overlay-layer" style={{ height: gridHeight }} aria-hidden="true">
      {windows.map((window) => {
        const kickInTop = timeScale
          ? timeScale.minutesToTop(window.startMinutes)
          : window.startMinutes * pixelsPerMinute
        const kickInHeight = timeScale
          ? timeScale.minutesToHeight(window.startMinutes, window.effectStartMinutes)
          : window.dose.kickInMinutes * pixelsPerMinute
        const activeTop = timeScale
          ? timeScale.minutesToTop(window.effectStartMinutes)
          : window.effectStartMinutes * pixelsPerMinute
        const activeHeight = timeScale
          ? timeScale.minutesToHeight(window.effectStartMinutes, window.effectEndMinutes)
          : window.dose.runMinutes * pixelsPerMinute

        const showKickIn =
          window.dose.kickInMinutes > 0 &&
          window.startMinutes < totalMinutes &&
          window.effectStartMinutes > 0 &&
          kickInHeight > 0

        const showActive =
          window.dose.runMinutes > 0 &&
          window.effectStartMinutes < totalMinutes &&
          window.effectEndMinutes > 0 &&
          activeHeight > 0

        return (
          <div key={window.dose.id} className="vitamin-window-group">
            {showKickIn && (
              <div
                className="vitamin-overlay-segment kick-in"
                style={{
                  top: Math.max(kickInTop, 0),
                  height: Math.max(kickInHeight, 0),
                }}
              />
            )}
            {showActive && (
              <div
                className="vitamin-overlay-segment active"
                style={{
                  top: Math.max(activeTop, 0),
                  height: Math.max(activeHeight, 0),
                }}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}
