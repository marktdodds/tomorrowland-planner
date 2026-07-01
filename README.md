# Tomorrowland Schedule Planner

An unofficial, frontend-only schedule planner for Tomorrowland Belgium. Switch between Weekend 1 and Weekend 2, filter artists, explore the stage grid, build a personal plan, and spot time conflicts automatically.

> **Disclaimer:** This is a fan project and is not affiliated with, endorsed by, or connected to Tomorrowland or ID&T. Lineup data is fetched from publicly accessible CDN URLs and may change without notice.

## Features

- Weekend 1 / Weekend 2 switcher with live lineup data from the Tomorrowland CDN
- Artist search and multi-select filter
- Interactive day / stage / time schedule grid
- Schedule view modes: filtered artists, expanded stages, or full lineup
- Click to select or deselect performances
- Conflict detection for overlapping selected sets
- Vitamin timing overlay on the schedule grid (personal planning only)
- Share plans via URL (selected sets + vitamin schedule)
- Persistent selections and filters via `localStorage` (separate per weekend)
- Responsive, festival-themed UI

## Getting started

This project uses [mise](https://mise.jdx.dev/) for Node.js. From the project root:

```bash
mise install   # installs Node 20.18.1 if needed
mise run install
mise run dev
```

Or without mise:

```bash
npm install
npm run dev
```

Open the URL shown in the terminal (typically `http://localhost:5173`).

## Build for production

```bash
npm run build
npm run preview
```

The static site output is written to `dist/`.

## Data source

Lineup JSON is fetched directly in the browser:

| Weekend | URL |
| --- | --- |
| Weekend 1 | `https://artist-lineup-cdn.tomorrowland.com/TL26BE-W1-9205196e-3eef-45c0-a82e-72aa1bb3cf8f.json` |
| Weekend 2 | `https://artist-lineup-cdn.tomorrowland.com/TL26BE-W2-9205196e-3eef-45c0-a82e-72aa1bb3cf8f.json` |

## localStorage keys

| Key | Purpose |
| --- | --- |
| `tl26-selected-weekend` | Active weekend (`W1` or `W2`) |
| `tl26-w1-*` / `tl26-w2-*` | Per-weekend state (selections, filters, schedule view, vitamin schedule) |
| `tl26-selected-performances` | Weekend 2 selected performance IDs (legacy key) |
| `tl26-artist-filter` | Weekend 2 artist filter state (legacy key) |
| `tl26-active-day` | Weekend 2 last viewed day tab (legacy key) |
| `tl26-schedule-view` | Weekend 2 schedule view options (legacy key) |
| `tl26-vitamin-schedule` | Weekend 2 vitamin schedule (legacy key) |

Weekend 2 keeps the original unprefixed keys for backward compatibility. Weekend 1 uses `tl26-w1-` prefixed keys.

## Project structure

```text
src/
  App.tsx                    # Main app shell and state wiring
  constants.ts               # CDN URLs, storage keys, grid settings
  types.ts                   # API and app types
  hooks/
    useFestivalData.ts       # Fetch and parse lineup data
    useLocalStorage.ts       # Persisted state helpers
    useSharePlanImport.ts    # Import shared plans from URL
  utils/
    time.ts                  # Time parsing and formatting
    performances.ts          # Artist options, filtering, conflicts
    sharePlan.ts             # Encode/decode share URLs
    vitamin.ts               # Vitamin dose helpers
  components/
    WeekendSwitcher.tsx      # Weekend 1 / 2 toggle
    ArtistFilter.tsx         # Artist search and selection
    DayTabs.tsx              # Friday / Saturday / Sunday tabs
    ScheduleGrid.tsx         # Stage/time grid
    ScheduleViewToggles.tsx  # Schedule view mode toggles
    PerformanceBlock.tsx     # Individual set block
    PlanPanels.tsx           # Conflict summary and my plan list
    SharePlanButton.tsx      # Copy share link
    VitaminSidebar.tsx       # Vitamin dose editor
    StatePanels.tsx          # Loading, error, and empty states
```

## Conflict detection

Selected performances are compared pairwise. A conflict is reported only when two sets overlap by at least one minute — back-to-back sets (one ending at 17:00 and the next starting at 17:00) are not flagged.

Conflicting sets are highlighted with red borders and badges in the grid, listed in the conflict panel, and marked in the personal plan sidebar.

## License

[MIT](LICENSE)
