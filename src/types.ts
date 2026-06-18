export interface Artist {
  id: string
  name: string
  image?: string
  instagram?: string
  spotify?: string
  facebook?: string
  tiktok?: string
  soundcloud?: string
  youtube?: string
  twitter?: string
  website?: string
}

export interface Stage {
  id: string
  name: string
}

export interface Performance {
  id: string
  name: string
  artists: Artist[]
  stage: Stage
  date: string
  day: string
  startTime: string
  endTime: string
}

export interface FestivalData {
  performances: Performance[]
}

export interface ParsedPerformance extends Performance {
  startMs: number
  endMs: number
  durationMinutes: number
}

export interface PerformanceConflict {
  id: string
  performances: [ParsedPerformance, ParsedPerformance]
}

export interface ArtistOption {
  id: string
  name: string
  image?: string
  performanceCount: number
}

export interface VitaminDose {
  id: string
  startTime: string
  kickInMinutes: number
  runMinutes: number
}

export interface VitaminScheduleState {
  dosesByDay: Record<string, VitaminDose[]>
}

export interface VitaminDoseWindow {
  dose: VitaminDose
  startMinutes: number
  effectStartMinutes: number
  effectEndMinutes: number
}
