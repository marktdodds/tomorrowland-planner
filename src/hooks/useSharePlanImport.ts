import { useEffect, useRef, useState } from 'react'
import type { VitaminScheduleState } from '../types'
import {
  clearSharePlanFromLocation,
  importSharePlan,
  parseSharePlanFromLocation,
} from '../utils/sharePlan'

interface UseSharePlanImportOptions {
  onImport: (performanceIds: Set<string>, vitaminSchedule: VitaminScheduleState) => void
}

export function useSharePlanImport({ onImport }: UseSharePlanImportOptions) {
  const [imported, setImported] = useState(false)
  const handledRef = useRef(false)

  useEffect(() => {
    if (handledRef.current) return

    const payload = parseSharePlanFromLocation(window.location.search)
    if (!payload) return

    handledRef.current = true
    const { performanceIds, vitaminSchedule } = importSharePlan(payload)
    onImport(performanceIds, vitaminSchedule)
    clearSharePlanFromLocation()
    setImported(true)
  }, [onImport])

  return { imported, dismissImported: () => setImported(false) }
}
