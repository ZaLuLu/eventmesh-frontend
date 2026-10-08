import React from 'react'

export interface MetaRowProps {
  label: string
  value: React.ReactNode
  className?: string
  hairline?: boolean
}

export const MetaRow: React.FC<MetaRowProps> = ({
  label,
  value,
  className = '',
  hairline = true,
}) => {
  return (
    <div
      className={`py-2.5 flex items-baseline justify-between gap-4 ${
        hairline ? 'border-b border-ink-15' : ''
      } ${className}`}
    >
      <span className="font-mono text-[11px] font-medium uppercase tracking-widecaps text-ink-60 flex-shrink-0">
        {label}
      </span>
      <span className="font-body text-sm font-semibold uppercase tracking-caps text-ink text-right break-words">
        {value}
      </span>
    </div>
  )
}
