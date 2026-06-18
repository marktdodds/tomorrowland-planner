import { DAY_ORDER, STORAGE_KEYS } from './constants'
import { useFestivalData } from './hooks/useFestivalData'
import { useLocalStorageState, useSetLocalStorage } from './hooks/useLocalStorage'
import type { VitaminScheduleState } from './types'
import { createEmptyVitaminSchedule } from './utils/vitamin'
import {
  buildArtistOptions,
  detectConflicts,
  getScheduleViewDescription,
  resolveSchedulePerformances,
  getStagesForDay,
  type ScheduleViewOptions,
} from './utils/performances'
import { ArtistFilter } from './components/ArtistFilter'
import { DayTabs } from './components/DayTabs'
import { ConflictPanel, MyPlan } from './components/PlanPanels'
import { ScheduleGrid } from './components/ScheduleGrid'
import { ScheduleViewToggles } from './components/ScheduleViewToggles'
import { EmptyState, ErrorState, LoadingState } from './components/StatePanels'

interface ArtistFilterState {
  query: string
  selectedArtistIds: string[]
}

export default function App() {
  const { performances, loading, error, refetch } = useFestivalData()
  const { selected: selectedIds, toggle, clear: clearPlan } = useSetLocalStorage(
    STORAGE_KEYS.selectedPerformances,
  )

  const [artistFilter, setArtistFilter] = useLocalStorageState<ArtistFilterState>(
    STORAGE_KEYS.artistFilter,
    { query: '', selectedArtistIds: [] },
  )

  const [activeDay, setActiveDay] = useLocalStorageState<(typeof DAY_ORDER)[number]>(
    STORAGE_KEYS.activeDay,
    'FRIDAY',
  )

  const [scheduleView, setScheduleView] = useLocalStorageState<ScheduleViewOptions>(
    STORAGE_KEYS.scheduleView,
    { expandStages: false, fullLineup: false },
  )

  const [vitaminSchedule, setVitaminSchedule] = useLocalStorageState<VitaminScheduleState>(
    STORAGE_KEYS.vitaminSchedule,
    createEmptyVitaminSchedule(),
  )

  const selectedArtistIds = new Set(artistFilter.selectedArtistIds)
  const artistOptions = buildArtistOptions(performances)
  const visiblePerformances = resolveSchedulePerformances(
    performances,
    selectedArtistIds,
    scheduleView,
  )
  const { conflictIds, conflicts } = detectConflicts(performances, selectedIds)
  const stages = getStagesForDay(visiblePerformances, activeDay)
  const scheduleDescription = getScheduleViewDescription(selectedArtistIds, scheduleView)
  const dimUnmatched =
    selectedArtistIds.size > 0 && scheduleView.expandStages && !scheduleView.fullLineup

  const dayCounts = DAY_ORDER.reduce<Record<string, number>>((acc, day) => {
    acc[day] = visiblePerformances.filter((performance) => performance.day === day).length
    return acc
  }, {})

  const activeDayDoses = vitaminSchedule.dosesByDay[activeDay] ?? []

  const setActiveDayDoses = (doses: typeof activeDayDoses) => {
    setVitaminSchedule((prev) => ({
      ...prev,
      dosesByDay: {
        ...prev.dosesByDay,
        [activeDay]: doses,
      },
    }))
  }

  const toggleArtist = (artistId: string) => {
    setArtistFilter((prev) => {
      const next = new Set(prev.selectedArtistIds)
      if (next.has(artistId)) {
        next.delete(artistId)
      } else {
        next.add(artistId)
      }
      return { ...prev, selectedArtistIds: Array.from(next) }
    })
  }

  return (
    <div className="app-shell">
      <header className="hero">
        <div className="hero-glow" aria-hidden="true" />
        <div className="hero-content">
          <p className="eyebrow">Tomorrowland Belgium · Weekend 2</p>
          <h1>Build your perfect weekend</h1>
          <p className="hero-copy">
            Filter artists, explore the full stage grid, and curate your personal schedule with
            automatic conflict detection.
          </p>
        </div>
        <div className="hero-stats" aria-live="polite">
          <div>
            <strong>{performances.length || '—'}</strong>
            <span>Total sets</span>
          </div>
          <div>
            <strong>{selectedIds.size}</strong>
            <span>In your plan</span>
          </div>
          <div>
            <strong>{conflicts.length}</strong>
            <span>Conflicts</span>
          </div>
        </div>
      </header>

      <main className="main-content">
        {loading && <LoadingState />}

        {!loading && error && <ErrorState message={error} onRetry={refetch} />}

        {!loading && !error && (
          <>
            <ArtistFilter
              artists={artistOptions}
              query={artistFilter.query}
              selectedArtistIds={selectedArtistIds}
              onQueryChange={(query) => setArtistFilter((prev) => ({ ...prev, query }))}
              onToggleArtist={toggleArtist}
              onClear={() =>
                setArtistFilter((prev) => ({ ...prev, selectedArtistIds: [], query: '' }))
              }
            />

            <ConflictPanel conflicts={conflicts} selectedCount={selectedIds.size} />
            <MyPlan
              performances={performances}
              selectedIds={selectedIds}
              conflictIds={conflictIds}
              vitaminSchedule={vitaminSchedule}
              onClear={clearPlan}
            />

            <section className="panel schedule-panel">
              <div className="panel-header">
                <div>
                  <h2>Weekend schedule</h2>
                  <p>{scheduleDescription}</p>
                </div>
              </div>

              <ScheduleViewToggles
                view={scheduleView}
                hasArtistFilter={selectedArtistIds.size > 0}
                onChange={setScheduleView}
              />

              <DayTabs activeDay={activeDay} counts={dayCounts} onChange={setActiveDay} />

              {visiblePerformances.filter((performance) => performance.day === activeDay).length === 0 ? (
                <EmptyState
                  title="No sets for this day"
                  description={
                    selectedArtistIds.size > 0
                      ? 'None of your selected artists play on this day. Try another day or adjust your artist filter.'
                      : 'There are no performances scheduled for this day.'
                  }
                  action={
                    selectedArtistIds.size > 0 ? (
                      <button
                        type="button"
                        className="button button-primary"
                        onClick={() =>
                          setArtistFilter((prev) => ({ ...prev, selectedArtistIds: [] }))
                        }
                      >
                        Show full lineup
                      </button>
                    ) : undefined
                  }
                />
              ) : (
                <ScheduleGrid
                  day={activeDay}
                  stages={stages}
                  performances={visiblePerformances}
                  selectedIds={selectedIds}
                  conflictIds={conflictIds}
                  dimUnmatched={dimUnmatched}
                  unmatchedArtistIds={selectedArtistIds}
                  vitaminDoses={activeDayDoses}
                  onVitaminDosesChange={setActiveDayDoses}
                  onToggle={toggle}
                />
              )}
            </section>
          </>
        )}
      </main>
    </div>
  )
}
