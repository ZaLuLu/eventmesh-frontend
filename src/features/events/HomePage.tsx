// EventMesh flagship homepage & premiere showcase
import React, { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { usePromotedEvents } from '@/hooks/useEvents'
import { api, Event, PaginatedResult } from '@/api'
import { CinematicHeroStage } from './components/CinematicHeroStage'
import { VerticalPosterCard } from '@/design-system/VerticalPosterCard'
import { SectionHeader } from '@/design-system/SectionHeader'
import { ArrowRight, Sparkle } from '@/design-system/Icon'
import { EventCarousel3D, type EventCarouselItem } from '@/design-system/3d'

export const HomePage: React.FC = () => {
  // 1. Promoted / Featured Events (for Top Sliding Stage with Dual Peeks)
  const { data: promoted = [] } = usePromotedEvents()

  // 2. Discovery Events Pool
  const [allEvents, setAllEvents] = useState<Event[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [loadError, setLoadError] = useState<boolean>(false)

  useEffect(() => {
    let isCancelled = false
    setIsLoading(true)
    setLoadError(false)

    const fetchEvents = async () => {
      try {
        const res: PaginatedResult<Event> = api.events.list
          ? await api.events.list({ limit: 30 })
          : await api.events.getEvents({ limit: 30 })

        if (!isCancelled) {
          setAllEvents(res.items || [])
          setIsLoading(false)
        }
      } catch (err) {
        if (!isCancelled) {
          console.error('Failed to fetch events for homepage:', err)
          setAllEvents([])
          setLoadError(true)
          setIsLoading(false)
        }
      }
    }

    fetchEvents()

    return () => {
      isCancelled = true
    }
  }, [])

  // 3. Featured Hero Carousel Events
  const heroSlideEvents = useMemo(() => {
    const pool = promoted.length > 0 ? promoted : allEvents
    const featured = pool.filter((e) => e.isSignature || e.promotion?.label || e.banner || e.poster)
    return (featured.length ? featured : pool).slice(0, 6)
  }, [promoted, allEvents])

  // 4. Strictly 4 Paid Premier Ticketed Events for Homepage
  const paidPremiereEvents = useMemo(() => {
    const pool = allEvents.length > 0 ? allEvents : promoted
    // Filter strictly for paid ticketed events
    const paid = pool.filter((e) => !e.isFree && (e.price || 0) > 0)
    if (paid.length >= 4) return paid.slice(0, 4)
    // Fallback if fewer than 4 paid are marked in store
    const nonFree = pool.filter((e) => !e.isFree)
    if (nonFree.length >= 4) return nonFree.slice(0, 4)
    return pool.slice(0, 4)
  }, [allEvents, promoted])

  return (
    <div className="w-full bg-paper text-ink min-h-screen flex flex-col select-none">
      {/* 1. Flagship Featured Cinematic Hero Stage */}
      <CinematicHeroStage events={heroSlideEvents} />

      {/* 2. Curated Premieres Showcase (Strictly 4 Paid Ticketed Events in Vertical Poster Ratio) */}
      <section className="relative w-full py-12 sm:py-16 border-b border-line bg-paper">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <SectionHeader
            title="Curated Premieres"
            subtitle="Top ticketed hackathons, tech summits, and creative masterclasses happening across campus and the city."
            action={
              <Link
                to="/explore?free=false"
                className="text-xs sm:text-sm font-semibold text-accent hover:underline inline-flex items-center gap-1"
              >
                <span>View all paid passes</span>
                <ArrowRight size={14} weight="bold" />
              </Link>
            }
          />

          {isLoading ? (
            <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className="aspect-[2/3] w-full rounded-[22px] border border-line bg-surface-subtle animate-pulse"
                />
              ))}
            </div>
          ) : loadError ? (
            <div className="mt-8 rounded-2xl border border-line bg-card p-8 text-center text-ink-soft">
              <p>Unable to load premieres right now. Please refresh.</p>
            </div>
          ) : (
            <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {paidPremiereEvents.map((event, idx) => (
                <VerticalPosterCard
                  key={event.id}
                  event={event}
                  priority={idx < 2}
                />
              ))}
            </div>
          )}

          {/* 3. Short & Minimal "Explore more" CTA Button */}
          <div className="mt-12 flex flex-col items-center justify-center">
            <Link
              to="/explore"
              className="inline-flex items-center gap-2 px-7 py-3 rounded-full border border-line bg-card text-ink font-medium text-sm hover:border-accent hover:text-accent transition-all shadow-xs hover:shadow-md group"
            >
              <span>Explore more</span>
              <ArrowRight size={14} weight="bold" className="transition-transform group-hover:translate-x-1 text-accent" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
