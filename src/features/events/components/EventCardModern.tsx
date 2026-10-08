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
      className="group relative flex flex-col neo-card overflow-hidden select-none"
    >
      {/* Top Media Container */}
      <div className="relative aspect-[16/10] w-[calc(100%-16px)] m-2 rounded-2xl overflow-hidden bg-slate-200/60 shadow-neo-inset">
        <img
          src={fallbackCover}
          alt={event.title}
          className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
          loading="lazy"
        />

        {/* Gradient Shadow Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-black/10" />

        {/* Tactile Date Stamp Ribbon (Top Left) */}
        <div className="absolute top-2.5 left-2.5 rounded-xl neo-pill px-2.5 py-1 text-center bg-[#EEF2F6]/95 backdrop-blur-md">
          <span className="block text-[10px] font-black tracking-wider text-indigo-600 leading-none">
            {monthStr}
          </span>
          <span className="block text-base font-black text-slate-900 leading-tight">
            {dayStr}
          </span>
        </div>

        {/* Category Tag (Top Right) */}
        <div className="absolute top-2.5 right-2.5">
          <span className="neo-pill inline-flex items-center gap-1 px-2.5 py-1 text-[10px] font-bold tracking-normal text-slate-800 bg-[#EEF2F6]/90 backdrop-blur-md">
            {event.category}
          </span>
        </div>

        {/* Fast Filling Badge (Bottom Left) */}
        {isFastFilling && (
          <div className="absolute bottom-2.5 left-2.5">
            <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold text-white bg-gradient-to-r from-amber-500 to-rose-500 shadow-neo-sm">
              ⚡ Filling Fast
            </span>
          </div>
        )}

        {/* Free Pass Tag (Bottom Right) */}
        <div className="absolute bottom-2.5 right-2.5">
          <span className="rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-[10px] font-bold uppercase px-2.5 py-0.5 shadow-neo-sm">
            {event.isFree ? 'Free Pass' : `₹${event.price || 0}`}
          </span>
        </div>
      </div>

      {/* Card Body */}
      <div className="flex flex-col flex-1 p-4 sm:p-5">
        {/* Organizer & Verification */}
        <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
          <div className="flex items-center gap-1.5 font-medium">
            <span
              className="h-2.5 w-2.5 rounded-full flex-shrink-0 shadow-xs"
              style={{ backgroundColor: accentColor }}
            />
            <span className="truncate max-w-[150px] font-bold text-slate-700">
              {event.organizerName}
            </span>
          </div>

          <span className="neo-inset px-2 py-0.5 rounded-full text-[10px] font-bold text-indigo-600">
            Verified Host
          </span>
        </div>

        {/* Title */}
        <Link to={`/events/${event.slug}`} className="group-hover:text-indigo-600 transition-colors">
          <h3 className="font-display font-extrabold text-base sm:text-lg text-slate-900 line-clamp-2 leading-snug mb-2">
            {event.title}
          </h3>
        </Link>

        {/* Location & Time */}
        <div className="flex items-center gap-3 text-xs text-slate-500 mb-4 font-medium">
          <div className="flex items-center gap-1 truncate">
            <MapPin className="h-3.5 w-3.5 text-indigo-500 flex-shrink-0" />
            <span className="truncate">{event.venue.name}</span>
          </div>
          <div className="flex items-center gap-1 flex-shrink-0">
            <Clock className="h-3.5 w-3.5 text-slate-400" />
            <span>{formatTime(event.startsAt)}</span>
          </div>
        </div>

        {/* Capacity Progress Bar */}
        <div className="mt-auto pt-3 border-t border-slate-300/40">
          <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1.5 font-semibold">
            <span className="flex items-center gap-1">
              <Users className="h-3 w-3 text-slate-400" />
              <span>{registeredCount} Registered</span>
            </span>
            <span className={isFastFilling ? 'text-amber-600 font-bold' : 'text-slate-600'}>
              {spotsPercent}% booked
            </span>
          </div>

          <div className="neo-inset h-2 w-full rounded-full overflow-hidden p-[1px]">
            <div
              className="h-full rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 transition-all duration-500"
              style={{ width: `${spotsPercent}%` }}
            />
          </div>

          {/* Action Row */}
          <div className="mt-4 flex items-center gap-2.5">
            <Link to={`/events/${event.slug}`} className="flex-1">
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
