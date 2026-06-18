import { GRID_END_HOUR, GRID_START_HOUR, PIXELS_PER_HOUR } from '../constants'
import type { ParsedPerformance, VitaminDoseWindow } from '../types'
import { getGridHourLabel, getMinutesFromGridStart, gridMinutesToClockTime } from './time'

const COMPACT_GAP_HEIGHT = 36
const COMPACT_PADDING_MINUTES = 20
const MIN_GAP_TO_COLLAPSE_MINUTES = 45

export interface TimeInterval {
  startMinutes: number
  endMinutes: number
}

export interface CollapsedGap {
  id: string
  top: number
  height: number
  startMinutes: number
  endMinutes: number
  startLabel: string
  endLabel: string
}

export interface HourMark {
  key: string
  top: number
  label: string
}

interface MapPieceLinear {
  type: 'linear'
  startMinutes: number
  endMinutes: number
  startY: number
  endY: number
}

interface MapPieceCollapsed {
  type: 'collapsed'
  startMinutes: number
  endMinutes: number
  top: number
  height: number
}

type MapPiece = MapPieceLinear | MapPieceCollapsed

export interface ScheduleTimeScale {
  gridHeight: number
  hourMarks: HourMark[]
  collapsedGaps: CollapsedGap[]
  minutesToTop(minutes: number): number
  minutesToHeight(startMinutes: number, endMinutes: number): number
  isVisible(startMinutes: number, endMinutes: number): boolean
}

function mergeIntervals(intervals: TimeInterval[]): TimeInterval[] {
  if (intervals.length === 0) return []

  const sorted = [...intervals].sort((a, b) => a.startMinutes - b.startMinutes)
  const merged: TimeInterval[] = [{ ...sorted[0] }]

  for (let index = 1; index < sorted.length; index += 1) {
    const current = sorted[index]
    const last = merged[merged.length - 1]

    if (current.startMinutes <= last.endMinutes) {
      last.endMinutes = Math.max(last.endMinutes, current.endMinutes)
    } else {
      merged.push({ ...current })
    }
  }

  return merged
}

export function collectContentIntervals(
  performances: ParsedPerformance[],
  doseWindows: VitaminDoseWindow[],
  gridStartHour: number,
  totalMinutes: number,
  paddingMinutes = COMPACT_PADDING_MINUTES,
): TimeInterval[] {
  const raw: TimeInterval[] = []

  for (const performance of performances) {
    raw.push({
      startMinutes:
        getMinutesFromGridStart(performance.startTime, gridStartHour) - paddingMinutes,
      endMinutes:
        getMinutesFromGridStart(performance.endTime, gridStartHour) + paddingMinutes,
    })
  }

  for (const window of doseWindows) {
    raw.push({
      startMinutes: window.startMinutes - paddingMinutes,
      endMinutes: window.effectEndMinutes + paddingMinutes,
    })
  }

  return mergeIntervals(
    raw
      .map((interval) => ({
        startMinutes: Math.max(0, interval.startMinutes),
        endMinutes: Math.min(totalMinutes, interval.endMinutes),
      }))
      .filter((interval) => interval.endMinutes > interval.startMinutes),
  )
}

function buildHourMarksForPiece(
  piece: MapPieceLinear,
  gridStartHour: number,
): HourMark[] {
  const marks: HourMark[] = []
  const firstHour = Math.ceil(piece.startMinutes / 60) + gridStartHour
  const lastHour = Math.floor(piece.endMinutes / 60) + gridStartHour

  marks.push({
    key: `start-${piece.startMinutes}`,
    top: piece.startY,
    label: gridMinutesToClockTime(piece.startMinutes, gridStartHour),
  })

  for (let hour = firstHour; hour <= lastHour; hour += 1) {
    const minutes = (hour - gridStartHour) * 60
    if (minutes <= piece.startMinutes || minutes >= piece.endMinutes) continue

    const ratio = (minutes - piece.startMinutes) / (piece.endMinutes - piece.startMinutes)
    marks.push({
      key: `hour-${hour}`,
      top: piece.startY + ratio * (piece.endY - piece.startY),
      label: getGridHourLabel(hour),
    })
  }

  if (piece.endMinutes - piece.startMinutes > 30) {
    marks.push({
      key: `end-${piece.endMinutes}`,
      top: piece.endY,
      label: gridMinutesToClockTime(piece.endMinutes, gridStartHour),
    })
  }

  return marks
}

function createScaleFromPieces(
  pieces: MapPiece[],
  collapsedGaps: CollapsedGap[],
  gridStartHour: number,
): ScheduleTimeScale {
  const gridHeight =
    pieces.length === 0
      ? 0
      : (() => {
          const last = pieces[pieces.length - 1]
          return last.type === 'linear' ? last.endY : last.top + last.height
        })()

  const minutesToTop = (minutes: number): number => {
    for (const piece of pieces) {
      if (minutes < piece.startMinutes || minutes > piece.endMinutes) continue

      if (piece.type === 'linear') {
        const span = piece.endMinutes - piece.startMinutes
        if (span === 0) return piece.startY
        const ratio = (minutes - piece.startMinutes) / span
        return piece.startY + ratio * (piece.endY - piece.startY)
      }

      return piece.top + piece.height / 2
    }

    if (minutes < pieces[0]?.startMinutes) {
      return 0
    }

    const last = pieces[pieces.length - 1]
    if (last.type === 'linear') {
      return last.endY
    }
    return last.top + last.height
  }

  return {
    gridHeight,
    collapsedGaps,
    hourMarks: pieces
      .filter((piece): piece is MapPieceLinear => piece.type === 'linear')
      .flatMap((piece) => buildHourMarksForPiece(piece, gridStartHour)),
    minutesToTop,
    minutesToHeight(startMinutes, endMinutes) {
      return Math.max(minutesToTop(endMinutes) - minutesToTop(startMinutes), 0)
    },
    isVisible(startMinutes, endMinutes) {
      return endMinutes > 0 && startMinutes < (GRID_END_HOUR - GRID_START_HOUR) * 60
    },
  }
}

export function buildLinearTimeScale(
  gridStartHour = GRID_START_HOUR,
  gridEndHour = GRID_END_HOUR,
  pixelsPerHour = PIXELS_PER_HOUR,
): ScheduleTimeScale {
  const totalMinutes = (gridEndHour - gridStartHour) * 60
  const gridHeight = (gridEndHour - gridStartHour) * pixelsPerHour

  const piece: MapPieceLinear = {
    type: 'linear',
    startMinutes: 0,
    endMinutes: totalMinutes,
    startY: 0,
    endY: gridHeight,
  }

  return createScaleFromPieces([piece], [], gridStartHour)
}

export function buildCompactTimeScale(
  performances: ParsedPerformance[],
  doseWindows: VitaminDoseWindow[],
  gridStartHour = GRID_START_HOUR,
  gridEndHour = GRID_END_HOUR,
  pixelsPerHour = PIXELS_PER_HOUR,
): ScheduleTimeScale {
  const totalMinutes = (gridEndHour - gridStartHour) * 60
  const intervals = collectContentIntervals(
    performances,
    doseWindows,
    gridStartHour,
    totalMinutes,
  )

  if (intervals.length === 0) {
    return buildLinearTimeScale(gridStartHour, gridEndHour, pixelsPerHour)
  }

  const pieces: MapPiece[] = []
  const collapsedGaps: CollapsedGap[] = []
  let y = 0

  for (let index = 0; index < intervals.length; index += 1) {
    const interval = intervals[index]
    const segmentHeight = ((interval.endMinutes - interval.startMinutes) / 60) * pixelsPerHour

    pieces.push({
      type: 'linear',
      startMinutes: interval.startMinutes,
      endMinutes: interval.endMinutes,
      startY: y,
      endY: y + segmentHeight,
    })
    y += segmentHeight

    const next = intervals[index + 1]
    if (!next) continue

    const gapMinutes = next.startMinutes - interval.endMinutes
    if (gapMinutes >= MIN_GAP_TO_COLLAPSE_MINUTES) {
      collapsedGaps.push({
        id: `gap-${index}`,
        top: y,
        height: COMPACT_GAP_HEIGHT,
        startMinutes: interval.endMinutes,
        endMinutes: next.startMinutes,
        startLabel: gridMinutesToClockTime(interval.endMinutes, gridStartHour),
        endLabel: gridMinutesToClockTime(next.startMinutes, gridStartHour),
      })
      pieces.push({
        type: 'collapsed',
        startMinutes: interval.endMinutes,
        endMinutes: next.startMinutes,
        top: y,
        height: COMPACT_GAP_HEIGHT,
      })
      y += COMPACT_GAP_HEIGHT
    } else if (gapMinutes > 0) {
      const bridgeHeight = (gapMinutes / 60) * pixelsPerHour
      pieces.push({
        type: 'linear',
        startMinutes: interval.endMinutes,
        endMinutes: next.startMinutes,
        startY: y,
        endY: y + bridgeHeight,
      })
      y += bridgeHeight
    }
  }

  return createScaleFromPieces(pieces, collapsedGaps, gridStartHour)
}
