import React, { useState, useEffect, useCallback, useRef } from 'react'
import { Link } from 'react-router-dom'
import useEmblaCarousel from 'embla-carousel-react'
import {
  Calendar,
  MapPin,
  Users,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Pause,
  Play,
  CheckCircle2,
  Sparkles,
} from 'lucide-react'
import { Event } from '@/api/contracts'
import { Badge } from '@/design-system/primitives/Badge'
import { Button } from '@/design-system/primitives/Button'
import { cn } from '@/lib/utils'
import { formatCardDate, formatPrice } from '@/design-system/EventCard'
import { PosterArtwork } from '@/design-system/PosterArtwork'

export interface PromoCarouselProps {
  events: Event[]
  className?: string
}

export const PromoCarousel: React.FC<PromoCarouselProps> = ({ events, className }) => {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: true,
    skipSnaps: false,
    duration: 30,
  })

  const [selectedIndex, setSelectedIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(true)
  const [isHovered, setIsHovered] = useState(false)
  const autoplayTimerRef = useRef<NodeJS.Timeout | null>(null)

  const onSelect = useCallback(() => {
    if (!emblaApi) return
    setSelectedIndex(emblaApi.selectedScrollSnap())
  }, [emblaApi])

  useEffect(() => {
    if (!emblaApi) return
    onSelect()
    emblaApi.on('select', onSelect)
    emblaApi.on('reInit', onSelect)
    return () => {
      emblaApi.off('select', onSelect)
      emblaApi.off('reInit', onSelect)
    }
  }, [emblaApi, onSelect])

  // 8s Autoplay with pause-on-hover & touch
  const scrollToNext = useCallback(() => {
    if (emblaApi && emblaApi.canScrollNext()) {
      emblaApi.scrollNext()
    }
  }, [emblaApi])

  useEffect(() => {
    if (!isPlaying || isHovered || !events.length) {
      if (autoplayTimerRef.current) clearInterval(autoplayTimerRef.current)
      return
    }

    autoplayTimerRef.current = setInterval(() => {
      scrollToNext()
    }, 8000)

    return () => {
      if (autoplayTimerRef.current) clearInterval(autoplayTimerRef.current)
    }
  }, [isPlaying, isHovered, events.length, scrollToNext])

  const scrollPrev = () => emblaApi && emblaApi.scrollPrev()
  const scrollNext = () => emblaApi && emblaApi.scrollNext()
  const scrollTo = (index: number) => emblaApi && emblaApi.scrollTo(index)

  if (!events || events.length === 0) {
    return null
  }

  return (
    <section
      aria-label="Promoted Featured Events"
      className={cn(
        'relative w-full text-white overflow-hidden select-none',
        'min-h-[50svh] lg:h-[500px]',
        'pt-20 sm:pt-24 pb-6 sm:pb-8 flex flex-col justify-between border-b border-[#1A2E4C]',
        className
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onTouchStart={() => setIsHovered(true)}
      onTouchEnd={() => setIsHovered(false)}
    >
      {/* Embla Viewport */}
      <div className="overflow-hidden w-full flex-1 flex items-center" ref={emblaRef}>
        <div className="flex w-full h-full">
          {events.map((event, index) => {
            const clubColor = event.club?.color || event.organizerColor || '#2F4BD6'
            const isVerified = event.club?.verified ?? true
            const isFillingFast =
              event.seatsLeft !== undefined && event.seatsLeft > 0 && event.seatsLeft <= 5
            const isFree = event.isFree || event.price === 0 || !event.features?.paid
            const hasPoster = Boolean(event.poster && event.poster.trim().length > 0)
            const dateStr = formatCardDate(event.startsAt)
            const eventHref = `/events/${event.slug || event.id}`

            return (
              <div
                key={event.id}
                className="flex-[0_0_100%] min-w-0 px-4 sm:px-6 lg:px-8 max-w-[1440px] mx-auto flex items-center"
              >
                <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
                  {/* Left Column: Headline & Editorial Info (7 Cols) */}
                  <div className="lg:col-span-7 flex flex-col items-start justify-center space-y-4">
                    {/* Editorial Kicker */}
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="text-xs font-mono text-sky-400 font-semibold tracking-wider">
                        01 // CAMPUS FLAGSHIP SHOWCASE
                      </span>

                      {isFillingFast && (
                        <span className="text-xs font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/30">
                          Filling fast · {event.seatsLeft} spots left
                        </span>
                      )}

                      <span className="text-xs text-slate-400 uppercase tracking-widest font-mono">
                        #{index + 1} OF {events.length}
                      </span>
                    </div>

                    {/* Headline in Modern Bold Tech Display */}
                    <h2 className="font-sans text-3xl sm:text-4xl lg:text-[44px] font-bold leading-[1.08] tracking-tight text-white">
                      <Link
                        to={eventHref}
                        className="hover:text-sky-300 transition-colors focus:outline-none focus-visible:underline"
                      >
                        {event.title}
                      </Link>
                    </h2>

                    {/* Subtitle / Description Snippet */}
                    <p className="text-slate-300 text-[15px] sm:text-[16px] leading-relaxed line-clamp-2 sm:line-clamp-3 max-w-2xl font-normal">
                      {event.subtitle || event.description}
                    </p>

                    {/* Meta Row: Date, Club, Venue */}
                    <div className="flex flex-wrap items-center gap-y-2 gap-x-4 pt-1 text-[13px] text-slate-300">
                      {/* Date */}
                      <div className="flex items-center gap-1.5 font-semibold text-sky-400 uppercase tracking-wider">
                        <Calendar className="w-4 h-4 text-sky-400" />
                        <span>{dateStr}</span>
                      </div>

                      <span className="text-slate-600">·</span>

                      {/* Club attribution */}
                      <div className="flex items-center gap-1.5">
                        <span
                          className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                          style={{ backgroundColor: clubColor }}
                          aria-hidden="true"
                        />
                        <span className="font-medium text-white">
                          {event.club?.name || event.organizerName}
                        </span>
                        {isVerified && (
                          <span title="Verified Club" className="inline-flex items-center text-sky-400">
                            <CheckCircle2 className="w-3.5 h-3.5 text-sky-400" />
                          </span>
                        )}
                      </div>

                      {event.venue?.name && (
                        <>
                          <span className="text-slate-600">·</span>
                          <div className="flex items-center gap-1.5 text-slate-400">
                            <MapPin className="w-3.5 h-3.5 text-sky-400" />
                            <span className="truncate max-w-[180px]">{event.venue.name}</span>
                          </div>
                        </>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-3 pt-2">
                      <Link to={eventHref}>
                        <Button
                          variant="primary"
                          size="md"
                          className="bg-white text-[#08101E] hover:bg-slate-100 px-6 font-semibold shadow-md text-sm rounded-lg"
                          icon={<ArrowRight className="w-4 h-4" />}
                        >
                          View event
                        </Button>
                      </Link>

                      <Link
                        to={eventHref}
                        className="inline-flex items-center h-10 px-5 rounded-lg border border-[#1A2E4C] text-slate-300 hover:text-white hover:border-sky-400 text-sm font-medium transition-colors"
                      >
                        Learn more
                      </Link>
                    </div>
                  </div>

                  {/* Right Column: Event Poster (Unboxed with Corner Registration Ticks) */}
                  <div className="lg:col-span-5 hidden lg:block">
                    <div className="relative group">
                      <span className="absolute -top-2 -left-2 text-sky-400 text-sm font-mono pointer-events-none z-20">┌</span>
                      <span className="absolute -top-2 -right-2 text-sky-400 text-sm font-mono pointer-events-none z-20">┐</span>
                      <span className="absolute -bottom-2 -left-2 text-sky-400 text-sm font-mono pointer-events-none z-20">└</span>
                      <span className="absolute -bottom-2 -right-2 text-sky-400 text-sm font-mono pointer-events-none z-20">┘</span>

                      <Link
                        to={eventHref}
                        className="block relative aspect-[5/4] rounded-lg overflow-hidden border border-[#1A2E4C] group-hover:border-sky-400 transition-colors"
                      >
                        <PosterArtwork
                          id={event.id}
                          title={event.title}
                          category={event.category}
                          clubName={event.club?.name || event.organizerName}
                          clubColor={clubColor}
                          imageUrl={event.poster}
                          dateStr={dateStr}
                          priority={index === 0}
                        />

                        {/* Top Badge overlay */}
                        <div className="absolute top-3 left-3 flex items-center gap-1.5 z-10 font-mono text-xs">
                          <span className="px-2 py-0.5 rounded bg-[#08101E]/90 text-sky-400 border border-[#1A2E4C] font-semibold">
                            PROMOTED
                          </span>
                          {isFree ? (
                            <span className="px-2 py-0.5 rounded bg-emerald-950/90 text-emerald-300 border border-emerald-500/30 font-semibold">
                              FREE
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded bg-[#08101E]/90 text-white border border-[#1A2E4C] font-semibold">
                              {formatPrice(event)}
                            </span>
                          )}
                        </div>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Bottom Controls Strip: Blueprint Step Markers & Navigation */}
      <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 pt-4 flex items-center justify-between border-t border-[#1A2E4C]/60 text-xs font-mono">
        {/* Slide Indicators */}
        <div className="flex items-center gap-3">
          {events.map((_, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => scrollTo(idx)}
              aria-label={`Go to slide ${idx + 1}`}
              className={cn(
                'group flex items-center gap-2 py-1 transition-colors text-xs font-mono',
                selectedIndex === idx
                  ? 'text-sky-400 font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              )}
            >
              <span
                className={cn(
                  'h-0.5 transition-all duration-300',
                  selectedIndex === idx ? 'w-8 bg-sky-400' : 'w-4 bg-[#1A2E4C] group-hover:bg-slate-500'
                )}
              />
              <span>{String(idx + 1).padStart(2, '0')}</span>
            </button>
          ))}
        </div>

        {/* Carousel Navigation Buttons & Autoplay Toggle */}
        <div className="flex items-center gap-2 text-slate-300">
          <button
            type="button"
            onClick={() => setIsPlaying(!isPlaying)}
            aria-label={isPlaying ? 'Pause auto-sliding' : 'Start auto-sliding'}
            className="h-8 px-2.5 bg-[#0D192E] hover:bg-[#1A2E4C] text-slate-300 hover:text-sky-300 flex items-center gap-1.5 transition-colors border border-[#1A2E4C] text-xs font-mono"
          >
            {isPlaying ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
            <span className="hidden sm:inline">{isPlaying ? 'PAUSE' : 'AUTO'}</span>
          </button>

          <button
            type="button"
            onClick={scrollPrev}
            aria-label="Previous event"
            className="w-8 h-8 bg-[#0D192E] hover:bg-[#1A2E4C] text-slate-300 hover:text-sky-300 flex items-center justify-center transition-colors border border-[#1A2E4C]"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={scrollNext}
            aria-label="Next event"
            className="w-8 h-8 bg-[#0D192E] hover:bg-[#1A2E4C] text-slate-300 hover:text-sky-300 flex items-center justify-center transition-colors border border-[#1A2E4C]"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </section>
  )
}
