import React from 'react'

export interface ChipProps {
  label: string
  active?: boolean
  onClick?: () => void
  onRemove?: () => void
  color?: string
  size?: 'sm' | 'md'
  className?: string
}

export const Chip: React.FC<ChipProps> = ({
  label,
  active = false,
  onClick,
  onRemove,
  color,
  size = 'md',
  className = '',
}) => {
  const sizeClasses = size === 'sm' ? 'px-2 py-1 text-[10px]' : 'px-3 py-1.5 text-[11px]'

  const activeClasses = active
    ? 'bg-ink text-paper border-ink'
    : 'bg-paper text-ink border-ink-15 hover:border-ink'

  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 font-mono font-medium uppercase tracking-widecaps border transition-all duration-150 select-none ${sizeClasses} ${activeClasses} ${className}`}
    >
      {color && (
        <span
          className="inline-block h-2 w-2 flex-shrink-0"
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
          className="ml-1 opacity-60 hover:opacity-100"
          aria-label={`Remove ${label}`}
        >
          ×
        </span>
      )}
    </button>
  )
}
