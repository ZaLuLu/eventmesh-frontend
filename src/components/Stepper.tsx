import React, { useRef, useState, useEffect, useCallback } from 'react';
import './Stepper.css';

export interface StepItem {
  id?: string;
  title: string;
  description?: string;
  icon?: React.ReactNode;
}

export interface StepperProps {
  steps: StepItem[];
  activeStep: number;
  onStepChange?: (index: number) => void;
  direction?: 'horizontal' | 'vertical';
  framed?: boolean;
  className?: string;
  allowStepClick?: boolean;
}

export const Stepper: React.FC<StepperProps> = ({
  steps,
  activeStep,
  onStepChange,
  direction = 'horizontal',
  framed = false,
  className = '',
  allowStepClick = true,
}) => {
  const trackRef = useRef<HTMLDivElement>(null);
  const segmentRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const [gliderStyle, setGliderStyle] = useState<React.CSSProperties>({ opacity: 0 });

  const updateGlider = useCallback(() => {
    const track = trackRef.current;
    const activeSeg = segmentRefs.current[activeStep];
    if (!track || !activeSeg) {
      setGliderStyle({ opacity: 0 });
      return;
    }

    if (direction === 'horizontal') {
      const trackRect = track.getBoundingClientRect();
      const segRect = activeSeg.getBoundingClientRect();
      const offsetLeft = segRect.left - trackRect.left;
      const width = segRect.width;

      setGliderStyle({
        opacity: 1,
        transform: `translateX(${offsetLeft}px)`,
        width: `${width}px`,
      });
    } else {
      const trackRect = track.getBoundingClientRect();
      const segRect = activeSeg.getBoundingClientRect();
      const offsetTop = segRect.top - trackRect.top;
      const height = segRect.height;

      setGliderStyle({
        opacity: 1,
        transform: `translateY(${offsetTop}px)`,
        height: `${height}px`,
      });
    }
  }, [activeStep, direction]);

  useEffect(() => {
    updateGlider();
    window.addEventListener('resize', updateGlider);
    return () => window.removeEventListener('resize', updateGlider);
  }, [updateGlider]);

  return (
    <div
      className={`stepper ${framed ? 'stepper--framed' : ''} ${
        direction === 'vertical' ? 'stepper--vertical' : ''
      } ${className}`.trim()}
      role="navigation"
      aria-label="Progress Stepper"
    >
      <div className="stepper__rim" />
      <div className="stepper__header">
        <div className="stepper__track" ref={trackRef}>
          <div className="stepper__glider" style={gliderStyle} aria-hidden="true" />
          {steps.map((step, index) => {
            const isCompleted = index < activeStep;
            const isActive = index === activeStep;
            const status = isCompleted ? 'complete' : isActive ? 'active' : 'upcoming';

            const handleClick = () => {
              if (allowStepClick && onStepChange) {
                onStepChange(index);
              }
            };

            return (
              <button
                key={step.id || index}
                ref={(el) => (segmentRefs.current[index] = el)}
                type="button"
                className="stepper__segment"
                data-status={status}
                onClick={handleClick}
                disabled={!allowStepClick && !isActive && !isCompleted}
                aria-current={isActive ? 'step' : undefined}
                aria-label={`Step ${index + 1}: ${step.title}`}
              >
                <span className="stepper__badge" data-status={status}>
                  {isCompleted ? '✓' : index + 1}
                </span>
                <span className="stepper__text">
                  <span className="stepper__title">{step.title}</span>
                  {step.description && (
                    <span className="stepper__description">{step.description}</span>
                  )}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
