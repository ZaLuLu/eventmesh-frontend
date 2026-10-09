import React from 'react'
import { FolderX, AlertCircle } from 'lucide-react'
import { Button } from './Button'

export interface EmptyStateProps {
  title?: string
  description?: string
  actionLabel?: string
  onAction?: () => void
  icon?: React.ReactNode
  surface?: 'public' | 'admin'
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = 'No items found',
  description = 'There are currently no records matching this query.',
  actionLabel,
  onAction,
  icon,
  surface = 'public',
}) => {
  return (
    <div className="w-full max-h-[240px] py-6 px-4 border border-line rounded-[14px] bg-surface flex flex-col items-center justify-center text-center">
      <div className="text-text-3 mb-2">
        {icon || <FolderX className="h-8 w-8 stroke-1 text-text-3" />}
      </div>
      <h4 className="text-h3 font-semibold text-text mb-1">{title}</h4>
      <p className="text-small text-text-2 max-w-md mb-4">{description}</p>
      {actionLabel && onAction && (
        <Button variant="secondary" size="compact" surface={surface} onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  )
}

export interface ErrorStateProps {
  title?: string
  message?: string
  retryLabel?: string
  onRetry?: () => void
  surface?: 'public' | 'admin'
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Something went wrong',
  message = 'An error occurred while loading this content. Please try again.',
  retryLabel = 'Try again',
  onRetry,
  surface = 'public',
}) => {
  return (
    <div className="w-full max-h-[240px] py-6 px-4 border border-danger/30 bg-danger/5 rounded-[14px] flex flex-col items-center justify-center text-center">
      <AlertCircle className="h-8 w-8 text-danger mb-2" />
      <h4 className="text-h3 font-semibold text-danger mb-1">{title}</h4>
      <p className="text-small text-text max-w-md mb-4">{message}</p>
      {onRetry && (
        <Button variant="secondary" size="compact" surface={surface} onClick={onRetry}>
          {retryLabel}
        </Button>
      )}
    </div>
  )
}
