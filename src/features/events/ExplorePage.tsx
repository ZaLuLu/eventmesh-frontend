import React, { useMemo, useState } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { useEvents } from '@/hooks/useEvents'
import { useClubs } from '@/hooks/useClubs'
import { VerticalPosterCard } from '@/design-system/VerticalPosterCard'
import { PageShell } from '@/design-system/layout/PageShell'
import { GhostEventGrid } from '@/design-system/primitives/GhostLoader'
import { QuickRSVPModal } from './components/QuickRSVPModal'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/design-system/ui/dropdown-menu'
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from '@/design-system/ui/accordion'
import {
  MagnifyingGlass,
  X,
  Funnel,
  CaretDown,
  ArrowCounterClockwise,
  CalendarBlank,
  MapPin,
  Check,
  Ticket,
  ArrowRight,
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

const sources = [
  { value: 'ALL', label: 'All Sources', dot: '#71717A' },
  { value: 'eventmesh', label: 'EventMesh', dot: '#7C3AED' },
  { value: 'eventbrite', label: 'Eventbrite', dot: '#FF8A65' },
  { value: 'meetup', label: 'Meetup', dot: '#FF4D4D' },
  { value: 'luma', label: 'Luma', dot: '#C084FC' },
]

const cities = [
  { value: 'ALL', label: 'All Cities' },
  { value: 'Bangalore', label: 'Bangalore' },
  { value: 'Mumbai', label: 'Mumbai' },
  { value: 'Delhi NCR', label: 'Delhi NCR' },
  { value: 'Hyderabad', label: 'Hyderabad' },
  { value: 'Pune', label: 'Pune' },
  { value: 'Goa', label: 'Goa' },
  { value: 'San Francisco', label: 'San Francisco' },
  { value: 'New York', label: 'New York' },
  { value: 'London', label: 'London' },
  { value: 'Berlin', label: 'Berlin' },
]

const dates = [
  { value: 'upcoming', label: 'Upcoming' },
  { value: 'today', label: 'Today' },
  { value: 'weekend', label: 'This Weekend' },
  { value: 'next-week', label: 'Next Week' },
  { value: 'past', label: 'Past Events' },
  { value: 'all', label: 'All Dates' },
]

const scopes = [
  { value: 'ALL', label: 'All Locations' },
  { value: 'campus', label: 'Campus Venues' },
  { value: 'city', label: 'Outside / City Hubs' },
]

export const ExplorePage: React.FC = () => {
  const [params, setParams] = useSearchParams()
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false)
  const [quickRsvpEvent, setQuickRsvpEvent] = useState<any>(null)

  // URL Query Parameters
  const category = params.get('category') || 'ALL'
  const source = params.get('source') || 'ALL'
  const city = params.get('city') || 'ALL'
  const club = params.get('club') || 'ALL'
  const date = params.get('date') || 'upcoming'
  const scope = params.get('scope') || 'ALL'
  const query = params.get('search') || ''
  const admission = params.get('admission') || (params.get('free') === 'true' ? 'free' : params.get('free') === 'false' ? 'paid' : 'all')
  const sort = params.get('sort') || 'date-desc'

  const { data: clubs = [] } = useClubs()
  const { data, isLoading, isError, refetch } = useEvents({
    search: query || undefined,
    category: category !== 'ALL' ? category : undefined,
    city: city !== 'ALL' ? city : undefined,
    source: source !== 'ALL' ? source : undefined,
    free: admission === 'free' ? true : admission === 'paid' ? false : undefined,
    dateFilter: date !== 'all' && date !== 'ALL' ? (date as any) : undefined,
  })

  const setParam = (key: string, value: string) => {
    setParams((previous) => {
      const next = new URLSearchParams(previous)
      if (
        !value ||
        value === 'ALL' ||
        (key === 'date' && value === 'upcoming') ||
        (key === 'admission' && value === 'all') ||
        (key === 'sort' && value === 'date-desc')
      ) {
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

  const handleResetFilters = () => {
    setParams(new URLSearchParams())
  }

  // Active filters count
  const activeFiltersCount = useMemo(() => {
    let count = 0
    if (category !== 'ALL') count++
    if (source !== 'ALL') count++
    if (city !== 'ALL') count++
    if (club !== 'ALL') count++
    if (date !== 'upcoming' && date !== 'all') count++
    if (scope !== 'ALL') count++
    if (admission !== 'all') count++
    if (query) count++
    return count
  }, [category, source, city, club, date, scope, admission, query])

  // Process & Sort events
  const events = useMemo(() => {
    let items = (data?.items || []).filter((e) => {
      const venueLower = (e.venue?.name || '').toLowerCase()
      const isCampus = venueLower.includes('campus') || venueLower.includes('auditorium') || venueLower.includes('hall') || venueLower.includes('ctu')
      if (scope === 'campus' && !isCampus) return false
      if (scope === 'city' && isCampus) return false
      if (club !== 'ALL' && e.organizerId !== club && e.club?.id !== club) return false
      return true
    })

    return items.sort((a, b) => {
      if (sort === 'date') return new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime()
      if (sort === 'date-desc') return new Date(b.startsAt).getTime() - new Date(a.startsAt).getTime()
      if (sort === 'price-asc') return (a.price || 0) - (b.price || 0)
      if (sort === 'title') return a.title.localeCompare(b.title)
      return 0
    })
  }, [data?.items, scope, club, sort])

  // Dynamic category counts
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { ALL: (data?.items || []).length }
    categories.forEach((cat) => {
      if (cat.value !== 'ALL') counts[cat.value] = 0
    })
    ;(data?.items || []).forEach((e) => {
      const cat = (e.category || '').toLowerCase()
      if (counts[cat] !== undefined) counts[cat]++
    })
    return counts
  }, [data?.items])

  return (
    <PageShell className="py-8 sm:py-12 space-y-8 max-w-7xl mx-auto">
      {/* 1. Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-2 border-b border-line">
        <div>
          <nav aria-label="Breadcrumb" className="mb-2">
            <ol className="flex items-center gap-1.5 text-xs font-mono text-ink-muted">
              <li>
                <Link to="/" className="hover:text-ink transition-colors">Home</Link>
              </li>
              <li>/</li>
              <li className="text-ink font-semibold" aria-current="page">Explore</li>
            </ol>
          </nav>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-ink font-display">
            Explore All Campus Events
          </h1>
          <p className="mt-1 text-sm text-ink-soft max-w-2xl leading-relaxed">
            Discover student hackathons, city tech summits, and open campus masterclasses across CTU and beyond.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <Link
            to="/calendar"
            className="inline-flex items-center gap-1.5 rounded-xl border border-line bg-card hover:bg-surface-subtle px-3.5 py-2 text-xs font-semibold text-ink shadow-xs hover:border-accent hover:text-accent transition-all active:scale-95"
            title="Open interactive calendar schedule"
          >
            <CalendarBlank size={14} weight="bold" className="text-accent" />
            <span>Calendar View</span>
          </Link>

          {/* Clean Non-Button Metric Counter */}
          <span className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-mono font-semibold text-ink-muted bg-surface-subtle rounded-xl border border-line">
            <span className="h-2 w-2 rounded-full bg-accent animate-pulse" />
            <span>{isLoading ? 'Scanning...' : `${events.length} events`}</span>
          </span>
        </div>
      </div>

      {/* 2. Unified Top Filter Toolbar (Luma / Dice Style, 100% Solid) */}
      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Search Input Dock */}
          <div className="relative flex-1 min-w-[220px] max-w-md">
            <MagnifyingGlass
              size={15}
              weight="bold"
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-muted"
            />
            <input
              type="text"
              value={query}
              onChange={(e) => setParam('search', e.target.value)}
              placeholder="Search by title, club, keyword..."
              className="h-10 w-full rounded-xl border border-line bg-card pl-9 pr-8 text-xs text-ink placeholder:text-ink-muted focus:border-accent focus:outline-none shadow-xs"
            />
            {query && (
              <button
                type="button"
                onClick={() => setParam('search', '')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-ink-muted hover:text-ink"
              >
                <X size={13} weight="bold" />
              </button>
            )}
          </div>

          {/* Desktop Filter Pills */}
          <div className="hidden lg:flex flex-wrap items-center gap-2">
            {/* Category Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger
                className={cn(
                  'h-10 px-3.5 rounded-xl border text-xs font-mono font-semibold inline-flex items-center gap-1.5 transition-all shadow-xs active:scale-95 cursor-pointer',
                  category !== 'ALL'
                    ? 'border-accent bg-accent-soft text-accent'
                    : 'border-line bg-card text-ink hover:border-line-strong'
                )}
              >
                <span>{category === 'ALL' ? 'Category' : categories.find((c) => c.value === category)?.label}</span>
                <CaretDown size={12} weight="bold" className="text-ink-muted" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56 p-1.5 bg-card border border-line rounded-xl shadow-xl">
                {categories.map((c) => (
                  <DropdownMenuItem
                    key={c.value}
                    onClick={() => setParam('category', c.value)}
                    className="flex items-center justify-between px-3 py-2 text-xs font-mono rounded-lg cursor-pointer hover:bg-surface-subtle"
                  >
                    <span>{c.label}</span>
                    <span className="text-[10px] text-ink-muted">({categoryCounts[c.value] || 0})</span>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* When / Date Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger
                className={cn(
                  'h-10 px-3.5 rounded-xl border text-xs font-mono font-semibold inline-flex items-center gap-1.5 transition-all shadow-xs active:scale-95 cursor-pointer',
                  date !== 'upcoming' && date !== 'all'
                    ? 'border-accent bg-accent-soft text-accent'
                    : 'border-line bg-card text-ink hover:border-line-strong'
                )}
              >
                <span>{date === 'upcoming' ? 'When: Upcoming' : dates.find((d) => d.value === date)?.label}</span>
                <CaretDown size={12} weight="bold" className="text-ink-muted" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-48 p-1.5 bg-card border border-line rounded-xl shadow-xl">
                {dates.map((d) => (
                  <DropdownMenuItem
                    key={d.value}
                    onClick={() => setParam('date', d.value)}
                    className="flex items-center justify-between px-3 py-2 text-xs font-mono rounded-lg cursor-pointer hover:bg-surface-subtle"
                  >
                    <span>{d.label}</span>
                    {date === d.value && <Check size={13} weight="bold" className="text-accent" />}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Platform / Source Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger
                className={cn(
                  'h-10 px-3.5 rounded-xl border text-xs font-mono font-semibold inline-flex items-center gap-1.5 transition-all shadow-xs active:scale-95 cursor-pointer',
                  source !== 'ALL'
                    ? 'border-accent bg-accent-soft text-accent'
                    : 'border-line bg-card text-ink hover:border-line-strong'
                )}
              >
                <span>{source === 'ALL' ? 'Platform' : sources.find((s) => s.value === source)?.label}</span>
                <CaretDown size={12} weight="bold" className="text-ink-muted" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-48 p-1.5 bg-card border border-line rounded-xl shadow-xl">
                {sources.map((s) => (
                  <DropdownMenuItem
                    key={s.value}
                    onClick={() => setParam('source', s.value)}
                    className="flex items-center justify-between px-3 py-2 text-xs font-mono rounded-lg cursor-pointer hover:bg-surface-subtle"
                  >
                    <span className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: s.dot }} />
                      <span>{s.label}</span>
                    </span>
                    {source === s.value && <Check size={13} weight="bold" className="text-accent" />}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Price / Admission Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger
                className={cn(
                  'h-10 px-3.5 rounded-xl border text-xs font-mono font-semibold inline-flex items-center gap-1.5 transition-all shadow-xs active:scale-95 cursor-pointer',
                  admission !== 'all'
                    ? 'border-accent bg-accent-soft text-accent'
                    : 'border-line bg-card text-ink hover:border-line-strong'
                )}
              >
                <span>{admission === 'all' ? 'Admission' : admission === 'free' ? 'Free Passes' : 'Paid Passes'}</span>
                <CaretDown size={12} weight="bold" className="text-ink-muted" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-44 p-1.5 bg-card border border-line rounded-xl shadow-xl">
                <DropdownMenuItem onClick={() => setParam('admission', 'all')} className="px-3 py-2 text-xs font-mono rounded-lg cursor-pointer hover:bg-surface-subtle">
                  All Passes
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setParam('admission', 'free')} className="px-3 py-2 text-xs font-mono rounded-lg cursor-pointer hover:bg-surface-subtle">
                  Free Student Passes
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setParam('admission', 'paid')} className="px-3 py-2 text-xs font-mono rounded-lg cursor-pointer hover:bg-surface-subtle">
                  Paid Ticketed Passes
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* City / Location Scope Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger
                className={cn(
                  'h-10 px-3.5 rounded-xl border text-xs font-mono font-semibold inline-flex items-center gap-1.5 transition-all shadow-xs active:scale-95 cursor-pointer',
                  city !== 'ALL' || scope !== 'ALL'
                    ? 'border-accent bg-accent-soft text-accent'
                    : 'border-line bg-card text-ink hover:border-line-strong'
                )}
              >
                <span>{scope !== 'ALL' ? (scope === 'campus' ? 'Campus Only' : 'Outside City') : city !== 'ALL' ? city : 'Location'}</span>
                <CaretDown size={12} weight="bold" className="text-ink-muted" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-52 p-1.5 bg-card border border-line rounded-xl shadow-xl">
                <DropdownMenuItem onClick={() => { setParam('scope', 'ALL'); setParam('city', 'ALL'); }} className="px-3 py-2 text-xs font-mono rounded-lg cursor-pointer hover:bg-surface-subtle">
                  All Locations
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setParam('scope', 'campus')} className="px-3 py-2 text-xs font-mono rounded-lg cursor-pointer hover:bg-surface-subtle">
                  Campus Venues Only
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setParam('scope', 'city')} className="px-3 py-2 text-xs font-mono rounded-lg cursor-pointer hover:bg-surface-subtle">
                  Outside / City Hubs
                </DropdownMenuItem>
                <DropdownMenuSeparator className="my-1 border-t border-line" />
                {cities.filter(c => c.value !== 'ALL').map((c) => (
                  <DropdownMenuItem
                    key={c.value}
                    onClick={() => { setParam('scope', 'ALL'); setParam('city', c.value); }}
                    className="px-3 py-1.5 text-xs font-mono rounded-lg cursor-pointer hover:bg-surface-subtle"
                  >
                    <span>{c.label}</span>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Mobile Filter Drawer Button (< lg) */}
          <button
            type="button"
            onClick={() => setIsMobileFilterOpen(true)}
            className="lg:hidden h-10 px-3.5 rounded-xl border border-line bg-card font-mono text-xs font-semibold text-ink inline-flex items-center gap-2 shadow-xs active:scale-95"
          >
            <Funnel size={14} weight="bold" className="text-accent" />
            <span>Filters</span>
            {activeFiltersCount > 0 && (
              <span className="grid h-4 w-4 place-items-center rounded-full bg-accent text-[10px] text-white font-bold">
                {activeFiltersCount}
              </span>
            )}
          </button>

          {/* Sort Selector Dropdown */}
          <div className="ml-auto flex items-center gap-1.5">
            <span className="hidden sm:inline text-xs font-mono text-ink-muted">Sort:</span>
            <DropdownMenu>
              <DropdownMenuTrigger className="h-10 px-3.5 rounded-xl border border-line bg-card text-xs font-mono font-semibold text-ink inline-flex items-center gap-1.5 shadow-xs hover:border-line-strong active:scale-95 cursor-pointer">
                <span>
                  {sort === 'date-desc'
                    ? 'Latest Date'
                    : sort === 'date'
                    ? 'Soonest Date'
                    : sort === 'price-asc'
                    ? 'Price: Low-High'
                    : 'Title (A-Z)'}
                </span>
                <CaretDown size={12} weight="bold" className="text-ink-muted" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 p-1.5 bg-card border border-line rounded-xl shadow-xl">
                <DropdownMenuItem onClick={() => setParam('sort', 'date-desc')} className="px-3 py-2 text-xs font-mono rounded-lg cursor-pointer hover:bg-surface-subtle">
                  Date: Latest
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setParam('sort', 'date')} className="px-3 py-2 text-xs font-mono rounded-lg cursor-pointer hover:bg-surface-subtle">
                  Date: Soonest
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setParam('sort', 'price-asc')} className="px-3 py-2 text-xs font-mono rounded-lg cursor-pointer hover:bg-surface-subtle">
                  Price: Low to High
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setParam('sort', 'title')} className="px-3 py-2 text-xs font-mono rounded-lg cursor-pointer hover:bg-surface-subtle">
                  Title: A-Z
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* 3. Active Filters Pill Bar (Dismissible Tags) */}
        {activeFiltersCount > 0 && (
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-line">
            <span className="text-xs font-mono text-ink-muted mr-1">Active:</span>

            {category !== 'ALL' && (
              <span className="inline-flex items-center gap-1 rounded-full bg-accent-soft px-3 py-1 text-xs font-mono font-semibold text-accent border border-accent/20">
                <span>Category: {categories.find((c) => c.value === category)?.label || category}</span>
                <button type="button" onClick={() => setParam('category', 'ALL')} className="hover:text-ink">
                  <X size={11} weight="bold" />
                </button>
              </span>
            )}

            {date !== 'upcoming' && date !== 'all' && (
              <span className="inline-flex items-center gap-1 rounded-full bg-surface-subtle px-3 py-1 text-xs font-mono font-semibold text-ink border border-line">
                <span>When: {dates.find((d) => d.value === date)?.label || date}</span>
                <button type="button" onClick={() => setParam('date', 'upcoming')} className="hover:text-accent">
                  <X size={11} weight="bold" />
                </button>
              </span>
            )}

            {source !== 'ALL' && (
              <span className="inline-flex items-center gap-1 rounded-full bg-accent-soft px-3 py-1 text-xs font-mono font-semibold text-accent border border-accent/20">
                <span>Source: {sources.find((s) => s.value === source)?.label || source}</span>
                <button type="button" onClick={() => setParam('source', 'ALL')} className="hover:text-ink">
                  <X size={11} weight="bold" />
                </button>
              </span>
            )}

            {admission !== 'all' && (
              <span className="inline-flex items-center gap-1 rounded-full bg-surface-subtle px-3 py-1 text-xs font-mono font-semibold text-ink border border-line">
                <span>Pass: {admission === 'free' ? 'Free Admission' : 'Paid Ticketed'}</span>
                <button type="button" onClick={() => setParam('admission', 'all')} className="hover:text-accent">
                  <X size={11} weight="bold" />
                </button>
              </span>
            )}

            {scope !== 'ALL' && (
              <span className="inline-flex items-center gap-1 rounded-full bg-surface-subtle px-3 py-1 text-xs font-mono font-semibold text-ink border border-line">
                <span>Scope: {scope === 'campus' ? 'Campus Only' : 'Outside City'}</span>
                <button type="button" onClick={() => setParam('scope', 'ALL')} className="hover:text-accent">
                  <X size={11} weight="bold" />
                </button>
              </span>
            )}

            {city !== 'ALL' && (
              <span className="inline-flex items-center gap-1 rounded-full bg-surface-subtle px-3 py-1 text-xs font-mono font-semibold text-ink border border-line">
                <span>City: {city}</span>
                <button type="button" onClick={() => setParam('city', 'ALL')} className="hover:text-accent">
                  <X size={11} weight="bold" />
                </button>
              </span>
            )}

            {query && (
              <span className="inline-flex items-center gap-1 rounded-full bg-surface-subtle px-3 py-1 text-xs font-mono font-semibold text-ink border border-line">
                <span>"{query}"</span>
                <button type="button" onClick={() => setParam('search', '')} className="hover:text-accent">
                  <X size={11} weight="bold" />
                </button>
              </span>
            )}

            <button
              type="button"
              onClick={handleResetFilters}
              className="text-xs font-mono font-semibold text-accent hover:underline ml-1 cursor-pointer"
            >
              Clear all
            </button>
          </div>
        )}
      </div>

      {/* 4. Full-Width 4-Column Responsive Grid (Option A1 + A2) */}
      <div className="w-full">
        {isLoading && <GhostEventGrid count={8} />}

        {isError && !isLoading && (
          <div className="rounded-2xl border border-line bg-card p-12 text-center space-y-3">
            <p className="text-sm text-ink-soft">Could not load campus events. Please check connection.</p>
            <button
              type="button"
              onClick={() => refetch()}
              className="inline-flex items-center gap-1.5 rounded-full bg-accent px-5 py-2 text-xs font-mono font-semibold text-white shadow-xs hover:bg-accent-hover"
            >
              <span>Retry Search</span>
            </button>
          </div>
        )}

        {!isLoading && !isError && events.length === 0 && (
          <div className="rounded-2xl border border-dashed border-line bg-card p-14 text-center space-y-4">
            <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-surface-subtle border border-line text-ink-muted">
              <Funnel size={22} weight="bold" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-ink">No events match your selected filters</h3>
              <p className="text-xs text-ink-soft max-w-sm mx-auto">
                Try widening your search terms, selecting "All Categories", or clearing specific date filters.
              </p>
            </div>
            <div className="pt-2">
              <button
                type="button"
                onClick={handleResetFilters}
                className="inline-flex items-center gap-1.5 rounded-full border border-line bg-card px-5 py-2.5 text-xs font-mono font-semibold text-ink shadow-xs hover:border-accent hover:text-accent transition-colors"
              >
                <ArrowCounterClockwise size={13} weight="bold" />
                <span>Reset All Filters</span>
              </button>
            </div>
          </div>
        )}

        {!isLoading && !isError && events.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {events.map((event, idx) => (
              <VerticalPosterCard
                key={event.id}
                event={event}
                priority={idx < 4}
                onQuickRSVP={(evt) => setQuickRsvpEvent(evt)}
              />
            ))}
          </div>
        )}
      </div>

      {/* 5. 1-Click Pass Desk Modal */}
      <QuickRSVPModal
        event={quickRsvpEvent}
        isOpen={Boolean(quickRsvpEvent)}
        onClose={() => setQuickRsvpEvent(null)}
      />

      {/* 6. Mobile Off-Canvas Filter Drawer with Accordion Sections (Option A3) */}
      {isMobileFilterOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          {/* Solid Opaque Scrim (Zero Glassmorphism) */}
          <div
            className="fixed inset-0 bg-black/70 transition-opacity"
            onClick={() => setIsMobileFilterOpen(false)}
          />

          <div className="relative ml-auto flex h-full w-full max-w-sm flex-col bg-card border-l border-line p-5 shadow-2xl overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-line mb-4">
              <div className="flex items-center gap-2">
                <Funnel size={16} weight="bold" className="text-accent" />
                <h3 className="text-base font-bold text-ink font-display">Filters</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsMobileFilterOpen(false)}
                aria-label="Close filters"
                className="grid h-9 w-9 place-items-center rounded-lg bg-surface-subtle border border-line text-ink-muted hover:text-ink active:scale-95"
              >
                <X size={16} weight="bold" />
              </button>
            </div>

            <Accordion type="multiple" defaultValue={['cat', 'date', 'source']} className="w-full space-y-1">
              {/* Category Accordion */}
              <AccordionItem value="cat" className="border-b border-line">
                <AccordionTrigger className="text-xs font-mono font-bold uppercase text-ink">
                  Category ({categories.find(c => c.value === category)?.label || 'All'})
                </AccordionTrigger>
                <AccordionContent className="pt-1 pb-3 space-y-1">
                  {categories.map((c) => (
                    <button
                      key={c.value}
                      type="button"
                      onClick={() => setParam('category', c.value)}
                      className={cn(
                        'w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-mono transition-colors text-left',
                        category === c.value
                          ? 'bg-accent text-white font-bold'
                          : 'hover:bg-surface-subtle text-ink-soft'
                      )}
                    >
                      <span>{c.label}</span>
                      <span className="text-[10px] opacity-80">({categoryCounts[c.value] || 0})</span>
                    </button>
                  ))}
                </AccordionContent>
              </AccordionItem>

              {/* Date Accordion */}
              <AccordionItem value="date" className="border-b border-line">
                <AccordionTrigger className="text-xs font-mono font-bold uppercase text-ink">
                  Timing ({dates.find(d => d.value === date)?.label || 'Upcoming'})
                </AccordionTrigger>
                <AccordionContent className="pt-1 pb-3 space-y-1">
                  {dates.map((d) => (
                    <button
                      key={d.value}
                      type="button"
                      onClick={() => setParam('date', d.value)}
                      className={cn(
                        'w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-mono transition-colors text-left',
                        date === d.value
                          ? 'bg-accent text-white font-bold'
                          : 'hover:bg-surface-subtle text-ink-soft'
                      )}
                    >
                      <span>{d.label}</span>
                      {date === d.value && <Check size={13} weight="bold" />}
                    </button>
                  ))}
                </AccordionContent>
              </AccordionItem>

              {/* Source Platform Accordion */}
              <AccordionItem value="source" className="border-b border-line">
                <AccordionTrigger className="text-xs font-mono font-bold uppercase text-ink">
                  Platform ({sources.find(s => s.value === source)?.label || 'All'})
                </AccordionTrigger>
                <AccordionContent className="pt-1 pb-3 space-y-1">
                  {sources.map((s) => (
                    <button
                      key={s.value}
                      type="button"
                      onClick={() => setParam('source', s.value)}
                      className={cn(
                        'w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-mono transition-colors text-left',
                        source === s.value
                          ? 'bg-accent text-white font-bold'
                          : 'hover:bg-surface-subtle text-ink-soft'
                      )}
                    >
                      <span className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: s.dot }} />
                        <span>{s.label}</span>
                      </span>
                      {source === s.value && <Check size={13} weight="bold" />}
                    </button>
                  ))}
                </AccordionContent>
              </AccordionItem>

              {/* Admission Accordion */}
              <AccordionItem value="admission" className="border-b border-line">
                <AccordionTrigger className="text-xs font-mono font-bold uppercase text-ink">
                  Admission ({admission === 'free' ? 'Free' : admission === 'paid' ? 'Paid' : 'All'})
                </AccordionTrigger>
                <AccordionContent className="pt-1 pb-3 space-y-1">
                  {[
                    { value: 'all', label: 'All Passes' },
                    { value: 'free', label: 'Free Passes Only' },
                    { value: 'paid', label: 'Paid Passes Only' },
                  ].map((a) => (
                    <button
                      key={a.value}
                      type="button"
                      onClick={() => setParam('admission', a.value)}
                      className={cn(
                        'w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-mono transition-colors text-left',
                        admission === a.value
                          ? 'bg-accent text-white font-bold'
                          : 'hover:bg-surface-subtle text-ink-soft'
                      )}
                    >
                      <span>{a.label}</span>
                      {admission === a.value && <Check size={13} weight="bold" />}
                    </button>
                  ))}
                </AccordionContent>
              </AccordionItem>
            </Accordion>

            <div className="mt-auto pt-4 border-t border-line">
              <button
                type="button"
                onClick={() => setIsMobileFilterOpen(false)}
                className="w-full rounded-xl bg-accent py-3 text-xs font-mono font-bold text-white shadow-xs hover:bg-accent-hover active:scale-[0.98] transition-all"
              >
                Show {events.length} Events
              </button>
            </div>
          </div>
        </div>
      )}
    </PageShell>
  )
}
