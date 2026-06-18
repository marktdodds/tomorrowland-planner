import { FESTIVAL_TIMEZONE } from '../constants'
import type { ParsedPerformance } from '../types'

function toFestivalDate(iso: string): Date {
  return new Date(iso.replace(' ', 'T'))
}

function getFestivalTimeParts(iso: string): { hours: number; minutes: number } {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: FESTIVAL_TIMEZONE,
    hour: 'numeric',
    minute: 'numeric',
    hour12: false,
  }).formatToParts(toFestivalDate(iso))

  return {
    hours: Number(parts.find((part) => part.type === 'hour')?.value ?? 0),
    minutes: Number(parts.find((part) => part.type === 'minute')?.value ?? 0),
  }
}

export function parsePerformanceTime(iso: string): number {
  return toFestivalDate(iso).getTime()
}

export function formatTime(iso: string): string {
  return new Intl.DateTimeFormat('en-GB', {
    timeZone: FESTIVAL_TIMEZONE,
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(toFestivalDate(iso))
}

export function formatTimeRange(startTime: string, endTime: string): string {
  return `${formatTime(startTime)} – ${formatTime(endTime)}`
}

export function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  if (hours === 0) return `${mins}m`
  if (mins === 0) return `${hours}h`
  return `${hours}h ${mins}m`
}

export function getMinutesFromGridStart(iso: string, gridStartHour: number): number {
  const { hours, minutes } = getFestivalTimeParts(iso)
  const adjustedHours = hours < gridStartHour ? hours + 24 : hours
  return (adjustedHours - gridStartHour) * 60 + minutes
}

export function performancesOverlap(a: ParsedPerformance, b: ParsedPerformance): boolean {
  return a.startMs < b.endMs && b.startMs < a.endMs
}

export function getGridHourLabel(hour: number): string {
  const normalized = hour >= 24 ? hour - 24 : hour
  return `${String(normalized).padStart(2, '0')}:00`
}

export function clockTimeToGridMinutes(time: string, gridStartHour: number): number {
  const [hours, minutes] = time.split(':').map(Number)
  const adjustedHours = hours < gridStartHour ? hours + 24 : hours
  return (adjustedHours - gridStartHour) * 60 + minutes
}

export function gridMinutesToClockTime(
  gridMinutes: number,
  gridStartHour: number = 12,
): string {
  const totalMinutesFromMidnight = gridStartHour * 60 + gridMinutes
  const hours = Math.floor(totalMinutesFromMidnight / 60) % 24
  const minutes = totalMinutesFromMidnight % 60
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`
}
