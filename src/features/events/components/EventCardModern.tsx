import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Calendar,
  MapPin,
  Users,
  Award,
  Sparkles,
  ArrowRight,
  Clock,
  Star,
  Ticket,
} from 'lucide-react'
import { Event } from '@/api'
import { formatDate, formatTime } from '@/lib/dates'
import { Button } from '@/design-system/primitives/Button'

export interface EventCardModernProps {
  event: Event
  rankNumber?: number // For Netflix Top 10 Shelf
  layout?: 'standard' | 'compact' | 'widescreen'
}

export const EventCardModern: React.FC<EventCardModernProps> = ({
  event,
  rankNumber,
  layout = 'standard',
}) => {
  const [isHovered, setIsHovered] = useState(false)

  const fallbackCover =
    event.banner ||
    event.poster ||
    'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=800&q=80'

  const accentColor = event.organizerColor || '#2563EB'
  const registeredCount = event.capacity - event.seatsLeft
  const spotsPercent = Math.min(
    100,
    Math.round((registeredCount / (event.capacity || 100)) * 100)
  )

  const isFastFilling = spotsPercent >= 75

  // Date parsing for month badge
  const eventDate = new Date(event.startsAt)
  const monthStr = eventDate.toLocaleString('en-US', { month: 'short' }).toUpperCase()
  const dayStr = eventDate.getDate()

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group relative flex flex-col rounded-2xl bg-white border border-[#DADCE0] shadow-subtle hover:shadow-card-hover transition-all duration-300 overflow-hidden hover:-translate-y-1"
    >
      {/* Top Media Container */}
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-slate-100">
        <img
          src={fallbackCover}
          alt={event.title}
          className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
          loading="lazy"
        />

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-black/10" />

        {/* M3 Date Stamp Ribbon (Top Left) */}
        <div className="absolute top-3 left-3 rounded-xl bg-white/95 backdrop-blur-md px-2.5 py-1 text-center shadow-xs border border-[#DADCE0]">
          <span className="block text-[10px] font-bold tracking-wider text-md-primary leading-none">
            {monthStr}
          </span>
          <span className="block text-base font-extrabold text-slate-900 leading-tight">
            {dayStr}
          </span>
        </div>

        {/* Category Tag (Top Right) */}
        <div className="absolute top-3 right-3">
          <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-semibold tracking-normal text-slate-800 backdrop-blur-md bg-white/90 border border-[#DADCE0] shadow-2xs">
            {event.category}
          </span>
        </div>

        {/* Fast Filling Badge (Bottom Left of Media) */}
        {isFastFilling && (
          <div className="absolute bottom-2.5 left-3">
            <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold text-[#B06000] bg-[#FEF7E0] border border-[#FEEFC3] shadow-2xs">
              ⚡ Filling Fast
            </span>
          </div>
        )}

        {/* Free Pass Tag (Bottom Right of Media) */}
        <div className="absolute bottom-2.5 right-3">
          <span className="rounded-md bg-[#E6F4EA] text-[#137333] border border-[#CEEAD6] text-[10px] font-bold uppercase px-2 py-0.5 shadow-2xs">
            Free Pass
          </span>
        </div>
      </div>

      {/* Card Body */}
      <div className="flex flex-col flex-1 p-4 sm:p-5">
        {/* Organizer & Verification */}
        <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
          <div className="flex items-center gap-1.5 font-medium">
            <span
              className="h-2 w-2 rounded-full flex-shrink-0"
              style={{ backgroundColor: accentColor }}
            />
            <span className="truncate max-w-[150px] font-semibold text-slate-700">
              {event.organizerName}
            </span>
          </div>

          {event.certificateInfo && (
            <span className="flex items-center gap-1 text-[11px] font-medium text-[#137333] bg-[#E6F4EA] border border-[#CEEAD6] px-2 py-0.5 rounded-full">
              <Award className="h-3 w-3" />
              Certificate
            </span>
          )}
        </div>

        {/* Title */}
        <Link to={`/events/${event.slug}`} className="group-hover:text-md-primary transition-colors">
          <h3 className="font-display font-bold text-base sm:text-lg text-slate-900 line-clamp-2 leading-snug mb-2">
            {event.title}
          </h3>
        </Link>

        {/* Location & Time */}
        <div className="flex items-center gap-3 text-xs text-slate-500 mb-4">
          <div className="flex items-center gap-1 truncate">
            <MapPin className="h-3.5 w-3.5 text-slate-400 flex-shrink-0" />
            <span className="truncate">{event.venue.name}</span>
          </div>
          <div className="flex items-center gap-1 flex-shrink-0">
            <Clock className="h-3.5 w-3.5 text-slate-400" />
            <span>{formatTime(event.startsAt)}</span>
          </div>
        </div>

        {/* Capacity Progress Bar */}
        <div className="mt-auto pt-3 border-t border-slate-100">
          <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1.5 font-medium">
            <span className="flex items-center gap-1">
              <Users className="h-3 w-3 text-slate-400" />
              <span>{registeredCount} Registered</span>
            </span>
            <span className={isFastFilling ? 'text-amber-700 font-bold' : 'text-slate-600'}>
              {spotsPercent}% booked
            </span>
          </div>

          <div className="h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                isFastFilling ? 'bg-amber-500' : 'bg-md-primary'
              }`}
              style={{ width: `${spotsPercent}%` }}
            />
          </div>

          {/* Action Row */}
          <div className="mt-3.5 flex items-center gap-2">
            <Link to={`/events/${event.slug}/register`} className="flex-1">
              <Button variant="primary" size="sm" fullWidth arrow>
                Book Pass
              </Button>
            </Link>

            <Link to={`/events/${event.slug}`}>
              <Button variant="secondary" size="sm">
                Details
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
