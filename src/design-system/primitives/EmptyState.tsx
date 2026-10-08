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
    <div className="w-full py-16 px-6 border border-dashed border-ink-15 flex flex-col items-center justify-center text-center">
      <div className="text-ink-60 mb-4">
        {icon || <FolderX className="h-10 w-10 stroke-1" />}
      </div>
      <h4 className="font-display text-2xl uppercase text-ink mb-2">{title}</h4>
      <p className="font-body text-sm text-ink-60 max-w-md mb-6">{description}</p>
      {actionLabel && onAction && (
        <Button variant="secondary" size="sm" surface={surface} onClick={onAction}>
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
  retryLabel = 'Try Again',
  onRetry,
  surface = 'public',
}) => {
  return (
    <div className="w-full py-12 px-6 border-2 border-[#A32828] bg-[#A32828]/5 flex flex-col items-center justify-center text-center">
      <AlertCircle className="h-10 w-10 text-[#A32828] mb-3" />
      <h4 className="font-display text-2xl uppercase text-[#A32828] mb-1">{title}</h4>
      <p className="font-body text-sm text-ink mb-6 max-w-md">{message}</p>
      {onRetry && (
        <Button variant="secondary" size="sm" surface={surface} onClick={onRetry}>
          {retryLabel}
        </Button>
      )}
    </div>
  )
}
