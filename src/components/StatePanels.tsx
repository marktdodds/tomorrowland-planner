import type { ReactNode } from 'react'

interface LoadingStateProps {
  message?: string
}

export function LoadingState({ message = 'Loading the weekend lineup…' }: LoadingStateProps) {
  return (
    <div className="state-panel loading-panel">
      <div className="spinner" aria-hidden="true" />
      <p>{message}</p>
    </div>
  )
}

interface ErrorStateProps {
  message: string
  onRetry: () => void
}

export function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <div className="state-panel error-panel">
      <h2>Could not load lineup</h2>
      <p>{message}</p>
      <button type="button" className="button button-primary" onClick={onRetry}>
        Try again
      </button>
    </div>
  )
}

interface EmptyStateProps {
  title: string
  description: string
  action?: ReactNode
}

export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <div className="state-panel empty-panel">
      <h2>{title}</h2>
      <p>{description}</p>
      {action}
    </div>
  )
}
