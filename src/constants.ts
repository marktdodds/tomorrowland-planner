export const FESTIVAL_DATA_URL =
  'https://artist-lineup-cdn.tomorrowland.com/TL26BE-W2-9205196e-3eef-45c0-a82e-72aa1bb3cf8f.json'

export const STORAGE_KEYS = {
  selectedPerformances: 'tl26-selected-performances',
  artistFilter: 'tl26-artist-filter',
  activeDay: 'tl26-active-day',
  scheduleView: 'tl26-schedule-view',
  vitaminSchedule: 'tl26-vitamin-schedule',
} as const

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
