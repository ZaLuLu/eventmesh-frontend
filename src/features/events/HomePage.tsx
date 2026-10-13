// Hallmark macrostructure: Ecosystem Index / Option B Seamless Architecture
import React, { useState, useEffect, useMemo, useCallback } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { usePromotedEvents, useNewestEvents } from '@/hooks/useEvents'
import { api, Event, PaginatedResult } from '@/api'
import { FeaturedEventsHero } from './components/FeaturedEventsHero'
import { EventShowcaseGrid } from './components/EventShowcaseGrid'
import { ClubsStrip } from './components/ClubsStrip'
import { EventsToolbar } from './components/EventsToolbar'
import { EventsDiscoveryView } from './components/EventsDiscoveryView'
import { SectionHeader } from '@/design-system/SectionHeader'
import { Ticket, ArrowDown } from '@/design-system/Icon'

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

  // 3. Promoted & Newest Data
  const { data: promoted = [] } = usePromotedEvents()
  const { data: newestData, isLoading: isNewestLoading } = useNewestEvents({ limit: 5 })
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
    <div className="w-full bg-[var(--color-paper)] text-[var(--color-ink)] min-h-screen flex flex-col select-none">
      {/* ==============================================================
          HERO ACT: FEATURED EVENTS DISCOVERY CAROUSEL
          Kinetic horizontal slider adapting @reactbits-pro/about-15
          ============================================================== */}
      <FeaturedEventsHero events={promoted.length > 0 ? promoted : discoveryEvents} />

      {/* ==============================================================
          SECTION 1: RECENTLY UPLOADED SESSIONS
          Showcase Grid adapting @reactbits-pro/showcase-4 patterns
          ============================================================== */}
      <section className="relative w-full py-12 sm:py-16 border-b border-line/60">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <EventShowcaseGrid
            events={newestEvents.length > 0 ? newestEvents : discoveryEvents}
            title="Recently Scheduled Sessions"
            subtitle="Browse newly announced hackathons, workshops, and gatherings across student guilds."
            showCategoryFilters={true}
            isLoading={isNewestLoading}
          />
        </div>
      </section>

      {/* ==============================================================
          SECTION 2: CAMPUS COLLECTIVES
          ============================================================== */}
      <section className="relative w-full py-14 sm:py-20 border-b border-line/60 bg-surface-subtle/30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-8">
          <SectionHeader
            title="Campus Collectives"
            subtitle="Autonomous student guilds, research labs, and design studios organizing this season."
            badge="Societies"
            action={
              <Link
                to="/clubs"
                className="text-xs font-semibold text-accent hover:underline inline-flex items-center gap-1 font-mono uppercase tracking-wider"
              >
                <span>View all clubs</span>
              </Link>
            }
          />
          <ClubsStrip />
        </div>
      </section>

      {/* ==============================================================
          SECTION 3: DISCOVERY DIRECTORY & FILTER TOOLBAR
          ============================================================== */}
      <section id="discovery" className="relative w-full py-14 sm:py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-8">
          <SectionHeader
            title="All Sessions & Workshops"
            subtitle="Filter by category, timing, or search for specific technologies."
            badge="Directory"
          />

          <EventsToolbar
            category={category}
            onCategoryChange={(val) => {
              const next = new URLSearchParams(searchParams)
              if (val === 'all') next.delete('category')
              else next.set('category', val)
              setSearchParams(next, { replace: true })
            }}
            searchQuery={searchQuery}
            onSearchQueryChange={(val) => {
              const next = new URLSearchParams(searchParams)
              if (!val) next.delete('q')
              else next.set('q', val)
              setSearchParams(next, { replace: true })
            }}
            dateFilter={dateFilter}
            onDateFilterChange={(val) => {
              const next = new URLSearchParams(searchParams)
              if (val === 'all') next.delete('date')
              else next.set('date', val)
              setSearchParams(next, { replace: true })
            }}
            freeOnly={freeOnly}
            onFreeOnlyChange={(val) => {
              const next = new URLSearchParams(searchParams)
              if (!val) next.delete('free')
              else next.set('free', 'true')
              setSearchParams(next, { replace: true })
            }}
            sortBy={sortBy}
            onSortByChange={(val) => {
              const next = new URLSearchParams(searchParams)
              next.set('sort', val)
              setSearchParams(next, { replace: true })
            }}
            viewMode={viewMode}
            onViewModeChange={handleViewModeChange}
            totalCount={totalCount}
          />

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
