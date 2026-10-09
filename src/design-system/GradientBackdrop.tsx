import React, { Component, ErrorInfo, ReactNode, useEffect, useState } from 'react'
import CoralDawn from '@/vendor/ui/coral-dawn'

interface ErrorBoundaryProps {
  fallback: ReactNode
  children: ReactNode
}

interface ErrorBoundaryState {
  hasError: boolean
}

class GradientErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(_: Error): ErrorBoundaryState {
    return { hasError: true }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.warn('Coral Dawn gradient failed to render, falling back to solid #FDEBE6:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback
    }
    return this.props.children
  }
}

export interface GradientBackdropProps {
  className?: string
  speed?: number
}

/**
 * GradientBackdrop wraps the vendor Coral Dawn component.
 * - Positioned absolutely as a pointer-events-none, aria-hidden background layer.
 * - Fallback to solid #FDEBE6 if an error occurs.
 * - Pauses animation when the tab is hidden or if prefers-reduced-motion is enabled.
 * - Never place small body text directly on it; all content must sit on solid surfaces.
 */
export const GradientBackdrop: React.FC<GradientBackdropProps> = ({
  className = '',
  speed = 15,
}) => {
  const [isPaused, setIsPaused] = useState(false)

  useEffect(() => {
    // 1. Check prefers-reduced-motion
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    const handleMotionChange = () => {
      if (mediaQuery.matches) {
        setIsPaused(true)
      } else if (!document.hidden) {
        setIsPaused(false)
      }
    }

    // 2. Check tab visibility
    const handleVisibilityChange = () => {
      if (document.hidden || mediaQuery.matches) {
        setIsPaused(true)
      } else {
        setIsPaused(false)
      }
    }

    // Initial check
    if (mediaQuery.matches || document.hidden) {
      setIsPaused(true)
    }

    mediaQuery.addEventListener('change', handleMotionChange)
    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      mediaQuery.removeEventListener('change', handleMotionChange)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [])

  const solidFallback = (
    <div
      aria-hidden="true"
      className="absolute inset-0 w-full h-full bg-[#FDEBE6] pointer-events-none"
    />
  )

  return (
    <div
      aria-hidden="true"
      className={`absolute inset-0 w-full h-full pointer-events-none overflow-hidden select-none -z-10 ${className}`}
      style={{ backgroundColor: '#FDEBE6' }}
    >
      <GradientErrorBoundary fallback={solidFallback}>
        <CoralDawn
          paused={isPaused}
          speed={speed}
          className="w-full h-full object-cover opacity-90"
        />
      </GradientErrorBoundary>
    </div>
  )
}
