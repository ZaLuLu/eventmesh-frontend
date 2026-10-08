import { useMemo } from 'react'
import { computeOnEventColor, getContrastSummary } from '@/lib/contrast'

export function useEventTheme(color: string) {
  return useMemo(() => {
    const onEvent = computeOnEventColor(color)
    const summary = getContrastSummary(color)
    return {
      eventColor: color,
      onEventColor: onEvent,
      summary,
      style: {
        '--event': color,
        '--on-event': onEvent,
      } as React.CSSProperties,
    }
  }, [color])
}
