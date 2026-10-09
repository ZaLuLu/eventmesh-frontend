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
      <ol className="flex items-center gap-3 sm:gap-5 min-w-max pb-1">
        {steps.map((step, idx) => {
          const isCurrent = idx === currentStep
          const isCompleted = idx < currentStep
          const isClickable = Boolean(onStepClick && idx <= currentStep)

          const circleColor = isCurrent
            ? surface === 'admin'
              ? 'bg-admin-accent text-white'
              : 'bg-accent text-white'
            : isCompleted
            ? surface === 'admin'
              ? 'bg-[#E8ECEE] text-admin-accent font-bold'
              : 'bg-accent-soft text-accent font-bold'
            : 'bg-subtle text-text-3'

          return (
            <li key={step.id} className="flex items-center gap-3 sm:gap-4">
              <button
                type="button"
                disabled={!isClickable}
                onClick={() => onStepClick && onStepClick(idx)}
                className={`flex items-center gap-2.5 transition-colors duration-150 text-left ${
                  isClickable ? 'cursor-pointer hover:opacity-80' : 'cursor-default'
                }`}
              >
                {/* Flat Step Circle */}
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-caption font-semibold select-none ${circleColor}`}
                >
                  {isCompleted ? '✓' : idx + 1}
                </div>

                <span
                  className={`text-small transition-colors ${
                    isCurrent
                      ? 'text-text font-semibold'
                      : isCompleted
                      ? 'text-text font-medium'
                      : 'text-text-3 font-normal'
                  }`}
                >
                  {step.label}
                </span>
              </button>

              {idx < steps.length - 1 && (
                <div className="w-6 sm:w-10 h-px bg-line select-none" />
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
