import React from 'react'
import { FormField } from '@/api'
import { Field } from '@/design-system/primitives/Field'
import { Select } from '@/design-system/primitives/Select'
import { UploadSimple, Link as LinkIcon } from '@phosphor-icons/react'

export interface FormRendererProps {
  fields: FormField[]
  values: Record<string, any>
  onChange: (fieldId: string, value: any) => void
  errors?: Record<string, string>
  disabled?: boolean
}

export const FormRenderer: React.FC<FormRendererProps> = ({
  fields,
  values,
  onChange,
  errors = {},
  disabled = false,
}) => {
  if (!fields || fields.length === 0) {
    return (
      <p className="text-xs text-ink-soft py-2">
        Standard registration particulars apply.
      </p>
    )
  }

  return (
    <div className="space-y-4">
      {fields.map((field) => {
        const value = values[field.id] ?? ''
        const error = errors[field.id]

        // 1. Single Select
        if (field.type === 'select') {
          const options = (field.options || []).map((opt) => ({
            value: opt,
            label: opt,
          }))
          return (
            <Select
              key={field.id}
              label={field.label}
              options={[{ value: '', label: 'Select option...' }, ...options]}
              value={value}
              onChange={(e) => onChange(field.id, e.target.value)}
              error={error}
              helpText={field.helpText}
              required={field.required}
              disabled={disabled}
            />
          )
        }

        // 2. Multi-Select Checkboxes
        if (field.type === 'multiselect') {
          const currentArray: string[] = Array.isArray(value) ? value : []
          return (
            <div key={field.id} className="space-y-2">
              <label className="text-xs font-bold text-ink block">
                {field.label} {field.required && <span className="text-[#FF5C8A]">*</span>}
              </label>
              <div className="flex flex-wrap gap-2">
                {(field.options || ['Track A', 'Track B']).map((opt) => {
                  const isChecked = currentArray.includes(opt)
                  return (
                    <button
                      key={opt}
                      type="button"
                      disabled={disabled}
                      onClick={() => {
                        const updated = isChecked
                          ? currentArray.filter((item) => item !== opt)
                          : [...currentArray, opt]
                        onChange(field.id, updated)
                      }}
                      className={`px-3 py-1.5 rounded-full text-xs font-bold border-2 transition-colors ${
                        isChecked
                          ? 'bg-ink text-paper border-ink shadow-[2px_2px_0_#151130]'
                          : 'bg-card text-ink-soft border-ink/30 hover:border-ink'
                      }`}
                    >
                      {opt} {isChecked && '✓'}
                    </button>
                  )
                })}
              </div>
              {field.helpText && <p className="text-xs text-ink-soft">{field.helpText}</p>}
              {error && <p className="text-xs text-[#FF5C8A] font-bold">{error}</p>}
            </div>
          )
        }

        // 3. Single Checkbox
        if (field.type === 'checkbox') {
          return (
            <div key={field.id} className="flex items-start gap-3 pt-1">
              <input
                type="checkbox"
                id={`chk-${field.id}`}
                checked={Boolean(value)}
                onChange={(e) => onChange(field.id, e.target.checked)}
                disabled={disabled}
                className="mt-1 h-4 w-4 rounded-[4px] border-2 border-ink text-cobalt focus:ring-cobalt cursor-pointer"
              />
              <div>
                <label
                  htmlFor={`chk-${field.id}`}
                  className="text-xs sm:text-sm font-bold text-ink cursor-pointer select-none"
                >
                  {field.label}
                  {field.required && <span className="ml-1 text-[#FF5C8A] font-bold">*</span>}
                </label>
                {field.helpText && (
                  <p className="text-xs text-ink-soft mt-0.5">{field.helpText}</p>
                )}
                {error && (
                  <p className="text-xs text-[#FF5C8A] font-bold mt-0.5">{error}</p>
                )}
              </div>
            </div>
          )
        }

        // 4. File Upload
        if (field.type === 'file') {
          return (
            <div key={field.id} className="space-y-1.5">
              <label className="text-xs font-bold text-ink block">
                {field.label} {field.required && <span className="text-[#FF5C8A]">*</span>}
              </label>
              <div className="flex items-center gap-3 p-3 rounded-[12px] border-2 border-dashed border-ink/30 bg-paper hover:bg-paper-2 transition-colors">
                <UploadSimple className="w-5 h-5 text-ink-soft" weight="bold" />
                <input
                  type="file"
                  disabled={disabled}
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) onChange(field.id, file.name)
                  }}
                  className="text-xs text-ink-soft file:mr-3 file:py-1 file:px-3 file:rounded-full file:border-2 file:border-ink file:text-xs file:font-bold file:bg-card file:text-ink cursor-pointer"
                />
              </div>
              {value && <p className="text-xs font-mono text-ink">Selected: {value}</p>}
              {field.helpText && <p className="text-xs text-ink-soft">{field.helpText}</p>}
              {error && <p className="text-xs text-[#FF5C8A] font-bold">{error}</p>}
            </div>
          )
        }

        // 5. Long Text / Multiline
        if (field.type === 'longtext') {
          return (
            <Field
              key={field.id}
              multiline
              rows={4}
              label={field.label}
              value={value}
              onChange={(e) => onChange(field.id, e.target.value)}
              error={error}
              helpText={field.helpText}
              required={field.required}
              placeholder={field.placeholder}
              disabled={disabled}
            />
          )
        }

        // 6. Text, URL, Email, Phone, Number, Date
        return (
          <Field
            key={field.id}
            type={
              field.type === 'number'
                ? 'number'
                : field.type === 'date'
                ? 'date'
                : field.type === 'email'
                ? 'email'
                : field.type === 'url'
                ? 'url'
                : 'text'
            }
            label={field.label}
            value={value}
            onChange={(e) => onChange(field.id, e.target.value)}
            error={error}
            helpText={field.helpText}
            required={field.required}
            placeholder={field.placeholder}
            disabled={disabled}
          />
        )
      })}
    </div>
  )
}
