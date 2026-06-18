import { CONFLICT_OVERLAP_MS } from '../constants'
import type { ArtistOption, ParsedPerformance, Performance, PerformanceConflict } from '../types'
import { parsePerformanceTime } from './time'

export function getOverlapMs(a: ParsedPerformance, b: ParsedPerformance): number {
  return Math.min(a.endMs, b.endMs) - Math.max(a.startMs, b.startMs)
}

export function performancesConflict(a: ParsedPerformance, b: ParsedPerformance): boolean {
  return getOverlapMs(a, b) >= CONFLICT_OVERLAP_MS
}

export function enrichPerformance(performance: Performance): ParsedPerformance {
  const startMs = parsePerformanceTime(performance.startTime)
  const endMs = parsePerformanceTime(performance.endTime)
  return {
    ...performance,
    startMs,
    endMs,
    durationMinutes: Math.round((endMs - startMs) / 60000),
  }
}

export function buildArtistOptions(performances: Performance[]): ArtistOption[] {
  const map = new Map<string, ArtistOption>()

  for (const performance of performances) {
    for (const artist of performance.artists) {
      const existing = map.get(artist.id)
      if (existing) {
        existing.performanceCount += 1
        if (!existing.image && artist.image) {
          existing.image = artist.image
        }
      } else {
        map.set(artist.id, {
          id: artist.id,
          name: artist.name,
          image: artist.image,
          performanceCount: 1,
        })
      }
    }
  }

  return Array.from(map.values()).sort((a, b) =>
    a.name.localeCompare(b.name, undefined, { sensitivity: 'base' }),
  )
}

export function filterPerformancesByArtists(
  performances: ParsedPerformance[],
  selectedArtistIds: Set<string>,
): ParsedPerformance[] {
  if (selectedArtistIds.size === 0) return performances

  return performances.filter((performance) =>
    performance.artists.some((artist) => selectedArtistIds.has(artist.id)),
  )
}

export function performanceMatchesArtists(
  performance: ParsedPerformance,
  selectedArtistIds: Set<string>,
): boolean {
  if (selectedArtistIds.size === 0) return true
  return performance.artists.some((artist) => selectedArtistIds.has(artist.id))
}

export interface ScheduleViewOptions {
  expandStages: boolean
  fullLineup: boolean
}

export function resolveSchedulePerformances(
  performances: ParsedPerformance[],
  selectedArtistIds: Set<string>,
  view: ScheduleViewOptions,
): ParsedPerformance[] {
  if (selectedArtistIds.size === 0 || view.fullLineup) {
    return performances
  }

  if (view.expandStages) {
    const stageNames = new Set(
      filterPerformancesByArtists(performances, selectedArtistIds).map(
        (performance) => performance.stage.name,
      ),
    )
    return performances.filter((performance) => stageNames.has(performance.stage.name))
  }

  return filterPerformancesByArtists(performances, selectedArtistIds)
}

export function getScheduleViewDescription(
  selectedArtistIds: Set<string>,
  view: ScheduleViewOptions,
): string {
  if (selectedArtistIds.size === 0 || view.fullLineup) {
    return 'Showing the full weekend lineup across every stage.'
  }

  if (view.expandStages) {
    return `Showing all sets on stages where your ${selectedArtistIds.size} selected artist${selectedArtistIds.size === 1 ? '' : 's'} play.`
  }

  return `Showing sets for ${selectedArtistIds.size} selected artist${selectedArtistIds.size === 1 ? '' : 's'}.`
}

export function detectConflicts(
  performances: ParsedPerformance[],
  selectedIds: Set<string>,
): {
  conflictIds: Set<string>
  conflicts: PerformanceConflict[]
} {
  const selected = performances.filter((p) => selectedIds.has(p.id))
  const conflictIds = new Set<string>()
  const conflicts: PerformanceConflict[] = []
  const seenPairs = new Set<string>()

  for (let i = 0; i < selected.length; i += 1) {
    for (let j = i + 1; j < selected.length; j += 1) {
      const a = selected[i]
      const b = selected[j]
      if (performancesConflict(a, b)) {
        conflictIds.add(a.id)
        conflictIds.add(b.id)
        const pairKey = [a.id, b.id].sort().join(':')
        if (!seenPairs.has(pairKey)) {
          seenPairs.add(pairKey)
          conflicts.push({
            id: pairKey,
            performances: [a, b],
          })
        }
      }
    }
  }

  return { conflictIds, conflicts }
}

export function getStagesForDay(
  performances: ParsedPerformance[],
  day: string,
): string[] {
  const stages = new Set<string>()
  for (const performance of performances) {
    if (performance.day === day) {
      stages.add(performance.stage.name)
    }
  }

  const priority = ['MAINSTAGE', 'CRYSTAL GARDEN', 'FREEDOM BY BUD', 'CORE']
  return Array.from(stages).sort((a, b) => {
    const aIndex = priority.indexOf(a)
    const bIndex = priority.indexOf(b)
    if (aIndex !== -1 || bIndex !== -1) {
      return (aIndex === -1 ? 99 : aIndex) - (bIndex === -1 ? 99 : bIndex)
    }
    return a.localeCompare(b)
  })
}
