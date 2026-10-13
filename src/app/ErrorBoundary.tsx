import React, { Component, ErrorInfo, ReactNode } from 'react'
import { WarningCircle, ArrowClockwise, House } from '@/design-system/Icon'
import { Sticker } from '@/design-system/primitives/Sticker'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('EventMesh Caught Error:', error, errorInfo)
  }

  public handleReset = () => {
    this.setState({ hasError: false, error: null })
    window.location.reload()
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="w-full min-h-[70vh] flex flex-col items-center justify-center p-6 text-center select-none bg-paper">
          <div className="max-w-md w-full bg-card border-[1.5px] border-ink rounded-ticket p-8 shadow-offset-lg space-y-6">
            <div className="flex justify-center">
              <Sticker color="tangerine" size="md" tilt={-2} icon={<WarningCircle size={14} weight="bold" />}>
                Circuit Tripped · 500
              </Sticker>
            </div>

            <div className="space-y-2">
              <h1 className="font-display font-extrabold text-4xl sm:text-5xl text-ink tracking-tight">
                System glitch <span className="font-accent text-tangerine not-italic font-normal">detected</span>
              </h1>
              <p className="text-ink-soft text-sm sm:text-base font-sans leading-relaxed">
                An unexpected condition interrupted the canvas. Your saved tickets and registrations remain secure in memory.
              </p>
            </div>

            {this.state.error && (
              <pre className="bg-paper-2 border border-ink/15 rounded-lg p-3 text-left text-xs font-mono text-red-700 overflow-x-auto max-h-24">
                {this.state.error.message}
              </pre>
            )}

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={this.handleReset}
                className="btn-funk-primary w-full sm:w-auto px-6 py-2.5 text-sm font-bold flex items-center justify-center gap-2"
              >
                <ArrowClockwise size={16} weight="bold" />
                <span>Reload Application</span>
              </button>
              <a
                href="/"
                className="btn-funk-secondary w-full sm:w-auto px-6 py-2.5 text-sm font-bold flex items-center justify-center gap-2"
              >
                <House size={16} weight="bold" />
                <span>Home Page</span>
              </a>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
