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
      <ol className="flex items-center gap-3 sm:gap-6 min-w-max pb-2">
        {steps.map((step, idx) => {
          const isCurrent = idx === currentStep
          const isCompleted = idx < currentStep
          const isClickable = Boolean(onStepClick && idx <= currentStep)

          return (
            <li key={step.id} className="flex items-center gap-3 sm:gap-4">
              <button
                type="button"
                disabled={!isClickable}
                onClick={() => onStepClick && onStepClick(idx)}
                className={`flex items-center gap-2.5 transition-all text-left ${
                  isClickable ? 'cursor-pointer' : 'cursor-default'
                }`}
              >
                {/* M3 Circular Indicator */}
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                    isCurrent
                      ? 'bg-md-primary text-white shadow-xs'
                      : isCompleted
                      ? 'bg-md-primary-container text-md-primary'
                      : 'bg-[#F1F3F4] text-slate-500'
                  }`}
                >
                  {isCompleted ? '✓' : idx + 1}
                </div>

                <span
                  className={`text-xs font-semibold tracking-normal ${
                    isCurrent
                      ? 'text-md-on-surface font-bold'
                      : isCompleted
                      ? 'text-md-primary font-medium'
                      : 'text-slate-500 font-medium'
                  }`}
                >
                  {step.label}
                </span>
              </button>

              {idx < steps.length - 1 && (
                <div className="w-8 sm:w-12 h-0.5 bg-[#DADCE0] select-none" />
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
