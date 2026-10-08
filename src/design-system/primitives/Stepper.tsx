import React from 'react'

export interface StepItem {
  id: string | number
  label: string
}

export interface StepperProps {
  steps: StepItem[]
  currentStep: number
  onStepClick?: (stepIndex: number) => void
  className?: string
  surface?: 'public' | 'admin'
}

export const Stepper: React.FC<StepperProps> = ({
  steps,
  currentStep,
  onStepClick,
  className = '',
  surface = 'public',
}) => {
  return (
    <nav aria-label="Progress" className={`w-full overflow-x-auto ${className}`}>
      <ol className="flex items-center gap-2 sm:gap-4 min-w-max pb-2">
        {steps.map((step, idx) => {
          const isCurrent = idx === currentStep
          const isCompleted = idx < currentStep
          const isClickable = Boolean(onStepClick && idx <= currentStep)

          const activeColor =
            surface === 'admin'
              ? isCurrent
                ? 'bg-admin-accent text-white border-admin-accent'
                : isCompleted
                ? 'bg-ink text-paper border-ink'
                : 'bg-paper text-ink-60 border-admin-border'
              : isCurrent
              ? 'bg-ink text-paper border-ink'
              : isCompleted
              ? 'bg-paper-deep text-ink border-ink-15'
              : 'bg-paper text-ink-60 border-ink-15'

          return (
            <li key={step.id} className="flex items-center gap-2 sm:gap-3">
              <button
                type="button"
                disabled={!isClickable}
                onClick={() => onStepClick && onStepClick(idx)}
                className={`flex items-center gap-2 border px-3 py-1.5 transition-colors ${activeColor} ${
                  isClickable ? 'cursor-pointer hover:border-ink' : 'cursor-default'
                }`}
              >
                <span className="font-mono text-[10px] font-bold">
                  {String(idx + 1).padStart(2, '0')}
                </span>
                <span className="font-mono text-[11px] uppercase tracking-widecaps font-medium">
                  {step.label}
                </span>
              </button>

              {idx < steps.length - 1 && (
                <span className="text-ink-15 font-mono text-xs select-none">→</span>
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
