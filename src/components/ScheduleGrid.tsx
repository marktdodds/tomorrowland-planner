import { useMemo } from 'react'
import { GRID_END_HOUR, GRID_START_HOUR } from '../constants'
import type { ParsedPerformance, VitaminDose } from '../types'
import {
  buildCompactTimeScale,
  buildLinearTimeScale,
  type ScheduleTimeScale,
} from '../utils/compactSchedule'
import { getDoseWindows } from '../utils/vitamin'
import { getMinutesFromGridStart } from '../utils/time'
import { PerformanceBlock } from './PerformanceBlock'
import { VitaminOverlay } from './VitaminOverlay'
import { VitaminSidebar } from './VitaminSidebar'
import { VitaminSidebarReadOnly } from './VitaminSidebarReadOnly'

interface ScheduleGridProps {
  day: string
  stages: string[]
  performances: ParsedPerformance[]
  selectedIds: Set<string>
  conflictIds: Set<string>
  vitaminDoses: VitaminDose[]
  readOnly?: boolean
  compact?: boolean
  dimUnmatched?: boolean
  unmatchedArtistIds?: Set<string>
  onVitaminDosesChange?: (doses: VitaminDose[]) => void
  onToggle?: (id: string) => void
}

const TOTAL_MINUTES = (GRID_END_HOUR - GRID_START_HOUR) * 60
const EMPTY_STAGE_LABEL = 'Your plan'

function CollapsedGapMarkers({ timeScale }: { timeScale: ScheduleTimeScale }) {
  if (timeScale.collapsedGaps.length === 0) {
    return null
  }

  return (
    <>
      {timeScale.collapsedGaps.map((gap) => (
        <div
          key={gap.id}
          className="schedule-collapsed-gap"
          style={{ top: gap.top, height: gap.height }}
        >
          <span className="schedule-collapsed-gap-wave" aria-hidden="true">
            ∿∿∿∿∿∿∿
          </span>
          <span className="schedule-collapsed-gap-label">
            {gap.startLabel} – {gap.endLabel}
          </span>
        </div>
      ))}
    </>
  )
}

export function ScheduleGrid({
  day,
  stages,
  performances,
  selectedIds,
  conflictIds,
  vitaminDoses,
  readOnly = false,
  compact = false,
  dimUnmatched = false,
  unmatchedArtistIds,
  onVitaminDosesChange,
  onToggle,
}: ScheduleGridProps) {
  const dayPerformances = performances.filter((performance) => performance.day === day)
  const doseWindows = getDoseWindows(vitaminDoses, GRID_START_HOUR)
  const displayStages =
    stages.length > 0
      ? stages
      : readOnly && (dayPerformances.length > 0 || vitaminDoses.length > 0)
        ? [EMPTY_STAGE_LABEL]
        : []

  const timeScale = useMemo(() => {
    if (compact) {
      return buildCompactTimeScale(dayPerformances, doseWindows)
    }
    return buildLinearTimeScale()
  }, [compact, dayPerformances, doseWindows])

  const gridHeight = timeScale.gridHeight

  if (displayStages.length === 0) {
    return null
  }

  return (
    <div className={`schedule-grid-wrapper ${compact ? 'compact' : ''}`}>
      <p className="schedule-scroll-hint">Swipe sideways to see more stages</p>
      <div className="schedule-grid">
        <div className="vitamin-column">
          <div className="schedule-column-header-spacer" aria-hidden="true" />
          <div className="vitamin-column-body" style={{ minHeight: gridHeight }}>
            {readOnly ? (
              <VitaminSidebarReadOnly doses={vitaminDoses} />
            ) : (
              <VitaminSidebar
                doses={vitaminDoses}
                onChange={(doses) => onVitaminDosesChange?.(doses)}
              />
            )}
          </div>
        </div>

        <div className="schedule-main">
          <div className="time-column">
            <div className="schedule-column-header-spacer" aria-hidden="true" />
            <div className="time-axis" style={{ height: gridHeight }} aria-hidden="true">
              {timeScale.hourMarks.map((mark) => (
                <div key={mark.key} className="time-axis-label" style={{ top: mark.top }}>
                  {mark.label}
                </div>
              ))}
            </div>
          </div>

          <div className="stage-columns">
            <VitaminOverlay
              windows={doseWindows}
              gridHeight={gridHeight}
              totalMinutes={TOTAL_MINUTES}
              timeScale={compact ? timeScale : undefined}
            />
            <CollapsedGapMarkers timeScale={timeScale} />

            {displayStages.map((stage) => {
              const stagePerformances =
                stage === EMPTY_STAGE_LABEL
                  ? dayPerformances
                  : dayPerformances.filter((performance) => performance.stage.name === stage)

              return (
                <div key={stage} className="stage-column">
                  <div className="stage-column-header">{stage}</div>
                  <div className="stage-column-body" style={{ height: gridHeight }}>
                    {timeScale.hourMarks.map((mark) => (
                      <div key={`line-${mark.key}`} className="grid-hour-line" style={{ top: mark.top }} />
                    ))}

                    {stagePerformances.map((performance) => {
                      const startMinutes = getMinutesFromGridStart(
                        performance.startTime,
                        GRID_START_HOUR,
                      )
                      const endMinutes = getMinutesFromGridStart(
                        performance.endTime,
                        GRID_START_HOUR,
                      )

                      if (!timeScale.isVisible(startMinutes, endMinutes)) {
                        return null
                      }

                      const top = timeScale.minutesToTop(startMinutes)
                      const height = timeScale.minutesToHeight(startMinutes, endMinutes)

                      if (height <= 0) {
                        return null
                      }

                      return (
                        <PerformanceBlock
                          key={performance.id}
                          performance={performance}
                          top={top}
                          height={height}
                          selected={readOnly || selectedIds.has(performance.id)}
                          conflict={conflictIds.has(performance.id)}
                          readOnly={readOnly}
                          dimmed={
                            !readOnly &&
                            dimUnmatched &&
                            unmatchedArtistIds !== undefined &&
                            !performance.artists.some((artist) =>
                              unmatchedArtistIds.has(artist.id),
                            )
                          }
                          onToggle={onToggle}
                        />
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
