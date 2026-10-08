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

    const baseInputClasses = `w-full font-body text-sm px-4 py-2.5 rounded-2xl transition-all duration-200 placeholder:text-slate-400 focus:outline-none ${
      surface === 'public'
        ? error
          ? 'bg-[#EEF2F6] shadow-neo-inset border border-rose-400 text-slate-800 focus:ring-2 focus:ring-rose-400/20'
          : 'bg-[#EEF2F6] shadow-neo-inset border border-white/60 text-slate-800 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20'
        : error
        ? 'bg-white border border-[#D93025] text-slate-900 focus:border-[#D93025] focus:ring-2 focus:ring-[#D93025]/20'
        : 'bg-white border border-slate-300 text-slate-900 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/20'
    } ${props.disabled ? 'opacity-50 cursor-not-allowed bg-slate-100' : ''}`

    return (
      <div className="w-full flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="flex items-center justify-between font-body text-xs font-semibold text-slate-700"
          >
            <span>
              {label}
              {required && <span className="ml-1 text-rose-500 font-bold">*</span>}
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
