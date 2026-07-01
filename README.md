# Tomorrowland Schedule Viewer

A frontend-only festival schedule planner for Tomorrowland Belgium Weekend 2. Filter artists, explore the full stage grid, build your personal plan, and spot time conflicts automatically.

## Features

- Live lineup data from the Tomorrowland CDN
- Artist search and multi-select pre-filter
- Interactive day/stage/time schedule grid
- Click to select or deselect performances
- Conflict detection for overlapping selected sets
- Persistent selections and filters via `localStorage`
- Responsive, festival-themed UI

## Getting started

This project uses [mise](https://mise.jdx.dev/) for Node.js. From the project root:

```bash
mise install   # installs Node 20.18.1 if needed
mise run install
mise run dev
```

Or without mise tasks:

```bash
npm install
npm run dev
```

Open the URL shown in the terminal (typically `http://localhost:5173`).

## Build for production

```bash
mise run build
mise run preview
```

The static site output is written to `dist/`.

## Data source

Lineup JSON is fetched directly in the browser from:

`https://artist-lineup-cdn.tomorrowland.com/TL26BE-W2-9205196e-3eef-45c0-a82e-72aa1bb3cf8f.json`

## localStorage keys

| Key | Purpose |
| --- | --- |
| `tl26-selected-performances` | Array of selected performance IDs |
| `tl26-artist-filter` | Artist search query and selected artist IDs |
| `tl26-active-day` | Last viewed day tab (`FRIDAY`, `SATURDAY`, `SUNDAY`) |

## Project structure

```text
src/
  App.tsx                 # Main app shell and state wiring
  constants.ts            # CDN URL, storage keys, grid settings
  types.ts                # API and app types
  hooks/
    useFestivalData.ts    # Fetch and parse lineup data
    useLocalStorage.ts    # Persisted state helpers
  utils/
    time.ts               # Time parsing and formatting
    performances.ts       # Artist options, filtering, conflicts
  components/
    ArtistFilter.tsx      # Artist search and selection
    DayTabs.tsx           # Friday / Saturday / Sunday tabs
    ScheduleGrid.tsx      # Stage/time grid
    PerformanceBlock.tsx  # Individual set block
    PlanPanels.tsx        # Conflict summary and my plan list
    StatePanels.tsx       # Loading, error, and empty states
```

## Conflict detection

Selected performances are compared pairwise. A conflict is reported only when two sets overlap by at least one minute — back-to-back sets (one ending at 17:00 and the next starting at 17:00) are not flagged.

Conflicting sets are highlighted with red borders and badges in the grid, listed in the conflict panel, and marked in the personal plan sidebar.
# tomorrowland-planner
