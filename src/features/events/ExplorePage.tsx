// Hallmark macrostructure: Catalog-Explore / Option B Seamless Architecture
import React, { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { useSearchParams, Link } from 'react-router-dom'
import { useEvents } from '@/hooks/useEvents'
import { useClubs } from '@/hooks/useClubs'
import { Event } from '@/api'
import { EventTicketCard } from '@/design-system/EventTicketCard'
import { SectionHeader } from '@/design-system/SectionHeader'
import { PageShell } from '@/design-system/layout/PageShell'
import { Sheet } from '@/design-system/primitives/Sheet'
import { EmptyState } from '@/design-system/primitives/EmptyState'
import { formatDate, formatTime, formatCurrency } from '@/lib/format'
import { getClubTheme } from '@/design-system/clubColors'
import {
  MagnifyingGlass,
  X,
  Funnel,
  GridFour,
  ListBullets,
  Check,
  CalendarBlank,
  MapPin,
  Ticket,
  ArrowUpRight,
} from '@/design-system/Icon'
import { cn } from '@/lib/utils'

/**
 * Modern-Minimal Dense Row for List View
 */
const DenseExploreRow: React.FC<{ event: Event }> = ({ event }) => {
  const clubId = event.organizerId || (event as any).clubId || 'club-cp'
  const clubTheme = getClubTheme(clubId)
  const isFree = event.isFree ?? (!event.price || event.price === 0)
  const isWaitlist = event.seatsLeft === 0 || (event as any).isWaitlist

  return (
    <article className="group relative flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-card border border-line hover:border-accent/30 hover:bg-surface-subtle/50 transition-colors select-none">
      {/* Left: Date Stamp & Particulars */}
      <div className="flex items-start sm:items-center gap-4 min-w-0">
        <div className="w-12 h-12 rounded-xl bg-surface-subtle flex flex-col items-center justify-center flex-shrink-0 text-center font-mono">
          <span className="text-[10px] uppercase font-bold text-accent tracking-wider">
            {new Date(event.startsAt).toLocaleDateString('en-IN', { month: 'short' })}
          </span>
          <span className="font-sans font-bold text-base text-ink leading-none">
            {new Date(event.startsAt).getDate()}
          </span>
        </div>

        <div className="space-y-0.5 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className="w-2 h-2 rounded-full flex-shrink-0"
              style={{ backgroundColor: clubTheme.hex || 'var(--accent)' }}
              aria-hidden="true"
            />
            <span className="text-xs font-medium text-ink-soft truncate">
              {event.club?.name || event.organizerName || 'Campus Club'}
            </span>
            <span className="text-xs font-mono text-ink-muted">·</span>
            <span className="text-xs font-mono text-ink-muted">
              {formatTime(event.startsAt)}
            </span>
          </div>

          <h3 className="font-sans font-semibold text-base text-ink tracking-tight line-clamp-1 group-hover:text-accent transition-colors">
            <Link to={`/events/${event.slug || event.id}`} className="focus:outline-none">
              {event.title}
            </Link>
          </h3>

          <div className="flex items-center gap-1.5 text-xs text-ink-muted">
            <MapPin size={12} weight="bold" className="text-accent flex-shrink-0" />
            <span className="truncate">{event.venue?.name || 'Campus Main Auditorium'}</span>
          </div>
        </div>
      </div>

      {/* Right: Badges & Action CTA */}
      <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-line/60 flex-shrink-0">
        <div className="text-left sm:text-right font-mono text-xs">
          <span className="font-semibold text-ink">
            {isFree ? 'Free' : formatCurrency(event.price)}
          </span>
          {event.seatsLeft !== undefined && (
            <p className="text-[11px] text-ink-muted">
              {event.seatsLeft} left
            </p>
          )}
        </div>

        <Link
          to={`/events/${event.slug || event.id}`}
          className="inline-flex items-center gap-1 px-3.5 py-1.5 rounded-full bg-ink text-paper hover:bg-accent hover:text-white font-medium text-xs transition-colors"
        >
          <span>{isWaitlist ? 'Waitlist' : 'RSVP'}</span>
          <ArrowUpRight size={12} weight="bold" />
        </Link>
      </div>
    </article>
  )
}

export const ExplorePage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false)
  const [sortBy, setSortBy] = useState<'date' | 'popular' | 'title'>('date')

  const activeCategory = searchParams.get('category') || 'ALL'
  const activeClub = searchParams.get('club') || 'ALL'
  const activeDate = searchParams.get('date') || 'ALL'
  const searchQuery = searchParams.get('search') || ''
  const freeOnly = searchParams.get('free') === 'true'

  const { data: clubs = [] } = useClubs()
  const { data: eventsData, isLoading } = useEvents({
    category: activeCategory !== 'ALL' ? activeCategory : undefined,
    clubId: activeClub !== 'ALL' ? activeClub : undefined,
    search: searchQuery || undefined,
  })

  const rawEvents = useMemo(() => eventsData?.items || [], [eventsData?.items])

  // Filter & sort events
  const filteredEvents = useMemo(() => {
    let result = [...rawEvents]

    if (freeOnly) {
      result = result.filter((e) => e.isFree || !e.features?.paid)
    }

    if (activeDate === 'today') {
      const todayStr = new Date().toISOString().slice(0, 10)
      result = result.filter((e) => e.startsAt.startsWith(todayStr))
    }

    if (sortBy === 'popular') {
      result.sort((a, b) => (b.capacity - b.seatsLeft) - (a.capacity - a.seatsLeft))
    } else if (sortBy === 'title') {
      result.sort((a, b) => a.title.localeCompare(b.title))
    } else {
      result.sort((a, b) => {
        const aActive = a.status === 'published' ? 1 : 0
        const bActive = b.status === 'published' ? 1 : 0
        if (aActive !== bActive) return bActive - aActive
        return new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime()
      })
    }

    return result
  }, [rawEvents, freeOnly, activeDate, sortBy])

  const setParam = (key: string, value: string) => {
    const next = new URLSearchParams(searchParams)
    if (value && value !== 'ALL') {
      next.set(key, value)
    } else {
      next.delete(key)
    }
    setSearchParams(next)
  }

  const clearAllFilters = () => {
    setSearchParams(new URLSearchParams())
  }

  const categories = [
    { id: 'ALL', label: 'All' },
    { id: 'HACKATHON', label: 'Hackathons' },
    { id: 'WORKSHOP', label: 'Workshops' },
    { id: 'TALK', label: 'Tech talks' },
    { id: 'COMPETITION', label: 'Competitions' },
  ]

  const activeFiltersCount =
    (activeCategory !== 'ALL' ? 1 : 0) +
    (activeClub !== 'ALL' ? 1 : 0) +
    (activeDate !== 'ALL' ? 1 : 0) +
    (freeOnly ? 1 : 0) +
    (searchQuery ? 1 : 0)

  return (
    <PageShell className="py-8 sm:py-12 space-y-8 select-none">
      {/* Header Block: Section Header & Instant Search Box */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-line/60">
        <SectionHeader
          title="Explore Campus Sessions"
          subtitle="Discover and reserve seats for hackathons, engineering masterclasses, and design retreats."
          badge="Live Index"
          className="mb-0"
        />

        {/* Prominent Instant Search Input */}
        <div className="relative w-full md:max-w-xs">
          <MagnifyingGlass
            size={16}
            weight="bold"
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-muted pointer-events-none"
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setParam('search', e.target.value)}
            placeholder="Search sessions..."
            className="w-full h-10 pl-9 pr-8 bg-card border border-line rounded-full focus:border-accent focus:outline-none text-xs text-ink placeholder:text-ink-muted transition-colors shadow-sm"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setParam('search', '')}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 text-ink-muted hover:text-ink"
              aria-label="Clear search"
            >
              <X size={13} weight="bold" />
            </button>
          )}
        </div>
      </div>

      {/* Filter Strip & View Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-1">
          {categories.map((cat) => {
            const isSelected = activeCategory === cat.id
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setParam('category', cat.id)}
                className={cn(
                  'px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors',
                  isSelected
                    ? 'bg-ink text-paper'
                    : 'bg-card text-ink-soft hover:text-ink hover:bg-surface-subtle border border-line'
                )}
              >
                {cat.label}
              </button>
            )
          })}
        </div>

        {/* Right Tools: Free only, Sort, Grid/List view */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            type="button"
            onClick={() => setParam('free', freeOnly ? '' : 'true')}
            className={cn(
              'h-8 px-3 rounded-full text-xs font-medium flex items-center gap-1.5 transition-colors border',
              freeOnly
                ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
                : 'bg-card text-ink border-line hover:bg-surface-subtle'
            )}
          >
            <span>Free only</span>
            {freeOnly && <Check size={11} weight="bold" />}
          </button>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="h-8 px-3 bg-card border border-line rounded-full text-xs font-medium text-ink focus:outline-none focus:border-accent transition-colors cursor-pointer"
          >
            <option value="date">Soonest</option>
            <option value="popular">Most popular</option>
            <option value="title">Alphabetical</option>
          </select>

          {/* Grid / List Switcher */}
          <div className="flex items-center p-0.5 bg-surface-subtle rounded-full border border-line">
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={cn(
                'w-7 h-7 rounded-full flex items-center justify-center transition-colors',
                viewMode === 'grid' ? 'bg-card text-ink shadow-sm' : 'text-ink-muted hover:text-ink'
              )}
              aria-label="Grid view"
            >
              <GridFour size={14} weight="bold" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode('list')}
              className={cn(
                'w-7 h-7 rounded-full flex items-center justify-center transition-colors',
                viewMode === 'list' ? 'bg-card text-ink shadow-sm' : 'text-ink-muted hover:text-ink'
              )}
              aria-label="List view"
            >
              <ListBullets size={14} weight="bold" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Events Catalog Area */}
      {isLoading ? (
        <div
          className={cn(
            'w-full',
            viewMode === 'grid'
              ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8'
              : 'flex flex-col gap-3'
          )}
        >
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className={cn(
                'bg-surface-subtle animate-pulse rounded-2xl',
                viewMode === 'grid' ? 'h-72' : 'h-18'
              )}
            />
          ))}
        </div>
      ) : filteredEvents.length === 0 ? (
        <div className="py-16 text-center">
          <EmptyState
            title="No matching events found"
            description="Try loosening your filters or resetting your search keyword."
            actionLabel="Reset all filters"
            onAction={clearAllFilters}
          />
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {filteredEvents.map((evt) => (
            <EventTicketCard key={evt.id} event={evt} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col gap-2.5 max-w-4xl mx-auto w-full">
          {filteredEvents.map((evt) => (
            <DenseExploreRow key={evt.id} event={evt} />
          ))}
        </div>
      )}
    </PageShell>
  )
}
