import React, { useMemo, useState } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { api } from '@/api'
import { useEvents } from '@/hooks/useEvents'
import { useClubs } from '@/hooks/useClubs'
import { EventTicketCard } from '@/design-system/EventTicketCard'
import { PageShell } from '@/design-system/layout/PageShell'
import { MagnifyingGlass, X, Funnel, CaretDown, ArrowCounterClockwise } from '@/design-system/Icon'
import { cn } from '@/lib/utils'

const categories = [
  { value: 'ALL', label: 'All Events' },
  { value: 'hackathon', label: 'Hackathons' },
  { value: 'workshop', label: 'Workshops' },
  { value: 'competition', label: 'Competitions' },
  { value: 'talk', label: 'Talks & Panels' },
  { value: 'cultural', label: 'Cultural & Fests' },
]

const dates = [
  { value: 'ALL', label: 'Any Date' },
  { value: 'today', label: 'Today' },
  { value: 'weekend', label: 'This Weekend' },
  { value: 'next-week', label: 'Next Week' },
]

export const ExplorePage: React.FC = () => {
  const [params, setParams] = useSearchParams()
  const [bookmarkedIds, setBookmarkedIds] = useState<Set<string>>(() => {
    try {
      const stored = localStorage.getItem('eventmesh_bookmarked_events')
      return stored ? new Set(JSON.parse(stored)) : new Set()
    } catch {
      return new Set()
    }
  })

  const category = params.get('category') || 'ALL'
  const club = params.get('club') || 'ALL'
  const date = params.get('date') || 'ALL'
  const query = params.get('search') || ''
  const free = params.get('free') === 'true'
  const sort = params.get('sort') || 'date'

  const { data: clubs = [] } = useClubs()
  const { data, isLoading, isError, refetch } = useEvents({
    search: query || undefined,
  })

  const setParam = (key: string, value: string) => {
    setParams((previous) => {
      const next = new URLSearchParams(previous)
      if (!value || value === 'ALL') next.delete(key)
      else next.set(key, value)
      return next
    })
  }

  const handleBookmarkToggle = (eventId: string) => {
    setBookmarkedIds((prev) => {
      const next = new Set(prev)
      if (next.has(eventId)) next.delete(eventId)
      else next.add(eventId)
      try {
        localStorage.setItem('eventmesh_bookmarked_events', JSON.stringify(Array.from(next)))
      } catch {
        // Suppress storage failure
      }
      return next
    })
  }

  const handleResetFilters = () => {
    setParams(new URLSearchParams())
  }

  const activeFiltersCount = useMemo(() => {
    let count = 0
    if (category !== 'ALL') count++
    if (club !== 'ALL') count++
    if (date !== 'ALL') count++
    if (free) count++
    if (query) count++
    return count
  }, [category, club, date, free, query])

  const events = useMemo(() => {
    const now = new Date()
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const startOfTomorrow = new Date(startOfToday)
    startOfTomorrow.setDate(startOfToday.getDate() + 1)
    const nextMonday = new Date(startOfToday)
    nextMonday.setDate(startOfToday.getDate() + ((8 - startOfToday.getDay()) % 7 || 7))
    const followingMonday = new Date(nextMonday)
    followingMonday.setDate(nextMonday.getDate() + 7)
    const weekendStart = new Date(startOfToday)
    weekendStart.setDate(startOfToday.getDate() + ((6 - startOfToday.getDay() + 7) % 7))
    const weekendEnd = new Date(weekendStart)
    weekendEnd.setDate(weekendStart.getDate() + 2)

    const rawList = data?.items || []

    const result = rawList.filter((event) => {
      // Category filter (case-insensitive)
      if (category !== 'ALL') {
        const cat = (event.category || '').toLowerCase()
        const target = category.toLowerCase()
        if (target === 'hackathon' && !cat.includes('hack')) return false
        if (target === 'workshop' && !cat.includes('work')) return false
        if (target === 'competition' && !cat.includes('comp') && !cat.includes('contest')) return false
        if (target === 'talk' && !cat.includes('talk') && !cat.includes('symposium')) return false
        if (target === 'cultural' && !cat.includes('cult') && !cat.includes('fest') && !cat.includes('night')) return false
      }

      // Club filter
      if (club !== 'ALL') {
        const eventClubId = event.organizerId || event.club?.id
        if (eventClubId !== club) return false
      }

      // Free filter
      if (free && !(event.isFree || event.price === 0)) return false

      // Date preset filter
      const when = new Date(event.startsAt)
      if (date === 'today' && !(when >= startOfToday && when < startOfTomorrow)) return false
      if (date === 'weekend' && !(when >= weekendStart && when < weekendEnd)) return false
      if (date === 'next-week' && !(when >= nextMonday && when < followingMonday)) return false

      return true
    })

    // Sorting
    result.sort((a, b) => {
      if (sort === 'title') return a.title.localeCompare(b.title)
      if (sort === 'date-desc') return new Date(b.startsAt).getTime() - new Date(a.startsAt).getTime()
      if (sort === 'price-asc') {
        const priceA = a.isFree ? 0 : (a.price || 0)
        const priceB = b.isFree ? 0 : (b.price || 0)
        return priceA - priceB
      }
      return new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime()
    })

    return result
  }, [data?.items, category, club, free, date, sort])

  return (
    <PageShell className="py-6 sm:py-10">
      {/* 1. Sleek Editorial Masthead */}
      <div className="mb-4 space-y-2">
        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-ink-muted font-mono">
          <Link to="/" className="hover:text-accent transition-colors">Home</Link>
          <span>/</span>
          <span className="text-ink font-medium">Explore</span>
        </nav>

        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
          <div>
            <h1 className="text-xl sm:text-3xl font-extrabold tracking-tight text-ink font-display">
              Explore Campus Events & Productions
            </h1>
            <p className="mt-0.5 text-xs sm:text-sm text-ink-soft">
              Browse upcoming hackathons, engineering workshops, guest symposiums, and cultural fests.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-line bg-card px-2.5 py-1 text-xs font-mono font-medium text-ink shadow-xs">
              <span className="h-2 w-2 rounded-full bg-accent animate-pulse" />
              <span>{isLoading ? 'Scanning...' : `${events.length} events scheduled`}</span>
            </span>
          </div>
        </div>
      </div>

      {/* 2. Sticky Horizon Control Ribbon (Zero Left-Sidebar Clutter) */}
      <section
        aria-label="Filter events"
        className="sticky top-14 z-20 -mx-4 px-4 sm:-mx-6 sm:px-6 py-2.5 mb-6 border-y border-line bg-paper/95 backdrop-blur-md space-y-2.5 transition-all"
      >
        <div className="max-w-7xl mx-auto space-y-2.5">
          {/* Top Row: Category Pills (Single-Tap Horizontal Scroll) */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-0.5">
            {categories.map((item) => {
              const active = category === item.value || (category === 'ALL' && item.value === 'ALL')
              return (
                <button
                  key={item.value}
                  type="button"
                  onClick={() => setParam('category', item.value)}
                  aria-pressed={active}
                  className={cn(
                    'whitespace-nowrap rounded-full px-3.5 py-1.5 text-xs font-medium transition-all shrink-0',
                    active
                      ? 'bg-accent text-white font-semibold shadow-xs ring-2 ring-accent/20'
                      : 'border border-line bg-card text-ink-soft hover:border-line-strong hover:bg-surface-subtle hover:text-ink'
                  )}
                >
                  {item.label}
                </button>
              )
            })}
          </div>

          {/* Bottom Row: Secondary Filter Bar (Date Pills + Inline Search + Club Select + Sort) */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            {/* Left: Quick Date Pills & Free Filter (Scrollable on small mobile) */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-0.5 sm:pb-0">
              <span className="text-[11px] font-mono uppercase tracking-wider text-ink-muted mr-1 hidden md:inline-block shrink-0">
                When:
              </span>
              {dates.map((item) => {
                const active = date === item.value || (date === 'ALL' && item.value === 'ALL')
                return (
                  <button
                    key={item.value}
                    type="button"
                    onClick={() => setParam('date', item.value)}
                    aria-pressed={active}
                    className={cn(
                      'whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-medium transition-all shrink-0',
                      active
                        ? 'bg-ink text-paper shadow-xs font-semibold'
                        : 'border border-line bg-card text-ink-soft hover:border-line-strong hover:bg-surface-subtle'
                    )}
                  >
                    {item.label}
                  </button>
                )
              })}

              <button
                type="button"
                onClick={() => setParam('free', free ? '' : 'true')}
                aria-pressed={free}
                className={cn(
                  'whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-medium transition-all shrink-0',
                  free
                    ? 'bg-emerald-600 text-white font-semibold shadow-xs'
                    : 'border border-line bg-card text-ink-soft hover:border-line-strong hover:bg-surface-subtle'
                )}
              >
                Free Admission
              </button>
            </div>

            {/* Right: Search Input + Club Select + Sort Selector */}
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-0.5 sm:pb-0 shrink-0">
              {/* Compact In-Page Search */}
              <div className="relative w-36 sm:w-48 shrink-0">
                <MagnifyingGlass size={13} className="absolute left-2.5 top-2 text-ink-muted" aria-hidden="true" />
                <input
                  value={query}
                  onChange={(e) => setParam('search', e.target.value)}
                  placeholder="Keywords..."
                  aria-label="Filter events by keyword"
                  className="h-7 w-full rounded-full border border-line bg-card pl-7 pr-6 text-xs font-sans text-ink placeholder:text-ink-muted focus:border-accent focus:outline-none shadow-xs"
                />
                {query && (
                  <button
                    type="button"
                    onClick={() => setParam('search', '')}
                    aria-label="Clear search"
                    className="absolute right-2 top-1.5 text-ink-muted hover:text-ink"
                  >
                    <X size={11} />
                  </button>
                )}
              </div>

              {/* Society / Club Dropdown */}
              {clubs.length > 0 && (
                <div className="relative shrink-0">
                  <select
                    value={club}
                    onChange={(e) => setParam('club', e.target.value)}
                    aria-label="Filter by club or society"
                    className="h-7 rounded-full border border-line bg-card pl-2.5 pr-6 text-xs font-mono text-ink appearance-none focus:outline-none focus:border-accent cursor-pointer shadow-xs hover:border-line-strong"
                  >
                    <option value="ALL">All Clubs</option>
                    {clubs.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                  <CaretDown size={11} className="pointer-events-none absolute right-2 top-2 text-ink-muted" />
                </div>
              )}

              {/* Sort Dropdown */}
              <div className="relative shrink-0">
                <select
                  value={sort}
                  onChange={(e) => setParam('sort', e.target.value)}
                  aria-label="Sort events"
                  className="h-7 rounded-full border border-line bg-card pl-2.5 pr-6 text-xs font-mono text-ink appearance-none focus:outline-none focus:border-accent cursor-pointer shadow-xs hover:border-line-strong"
                >
                  <option value="date">Soonest</option>
                  <option value="date-desc">Latest</option>
                  <option value="title">Title (A-Z)</option>
                  <option value="price-asc">Price (Low-High)</option>
                </select>
                <CaretDown size={11} className="pointer-events-none absolute right-2 top-2 text-ink-muted" />
              </div>

              {/* Reset All Filters Pill */}
              {activeFiltersCount > 0 && (
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="inline-flex items-center gap-1 rounded-full border border-line bg-card px-2 py-0.5 text-xs font-mono text-accent hover:bg-surface-subtle transition-colors shadow-xs shrink-0"
                >
                  <ArrowCounterClockwise size={11} />
                  <span>Clear ({activeFiltersCount})</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* 3. Full-Width Event Grid (4 Columns Desktop, 2 Tablet, 1 Mobile) */}
      <div className="w-full min-w-0">
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {Array.from({ length: 8 }).map((_, index) => (
              <div
                key={index}
                className="h-96 animate-pulse rounded-[24px] border border-line bg-card p-4 space-y-4"
              >
                <div className="aspect-[16/10] w-full rounded-[18px] bg-surface-subtle" />
                <div className="h-4 w-1/3 rounded-full bg-surface-subtle" />
                <div className="h-6 w-3/4 rounded-full bg-surface-subtle" />
                <div className="h-4 w-1/2 rounded-full bg-surface-subtle" />
              </div>
            ))}
          </div>
        ) : isError ? (
          <div className="rounded-3xl border border-line bg-card p-12 text-center max-w-lg mx-auto space-y-3">
            <h2 className="text-lg font-bold text-ink font-display">Events could not be loaded</h2>
            <p className="text-xs text-ink-soft">
              We encountered an issue connecting to the campus event mesh.
            </p>
            <button
              type="button"
              onClick={() => refetch()}
              className="mt-2 rounded-full bg-accent px-5 py-2 text-xs font-semibold text-white hover:bg-accent-hover transition-colors shadow-xs"
            >
              Retry Connection
            </button>
          </div>
        ) : events.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {events.map((event) => (
              <EventTicketCard
                key={event.id}
                event={event}
                isBookmarked={bookmarkedIds.has(event.id)}
                onBookmark={handleBookmarkToggle}
              />
            ))}
          </div>
        ) : (
          /* Conversational Empty State */
          <div className="rounded-3xl border border-line bg-card p-12 sm:p-16 text-center max-w-xl mx-auto space-y-4 shadow-xs">
            <div className="inline-grid h-12 w-12 place-items-center rounded-2xl bg-surface-subtle text-accent border border-line/60">
              <Funnel size={24} weight="duotone" />
            </div>
            <div className="space-y-1">
              <h2 className="text-lg font-bold text-ink font-display">No events match your current filters</h2>
              <p className="text-xs sm:text-sm text-ink-soft max-w-md mx-auto">
                {query
                  ? `No events found matching "${query}". Try searching for another topic or club.`
                  : category !== 'ALL'
                  ? `No ${category.toLowerCase()} events scheduled for the selected timeframe.`
                  : 'No scheduled events meet the selected criteria.'}
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
              {category !== 'ALL' && (
                <button
                  type="button"
                  onClick={() => setParam('category', 'ALL')}
                  className="rounded-full border border-line bg-card px-3.5 py-1.5 text-xs font-medium text-ink hover:bg-surface-subtle transition-colors shadow-xs"
                >
                  View All Categories
                </button>
              )}
              {date !== 'ALL' && (
                <button
                  type="button"
                  onClick={() => setParam('date', 'ALL')}
                  className="rounded-full border border-line bg-card px-3.5 py-1.5 text-xs font-medium text-ink hover:bg-surface-subtle transition-colors shadow-xs"
                >
                  View Any Date
                </button>
              )}
              <button
                type="button"
                onClick={handleResetFilters}
                className="rounded-full bg-accent px-4 py-1.5 text-xs font-semibold text-white hover:bg-accent-hover transition-colors shadow-xs"
              >
                Reset All Filters
              </button>
            </div>
          </div>
        )}
      </div>
    </PageShell>
  )
}
