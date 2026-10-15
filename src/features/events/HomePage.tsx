// EventMesh campus programme and discovery
import React, { useState, useEffect, useMemo, useCallback } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { usePromotedEvents } from '@/hooks/useEvents'
import { api, Event, PaginatedResult } from '@/api'
import { CinematicHeroStage } from './components/CinematicHeroStage'
import { ResponsiveMasonryLayout } from '@/design-system/ResponsiveMasonryLayout'
import { ClubsStrip } from './components/ClubsStrip'
import { SectionHeader } from '@/design-system/SectionHeader'
import { ArrowRight } from '@/design-system/Icon'

export const HomePage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams()

  // 1. Filter State (synced with URL)
  const category = searchParams.get('category') || 'all'
  const searchQuery = searchParams.get('q') || ''
  const dateFilter = searchParams.get('date') || 'all'
  const freeOnly = searchParams.get('free') === 'true'
  const sortBy = searchParams.get('sort') || 'date-asc'

  // 2. Promoted / Featured Events (for Top Sliding Stage)
  const { data: promoted = [] } = usePromotedEvents()

  // 3. Discovery Events: Cursor Pagination & Filter Fetching
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
              limit: 16,
            })
          : await api.events.getEvents({
              category: category !== 'all' ? category : undefined,
              search: searchQuery || undefined,
              limit: 16,
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
    setSearchParams(new URLSearchParams(), { replace: true })
  }

  // 4. Strict Deduplication: Hero sliding cards vs Discovery masonry cards
  const heroSlideEvents = useMemo(() => {
    const pool = promoted.length > 0 ? promoted : discoveryEvents
    const featured = pool.filter((e) => e.isSignature || e.promotion?.label || e.banner || e.poster)
    return (featured.length ? featured : pool).slice(0, 6)
  }, [promoted, discoveryEvents])

  const featuredIds = useMemo(() => {
    return new Set(heroSlideEvents.map((e) => e.id))
  }, [heroSlideEvents])

  // Filter out featured events from masonry to eliminate duplicate cards
  const masonryEvents = useMemo(() => {
    const filtered = discoveryEvents.filter((e) => !featuredIds.has(e.id))
    // If filtering leaves very few cards, allow discoveryEvents to show so masonry stays rich
    return filtered.length > 0 ? filtered : discoveryEvents
  }, [discoveryEvents, featuredIds])

  return (
    <div className="w-full bg-paper text-ink min-h-screen flex flex-col select-none">
      {/* 1. Flagship Featured Section (Horizontal Sliding Cards with Dual Left & Right Peeks) */}
      <CinematicHeroStage events={heroSlideEvents} />

      {/* 2. High-Visibility Campus Events Masonry Showcase with Integrated Filter Ribbon */}
      <ResponsiveMasonryLayout
        events={masonryEvents}
        title="Explore Campus Events & Productions"
        subtitle="Filter by category or timing to reserve passes for hackathons, workshops, and student fests"
        category={category}
        onCategoryChange={(val) => {
          const next = new URLSearchParams(searchParams)
          if (val === 'all') next.delete('category')
          else next.set('category', val)
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
        totalCount={totalCount}
        isLoading={isLoading}
        hasMore={Boolean(nextCursor)}
        isLoadingMore={isLoadingMore}
        onLoadMore={handleLoadMore}
        onResetFilters={handleResetFilters}
      />

      {loadError && (
        <div className="mx-auto max-w-7xl px-4 sm:px-6 pb-8">
          <p role="alert" className="rounded-2xl border border-line bg-card p-6 text-center text-ink-soft">
            Events could not be loaded. Please refresh to try again.
          </p>
        </div>
      )}

      {loadMoreError && (
        <div className="mx-auto max-w-7xl px-4 sm:px-6 pb-8">
          <p role="alert" className="text-sm text-danger text-center">
            More events could not be loaded.{' '}
            <button type="button" className="underline font-medium" onClick={handleLoadMore}>
              Try again
            </button>
          </p>
        </div>
      )}

      {/* 3. Campus Collectives & Societies Spotlight */}
      <section className="relative w-full py-10 sm:py-14 border-b border-line bg-paper-2">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-6">
          <SectionHeader
            title="Campus Collectives & Societies"
            subtitle="Autonomous student guilds, competitive programming labs, and creative code studios."
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
    </div>
  )
}
