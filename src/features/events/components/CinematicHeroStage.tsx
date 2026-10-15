import React from 'react'
import { Event } from '@/api/contracts/event'
import { PanoramicHeroCarousel } from '@/design-system/PanoramicHeroCarousel'

export interface CinematicHeroStageProps {
  events?: Event[]
  className?: string
}

/**
 * CinematicHeroStage
 * Houses the PanoramicHeroCarousel with panoramic banner stage and side peeks.
 */
export const CinematicHeroStage: React.FC<CinematicHeroStageProps> = ({
  events = [],
  className = '',
}) => {
  return <PanoramicHeroCarousel events={events} className={className} />
}
