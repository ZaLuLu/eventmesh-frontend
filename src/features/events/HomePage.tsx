import React, { useState, useEffect, useMemo, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import { usePromotedEvents, useNewestEvents } from '@/hooks/useEvents'
import { api, Event, PaginatedResult } from '@/api'
import { PromoCarousel } from './components/PromoCarousel'
import { NewEventsRail } from './components/NewEventsRail'
import { EventsToolbar } from './components/EventsToolbar'
import { EventsDiscoveryView } from './components/EventsDiscoveryView'

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

  // 3. Top Half & Bottom Half Data
  const { data: promoted = [] } = usePromotedEvents()
  const { data: newestData, isLoading: isNewestLoading } = useNewestEvents({ limit: 8 })
  const newestEvents = useMemo(() => newestData?.items || [], [newestData?.items])

  // 4. Discovery Events: Cursor Pagination & Filter Fetching
  const [discoveryEvents, setDiscoveryEvents] = useState<Event[]>([])
  const [totalCount, setTotalCount] = useState<number>(0)
  const [nextCursor, setNextCursor] = useState<string | undefined>(undefined)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false)

  // Fetch initial page on filter change
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

  // Fetch next page
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
  };

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
    <div className="w-full bg-bg text-text min-h-screen flex flex-col">
      {/* ==============================================================
          TOP HALF: PROMOTED SHOWCASE CAROUSEL (>= 50svh, Desktop Cap 520px)
          Background: --champion (#151130)
          ============================================================== */}
      <PromoCarousel events={promoted} />

      {/* ==============================================================
          BOTTOM HALF: NEW ADDITIONS RAIL (>= 50svh)
          Background: --lavender (#E6E4F3)
          Straight seam meeting Top Half, together filling first viewport!
          ============================================================== */}
      <NewEventsRail events={newestEvents} isLoading={isNewestLoading} />

      {/* ==============================================================
          ALL-EVENTS DISCOVERY SECTION
          Sticky toolbar with category chips, date popover, Free toggle,
          sort select, segmented Grid/List toggle, and morphing counter.
          ============================================================== */}
      <section id="discovery" aria-label="Explore all events" className="w-full bg-bg py-6 sm:py-8">
        {/* Sticky Toolbar */}
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
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
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
