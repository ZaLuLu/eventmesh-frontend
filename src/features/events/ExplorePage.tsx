import { Modal } from '@/design-system/primitives/Modal'
import React, { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { api } from '@/api'
import { useEvents } from '@/hooks/useEvents'
import { useClubs } from '@/hooks/useClubs'
import { EventTicketCard } from '@/design-system/EventTicketCard'
import { PageShell } from '@/design-system/layout/PageShell'
import { MagnifyingGlass, X } from '@/design-system/Icon'
import { cn } from '@/lib/utils'

const categories = [
  { value: 'ALL', label: 'All events' },
  { value: 'HACKATHON', label: 'Hackathons' },
  { value: 'WORKSHOP', label: 'Workshops' },
  { value: 'TALK', label: 'Talks' },
  { value: 'COMPETITION', label: 'Competitions' },
]
const dates = [
  { value: 'ALL', label: 'Any date' },
  { value: 'today', label: 'Today' },
  { value: 'weekend', label: 'This weekend' },
  { value: 'next-week', label: 'Next week' },
]

export const ExplorePage: React.FC = () => {
  const [params, setParams] = useSearchParams()
  const [mobileFilters, setMobileFilters] = useState(false)
  useEffect(() => {
    if (!mobileFilters) return
    const closeOnEscape = (event: KeyboardEvent) => { if (event.key === 'Escape') setMobileFilters(false) }
    window.addEventListener('keydown', closeOnEscape)
    return () => window.removeEventListener('keydown', closeOnEscape)
  }, [mobileFilters])
  const category = params.get('category') || 'ALL'
  const campus = params.get('institution') || 'ALL'
  const club = params.get('club') || 'ALL'
  const date = params.get('date') || 'ALL'
  const query = params.get('search') || ''
  const free = params.get('free') === 'true'
  const sort = params.get('sort') || 'date'
  const { data: clubs = [] } = useClubs()
  const { data: campuses = [] } = useQuery({
    queryKey: ['institutions'],
    queryFn: () => api.organizations.getInstitutions ? api.organizations.getInstitutions() : Promise.resolve([]),
  })
  const { data, isLoading, isError, refetch } = useEvents({
    category: category !== 'ALL' ? category : undefined,
    clubId: club !== 'ALL' ? club : undefined,
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

  const events = useMemo(() => {
    const now = new Date()
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const startOfTomorrow = new Date(startOfToday); startOfTomorrow.setDate(startOfToday.getDate() + 1)
    const nextMonday = new Date(startOfToday); nextMonday.setDate(startOfToday.getDate() + ((8 - startOfToday.getDay()) % 7 || 7))
    const followingMonday = new Date(nextMonday); followingMonday.setDate(nextMonday.getDate() + 7)
    const weekendStart = new Date(startOfToday); weekendStart.setDate(startOfToday.getDate() + ((6 - startOfToday.getDay() + 7) % 7))
    const weekendEnd = new Date(weekendStart); weekendEnd.setDate(weekendStart.getDate() + 2)
    const result = (data?.items || []).filter((event) => {
      if (campus !== 'ALL' && event.institutionSlug !== campus && !event.institutionName?.toLowerCase().includes(campus.toLowerCase())) return false
      if (free && !(event.isFree || event.price === 0)) return false
      const when = new Date(event.startsAt)
      if (date === 'today' && !(when >= startOfToday && when < startOfTomorrow)) return false
      if (date === 'weekend' && !(when >= weekendStart && when < weekendEnd)) return false
      if (date === 'next-week' && !(when >= nextMonday && when < followingMonday)) return false
      return true
    })
    result.sort((a, b) => sort === 'title' ? a.title.localeCompare(b.title) : new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime())
    return result
  }, [data?.items, campus, free, date, sort])

  const filterRail = (
    <div className="space-y-6">
      <fieldset>
        <legend className="mb-2.5 text-xs font-mono uppercase tracking-wider text-ink-muted">When</legend>
        <div className="flex flex-wrap gap-1.5">
          {dates.map((item) => (
            <button
              key={item.value}
              type="button"
              onClick={() => setParam('date', item.value)}
              aria-pressed={date === item.value}
              className={cn(
                'rounded-full px-3 py-1.5 text-xs font-medium transition-all',
                date === item.value
                  ? 'bg-ink text-paper shadow-xs font-semibold'
                  : 'border border-line bg-card text-ink-soft hover:border-line-strong hover:bg-surface-subtle'
              )}
            >
              {item.label}
            </button>
          ))}
        </div>
      </fieldset>

      <fieldset>
        <legend className="mb-2.5 text-xs font-mono uppercase tracking-wider text-ink-muted">Category</legend>
        <div className="space-y-1">
          {categories.map((item) => (
            <button
              key={item.value}
              type="button"
              onClick={() => setParam('category', item.value)}
              aria-pressed={category === item.value}
              className={cn(
                'block w-full rounded-full px-3 py-1.5 text-left text-xs font-medium transition-all',
                category === item.value
                  ? 'bg-accent text-white font-semibold shadow-xs'
                  : 'text-ink-soft hover:bg-surface-subtle hover:text-ink'
              )}
            >
              {item.label}
            </button>
          ))}
        </div>
      </fieldset>

      {campuses.length > 0 && (
        <label className="block text-xs font-mono uppercase tracking-wider text-ink-muted">
          Campus
          <select
            value={campus}
            onChange={(event) => setParam('institution', event.target.value)}
            className="mt-1.5 w-full rounded-xl border border-line bg-card px-3 py-2 text-xs font-sans text-ink focus:outline-none focus:border-accent"
          >
            <option value="ALL">All campuses</option>
            {campuses.map((item) => (
              <option key={item.slug} value={item.slug}>
                {item.name}
              </option>
            ))}
          </select>
        </label>
      )}

      {clubs.length > 0 && (
        <label className="block text-xs font-mono uppercase tracking-wider text-ink-muted">
          Society / Club
          <select
            value={club}
            onChange={(event) => setParam('club', event.target.value)}
            className="mt-1.5 w-full rounded-xl border border-line bg-card px-3 py-2 text-xs font-sans text-ink focus:outline-none focus:border-accent"
          >
            <option value="ALL">All clubs</option>
            {clubs.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>
        </label>
      )}

      <label className="flex items-center gap-2 text-xs font-medium text-ink cursor-pointer pt-1">
        <input
          type="checkbox"
          checked={free}
          onChange={(event) => setParam('free', event.target.checked ? 'true' : '')}
          className="rounded text-accent accent-accent focus:ring-accent"
        />
        <span>Free admission only</span>
      </label>

      <button
        type="button"
        onClick={() => setParams(new URLSearchParams())}
        className="text-xs font-mono text-accent hover:underline block pt-2"
      >
        Reset all filters
      </button>
    </div>
  )

  return (
    <PageShell className="py-8 sm:py-12">
      {/* Editorial Header with Search Bar */}
      <div className="mb-8 flex flex-col justify-between gap-5 border-b border-line pb-6 md:flex-row md:items-end">
        <div>
          <span className="font-mono text-xs uppercase tracking-widest text-accent font-semibold">
            Campus Directory
          </span>
          <h1 className="mt-1.5 text-2xl sm:text-3xl font-bold tracking-tight text-ink font-display">
            Explore Events & Exhibitions
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-ink-soft">
            Autonomous hackathons, engineering workshops, and campus festivals.
          </p>
        </div>

        <div className="relative w-full md:max-w-xs">
          <MagnifyingGlass size={16} className="absolute left-3.5 top-3 text-ink-muted" aria-hidden="true" />
          <input
            value={query}
            onChange={(event) => setParam('search', event.target.value)}
            placeholder="Search events, topics, or clubs..."
            aria-label="Search events"
            className="h-10 w-full rounded-full border border-line bg-card pl-9 pr-4 text-xs font-sans text-ink placeholder:text-ink-muted focus:border-accent focus:outline-none shadow-xs"
          />
        </div>
      </div>

      {/* Mobile Filter Button */}
      <div className="mb-5 flex items-center justify-between lg:hidden">
        <button
          type="button"
          onClick={() => setMobileFilters(true)}
          className="rounded-full border border-line bg-card px-4 py-1.5 text-xs font-medium text-ink shadow-xs"
        >
          Filters ({events.length})
        </button>

        <label className="text-xs text-ink-soft flex items-center gap-1.5">
          <span>Sort:</span>
          <select
            value={sort}
            onChange={(event) => setParam('sort', event.target.value)}
            className="rounded-full border border-line bg-card px-2.5 py-1 text-xs text-ink"
          >
            <option value="date">Soonest</option>
            <option value="title">Title</option>
          </select>
        </label>
      </div>

      <Modal isOpen={mobileFilters} onClose={() => setMobileFilters(false)} title="Event Filters">
        {filterRail}
        <button
          type="button"
          onClick={() => setMobileFilters(false)}
          className="mt-6 w-full rounded-full bg-ink px-4 py-2.5 text-xs font-semibold text-paper"
        >
          Show {events.length} Events
        </button>
      </Modal>

      <div className="grid gap-8 lg:grid-cols-[220px_minmax(0,1fr)]">
        {/* Sticky Sidebar Filter Rail */}
        <aside
          aria-label="Event filters"
          className="hidden self-start rounded-3xl border border-line bg-card p-5 lg:sticky lg:top-24 lg:block shadow-xs"
        >
          {filterRail}
        </aside>

        {/* Event Cards Grid */}
        <div className="min-w-0">
          <div className="mb-4 hidden items-center justify-between gap-3 lg:flex">
            <p className="font-mono text-xs text-ink-muted">
              {isLoading ? 'Scanning campus schedule...' : `${events.length} events scheduled`}
            </p>

            <label className="text-xs text-ink-soft flex items-center gap-2">
              <span className="font-mono">SORT:</span>
              <select
                value={sort}
                onChange={(event) => setParam('sort', event.target.value)}
                className="rounded-full border border-line bg-card px-3 py-1 text-xs text-ink font-mono focus:outline-none focus:border-accent"
              >
                <option value="date">Date (Soonest)</option>
                <option value="title">Title (A-Z)</option>
              </select>
            </label>
          </div>

          {isLoading ? (
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 6 }).map((_, index) => (
                <div key={index} className="h-80 animate-pulse rounded-[24px] bg-surface-subtle" />
              ))}
            </div>
          ) : isError ? (
            <div className="rounded-3xl border border-line bg-card p-10 text-center">
              <h2 className="text-base font-semibold text-ink font-display">Events could not be loaded</h2>
              <button
                type="button"
                onClick={() => refetch()}
                className="mt-3 rounded-full bg-ink px-4 py-2 text-xs font-medium text-paper hover:bg-accent transition-colors"
              >
                Try again
              </button>
            </div>
          ) : events.length ? (
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {events.map((event) => (
                <EventTicketCard key={event.id} event={event} />
              ))}
            </div>
          ) : (
            <div className="rounded-3xl border border-line bg-card p-12 text-center space-y-2">
              <h2 className="text-base font-semibold text-ink font-display">No events match these filters</h2>
              <p className="text-xs text-ink-soft">
                Try selecting a different date pill or clearing category restrictions.
              </p>
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => setParams(new URLSearchParams())}
                  className="rounded-full border border-line bg-card px-4 py-1.5 text-xs font-mono text-accent hover:bg-surface-subtle"
                >
                  Clear all filters
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </PageShell>
  )
}
