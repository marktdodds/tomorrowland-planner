export const FESTIVAL_WEEKENDS = ['W1', 'W2'] as const
export type FestivalWeekend = (typeof FESTIVAL_WEEKENDS)[number]

export const FESTIVAL_DATA_URLS: Record<FestivalWeekend, string> = {
  W1: 'https://artist-lineup-cdn.tomorrowland.com/TL26BE-W1-9205196e-3eef-45c0-a82e-72aa1bb3cf8f.json',
  W2: 'https://artist-lineup-cdn.tomorrowland.com/TL26BE-W2-9205196e-3eef-45c0-a82e-72aa1bb3cf8f.json',
}

export const WEEKEND_LABELS: Record<FestivalWeekend, string> = {
  W1: 'Weekend 1',
  W2: 'Weekend 2',
}

const WEEKEND_SCOPED_STORAGE = {
  selectedPerformances: 'selected-performances',
  artistFilter: 'artist-filter',
  activeDay: 'active-day',
  scheduleView: 'schedule-view',
  vitaminSchedule: 'vitamin-schedule',
} as const

export type WeekendScopedStorageKey = keyof typeof WEEKEND_SCOPED_STORAGE

/** W2 keys keep the original unprefixed names so existing saved plans still load. */
const LEGACY_W2_STORAGE_KEYS: Record<WeekendScopedStorageKey, string> = {
  selectedPerformances: 'tl26-selected-performances',
  artistFilter: 'tl26-artist-filter',
  activeDay: 'tl26-active-day',
  scheduleView: 'tl26-schedule-view',
  vitaminSchedule: 'tl26-vitamin-schedule',
}

export const STORAGE_KEYS = {
  selectedWeekend: 'tl26-selected-weekend',
} as const

export function getWeekendStorageKey(
  weekend: FestivalWeekend,
  key: WeekendScopedStorageKey,
): string {
  if (weekend === 'W2') return LEGACY_W2_STORAGE_KEYS[key]
  return `tl26-${weekend.toLowerCase()}-${WEEKEND_SCOPED_STORAGE[key]}`
}

export const DAY_ORDER = ['FRIDAY', 'SATURDAY', 'SUNDAY'] as const

export const DAY_LABELS: Record<(typeof DAY_ORDER)[number], string> = {
  FRIDAY: 'Friday',
  SATURDAY: 'Saturday',
  SUNDAY: 'Sunday',
}

export const PIXELS_PER_HOUR = 80
export const GRID_START_HOUR = 12
export const GRID_END_HOUR = 26 // extends past midnight into next day

export const ARTIST_SEARCH_DEBOUNCE_MS = 300
export const CONFLICT_OVERLAP_MS = 60_000
export const FESTIVAL_TIMEZONE = 'Europe/Brussels'

export const VITAMIN_DEFAULTS = {
  kickInMinutes: 60,
  runMinutes: 120,
  startTime: '14:00',
} as const
