import { DAY_ORDER, VITAMIN_DEFAULTS } from '../constants'
import type { VitaminDose, VitaminDoseWindow, VitaminScheduleState } from '../types'
import { clockTimeToGridMinutes, gridMinutesToClockTime } from './time'

export function createEmptyVitaminSchedule(): VitaminScheduleState {
  return {
    dosesByDay: Object.fromEntries(DAY_ORDER.map((day) => [day, []])),
  }
}

export function createVitaminDose(overrides: Partial<VitaminDose> = {}): VitaminDose {
  return {
    id: crypto.randomUUID(),
    startTime: VITAMIN_DEFAULTS.startTime,
    kickInMinutes: VITAMIN_DEFAULTS.kickInMinutes,
    runMinutes: VITAMIN_DEFAULTS.runMinutes,
    ...overrides,
  }
}

export function getDoseWindows(
  doses: VitaminDose[],
  gridStartHour: number,
): VitaminDoseWindow[] {
  return doses.map((dose) => {
    const startMinutes = clockTimeToGridMinutes(dose.startTime, gridStartHour)
    const effectStartMinutes = startMinutes + dose.kickInMinutes
    const effectEndMinutes = effectStartMinutes + dose.runMinutes

    return {
      dose,
      startMinutes,
      effectStartMinutes,
      effectEndMinutes,
    }
  })
}

export function formatVitaminDoseSummary(
  dose: VitaminDose,
  gridStartHour: number,
): {
  doseLabel: string
  activeLabel: string
  redoseLabel: string
} {
  const window = getDoseWindows([dose], gridStartHour)[0]

  return {
    doseLabel: dose.startTime,
    activeLabel: `${gridMinutesToClockTime(window.effectStartMinutes)} – ${gridMinutesToClockTime(window.effectEndMinutes)}`,
    redoseLabel: gridMinutesToClockTime(window.effectEndMinutes),
  }
}

export function hasVitaminSchedule(schedule: VitaminScheduleState): boolean {
  return DAY_ORDER.some((day) => (schedule.dosesByDay[day]?.length ?? 0) > 0)
}

export function getAllVitaminDoses(schedule: VitaminScheduleState): Array<{
  day: string
  dose: VitaminDose
  sortKey: number
}> {
  return DAY_ORDER.flatMap((day) =>
    (schedule.dosesByDay[day] ?? []).map((dose, index) => ({
      day,
      dose,
      sortKey:
        DAY_ORDER.indexOf(day as (typeof DAY_ORDER)[number]) * 10_000 +
        clockTimeToGridMinutes(dose.startTime, 12) +
        index,
    })),
  ).sort((a, b) => a.sortKey - b.sortKey)
}
