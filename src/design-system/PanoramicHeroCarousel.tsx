import React, { useMemo, useState } from 'react'
import { CaretLeft, CaretRight, CalendarBlank, MapPin, ArrowRight } from '@/design-system/Icon'
import { Event } from '@/api/contracts/event'
import { formatDate, formatTime } from '@/lib/format'
import { EventLink } from './EventLink'
import { PosterArt } from './visuals/PosterArt'

export interface PanoramicHeroCarouselProps {
  events?: Event[]
  className?: string
}

/** Featured discovery: deliberate navigation, factual metadata, no registration side effects. */
export const PanoramicHeroCarousel: React.FC<PanoramicHeroCarouselProps> = ({ events = [], className = '' }) => {
  const slides = useMemo(() => {
    const featured = events.filter((event) => event.isSignature || event.promotion?.label || event.banner || event.poster)
    return (featured.length ? featured : events).slice(0, 6)
  }, [events])
  const [activeIndex, setActiveIndex] = useState(0)
  if (!slides.length) return null
  const index = activeIndex % slides.length
  const event = slides[index]
  const move = (delta: number) => setActiveIndex((index + delta + slides.length) % slides.length)

  return (
    <section aria-roledescription="carousel" aria-label="Featured events" className={`border-b border-line bg-paper ${className}`}>
      <div className="mx-auto max-w-container px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-4 flex items-center justify-between gap-4">
          <p className="text-sm font-medium text-ink-soft">Featured events</p>
          {slides.length > 1 && <div className="flex items-center gap-2">
            <span className="mr-1 text-xs tabular-nums text-ink-muted">{index + 1} of {slides.length}</span>
            <button type="button" onClick={() => move(-1)} aria-label="Previous featured event" className="grid h-11 w-11 place-items-center rounded-input border border-line bg-card text-ink hover:bg-surface-subtle"><CaretLeft size={18} /></button>
            <button type="button" onClick={() => move(1)} aria-label="Next featured event" className="grid h-11 w-11 place-items-center rounded-input border border-line bg-card text-ink hover:bg-surface-subtle"><CaretRight size={18} /></button>
          </div>}
        </div>
        <div className="grid min-w-0 overflow-hidden rounded-panel border border-line bg-card md:grid-cols-2">
          <div className="aspect-[16/9] min-w-0 overflow-hidden bg-surface-subtle md:aspect-auto md:min-h-64">
            {event.banner || event.poster
              ? <img src={event.banner || event.poster} alt="" className="h-full max-h-80 w-full object-cover" />
              : <PosterArt eventId={event.id} title={event.title} category={event.category} clubId={event.organizerId} />}
          </div>
          <div className="flex min-w-0 flex-col items-start p-5 sm:p-7" aria-live="polite" aria-atomic="true">
            <p className="text-xs font-medium text-accent">{event.club?.name || event.organizerName || event.category}</p>
            <h1 className="mt-2 break-words text-2xl font-semibold leading-tight text-ink sm:text-3xl">{event.title}</h1>
            <div className="mt-4 space-y-2 text-sm text-ink-soft">
              <p className="flex items-start gap-2"><CalendarBlank size={18} className="shrink-0" aria-hidden="true" /><span>{event.startsAt ? `${formatDate(event.startsAt)} · ${formatTime(event.startsAt)}` : 'Date to be announced'}</span></p>
              <p className="flex items-start gap-2"><MapPin size={18} className="shrink-0" aria-hidden="true" /><span>{event.venue?.name || (event.isOnline ? 'Online' : 'Venue to be announced')}</span></p>
            </div>
            {event.kind === 'imported' && <p className="mt-3 text-xs text-ink-muted">Booking through {event.provider || 'the event provider'}</p>}
            <EventLink event={event} className="mt-5 inline-flex min-h-11 items-center justify-center gap-2 rounded-input bg-accent px-5 py-2 text-sm font-medium text-on-accent hover:bg-accent-hover">
              View event <ArrowRight size={16} aria-hidden="true" />
            </EventLink>
          </div>
        </div>
      </div>
    </section>
  )
}
