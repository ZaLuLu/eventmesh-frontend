import React, { useMemo, useState } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { useEvents } from '@/hooks/useEvents'
import { useClubs } from '@/hooks/useClubs'
import { EventTicketCard } from '@/design-system/EventTicketCard'
import { PageShell } from '@/design-system/layout/PageShell'
import {
  MagnifyingGlass,
  X,
  Funnel,
  CaretDown,
  ArrowCounterClockwise,
  CalendarBlank,
  MapPin,
  Check,
} from '@/design-system/Icon'
import { cn } from '@/lib/utils'

const categories = [
  { value: 'ALL', label: 'All Categories' },
  { value: 'hackathon', label: 'Hackathons' },
  { value: 'workshop', label: 'Workshops' },
  { value: 'competition', label: 'Competitions' },
  { value: 'talk', label: 'Talks & Panels' },
  { value: 'cultural', label: 'Cultural & Music' },
  { value: 'conference', label: 'Conferences & Summits' },
]

const dates = [
  { value: 'ALL', label: 'Any Date' },
  { value: 'today', label: 'Today' },
  { value: 'weekend', label: 'This Weekend' },
  { value: 'next-week', label: 'Next Week' },
]

const scopes = [
  { value: 'ALL', label: 'All Locations' },
  { value: 'campus', label: 'Campus Venues' },
  { value: 'city', label: 'Outside / City Hubs' },
]

export const ExplorePage: React.FC = () => {
  const [params, setParams] = useSearchParams()
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false)
  const [bookmarkedIds, setBookmarkedIds] = useState<Set<string>>(() => {
    try {
      const stored = localStorage.getItem('eventmesh_bookmarked_events')
      return stored ? new Set(JSON.parse(stored)) : new Set()
    } catch {
      return new Set()
    }
  })

  // URL Query Parameters
  const category = params.get('category') || 'ALL'
  const club = params.get('club') || 'ALL'
  const date = params.get('date') || 'ALL'
  const scope = params.get('scope') || 'ALL'
  const query = params.get('search') || ''
  const admission = params.get('admission') || (params.get('free') === 'true' ? 'free' : params.get('free') === 'false' ? 'paid' : 'all')
  const sort = params.get('sort') || 'date'

  const { data: clubs = [] } = useClubs()
  const { data, isLoading, isError, refetch } = useEvents({
    search: query || undefined,
  })

  const setParam = (key: string, value: string) => {
    setParams((previous) => {
      const next = new URLSearchParams(previous)
      if (!value || value === 'ALL' || (key === 'admission' && value === 'all')) {
        next.delete(key)
        if (key === 'admission') next.delete('free')
      } else if (key === 'admission') {
        next.set('admission', value)
        if (value === 'free') next.set('free', 'true')
        else if (value === 'paid') next.set('free', 'false')
        else next.delete('free')
      } else {
        next.set(key, value)
      }
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
    setIsMobileFilterOpen(false)
  }

  const activeFiltersCount = useMemo(() => {
    let count = 0
    if (category !== 'ALL') count++
    if (club !== 'ALL') count++
    if (date !== 'ALL') count++
    if (scope !== 'ALL') count++
    if (admission !== 'all') count++
    if (query) count++
    return count
  }, [category, club, date, scope, admission, query])

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
        if (target === 'talk' && !cat.includes('talk') && !cat.includes('symposium') && !cat.includes('panel')) return false
        if (target === 'cultural' && !cat.includes('cult') && !cat.includes('fest') && !cat.includes('music') && !cat.includes('concert')) return false
        if (target === 'conference' && !cat.includes('conf') && !cat.includes('summit')) return false
      }

      // Organizer filter
      if (club !== 'ALL') {
        const eventClubId = event.organizerId || event.club?.id
        if (eventClubId !== club) return false
      }

      // Admission filter (Free vs Paid)
      if (admission === 'free' && !(event.isFree || event.price === 0)) return false
      if (admission === 'paid' && (event.isFree || (event.price || 0) === 0)) return false

      // Location / Scope filter (Campus vs City/Outside)
      if (scope !== 'ALL') {
        const isCity =
          event.orgId === 'org-city' ||
          (event.venue?.address || '').toLowerCase().includes('bengaluru') ||
          (event.venue?.address || '').toLowerCase().includes('koramangala') ||
          (event.venue?.address || '').toLowerCase().includes('indiranagar') ||
          (event.venue?.name || '').toLowerCase().includes('convention') ||
          (event.venue?.name || '').toLowerCase().includes('amphitheatre')
        if (scope === 'campus' && isCity) return false
        if (scope === 'city' && !isCity) return false
      }

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
  }, [data?.items, category, club, admission, scope, date, sort])

  // Count helper for category badges
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { ALL: data?.items?.length || 0 }
    const items = data?.items || []
    for (const item of items) {
      const cat = (item.category || '').toLowerCase()
      if (cat.includes('hack')) counts['hackathon'] = (counts['hackathon'] || 0) + 1
      if (cat.includes('work')) counts['workshop'] = (counts['workshop'] || 0) + 1
      if (cat.includes('comp') || cat.includes('contest')) counts['competition'] = (counts['competition'] || 0) + 1
      if (cat.includes('talk') || cat.includes('symposium') || cat.includes('panel')) counts['talk'] = (counts['talk'] || 0) + 1
      if (cat.includes('cult') || cat.includes('fest') || cat.includes('music') || cat.includes('concert')) counts['cultural'] = (counts['cultural'] || 0) + 1
      if (cat.includes('conf') || cat.includes('summit')) counts['conference'] = (counts['conference'] || 0) + 1
    }
    return counts
  }, [data?.items])

  // Filter Side Nav Content (Shared between desktop rail and mobile drawer)
  const FilterContent = (
    <div className="space-y-6 text-ink">
      {/* Search Input */}
      <div className="space-y-2">
        <label className="text-xs font-mono font-bold uppercase tracking-wider text-ink-muted">Search</label>
        <div className="relative">
          <MagnifyingGlass size={14} className="absolute left-3 top-2.5 text-ink-muted" aria-hidden="true" />
          <input
            value={query}
            onChange={(e) => setParam('search', e.target.value)}
            placeholder="Search all events..."
            aria-label="Search events"
            className="h-9 w-full rounded-xl border border-line bg-card pl-8 pr-8 text-xs font-sans text-ink placeholder:text-ink-muted focus:border-accent focus:outline-none shadow-xs"
          />
          {query && (
            <button
              type="button"
              onClick={() => setParam('search', '')}
              className="absolute right-2.5 top-2.5 text-ink-muted hover:text-ink"
            >
              <X size={13} />
            </button>
          )}
        </div>
      </div>

      {/* Admission: All / Free / Paid */}
      <div className="space-y-2">
        <label className="text-xs font-mono font-bold uppercase tracking-wider text-ink-muted">Admission</label>
        <div className="grid grid-cols-3 gap-1 rounded-xl border border-line bg-surface-subtle p-1">
          {[
            { value: 'all', label: 'All' },
            { value: 'free', label: 'Free' },
            { value: 'paid', label: 'Paid' },
          ].map((item) => {
            const active = admission === item.value
            return (
              <button
                key={item.value}
                type="button"
                onClick={() => setParam('admission', item.value)}
                className={cn(
                  'rounded-lg py-1.5 text-xs font-medium transition-all text-center',
                  active
                    ? 'bg-card text-ink font-semibold shadow-xs border border-line'
                    : 'text-ink-soft hover:text-ink'
                )}
              >
                {item.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* Location / Scope: Campus vs City Hubs */}
      <div className="space-y-2">
        <label className="text-xs font-mono font-bold uppercase tracking-wider text-ink-muted">Location Scope</label>
        <div className="flex flex-col gap-1">
          {scopes.map((item) => {
            const active = scope === item.value || (scope === 'ALL' && item.value === 'ALL')
            return (
              <button
                key={item.value}
                type="button"
                onClick={() => setParam('scope', item.value)}
                className={cn(
                  'flex items-center justify-between rounded-xl px-3 py-2 text-xs font-medium transition-all text-left',
                  active
                    ? 'bg-accent/10 text-accent font-semibold border border-accent/20'
                    : 'hover:bg-surface-subtle text-ink-soft hover:text-ink'
                )}
              >
                <span>{item.label}</span>
                {active && <Check size={14} weight="bold" className="text-accent" />}
              </button>
            )
          })}
        </div>
      </div>

      {/* Categories with Counts */}
      <div className="space-y-2">
        <label className="text-xs font-mono font-bold uppercase tracking-wider text-ink-muted">Categories</label>
        <div className="flex flex-col gap-1">
          {categories.map((item) => {
            const active = category === item.value || (category === 'ALL' && item.value === 'ALL')
            const count = categoryCounts[item.value]
            return (
              <button
                key={item.value}
                type="button"
                onClick={() => setParam('category', item.value)}
                className={cn(
                  'flex items-center justify-between rounded-xl px-3 py-2 text-xs font-medium transition-all text-left',
                  active
                    ? 'bg-accent text-white font-semibold shadow-xs'
                    : 'hover:bg-surface-subtle text-ink-soft hover:text-ink'
                )}
              >
                <span className="truncate">{item.label}</span>
                {count !== undefined && (
                  <span
                    className={cn(
                      'ml-2 rounded-full px-1.5 py-0.5 font-mono text-[10px]',
                      active ? 'bg-white/20 text-white' : 'bg-surface-subtle text-ink-muted border border-line/60'
                    )}
                  >
                    {count}
                  </span>
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* Timing / Dates */}
      <div className="space-y-2">
        <label className="text-xs font-mono font-bold uppercase tracking-wider text-ink-muted">When</label>
        <div className="flex flex-col gap-1">
          {dates.map((item) => {
            const active = date === item.value || (date === 'ALL' && item.value === 'ALL')
            return (
              <button
                key={item.value}
                type="button"
                onClick={() => setParam('date', item.value)}
                className={cn(
                  'flex items-center justify-between rounded-xl px-3 py-2 text-xs font-medium transition-all text-left',
                  active
                    ? 'bg-ink text-paper font-semibold shadow-xs'
                    : 'hover:bg-surface-subtle text-ink-soft hover:text-ink'
                )}
              >
                <span>{item.label}</span>
                {active && <Check size={14} weight="bold" className="text-paper" />}
              </button>
            )
          })}
        </div>
      </div>

      {/* Organizers / Hosts Filter */}
      {clubs.length > 0 && (
        <div className="space-y-2">
          <label className="text-xs font-mono font-bold uppercase tracking-wider text-ink-muted">Organized By</label>
          <div className="relative">
            <select
              value={club}
              onChange={(e) => setParam('club', e.target.value)}
              aria-label="Filter by organizer"
              className="h-9 w-full appearance-none rounded-xl border border-line bg-card pl-3 pr-8 text-xs font-sans text-ink focus:border-accent focus:outline-none shadow-xs"
            >
              <option value="ALL">All Organizers & Hosts</option>
              {clubs.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            <CaretDown size={13} className="pointer-events-none absolute right-2.5 top-3 text-ink-muted" />
          </div>
        </div>
      )}

      {/* Reset Filter Button */}
      {activeFiltersCount > 0 && (
        <div className="pt-2">
          <button
            type="button"
            onClick={handleResetFilters}
            className="w-full inline-flex items-center justify-center gap-1.5 rounded-xl border border-line bg-surface-subtle py-2 text-xs font-mono text-ink-soft hover:text-ink hover:border-line-strong transition-colors"
          >
            <ArrowCounterClockwise size={13} />
            <span>Reset All Filters ({activeFiltersCount})</span>
          </button>
        </div>
      )}
    </div>
  )

  return (
    <PageShell className="py-6 sm:py-10">
      {/* 1. Sleek Editorial Header */}
      <div className="mb-6 space-y-2">
        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-ink-muted font-mono">
          <Link to="/" className="hover:text-accent transition-colors">Home</Link>
          <span>/</span>
          <span className="text-ink font-medium">Explore</span>
        </nav>

        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-ink font-display">
              Explore All Events & Productions
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-ink-soft max-w-2xl">
              Browse university hackathons, city tech summits, creative design jams, and open masterclasses.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {/* Mobile Filter Sheet Trigger Button (< 1024px) */}
            <button
              type="button"
              onClick={() => setIsMobileFilterOpen(true)}
              className="lg:hidden inline-flex items-center gap-2 rounded-xl border border-line bg-card px-3.5 py-2 text-xs font-semibold text-ink shadow-xs hover:border-accent hover:text-accent"
            >
              <Funnel size={14} weight={activeFiltersCount > 0 ? 'fill' : 'regular'} className="text-accent" />
              <span>Filters</span>
              {activeFiltersCount > 0 && (
                <span className="grid h-4 w-4 place-items-center rounded-full bg-accent text-[10px] font-mono text-white">
                  {activeFiltersCount}
                </span>
              )}
            </button>

            {/* Total Results Count Badge */}
            <span className="inline-flex items-center gap-1.5 rounded-full border border-line bg-card px-3 py-1.5 text-xs font-mono font-medium text-ink shadow-xs">
              <span className="h-2 w-2 rounded-full bg-accent animate-pulse" />
              <span>{isLoading ? 'Scanning...' : `${events.length} events found`}</span>
            </span>
          </div>
        </div>
      </div>

      {/* 2. Main 2-Column Responsive Layout: Sticky Side Nav (Desktop) + Events Catalog (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-8 items-start">
        {/* Left Side Nav (Desktop Sticky) */}
        <aside
          aria-label="Event filters side navigation"
          className="hidden lg:block sticky top-20 rounded-2xl border border-line bg-card p-5 shadow-xs"
        >
          <div className="flex items-center justify-between pb-4 border-b border-line mb-5">
            <div className="flex items-center gap-2">
              <Funnel size={15} weight="bold" className="text-accent" />
              <h2 className="text-sm font-bold tracking-tight text-ink">Filters</h2>
            </div>
            {activeFiltersCount > 0 && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="text-xs font-mono text-accent hover:underline"
              >
                Clear all
              </button>
            )}
          </div>
          {FilterContent}
        </aside>

        {/* Right Column: Catalog Controls + 3-Column Event Grid */}
        <div className="min-w-0 space-y-4">
          {/* Quick Schedule / Time Filter Chips */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            <span className="text-xs font-mono font-medium text-ink-muted flex items-center gap-1.5 shrink-0 mr-1">
              <CalendarBlank size={13} className="text-accent" />
              <span>When:</span>
            </span>
            {[
              { value: 'ALL', label: 'All Dates' },
              { value: 'today', label: 'Today' },
              { value: 'weekend', label: 'This Weekend' },
              { value: 'next-week', label: 'Next Week' },
            ].map((d) => {
              const active = date === d.value || (date === 'ALL' && d.value === 'ALL')
              return (
                <button
                  key={d.value}
                  type="button"
                  onClick={() => setParam('date', d.value)}
                  className={cn(
                    'shrink-0 px-3 py-1 rounded-full text-xs font-mono transition-all',
                    active
                      ? 'bg-ink text-paper font-semibold shadow-xs'
                      : 'bg-card text-ink-soft hover:text-ink border border-line hover:border-line-strong'
                  )}
                >
                  {d.label}
                </button>
              )
            })}
          </div>

          {/* Top Catalog Toolbar: Active Filters summary + Sort Selector */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-line bg-card p-3 shadow-xs">
            {/* Active Filters Badges */}
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-xs font-mono text-ink-muted mr-1">Active:</span>
              {activeFiltersCount === 0 ? (
                <span className="text-xs text-ink-muted italic">All events showing</span>
              ) : (
                <>
                  {category !== 'ALL' && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-surface-subtle px-2.5 py-0.5 text-[11px] font-mono text-ink border border-line">
                      {category}
                      <button type="button" onClick={() => setParam('category', 'ALL')} className="hover:text-accent">
                        <X size={11} />
                      </button>
                    </span>
                  )}
                  {admission !== 'all' && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-surface-subtle px-2.5 py-0.5 text-[11px] font-mono text-ink border border-line">
                      {admission === 'free' ? 'Free Admission' : 'Paid Passes'}
                      <button type="button" onClick={() => setParam('admission', 'all')} className="hover:text-accent">
                        <X size={11} />
                      </button>
                    </span>
                  )}
                  {scope !== 'ALL' && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-surface-subtle px-2.5 py-0.5 text-[11px] font-mono text-ink border border-line">
                      {scope === 'campus' ? 'Campus Only' : 'City / Outside'}
                      <button type="button" onClick={() => setParam('scope', 'ALL')} className="hover:text-accent">
                        <X size={11} />
                      </button>
                    </span>
                  )}
                  {date !== 'ALL' && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-surface-subtle px-2.5 py-0.5 text-[11px] font-mono text-ink border border-line">
                      {date}
                      <button type="button" onClick={() => setParam('date', 'ALL')} className="hover:text-accent">
                        <X size={11} />
                      </button>
                    </span>
                  )}
                  {query && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-surface-subtle px-2.5 py-0.5 text-[11px] font-mono text-ink border border-line">
                      "{query}"
                      <button type="button" onClick={() => setParam('search', '')} className="hover:text-accent">
                        <X size={11} />
                      </button>
                    </span>
                  )}
                </>
              )}
            </div>

            {/* Sort Selector */}
            <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
              <span className="text-xs font-mono text-ink-muted">Sort:</span>
              <div className="relative">
                <select
                  value={sort}
                  onChange={(e) => setParam('sort', e.target.value)}
                  aria-label="Sort events"
                  className="h-8 appearance-none rounded-xl border border-line bg-surface-subtle pl-3 pr-7 text-xs font-mono text-ink focus:border-accent focus:outline-none shadow-xs"
                >
                  <option value="date">Date (Soonest)</option>
                  <option value="date-desc">Date (Latest)</option>
                  <option value="price-asc">Price (Low to High)</option>
                  <option value="title">Title (A-Z)</option>
                </select>
                <CaretDown size={12} className="pointer-events-none absolute right-2 top-2.5 text-ink-muted" />
              </div>
            </div>
          </div>

          {/* Loading Skeleton (2-columns on mobile, 3-columns on desktop) */}
          {isLoading && (
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-4 lg:gap-5">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="flex flex-col w-full rounded-[10px] sm:rounded-[14px] border border-line bg-card overflow-hidden animate-pulse"
                >
                  <div className="aspect-[3/4] w-full bg-surface-subtle" />
                  <div className="p-2.5 sm:p-4 space-y-2 sm:space-y-3">
                    <div className="h-2.5 sm:h-3 w-16 sm:w-24 bg-surface-subtle rounded-[3px] sm:rounded-[4px]" />
                    <div className="h-3.5 sm:h-5 w-4/5 bg-surface-subtle rounded-[3px] sm:rounded-[4px]" />
                    <div className="h-3 sm:h-4 w-1/2 bg-surface-subtle rounded-[3px] sm:rounded-[4px]" />
                    <div className="pt-1.5 sm:pt-2 flex justify-between border-t border-line/40">
                      <div className="h-2.5 sm:h-3 w-14 sm:w-20 bg-surface-subtle rounded-[3px] sm:rounded-[4px]" />
                      <div className="h-2.5 sm:h-3 w-10 sm:w-12 bg-surface-subtle rounded-[3px] sm:rounded-[4px]" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Error State */}
          {isError && !isLoading && (
            <div className="rounded-2xl border border-line bg-card p-10 text-center space-y-3">
              <p className="text-sm text-ink-soft">Could not load events. Please check connection.</p>
              <button
                type="button"
                onClick={() => refetch()}
                className="inline-flex items-center gap-1.5 rounded-full bg-accent px-4 py-2 text-xs font-mono font-semibold text-white shadow-xs hover:bg-accent-hover"
              >
                <span>Retry</span>
              </button>
            </div>
          )}

          {/* Empty State */}
          {!isLoading && !isError && events.length === 0 && (
            <div className="rounded-2xl border border-dashed border-line bg-card p-12 text-center space-y-3">
              <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-surface-subtle border border-line text-ink-muted">
                <Funnel size={20} />
              </div>
              <h3 className="text-base font-bold text-ink">No events match your criteria</h3>
              <p className="text-xs text-ink-soft max-w-sm mx-auto">
                Try widening your search keywords, switching between Free and Paid, or clearing category filters.
              </p>
              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="inline-flex items-center gap-1.5 rounded-full border border-line bg-card px-4 py-2 text-xs font-mono font-semibold text-ink shadow-xs hover:border-accent hover:text-accent transition-colors"
                >
                  <ArrowCounterClockwise size={13} />
                  <span>Reset All Filters</span>
                </button>
              </div>
            </div>
          )}

          {/* Events Catalog Grid (2-Columns on Mobile, 3-Columns on Desktop) */}
          {!isLoading && !isError && events.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-4 lg:gap-5">
              {events.map((event) => (
                <EventTicketCard
                  key={event.id}
                  event={event}
                  isBookmarked={bookmarkedIds.has(event.id)}
                  onBookmark={handleBookmarkToggle}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 3. Mobile Off-Canvas Filter Drawer (< 1024px) */}
      {isMobileFilterOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
            onClick={() => setIsMobileFilterOpen(false)}
          />

          {/* Slide-out Drawer Panel */}
          <div className="relative ml-auto flex h-full w-full max-w-xs flex-col bg-paper p-5 shadow-2xl overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-line mb-5">
              <div className="flex items-center gap-2">
                <Funnel size={16} weight="bold" className="text-accent" />
                <h3 className="text-base font-bold text-ink">Filter Events</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsMobileFilterOpen(false)}
                className="grid h-8 w-8 place-items-center rounded-full bg-surface-subtle text-ink-muted hover:text-ink"
              >
                <X size={16} />
              </button>
            </div>

            {FilterContent}

            <div className="mt-8 pt-4 border-t border-line">
              <button
                type="button"
                onClick={() => setIsMobileFilterOpen(false)}
                className="w-full rounded-xl bg-accent py-2.5 text-xs font-mono font-semibold text-white shadow-md hover:bg-accent-hover"
              >
                Apply & View ({events.length} Events)
              </button>
            </div>
          </div>
        </div>
      )}
    </PageShell>
  )
}
