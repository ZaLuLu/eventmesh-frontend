import { EventLink } from './EventLink'
import { eventPriceLabel } from '@/lib/eventPresentation'
import React from 'react'
import { Link } from 'react-router-dom'
import { BookmarkSimple, CheckCircle, MapPin } from '@/design-system/Icon'
import { Event } from '@/api'
import { formatDate, formatTime } from '@/lib/format'
import { cn } from '@/lib/utils'
import { PosterArt } from './visuals/PosterArt'

export interface EventTicketCardProps {
  event: Event
  onBookmark?: (eventId: string) => void
  isBookmarked?: boolean
  className?: string
}

export const EventTicketCard: React.FC<EventTicketCardProps> = ({ event, onBookmark, isBookmarked = false, className = '' }) => {
  const host = event.club?.name || event.organizerName || 'Organizer'
  const soldOut = event.seatsLeft === 0
  const price = eventPriceLabel(event)
  return (
    <article className={cn('group flex min-w-0 flex-col rounded-panel border border-line bg-card p-3 transition-colors hover:border-line-strong', className)}>
      <div className="relative aspect-[16/10] overflow-hidden rounded-poster bg-surface-subtle">
        {event.poster ? <img src={event.poster} alt={event.title} loading="lazy" className="h-full w-full object-cover" /> : <PosterArt eventId={event.id} title={event.title} category={event.category} clubId={event.organizerId} />}
        <span className="absolute left-3 top-3 rounded-full bg-card px-2.5 py-1 font-mono text-[10px] uppercase text-ink">{event.category || 'Event'}</span>
        {onBookmark && <button type="button" onClick={() => onBookmark(event.id)} aria-label={isBookmarked ? 'Remove bookmark' : 'Bookmark event'} className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full bg-card text-ink hover:text-accent"><BookmarkSimple size={17} weight={isBookmarked ? 'fill' : 'regular'} /></button>}
      </div>
      <div className="flex flex-1 flex-col px-1 pb-1 pt-4">
        <div className="flex min-w-0 items-center gap-1.5 text-xs text-ink-soft"><span className="truncate">{host}</span>{event.club?.verified && <CheckCircle size={14} weight="fill" className="shrink-0 text-success" aria-label="Verified organizer" />}</div>
        <h3 className="mt-1 line-clamp-2 text-lg font-semibold leading-snug text-ink"><EventLink event={event} className="hover:text-accent">{event.title}</EventLink></h3>
        {event.kind === 'imported' && <p className="mt-1 text-xs text-ink-soft">On {event.provider || 'event provider'}</p>}
        {event.subtitle && <p className="mt-1 line-clamp-2 text-sm text-ink-soft">{event.subtitle}</p>}
        <div className="mt-auto flex items-end justify-between gap-2 border-t border-line pt-3 text-xs">
          <div className="min-w-0 space-y-1 font-mono text-ink-soft"><p>{formatDate(event.startsAt)} · {formatTime(event.startsAt)}</p><p className="flex items-center gap-1 truncate"><MapPin size={12} aria-hidden="true" />{event.venue?.name || 'Venue to be announced'}</p><p className="text-ink">{soldOut ? 'Sold out' : event.seatsLeft != null && event.seatsLeft <= 14 ? event.seatsLeft + ' passes left' : price}</p></div>
          <EventLink event={event} className="shrink-0 rounded-input bg-ink px-3 py-2 font-semibold text-paper hover:bg-accent hover:text-on-accent active:scale-[0.98]">{event.kind === 'imported' ? 'View event' : 'Details'}</EventLink>
        </div>
      </div>
    </article>
  )
}
