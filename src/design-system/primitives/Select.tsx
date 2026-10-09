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

    const baseClasses = `w-full h-12 bg-surface text-text text-small px-3.5 border border-line rounded-[10px] appearance-none transition-colors duration-150 cursor-pointer focus:outline-none focus:ring-2 ${
      error
        ? 'border-danger focus:ring-danger'
        : surface === 'admin'
        ? 'border-line focus:ring-admin-accent focus:border-admin-accent'
        : 'border-line focus:ring-accent focus:border-accent'
    } ${props.disabled ? 'opacity-40 cursor-not-allowed bg-subtle' : ''}`

    return (
      <div className="w-full flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="flex items-center justify-between text-small font-medium text-text select-none"
          >
            <span>
              {label}
              {required && <span className="ml-1 text-danger font-bold">*</span>}
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
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3.5 text-text-2">
            <ChevronDown className="h-4 w-4" />
          </div>
        </div>

        {helpText && !error && (
          <p className="text-caption text-text-2 mt-0.5">{helpText}</p>
        )}

        {error && (
          <p className="text-caption font-medium text-danger mt-0.5">
            {error}
          </p>
        )}
      </div>
    )
  }
)

Select.displayName = 'Select'
