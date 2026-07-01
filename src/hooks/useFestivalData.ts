import { useEffect, useState } from 'react'
import type { FestivalData, ParsedPerformance } from '../types'
import { enrichPerformance } from '../utils/performances'

interface UseFestivalDataResult {
  performances: ParsedPerformance[]
  loading: boolean
  error: string | null
  refetch: () => void
}

export function useFestivalData(dataUrl: string): UseFestivalDataResult {
  const [performances, setPerformances] = useState<ParsedPerformance[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [reloadToken, setReloadToken] = useState(0)

  useEffect(() => {
    let cancelled = false

    async function load() {
      setLoading(true)
      setError(null)

      try {
        const response = await fetch(dataUrl)
        if (!response.ok) {
          throw new Error(`Failed to load lineup (${response.status})`)
        }

        const data = (await response.json()) as FestivalData
        if (!cancelled) {
          setPerformances(data.performances.map(enrichPerformance))
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Unable to load festival data')
          setPerformances([])
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    void load()

    return () => {
      cancelled = true
    }
  }, [dataUrl, reloadToken])

  return {
    performances,
    loading,
    error,
    refetch: () => setReloadToken((token) => token + 1),
  }
}
