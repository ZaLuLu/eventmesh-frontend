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
        hairline ? 'border-b border-line' : ''
      } ${className}`}
    >
      <span className="text-small text-text-2 flex-shrink-0">
        {label}
      </span>
      <span className="text-small font-semibold text-text text-right break-words">
        {value}
      </span>
    </div>
  )
}
