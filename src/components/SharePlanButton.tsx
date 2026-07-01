import { useState } from 'react'
import type { VitaminScheduleState } from '../types'
import { buildShareUrl, hasShareablePlan } from '../utils/sharePlan'

interface SharePlanButtonProps {
  performanceIds: Set<string>
  vitaminSchedule: VitaminScheduleState
}

async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    const input = document.createElement('textarea')
    input.value = text
    input.setAttribute('readonly', 'true')
    input.style.position = 'fixed'
    input.style.opacity = '0'
    document.body.appendChild(input)
    input.select()
    const copied = document.execCommand('copy')
    document.body.removeChild(input)
    return copied
  }
}

export function SharePlanButton({ performanceIds, vitaminSchedule }: SharePlanButtonProps) {
  const [status, setStatus] = useState<'idle' | 'copied' | 'error'>('idle')
  const canShare = hasShareablePlan(performanceIds, vitaminSchedule)

  const handleShare = async () => {
    if (!canShare) return

    const url = buildShareUrl(performanceIds, vitaminSchedule)
    const copied = await copyText(url)
    setStatus(copied ? 'copied' : 'error')
    window.setTimeout(() => setStatus('idle'), 2500)
  }

  return (
    <button
      type="button"
      className="button button-ghost"
      onClick={handleShare}
      disabled={!canShare}
    >
      {status === 'copied' ? 'Link copied!' : status === 'error' ? 'Copy failed' : 'Share plan'}
    </button>
  )
}
