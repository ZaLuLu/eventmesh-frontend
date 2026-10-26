// EventMesh flagship homepage & premiere showcase
import React, { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { usePromotedEvents } from '@/hooks/useEvents'
import { api, Event, PaginatedResult } from '@/api'
import { CinematicHeroStage, HERO_FEATURED_EVENTS } from './components/CinematicHeroStage'
import { VerticalPosterCard } from '@/design-system/VerticalPosterCard'
import { GhostPosterCard } from '@/design-system/primitives/GhostLoader'
import { SectionHeader } from '@/design-system/SectionHeader'
import { ArrowRight, Sparkle } from '@/design-system/Icon'
import { ActiveThemeTrio } from './components/ActiveThemeTrio'
import { QuickRSVPModal } from './components/QuickRSVPModal'

export const HomePage: React.FC = () => {
  // 1. Promoted / Featured Events (for Top Sliding Stage with Dual Peeks)
  const { data: promoted = [] } = usePromotedEvents()

  // 2. Discovery Events Pool
  const [allEvents, setAllEvents] = useState<Event[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [loadError, setLoadError] = useState<boolean>(false)
  const [quickRsvpEvent, setQuickRsvpEvent] = useState<Event | null>(null)

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

  // 3. Featured Hero Carousel Events - Strictly the 3 flagship dummy events
  const heroSlideEvents = HERO_FEATURED_EVENTS

  // 4. Layered Multi-Shelf Discovery Partitions (Decision A3)
  // Shelf 1: Strictly 4 Paid Premier Ticketed Events
  const paidPremiereEvents = useMemo(() => {
    const pool = allEvents.length > 0 ? allEvents : promoted
    const paid = pool.filter((e) => !e.isFree && (e.price || 0) > 0)
    if (paid.length >= 4) return paid.slice(0, 4)
    const nonFree = pool.filter((e) => !e.isFree)
    if (nonFree.length >= 4) return nonFree.slice(0, 4)
    return pool.slice(0, 4)
  }, [allEvents, promoted])

  // Shelf 2: Happening This Weekend / Upcoming Campus Hubs
  const weekendEvents = useMemo(() => {
    const pool = allEvents.length > 0 ? allEvents : promoted
    const premiereIds = new Set(paidPremiereEvents.map((e) => e.id))
    const candidates = pool.filter((e) => !premiereIds.has(e.id))
    return (candidates.length >= 4 ? candidates : pool).slice(0, 4)
  }, [allEvents, promoted, paidPremiereEvents])

  // Shelf 3: Campus Hackathons & Tech Sprints
  const hackathonEvents = useMemo(() => {
    const pool = allEvents.length > 0 ? allEvents : promoted
    const hacks = pool.filter(
      (e) =>
        e.category?.toLowerCase() === 'hackathon' ||
        e.title.toLowerCase().includes('hack') ||
        e.title.toLowerCase().includes('code') ||
        e.title.toLowerCase().includes('ai')
    )
    return (hacks.length >= 4 ? hacks : pool).slice(0, 4)
  }, [allEvents, promoted])

  // Shelf 4: 100% Free Admission / Student Access
  const freeEvents = useMemo(() => {
    const pool = allEvents.length > 0 ? allEvents : promoted
    const free = pool.filter((e) => e.isFree || e.price === 0)
    return (free.length >= 4 ? free : pool).slice(0, 4)
  }, [allEvents, promoted])

  return (
    <div className="w-full bg-paper text-ink min-h-screen flex flex-col">
      {/* 1. Flagship Featured Cinematic Hero Stage (Option A1: Immediate Poster Stage) */}
      <CinematicHeroStage events={heroSlideEvents} />

      {/* 2. Shelf 1: Curated Premieres Showcase (Clean Architectural Cards, Option A2) */}
      <section className="relative w-full py-10 sm:py-14 border-b border-line bg-paper">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <SectionHeader
            badge="Flagship Passes"
            title="Curated Premieres"
            subtitle="Top ticketed hackathons, summits, and creative masterclasses happening across campus."
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
            <div
              role="status"
              aria-live="polite"
              aria-label="Loading premiere events"
              className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
            >
              {[...Array(4)].map((_, i) => (
                <GhostPosterCard key={`ghost-poster-${i}`} />
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
                  key={`premiere-${event.id}`}
                  event={event}
                  priority={idx < 2}
                  onQuickRSVP={(evt) => setQuickRsvpEvent(evt)}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* 3. Shelf 2: Happening This Weekend */}
      <section className="relative w-full py-10 sm:py-14 border-b border-line bg-paper">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <SectionHeader
            badge="This Weekend"
            title="Happening Soon"
            subtitle="Stage productions, open mic sessions, and meetups lined up for the coming days."
            action={
              <Link
                to="/explore?date=weekend"
                className="text-xs sm:text-sm font-semibold text-accent hover:underline inline-flex items-center gap-1"
              >
                <span>Weekend calendar</span>
                <ArrowRight size={14} weight="bold" />
              </Link>
            }
          />

          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {weekendEvents.map((event) => (
              <VerticalPosterCard
                key={`weekend-${event.id}`}
                event={event}
                onQuickRSVP={(evt) => setQuickRsvpEvent(evt)}
              />
            ))}
          </div>
        </div>
      </section>

      {/* 4. Shelf 3: Campus Hackathons & Tech Sprints */}
      <section className="relative w-full py-10 sm:py-14 border-b border-line bg-paper">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <SectionHeader
            badge="Code & Build"
            title="Hackathons & Tech Sprints"
            subtitle="Build with fellow students, ship real prototypes, and compete for prize pools."
            action={
              <Link
                to="/explore?category=hackathon"
                className="text-xs sm:text-sm font-semibold text-accent hover:underline inline-flex items-center gap-1"
              >
                <span>All hackathons</span>
                <ArrowRight size={14} weight="bold" />
              </Link>
            }
          />

          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {hackathonEvents.map((event) => (
              <VerticalPosterCard
                key={`hack-${event.id}`}
                event={event}
                onQuickRSVP={(evt) => setQuickRsvpEvent(evt)}
              />
            ))}
          </div>
        </div>
      </section>

      {/* 5. Shelf 4: Free Admission / Student Access */}
      <section className="relative w-full py-10 sm:py-14 border-b border-line bg-paper">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <SectionHeader
            badge="Zero Cost"
            title="Free Student Passes"
            subtitle="Guest lectures, club orientations, and campus community meetups with zero fee."
            action={
              <Link
                to="/explore?free=true"
                className="text-xs sm:text-sm font-semibold text-accent hover:underline inline-flex items-center gap-1"
              >
                <span>Browse all free events</span>
                <ArrowRight size={14} weight="bold" />
              </Link>
            }
          />

          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {freeEvents.map((event) => (
              <VerticalPosterCard
                key={`free-${event.id}`}
                event={event}
                onQuickRSVP={(evt) => setQuickRsvpEvent(evt)}
              />
            ))}
          </div>
        </div>
      </section>

      {/* 6. Shelf 5: Active Theme Spotlight Trio */}
      <ActiveThemeTrio />

      {/* 7. Bottom Explore Action Bar */}
      <div className="py-12 flex flex-col items-center justify-center border-b border-line bg-paper">
        <Link
          to="/explore"
          className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full border border-line bg-card text-ink font-semibold text-sm hover:border-accent hover:text-accent transition-all shadow-xs hover:shadow-md group active:scale-95"
        >
          <span>Explore all campus events</span>
          <ArrowRight size={14} weight="bold" className="transition-transform group-hover:translate-x-1 text-accent" />
        </Link>
      </div>

      {/* 5. 1-Click Pass Desk Modal */}
      <QuickRSVPModal
        event={quickRsvpEvent}
        isOpen={Boolean(quickRsvpEvent)}
        onClose={() => setQuickRsvpEvent(null)}
      />
    </div>
  )
}
