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
  const sizeClasses = size === 'sm' ? 'px-3 py-1 text-xs' : 'px-4 py-1.5 text-xs font-semibold'

  const activeClasses = active
    ? 'bg-gradient-to-r from-indigo-500 via-purple-600 to-pink-500 text-white shadow-neo-sm font-bold border-transparent'
    : 'bg-[#EEF2F6] text-slate-700 shadow-neo-sm hover:shadow-neo-card hover:text-slate-900 border border-white/60 active:shadow-neo-inset'

  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-2 rounded-full transition-all duration-200 select-none whitespace-nowrap active:scale-[0.98] ${sizeClasses} ${activeClasses} ${className}`}
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
