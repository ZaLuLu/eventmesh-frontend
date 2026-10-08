import React from 'react'
import { ChevronDown } from 'lucide-react'

export interface SelectOption {
  value: string
  label: string
}

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  options: SelectOption[]
  helpText?: string
  error?: string
  surface?: 'public' | 'admin'
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      label,
      options,
      helpText,
      error,
      surface = 'public',
      className = '',
      required,
      id,
      ...props
    },
    ref
  ) => {
    const inputId = id || (label ? `select-${label.toLowerCase().replace(/\s+/g, '-')}` : undefined)

    const baseClasses = `w-full bg-paper text-ink font-body text-sm px-3.5 py-3 border appearance-none transition-colors duration-150 cursor-pointer ${
      error
        ? 'border-[#A32828] focus:border-[#A32828]'
        : surface === 'admin'
        ? 'border-admin-border focus:border-admin-accent'
        : 'border-ink focus:border-ink'
    } ${props.disabled ? 'opacity-40 cursor-not-allowed bg-paper-deep' : ''}`

    return (
      <div className="w-full flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="flex items-center justify-between font-mono text-[11px] font-medium uppercase tracking-widecaps text-ink-60"
          >
            <span>
              {label}
              {required && <span className="ml-1 text-[#A32828] font-bold">*</span>}
            </span>
          </label>
        )}

        <div className="relative">
          <select
            ref={ref}
            id={inputId}
            required={required}
            className={`${baseClasses} pr-10 ${className}`}
            {...props}
          >
            {options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-ink">
            <ChevronDown className="h-4 w-4" />
          </div>
        </div>

        {helpText && !error && (
          <p className="font-body text-xs text-ink-60">{helpText}</p>
        )}

        {error && (
          <p className="font-mono text-[11px] uppercase tracking-wide font-medium text-[#A32828]">
            {error}
          </p>
        )}
      </div>
    )
  }
)

Select.displayName = 'Select'
