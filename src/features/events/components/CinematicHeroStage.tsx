import React from 'react'
import { Event } from '@/api/contracts/event'
import { LiquidGlassCarousel } from '@/design-system/LiquidGlassCarousel'

export interface CinematicHeroStageProps {
  events?: Event[]
  className?: string
}

/**
 * CinematicHeroStage
 * Houses the LiquidGlassCarousel with optical refraction lens, inertial drag,
 * and side-peeking cards for the Top 60% hero featured stage.
 */
export const CinematicHeroStage: React.FC<CinematicHeroStageProps> = ({
  events = [],
  className = '',
}) => {
  return <LiquidGlassCarousel events={events} className={className} />
}
