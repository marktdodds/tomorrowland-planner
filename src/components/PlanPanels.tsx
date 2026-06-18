import { useEffect, useMemo, useState } from 'react'
import { DAY_ORDER } from '../constants'
import type { ParsedPerformance, PerformanceConflict, VitaminScheduleState } from '../types'
import { formatTimeRange } from '../utils/time'
import { getStagesForDay } from '../utils/performances'
import { hasVitaminSchedule } from '../utils/vitamin'
import { DayTabs } from './DayTabs'
import { ScheduleGrid } from './ScheduleGrid'

interface ConflictPanelProps {
  conflicts: PerformanceConflict[]
  selectedCount: number
}

export function ConflictPanel({ conflicts, selectedCount }: ConflictPanelProps) {
  if (selectedCount === 0) {
    return (
      <section className="panel conflict-panel muted-panel">
        <h2>Your plan</h2>
        <p>Select sets on the grid to build your personal weekend schedule.</p>
      </section>
    )
  }

  if (conflicts.length === 0) {
    return (
      <section className="panel conflict-panel success-panel">
        <h2>Your plan looks clear</h2>
        <p>
          {selectedCount} selected set{selectedCount === 1 ? '' : 's'} with no time overlaps detected.
        </p>
      </section>
    )
  }

  return (
    <section className="panel conflict-panel warning-panel">
      <div className="panel-header">
        <div>
          <h2>Schedule conflicts</h2>
          <p>
            {conflicts.length} overlap{conflicts.length === 1 ? '' : 's'} across your {selectedCount}{' '}
            selected set{selectedCount === 1 ? '' : 's'}.
          </p>
        </div>
        <span className="warning-pill">{conflicts.length}</span>
      </div>

      <ul className="conflict-list">
        {conflicts.map((conflict) => (
          <li key={conflict.id} className="conflict-item">
            <ConflictPair performances={conflict.performances} />
          </li>
        ))}
      </ul>
    </section>
  )
}

function ConflictPair({ performances }: { performances: [ParsedPerformance, ParsedPerformance] }) {
  const [a, b] = performances

  return (
    <div className="conflict-pair">
      <ConflictCard performance={a} />
      <span className="conflict-vs" aria-hidden="true">
        ×
      </span>
      <ConflictCard performance={b} />
    </div>
  )
}

function ConflictCard({ performance }: { performance: ParsedPerformance }) {
  return (
    <div className="conflict-card">
      <strong>{performance.name}</strong>
      <span>{performance.stage.name}</span>
      <span>{performance.day}</span>
      <span>{formatTimeRange(performance.startTime, performance.endTime)}</span>
    </div>
  )
}

interface MyPlanProps {
  performances: ParsedPerformance[]
  selectedIds: Set<string>
  conflictIds: Set<string>
  vitaminSchedule: VitaminScheduleState
  onClear: () => void
}

function dayHasPlanContent(
  day: string,
  selectedPerformances: ParsedPerformance[],
  vitaminSchedule: VitaminScheduleState,
): boolean {
  return (
    selectedPerformances.some((performance) => performance.day === day) ||
    (vitaminSchedule.dosesByDay[day]?.length ?? 0) > 0
  )
}

export function MyPlan({
  performances,
  selectedIds,
  conflictIds,
  vitaminSchedule,
  onClear,
}: MyPlanProps) {
  const selectedPerformances = useMemo(
    () => performances.filter((performance) => selectedIds.has(performance.id)),
    [performances, selectedIds],
  )
  const showVitamins = hasVitaminSchedule(vitaminSchedule)
  const [planDay, setPlanDay] = useState<(typeof DAY_ORDER)[number]>('FRIDAY')

  const daysWithContent = useMemo(
    () =>
      DAY_ORDER.filter((day) =>
        dayHasPlanContent(day, selectedPerformances, vitaminSchedule),
      ),
    [selectedPerformances, vitaminSchedule],
  )

  useEffect(() => {
    if (daysWithContent.length === 0) return
    if (!daysWithContent.includes(planDay)) {
      setPlanDay(daysWithContent[0])
    }
  }, [daysWithContent, planDay])

  if (selectedPerformances.length === 0 && !showVitamins) {
    return null
  }

  const planDayCounts = DAY_ORDER.reduce<Record<string, number>>((acc, day) => {
    acc[day] = selectedPerformances.filter((performance) => performance.day === day).length
    return acc
  }, {})

  const planStages = getStagesForDay(selectedPerformances, planDay)
  const planDayDoses = vitaminSchedule.dosesByDay[planDay] ?? []
  const planDayHasGrid =
    planStages.length > 0 || planDayDoses.length > 0 || selectedPerformances.some((p) => p.day === planDay)

  return (
    <section className="panel my-plan-panel schedule-panel">
      <div className="panel-header">
        <div>
          <h2>My weekend ({selectedPerformances.length})</h2>
          <p>Read-only view of your planned sets and vitamin windows.</p>
        </div>
        {selectedPerformances.length > 0 && (
          <button type="button" className="button button-ghost" onClick={onClear}>
            Clear plan
          </button>
        )}
      </div>

      <DayTabs activeDay={planDay} counts={planDayCounts} onChange={setPlanDay} />

      {planDayHasGrid ? (
        <ScheduleGrid
          readOnly
          compact
          day={planDay}
          stages={planStages}
          performances={selectedPerformances}
          selectedIds={selectedIds}
          conflictIds={conflictIds}
          vitaminDoses={planDayDoses}
        />
      ) : (
        <p className="muted my-plan-empty-day">Nothing planned for this day yet.</p>
      )}
    </section>
  )
}
