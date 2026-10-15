// EventMesh campus programme and discovery
import React, { useState, useEffect, useMemo, useCallback } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { usePromotedEvents, useNewestEvents } from '@/hooks/useEvents'
import { api, Event, PaginatedResult } from '@/api'
import { CinematicHeroStage } from './components/CinematicHeroStage'
import { RecommendedEventsShelf } from './components/RecommendedEventsShelf'
import { ResponsiveMasonryLayout } from '@/design-system/ResponsiveMasonryLayout'
import { ClubsStrip } from './components/ClubsStrip'
import { EventsToolbar } from './components/EventsToolbar'
import { EventsDiscoveryView } from './components/EventsDiscoveryView'
import { SectionHeader } from '@/design-system/SectionHeader'
import { ArrowRight } from '@/design-system/Icon'

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
      } catch { /* Browsing still works when local storage is unavailable. */ }
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
  const { data: newestData } = useNewestEvents({ limit: 8 })
  const newestEvents = useMemo(() => newestData?.items || [], [newestData?.items])

  // 4. Discovery Events: Cursor Pagination & Filter Fetching
  const [discoveryEvents, setDiscoveryEvents] = useState<Event[]>([])
  const [totalCount, setTotalCount] = useState<number>(0)
  const [nextCursor, setNextCursor] = useState<string | undefined>(undefined)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false)
  const [loadMoreError, setLoadMoreError] = useState(false)
  const [loadError, setLoadError] = useState(false)

  useEffect(() => {
    let isCancelled = false
    setIsLoading(true)
    setLoadError(false)

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
          setDiscoveryEvents([])
          setTotalCount(0)
          setNextCursor(undefined)
          setLoadError(true)
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
    setLoadMoreError(false)
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
      setLoadMoreError(true)
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
      {/* 1. Flagship Panoramic Hero Stage */}
      <CinematicHeroStage events={promoted.length > 0 ? promoted : discoveryEvents} />

      {/* 2. BookMyShow Style Recommended Shows / Events Poster Rail */}
      <RecommendedEventsShelf
        events={promoted.length > 0 ? promoted : discoveryEvents}
        title="Recommended Events"
        subtitle="Curated campus exhibitions, hackathons, and championship competitions"
        seeAllLink="/explore"
      />

      {/* 3. Campus Sessions & Productions Responsive Masonry Layout */}
      <ResponsiveMasonryLayout
        events={newestEvents.length > 0 ? newestEvents : discoveryEvents.slice(0, 8)}
        title="Happening on Campus"
        subtitle="Regular club sessions, technical workshops, and daily campus activities"
      />

      {/* 4. Campus Collectives & Societies (Moved up so it introduces clubs before search discovery) */}
      <section className="relative w-full py-10 sm:py-14 border-b border-line bg-paper-2">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-6">
          <SectionHeader
            title="Campus Collectives & Societies"
            subtitle="Autonomous student guilds, competitive programming labs, and creative code studios."
            badge="TOP SOCIETIES"
            action={
              <Link
                to="/clubs"
                className="text-xs sm:text-sm font-semibold text-accent hover:underline inline-flex items-center gap-1"
              >
                <span>View all clubs</span>
                <ArrowRight size={14} weight="bold" />
              </Link>
            }
          />
          <ClubsStrip />
        </div>
      </section>

      {/* 5. Streamlined Filter Toolbar & Search Bar directly scoping the Discovery Directory */}
      <section aria-label="Search events" className="relative z-10 border-b border-line bg-paper py-5">
        <div className="mx-auto max-w-7xl space-y-3 px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-lg sm:text-xl font-bold tracking-tight text-ink">
                Explore Events & Sessions
              </h2>
              <p className="text-xs text-ink-soft hidden sm:block">
                Filter by category, timing, or search for specific technologies
              </p>
            </div>

            <nav aria-label="Browse events by date" className="flex flex-wrap items-center gap-2">
              <Link
                to="/explore?date=today"
                className="rounded-full border border-line bg-card px-3 py-1 text-xs font-medium text-ink hover:border-line-strong hover:bg-surface-subtle transition-colors"
              >
                Today
              </Link>
              <Link
                to="/explore?date=weekend"
                className="rounded-full border border-line bg-card px-3 py-1 text-xs font-medium text-ink hover:border-line-strong hover:bg-surface-subtle transition-colors"
              >
                This weekend
              </Link>
              <Link
                to="/explore?date=next-week"
                className="rounded-full border border-line bg-card px-3 py-1 text-xs font-medium text-ink hover:border-line-strong hover:bg-surface-subtle transition-colors"
              >
                Next week
              </Link>
            </nav>
          </div>

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
        </div>
      </section>

      {/* 6. Discovery Directory */}
      <section id="discovery" className="relative w-full py-8 sm:py-12 bg-paper">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-8">
          {loadError ? (
            <p role="alert" className="rounded-[24px] border border-line bg-card p-6 text-center text-ink-soft">
              Events could not be loaded. Please refresh to try again.
            </p>
          ) : (
            <EventsDiscoveryView
              events={discoveryEvents}
              viewMode={viewMode}
              isLoading={isLoading}
              isLoadingMore={isLoadingMore}
              hasMore={Boolean(nextCursor)}
              onLoadMore={handleLoadMore}
              onResetFilters={handleResetFilters}
            />
          )}
          {loadMoreError && (
            <p role="alert" className="text-sm text-danger text-center">
              More events could not be loaded.{' '}
              <button type="button" className="underline font-medium" onClick={handleLoadMore}>
                Try again
              </button>
            </p>
          )}
        </div>
      </section>
    </div>
  )
}
