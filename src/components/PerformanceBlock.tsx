import type { ParsedPerformance } from '../types'
import { formatDuration, formatTimeRange } from '../utils/time'

interface PerformanceBlockProps {
  performance: ParsedPerformance
  top: number
  height: number
  selected: boolean
  conflict: boolean
  dimmed?: boolean
  readOnly?: boolean
  onToggle?: (id: string) => void
}

export function PerformanceBlock({
  performance,
  top,
  height,
  selected,
  conflict,
  dimmed = false,
  readOnly = false,
  onToggle,
}: PerformanceBlockProps) {
  const compact = height < 56
  const className = `performance-block ${selected ? 'selected' : ''} ${conflict ? 'conflict' : ''} ${dimmed ? 'dimmed' : ''} ${readOnly ? 'read-only' : ''}`

  const content = (
    <>
      <span className="performance-block-time">
        {formatTimeRange(performance.startTime, performance.endTime)}
      </span>
      <strong className="performance-block-name">{performance.name}</strong>
      {!compact && (
        <span className="performance-block-meta">
          {formatDuration(performance.durationMinutes)}
          {conflict && <span className="conflict-badge">Conflict</span>}
        </span>
      )}
      {compact && conflict && <span className="conflict-badge compact">!</span>}
    </>
  )

  if (readOnly) {
    return (
      <div
        className={className}
        style={{ top, height: Math.max(height, 44) }}
        title={`${performance.name} · ${performance.stage.name}`}
      >
        {content}
      </div>
    )
  }

  return (
    <button
      type="button"
      className={className}
      style={{ top, height: Math.max(height, 44) }}
      onClick={() => onToggle?.(performance.id)}
      title={`${performance.name} · ${performance.stage.name}`}
      aria-pressed={selected}
    >
      {content}
    </button>
  )
}
