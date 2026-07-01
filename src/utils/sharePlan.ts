import { DAY_ORDER } from '../constants'
import type { VitaminDose, VitaminScheduleState } from '../types'
import { createEmptyVitaminSchedule } from './vitamin'

export const SHARE_PLAN_PARAM = 'plan'
export const SHARE_PLAN_VERSION = 1

export interface SharePlanPayload {
  v: number
  p: string[]
  d: VitaminScheduleState['dosesByDay']
}

function toBase64Url(value: string): string {
  const bytes = new TextEncoder().encode(value)
  let binary = ''
  for (const byte of bytes) {
    binary += String.fromCharCode(byte)
  }
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

function fromBase64Url(value: string): string {
  const base64 = value.replace(/-/g, '+').replace(/_/g, '/')
  const padded = base64 + '='.repeat((4 - (base64.length % 4)) % 4)
  const binary = atob(padded)
  const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0))
  return new TextDecoder().decode(bytes)
}

function isVitaminDose(value: unknown): value is VitaminDose {
  if (!value || typeof value !== 'object') return false
  const dose = value as VitaminDose
  return (
    typeof dose.id === 'string' &&
    typeof dose.startTime === 'string' &&
    typeof dose.kickInMinutes === 'number' &&
    typeof dose.runMinutes === 'number'
  )
}

function normalizeVitaminSchedule(dosesByDay: SharePlanPayload['d']): VitaminScheduleState {
  const empty = createEmptyVitaminSchedule()

  for (const day of DAY_ORDER) {
    const doses = dosesByDay[day]
    if (!Array.isArray(doses)) continue
    empty.dosesByDay[day] = doses.filter(isVitaminDose)
  }

  return empty
}

export function createSharePayload(
  performanceIds: Iterable<string>,
  vitaminSchedule: VitaminScheduleState,
): SharePlanPayload {
  return {
    v: SHARE_PLAN_VERSION,
    p: Array.from(performanceIds),
    d: vitaminSchedule.dosesByDay,
  }
}

export function encodeSharePlan(
  performanceIds: Iterable<string>,
  vitaminSchedule: VitaminScheduleState,
): string {
  const payload = createSharePayload(performanceIds, vitaminSchedule)
  return toBase64Url(JSON.stringify(payload))
}

export function decodeSharePlan(encoded: string): SharePlanPayload | null {
  try {
    const parsed = JSON.parse(fromBase64Url(encoded)) as SharePlanPayload
    if (parsed.v !== SHARE_PLAN_VERSION) return null
    if (!Array.isArray(parsed.p) || !parsed.p.every((id) => typeof id === 'string')) return null
    if (!parsed.d || typeof parsed.d !== 'object') return null

    return {
      v: parsed.v,
      p: parsed.p,
      d: parsed.d,
    }
  } catch {
    return null
  }
}

export function buildShareUrl(
  performanceIds: Iterable<string>,
  vitaminSchedule: VitaminScheduleState,
): string {
  const encoded = encodeSharePlan(performanceIds, vitaminSchedule)
  const url = new URL(window.location.href)
  url.searchParams.set(SHARE_PLAN_PARAM, encoded)
  return url.toString()
}

export function parseSharePlanFromLocation(search: string): SharePlanPayload | null {
  const params = new URLSearchParams(search)
  const encoded = params.get(SHARE_PLAN_PARAM)
  if (!encoded) return null
  return decodeSharePlan(encoded)
}

export function clearSharePlanFromLocation(): void {
  const url = new URL(window.location.href)
  if (!url.searchParams.has(SHARE_PLAN_PARAM)) return
  url.searchParams.delete(SHARE_PLAN_PARAM)
  const next = `${url.pathname}${url.search}${url.hash}`
  window.history.replaceState({}, '', next)
}

export function importSharePlan(payload: SharePlanPayload): {
  performanceIds: Set<string>
  vitaminSchedule: VitaminScheduleState
} {
  return {
    performanceIds: new Set(payload.p),
    vitaminSchedule: normalizeVitaminSchedule(payload.d),
  }
}

export function hasShareablePlan(
  performanceIds: Set<string>,
  vitaminSchedule: VitaminScheduleState,
): boolean {
  const hasPerformances = performanceIds.size > 0
  const hasVitamins = DAY_ORDER.some((day) => (vitaminSchedule.dosesByDay[day]?.length ?? 0) > 0)
  return hasPerformances || hasVitamins
}
