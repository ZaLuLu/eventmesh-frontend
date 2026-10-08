import React from 'react'

export interface FieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  helpText?: string
  error?: string
  multiline?: boolean
  rows?: number
  surface?: 'public' | 'admin'
}

export const Field = React.forwardRef<
  HTMLInputElement | HTMLTextAreaElement,
  FieldProps
>(
  (
    {
      label,
      helpText,
      error,
      multiline = false,
      rows = 4,
      surface = 'public',
      className = '',
      required,
      id,
      ...props
    },
    ref
  ) => {
    const inputId = id || (label ? `field-${label.toLowerCase().replace(/\s+/g, '-')}` : undefined)

    const baseInputClasses = `w-full bg-white text-[#1F1F1F] font-body text-sm px-4 py-2.5 rounded-xl border transition-all duration-200 placeholder:text-[#5F6368]/60 focus:outline-none ${
      error
        ? 'border-[#D93025] focus:border-[#D93025] focus:ring-2 focus:ring-[#D93025]/20'
        : surface === 'admin'
        ? 'border-[#DADCE0] focus:border-[#1A73E8] focus:ring-2 focus:ring-[#1A73E8]/20'
        : 'border-[#DADCE0] focus:border-[#1A73E8] focus:ring-2 focus:ring-[#1A73E8]/20'
    } ${props.disabled ? 'opacity-40 cursor-not-allowed bg-[#F1F3F4]' : ''}`

    return (
      <div className="w-full flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="flex items-center justify-between font-body text-xs font-semibold text-[#444746]"
          >
            <span>
              {label}
              {required && <span className="ml-1 text-[#D93025] font-bold">*</span>}
            </span>
          </label>
        )}

        {multiline ? (
          <textarea
            ref={ref as React.Ref<HTMLTextAreaElement>}
            id={inputId}
            rows={rows}
            required={required}
            className={`${baseInputClasses} resize-y ${className}`}
            {...(props as React.TextareaHTMLAttributes<HTMLTextAreaElement>)}
          />
        ) : (
          <input
            ref={ref as React.Ref<HTMLInputElement>}
            id={inputId}
            required={required}
            className={`${baseInputClasses} ${className}`}
            {...props}
          />
        )}

        {helpText && !error && (
          <p className="font-body text-xs text-[#5F6368]">{helpText}</p>
        )}

        {error && (
          <p className="font-body text-xs font-medium text-[#D93025]">
            {error}
          </p>
        )}
      </div>
    )
  }
)

Field.displayName = 'Field'
