import { useEffect, useState } from 'react'
import { ARTIST_SEARCH_DEBOUNCE_MS } from '../constants'
import { useDebouncedValue } from '../hooks/useDebouncedValue'
import type { ArtistOption } from '../types'

interface ArtistFilterProps {
  artists: ArtistOption[]
  query: string
  selectedArtistIds: Set<string>
  onQueryChange: (query: string) => void
  onToggleArtist: (artistId: string) => void
  onClear: () => void
}

export function ArtistFilter({
  artists,
  query,
  selectedArtistIds,
  onQueryChange,
  onToggleArtist,
  onClear,
}: ArtistFilterProps) {
  const [inputValue, setInputValue] = useState(query)
  const debouncedQuery = useDebouncedValue(inputValue, ARTIST_SEARCH_DEBOUNCE_MS)

  useEffect(() => {
    setInputValue(query)
  }, [query])

  useEffect(() => {
    if (debouncedQuery !== query) {
      onQueryChange(debouncedQuery)
    }
  }, [debouncedQuery, query, onQueryChange])

  const normalizedQuery = debouncedQuery.trim().toLowerCase()
  const filteredArtists = artists.filter((artist) =>
    artist.name.toLowerCase().includes(normalizedQuery),
  )

  return (
    <section className="panel artist-filter-panel">
      <div className="panel-header">
        <div>
          <h2>Find your artists</h2>
          <p>Search and pick artists to focus the schedule before you plan your weekend.</p>
        </div>
        {selectedArtistIds.size > 0 && (
          <button type="button" className="button button-ghost" onClick={onClear}>
            Clear {selectedArtistIds.size} selected
          </button>
        )}
      </div>

      <label className="search-field">
        <span className="sr-only">Search artists</span>
        <input
          type="search"
          placeholder="Search 400+ artists…"
          value={inputValue}
          onChange={(event) => setInputValue(event.target.value)}
        />
      </label>

      <div className="artist-chip-grid" role="listbox" aria-label="Artist filter">
        {filteredArtists.length === 0 ? (
          <p className="muted">No artists match “{debouncedQuery}”. Try another name.</p>
        ) : (
          filteredArtists.map((artist) => {
            const selected = selectedArtistIds.has(artist.id)
            return (
              <button
                key={artist.id}
                type="button"
                role="option"
                aria-selected={selected}
                className={`artist-chip ${selected ? 'selected' : ''}`}
                onClick={() => onToggleArtist(artist.id)}
              >
                {artist.image ? (
                  <img src={artist.image} alt="" className="artist-chip-avatar" loading="lazy" />
                ) : (
                  <span className="artist-chip-avatar placeholder" aria-hidden="true">
                    {artist.name.charAt(0)}
                  </span>
                )}
                <span className="artist-chip-copy">
                  <strong>{artist.name}</strong>
                  <small>{artist.performanceCount} set{artist.performanceCount === 1 ? '' : 's'}</small>
                </span>
              </button>
            )
          })
        )}
      </div>
    </section>
  )
}
