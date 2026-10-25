import React from 'react'
import { Event } from '@/api/contracts/event'
import { SEED_EVENTS } from '@/api/adapters/mock/seedEvents'
import { PanoramicHeroCarousel } from '@/design-system/PanoramicHeroCarousel'

/**
 * Strictly the 3 flagship dummy featured events for the premiere hero carousel
 */
export const HERO_FEATURED_EVENTS: Event[] = SEED_EVENTS.slice(0, 3)

export interface CinematicHeroStageProps {
  events?: Event[]
  className?: string
}

/**
 * CinematicHeroStage
 * Houses the PanoramicHeroCarousel with panoramic banner stage and side peeks.
 * Strictly maintains only the 3 featured dummy events on the hero section.
 */
export const CinematicHeroStage: React.FC<CinematicHeroStageProps> = ({
  events = HERO_FEATURED_EVENTS,
  className = '',
}) => {
  const displayEvents = events && events.length > 0 ? events.slice(0, 3) : HERO_FEATURED_EVENTS
  return <PanoramicHeroCarousel events={displayEvents} className={className} />
}
