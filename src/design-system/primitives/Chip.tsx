import React from 'react'

export interface ChipProps {
  label?: string
  children?: React.ReactNode
  active?: boolean
  selected?: boolean
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
  children,
  active = false,
  selected,
  onClick,
  onRemove,
  color,
  icon,
  size = 'md',
  className = '',
}) => {
  const isSelected = selected !== undefined ? selected : active
  const chipLabel = children || label
  // Min height 40px on desktop, 44px on mobile for filters/chips; 14px font (or 13px for sm)
  const sizeClasses =
    size === 'sm'
      ? 'min-h-[36px] sm:min-h-[32px] px-3 py-1 text-caption'
      : 'min-h-[44px] sm:min-h-[40px] px-4 py-2 text-small'

  const activeClasses = isSelected
    ? 'bg-accent-soft text-accent font-semibold border-transparent'
    : 'bg-subtle text-text hover:text-text-2 border border-transparent hover:border-line'

  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-2 rounded-full transition-colors duration-150 select-none whitespace-nowrap focus-visible:outline-2 focus-visible:outline-text focus-visible:outline-offset-2 ${sizeClasses} ${activeClasses} ${className}`}
    >
      {icon && <span className="flex-shrink-0 text-current">{icon}</span>}
      {color && (
        <span
          className="inline-block h-2.5 w-2.5 rounded-full flex-shrink-0"
          style={{ backgroundColor: color }}
          aria-hidden="true"
        />
      )}
      <span>{chipLabel}</span>
      {onRemove && (
        <span
          role="button"
          tabIndex={0}
          onClick={(e) => {
            e.stopPropagation()
            onRemove()
          }}
          className="ml-1 opacity-70 hover:opacity-100 font-bold text-caption cursor-pointer"
          aria-label={`Remove ${label}`}
        >
          ×
        </span>
      )}
    </button>
  )
}
