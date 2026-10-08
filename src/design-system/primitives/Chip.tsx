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
  const sizeClasses = size === 'sm' ? 'px-3 py-1 text-xs' : 'px-4 py-2 text-xs font-semibold'

  const activeClasses = active
    ? 'bg-slate-900 text-white shadow-md shadow-slate-900/10 border-slate-900'
    : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-50 shadow-subtle'

  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-2 rounded-full border transition-all duration-200 select-none whitespace-nowrap active:scale-95 ${sizeClasses} ${activeClasses} ${className}`}
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
          className="ml-1 text-slate-400 hover:text-slate-600 font-bold"
          aria-label={`Remove ${label}`}
        >
          ×
        </span>
      )}
    </button>
  )
}
