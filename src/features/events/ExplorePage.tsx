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
      <fieldset><legend className="mb-2 text-sm font-semibold text-ink">When</legend><div className="flex flex-wrap gap-2">{dates.map((item) => <button key={item.value} type="button" onClick={() => setParam('date', item.value)} aria-pressed={date === item.value} className={cn('rounded-lg border px-3 py-2 text-xs', date === item.value ? 'border-accent bg-accent text-on-accent' : 'border-line bg-card text-ink-soft hover:border-line-strong')}>{item.label}</button>)}</div></fieldset>
      <fieldset><legend className="mb-2 text-sm font-semibold text-ink">Category</legend><div className="space-y-1">{categories.map((item) => <button key={item.value} type="button" onClick={() => setParam('category', item.value)} aria-pressed={category === item.value} className={cn('block w-full rounded-lg px-3 py-2 text-left text-sm', category === item.value ? 'bg-accent-soft font-semibold text-accent' : 'text-ink-soft hover:bg-surface-subtle')}>{item.label}</button>)}</div></fieldset>
      {campuses.length > 0 && <label className="block text-sm font-semibold text-ink">Campus<select value={campus} onChange={(event) => setParam('institution', event.target.value)} className="mt-2 w-full rounded-lg border border-line bg-card px-3 py-2 text-sm text-ink"><option value="ALL">All campuses</option>{campuses.map((item) => <option key={item.slug} value={item.slug}>{item.name}</option>)}</select></label>}
      {clubs.length > 0 && <label className="block text-sm font-semibold text-ink">Club<select value={club} onChange={(event) => setParam('club', event.target.value)} className="mt-2 w-full rounded-lg border border-line bg-card px-3 py-2 text-sm text-ink"><option value="ALL">All clubs</option>{clubs.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>}
      <label className="flex items-center gap-2 text-sm text-ink"><input type="checkbox" checked={free} onChange={(event) => setParam('free', event.target.checked ? 'true' : '')} className="accent-accent" />Free events only</label>
      <button type="button" onClick={() => setParams(new URLSearchParams())} className="text-sm font-medium text-accent hover:underline">Clear filters</button>
    </div>
  )

  return (
    <PageShell className="py-8 sm:py-12">
      <div className="mb-8 flex flex-col justify-between gap-5 border-b border-line pb-6 md:flex-row md:items-end">
        <div><p className="font-mono text-xs uppercase tracking-widest text-accent">Event index</p><h1 className="mt-2 text-3xl font-semibold text-ink sm:text-4xl">Explore events</h1><p className="mt-2 text-sm text-ink-soft">Find an event by date, club, category, or campus.</p></div>
        <div className="relative w-full md:max-w-sm"><MagnifyingGlass size={17} className="absolute left-3 top-3 text-ink-muted" aria-hidden="true" /><input value={query} onChange={(event) => setParam('search', event.target.value)} placeholder="Search events" aria-label="Search events" className="h-11 w-full rounded-lg border border-line bg-card pl-10 pr-3 text-sm text-ink" /></div>
      </div>
      <button type="button" onClick={() => setMobileFilters(true)} className="mb-5 rounded-lg border border-line bg-card px-4 py-2 text-sm font-medium text-ink lg:hidden">Filters</button>
      <Modal isOpen={mobileFilters} onClose={() => setMobileFilters(false)} title="Event filters">
        {filterRail}
        <button type="button" onClick={() => setMobileFilters(false)} className="mt-6 w-full rounded-input bg-accent px-4 py-3 font-medium text-on-accent">Show {events.length} events</button>
      </Modal>
      <div className="grid gap-8 lg:grid-cols-[240px_minmax(0,1fr)]">
        <aside aria-label="Event filters" className="hidden self-start rounded-panel border border-line bg-card p-5 lg:sticky lg:top-24 lg:block">{filterRail}</aside>
        <div className="min-w-0">
          <div className="mb-5 flex items-center justify-between gap-3"><p className="font-mono text-xs text-ink-muted">{isLoading ? 'Loading events' : events.length + ' events'}</p><label className="text-xs text-ink-soft">Sort <select value={sort} onChange={(event) => setParam('sort', event.target.value)} className="ml-2 rounded-lg border border-line bg-card px-2 py-1.5 text-ink"><option value="date">Soonest</option><option value="title">Title</option></select></label></div>
          {isLoading ? <div className="grid gap-5 sm:grid-cols-2">{Array.from({ length: 4 }).map((_, index) => <div key={index} className="h-72 animate-pulse rounded-panel bg-surface-subtle" />)}</div> :
            isError ? <div className="rounded-panel border border-line bg-card p-10 text-center"><h2 className="text-lg font-semibold text-ink">Events could not be loaded</h2><button type="button" onClick={() => refetch()} className="mt-3 rounded-full bg-accent px-4 py-2 text-sm font-medium text-on-accent">Try again</button></div> :
            events.length ? <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">{events.map((event) => <EventTicketCard key={event.id} event={event} />)}</div> :
            <div className="rounded-panel border border-line bg-card p-10 text-center"><h2 className="text-lg font-semibold text-ink">No events match these filters</h2><p className="mt-2 text-sm text-ink-soft">Try another date or category.</p></div>}
        </div>
      </div>
    </PageShell>
  )
}
