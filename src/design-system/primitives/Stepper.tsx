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
                {/* Tactile Circular Indicator */}
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                    isCurrent
                      ? 'bg-gradient-to-br from-indigo-500 via-purple-600 to-pink-500 text-white shadow-neo-sm scale-105'
                      : isCompleted
                      ? 'bg-[#EEF2F6] shadow-neo-inset text-emerald-600 border border-emerald-200/60'
                      : 'bg-[#EEF2F6] shadow-neo-inset text-slate-400 border border-white/60'
                  }`}
                >
                  {isCompleted ? '✓' : idx + 1}
                </div>

                <span
                  className={`text-xs tracking-normal ${
                    isCurrent
                      ? 'text-slate-900 font-bold'
                      : isCompleted
                      ? 'text-slate-700 font-semibold'
                      : 'text-slate-400 font-medium'
                  }`}
                >
                  {step.label}
                </span>
              </button>

              {idx < steps.length - 1 && (
                <div className="w-8 sm:w-12 h-0.5 bg-slate-200/80 rounded-full select-none" />
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
