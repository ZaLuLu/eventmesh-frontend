// Hallmark macrostructure: LandingPage
import React, { useState, useEffect, useMemo, useCallback } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { usePromotedEvents, useNewestEvents } from '@/hooks/useEvents'
import { api, Event, PaginatedResult } from '@/api'
import { PromotedTicketStack } from './components/PromotedTicketStack'
import { NewEventsRail } from './components/NewEventsRail'
import { ClubsStrip } from './components/ClubsStrip'
import { TicketLifecycleTeaser } from './components/TicketLifecycleTeaser'
import { EventsToolbar } from './components/EventsToolbar'
import { EventsDiscoveryView } from './components/EventsDiscoveryView'
import { Marquee } from '@/design-system/Marquee'
import { SectionHeader } from '@/design-system/SectionHeader'
import { Sticker } from '@/design-system/primitives/Sticker'
import { Ticket, ArrowDown, Sparkle } from '@/design-system/Icon'

export const HomePage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams()

  // 1. Sync View Mode with URL (?view=) and LocalStorage
  const urlView = searchParams.get('view')
  const initialView =
    urlView === 'list' || urlView === 'grid'
      ? urlView
      : (localStorage.getItem('eventmesh_view_preference') as 'grid' | 'list') || 'grid'

  const [viewMode, setViewMode] = useState<'grid' | 'list'>(initialView)

  const handleViewModeChange = useCallback(
    (mode: 'grid' | 'list') => {
      setViewMode(mode)
      try {
        localStorage.setItem('eventmesh_view_preference', mode)
      } catch {}
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev)
          next.set('view', mode)
          return next
        },
        { replace: true }
      )
    },
    [setSearchParams]
  )

  // 2. Filters State (synced with URL)
  const category = searchParams.get('category') || 'all'
  const searchQuery = searchParams.get('q') || ''
  const dateFilter = searchParams.get('date') || 'all'
  const freeOnly = searchParams.get('free') === 'true'
  const sortBy = searchParams.get('sort') || 'date-asc'

  const updateParam = useCallback(
    (key: string, val: string) => {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev)
          if (!val || val === 'all' || val === 'false') {
            next.delete(key)
          } else {
            next.set(key, val)
          }
          return next
        },
        { replace: true }
      )
    },
    [setSearchParams]
  )

  // 3. Promoted & Newest Data
  const { data: promoted = [] } = usePromotedEvents()
  const { data: newestData, isLoading: isNewestLoading } = useNewestEvents({ limit: 6 })
  const newestEvents = useMemo(() => newestData?.items || [], [newestData?.items])

  // 4. Discovery Events: Cursor Pagination & Filter Fetching
  const [discoveryEvents, setDiscoveryEvents] = useState<Event[]>([])
  const [totalCount, setTotalCount] = useState<number>(0)
  const [nextCursor, setNextCursor] = useState<string | undefined>(undefined)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false)

  useEffect(() => {
    let isCancelled = false
    setIsLoading(true)

    const fetchDiscovery = async () => {
      try {
        const res: PaginatedResult<Event> = api.events.list
          ? await api.events.list({
              category: category !== 'all' ? category : undefined,
              q: searchQuery || undefined,
              date: dateFilter !== 'all' ? dateFilter : undefined,
              free: freeOnly ? true : undefined,
              sort: sortBy,
              limit: 12,
            })
          : await api.events.getEvents({
              category: category !== 'all' ? category : undefined,
              search: searchQuery || undefined,
              limit: 12,
            })

        if (!isCancelled) {
          setDiscoveryEvents(res.items || [])
          setTotalCount(res.totalCount || res.items.length)
          setNextCursor(res.nextCursor)
          setIsLoading(false)
        }
      } catch (err) {
        if (!isCancelled) {
          console.error('Failed to fetch discovery events:', err)
          setIsLoading(false)
        }
      }
    }

    fetchDiscovery()

    return () => {
      isCancelled = true
    }
  }, [category, searchQuery, dateFilter, freeOnly, sortBy])

  const handleLoadMore = async () => {
    if (!nextCursor || isLoadingMore) return
    setIsLoadingMore(true)
    try {
      const res: PaginatedResult<Event> = api.events.list
        ? await api.events.list({
            category: category !== 'all' ? category : undefined,
            q: searchQuery || undefined,
            date: dateFilter !== 'all' ? dateFilter : undefined,
            free: freeOnly ? true : undefined,
            sort: sortBy,
            cursor: nextCursor,
            limit: 12,
          })
        : await api.events.getEvents({
            category: category !== 'all' ? category : undefined,
            search: searchQuery || undefined,
            cursor: nextCursor,
            limit: 12,
          })

      setDiscoveryEvents((prev) => [...prev, ...(res.items || [])])
      setNextCursor(res.nextCursor)
    } catch (err) {
      console.error('Failed to load more events:', err)
    } finally {
      setIsLoadingMore(false)
    }
  }

  const handleResetFilters = () => {
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams()
        if (prev.get('view')) next.set('view', prev.get('view')!)
        return next
      },
      { replace: true }
    )
  }

  return (
    <div className="w-full bg-paper text-ink min-h-screen flex flex-col select-none">
      {/* ==============================================================
          HERO ACT: TOP HALF PROMOTIONS (Page Directives 7.1 directive 2)
          Kills V-08 (no blue slab, no curved marquee).
          ============================================================== */}
      <section className="relative w-full pt-8 pb-12 sm:pt-14 sm:pb-20 border-b border-ink/10 overflow-hidden">
        <div className="max-w-[1320px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            {/* Left Headline Stage */}
            <div className="lg:col-span-7 space-y-6 text-left">
              {/* Funky Sticker Tag */}
              <div className="flex items-center gap-2">
                <Sticker color="mustard" size="sm" tilt={-2}>
                  Campus Season 2026
                </Sticker>
                <span className="text-xs font-mono font-semibold text-ink-soft">
                  Two-tap RSVP · Verified Identity
                </span>
              </div>

              {/* Giant Display Headline (Gate 38a: Strictly Roman) */}
              <h1 className="font-display font-black text-[clamp(2.75rem,7vw,5.5rem)] leading-[0.95] tracking-tight text-ink">
                Where student ideas make{' '}
                <span className="font-accent text-cobalt not-italic font-normal">
                  noise.
                </span>
              </h1>

              {/* Subcopy */}
              <p className="text-base sm:text-lg text-ink-soft max-w-xl leading-relaxed">
                Handcrafted hackathons, algorithmic sprints, and design salons from autonomous campus collectives. Grab a seat in two taps.
              </p>

              {/* Primary Action Buttons */}
              <div className="flex flex-wrap items-center gap-3.5 pt-2">
                <a
                  href="#discovery"
                  className="btn-funk-primary px-6 py-3 text-sm font-bold uppercase tracking-wider flex items-center gap-2"
                >
                  <span>Browse events</span>
                  <ArrowDown size={15} weight="bold" />
                </a>

                <Link
                  to="/attendee/dashboard"
                  className="btn-funk-secondary px-6 py-3 text-sm font-bold uppercase tracking-wider flex items-center gap-2"
                >
                  <Ticket size={16} weight="bold" className="text-cobalt" />
                  <span>My tickets & badge</span>
                </Link>
              </div>

              {/* Subtle Trust Micro-bar */}
              <div className="pt-4 flex items-center gap-6 text-xs font-mono text-ink-soft border-t border-ink/10">
                <div>
                  <span className="font-bold text-ink">9</span> student societies
                </div>
                <span>·</span>
                <div>
                  <span className="font-bold text-ink">100%</span> verified attendees
                </div>
                <span>·</span>
                <div>
                  <span className="font-bold text-ink">Zero</span> neon slop
                </div>
              </div>
            </div>

            {/* Right: Draggable Promoted Ticket Stack (Section 7.1 directive 2) */}
            <div className="lg:col-span-5 flex justify-center lg:justify-end">
              <PromotedTicketStack events={promoted} />
            </div>
          </div>
        </div>
      </section>

      {/* ==============================================================
          LIVE MARQUEE TICKER STRIP (Page Directives 7.1 directive 3)
          ============================================================== */}
      <Marquee
        items={[
          { text: 'Grand Turing Hackathon 2026', badge: 'This Saturday' },
          { text: '3 Seats Remaining in Algo Sprint', highlight: true },
          { text: 'Zero-Day CTF Registration Open', badge: 'Active' },
          { text: 'DevCraft Architecture Retreat Next Week', badge: 'Free with Pass' },
          { text: 'Physical Ticket Stubs Tear Only at Venue Gate', highlight: true },
          { text: 'Cryptographic QR Verification Token on Ticket Face' },
        ]}
        speed={32}
        variant="mustard"
      />

      {/* ==============================================================
          NEWEST RELEASES SECTION (3-col EventTicketCard grid, directive 4)
          ============================================================== */}
      <NewEventsRail events={newestEvents} isLoading={isNewestLoading} />

      {/* ==============================================================
          CLUBS STRIP SECTION (Color-blocked tiles, directive 6)
          ============================================================== */}
      <section className="w-full py-12 sm:py-16 border-t border-ink/10 bg-paper-2">
        <div className="max-w-[1320px] mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <SectionHeader
            title="Autonomous clubs & societies"
            subtitle="Follow student engineering guilds, design salons, and open source societies for priority registration access"
            sticker="9 Collectives"
            stickerColor="lavender"
            accentWord="societies"
          />
          <ClubsStrip />
        </div>
      </section>

      {/* ==============================================================
          TICKET LIFECYCLE TEASER (Directive 7 & F-07)
          Replaces fictional admission matrix.
          ============================================================== */}
      <section className="w-full py-12 sm:py-16 border-t border-ink/10 bg-paper">
        <div className="max-w-[1320px] mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <SectionHeader
            title="How your ticket works"
            subtitle="Authentic natural paper tickets that remain intact until physical gate volunteer check-in"
            sticker="Gate Check-In"
            stickerColor="mint"
            accentWord="works"
          />
          <TicketLifecycleTeaser />
        </div>
      </section>

      {/* ==============================================================
          ALL-EVENTS DISCOVERY CATALOG (Directive 5)
          ============================================================== */}
      <section id="discovery" aria-label="Explore all events" className="w-full py-10 sm:py-16 border-t border-ink/10 bg-paper">
        <div className="max-w-[1320px] mx-auto px-4 sm:px-6 lg:px-8 mb-6">
          <SectionHeader
            title="Explore all campus happenings"
            subtitle="Filter by category, search by venue, or toggle list view for high-density browsing"
            sticker="Full Catalog"
            stickerColor="sky"
            accentWord="happenings"
          />
        </div>

        {/* Sticky Filter Toolbar */}
        <EventsToolbar
          category={category}
          onCategoryChange={(cat) => updateParam('category', cat)}
          searchQuery={searchQuery}
          onSearchQueryChange={(q) => updateParam('q', q)}
          dateFilter={dateFilter}
          onDateFilterChange={(d) => updateParam('date', d)}
          freeOnly={freeOnly}
          onFreeOnlyChange={(f) => updateParam('free', f ? 'true' : '')}
          sortBy={sortBy}
          onSortByChange={(s) => updateParam('sort', s)}
          viewMode={viewMode}
          onViewModeChange={handleViewModeChange}
          totalCount={totalCount}
        />

        {/* Discovery View Grid / List with Motion layout animations */}
        <div className="max-w-[1320px] mx-auto px-4 sm:px-6 lg:px-8">
          <EventsDiscoveryView
            events={discoveryEvents}
            viewMode={viewMode}
            isLoading={isLoading}
            isLoadingMore={isLoadingMore}
            hasMore={Boolean(nextCursor)}
            onLoadMore={handleLoadMore}
            onResetFilters={handleResetFilters}
          />
        </div>
      </section>
    </div>
  )
}
