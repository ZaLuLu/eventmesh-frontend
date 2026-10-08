import React from 'react'

export interface ChipProps {
  label: string
  active?: boolean
  onClick?: () => void
  onRemove?: () => void
  color?: string
  icon?: React.ReactNode
  size?: 'sm' | 'md'
  variant?: 'filter' | 'tag' | 'badge'
  className?: string
}

export const Chip: React.FC<ChipProps> = ({
  label,
  active = false,
  onClick,
  onRemove,
  color,
  icon,
  size = 'md',
  className = '',
}) => {
  const sizeClasses = size === 'sm' ? 'px-3 py-1 text-xs' : 'px-3.5 py-1.5 text-xs font-semibold'

  const activeClasses = active
    ? 'bg-md-primary-container text-md-on-primary-container border-md-primary-container font-bold shadow-2xs'
    : 'bg-white text-md-on-surface-variant border-md-outline hover:bg-black/[0.04] shadow-none'

  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-2 rounded-lg border transition-all duration-150 select-none whitespace-nowrap active:scale-[0.98] ${sizeClasses} ${activeClasses} ${className}`}
    >
      {icon && <span className="flex-shrink-0 text-current">{icon}</span>}
      {color && (
        <span
          className="inline-block h-2 w-2 rounded-full flex-shrink-0"
          style={{ backgroundColor: color }}
        />
      )}
      <span>{label}</span>
      {onRemove && (
        <span
          role="button"
          tabIndex={0}
          onClick={(e) => {
            e.stopPropagation()
            onRemove()
          }}
          className="ml-1 opacity-60 hover:opacity-100 font-bold"
          aria-label={`Remove ${label}`}
        >
          ×
        </span>
      )}
    </button>
  )
}
