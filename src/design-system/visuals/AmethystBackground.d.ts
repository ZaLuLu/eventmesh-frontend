import React from 'react'

export interface AmethystBackgroundProps {
  className?: string
  style?: React.CSSProperties
  speed?: number
  paused?: boolean
}

declare const AmethystBackground: React.FC<AmethystBackgroundProps>
export default AmethystBackground
