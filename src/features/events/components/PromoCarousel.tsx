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
        'relative w-full text-[#0A0A0A] overflow-hidden select-none',
        'min-h-[50svh] lg:h-[500px]',
        'pt-20 sm:pt-24 pb-6 sm:pb-8 flex flex-col justify-between border-b border-[#E2E8F0]',
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
            const clubColor = event.club?.color || event.organizerColor || '#0047FF'
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
                      <span className="text-xs font-mono text-[#0047FF] font-bold tracking-wider">
                        01 // CAMPUS FLAGSHIP SHOWCASE
                      </span>

                      {isFillingFast && (
                        <span className="text-xs font-mono px-2 py-0.5 rounded-none bg-amber-500/10 text-amber-700 border border-amber-500/30 font-semibold">
                          Filling fast · {event.seatsLeft} spots left
                        </span>
                      )}

                      <span className="text-xs text-slate-400 uppercase tracking-widest font-mono">
                        #{index + 1} OF {events.length}
                      </span>
                    </div>

                    {/* Headline in Modern Bold Tech Display */}
                    <h2 className="font-sans text-3xl sm:text-4xl lg:text-[44px] font-bold leading-[1.08] tracking-tight text-[#0A0A0A]">
                      <Link
                        to={eventHref}
                        className="hover:text-[#0047FF] transition-colors focus:outline-none focus-visible:underline"
                      >
                        {event.title}
                      </Link>
                    </h2>

                    {/* Subtitle / Description Snippet */}
                    <p className="text-slate-600 text-[15px] sm:text-[16px] leading-relaxed line-clamp-2 sm:line-clamp-3 max-w-2xl font-normal">
                      {event.subtitle || event.description}
                    </p>

                    {/* Meta Row: Date, Club, Venue */}
                    <div className="flex flex-wrap items-center gap-y-2 gap-x-4 pt-1 text-[13px] text-slate-600">
                      {/* Date */}
                      <div className="flex items-center gap-1.5 font-semibold text-[#0047FF] uppercase tracking-wider">
                        <Calendar className="w-4 h-4 text-[#0047FF]" />
                        <span>{dateStr}</span>
                      </div>

                      <span className="text-slate-300">·</span>

                      {/* Club attribution */}
                      <div className="flex items-center gap-1.5">
                        <span
                          className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                          style={{ backgroundColor: clubColor }}
                          aria-hidden="true"
                        />
                        <span className="font-medium text-[#0A0A0A]">
                          {event.club?.name || event.organizerName}
                        </span>
                        {isVerified && (
                          <span title="Verified Club" className="inline-flex items-center text-[#0047FF]">
                            <CheckCircle2 className="w-3.5 h-3.5 text-[#0047FF]" />
                          </span>
                        )}
                      </div>

                      {event.venue?.name && (
                        <>
                          <span className="text-slate-300">·</span>
                          <div className="flex items-center gap-1.5 text-slate-500">
                            <MapPin className="w-3.5 h-3.5 text-[#0047FF]" />
                            <span className="truncate max-w-[180px]">{event.venue.name}</span>
                          </div>
                        </>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-3 pt-2 font-mono">
                      <Link to={eventHref}>
                        <Button
                          variant="primary"
                          size="md"
                          className="bg-[#0047FF] text-white hover:bg-[#0037CC] px-6 font-semibold shadow-sm text-xs rounded-none uppercase tracking-wider"
                          icon={<ArrowRight className="w-4 h-4" />}
                        >
                          View event
                        </Button>
                      </Link>

                      <Link
                        to={eventHref}
                        className="inline-flex items-center h-10 px-5 rounded-none border border-[#E2E8F0] text-[#0A0A0A] hover:text-[#0047FF] hover:border-[#0047FF] text-xs font-semibold uppercase tracking-wider transition-colors"
                      >
                        Learn more
                      </Link>
                    </div>
                  </div>

                  {/* Right Column: Event Poster (Unboxed with Corner Registration Ticks) */}
                  <div className="lg:col-span-5 hidden lg:block">
                    <div className="relative group">
                      <span className="absolute -top-2 -left-2 text-[#0047FF] text-sm font-mono pointer-events-none z-20">┌</span>
                      <span className="absolute -top-2 -right-2 text-[#0047FF] text-sm font-mono pointer-events-none z-20">┐</span>
                      <span className="absolute -bottom-2 -left-2 text-[#0047FF] text-sm font-mono pointer-events-none z-20">└</span>
                      <span className="absolute -bottom-2 -right-2 text-[#0047FF] text-sm font-mono pointer-events-none z-20">┘</span>

                      <Link
                        to={eventHref}
                        className="block relative aspect-[5/4] rounded-none overflow-hidden border border-[#E2E8F0] group-hover:border-[#0047FF] transition-colors"
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
                          <span className="px-2 py-0.5 bg-white/95 text-[#0047FF] border border-[#E2E8F0] font-semibold">
                            PROMOTED
                          </span>
                          {isFree ? (
                            <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-300 font-semibold">
                              FREE
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 bg-white/95 text-[#0A0A0A] border border-[#E2E8F0] font-semibold">
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
      <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 pt-4 flex items-center justify-between border-t border-[#E2E8F0] text-xs font-mono">
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
                  ? 'text-[#0047FF] font-semibold'
                  : 'text-slate-400 hover:text-slate-700'
              )}
            >
              <span
                className={cn(
                  'h-0.5 transition-all duration-300',
                  selectedIndex === idx ? 'w-8 bg-[#0047FF]' : 'w-4 bg-[#E2E8F0] group-hover:bg-slate-400'
                )}
              />
              <span>{String(idx + 1).padStart(2, '0')}</span>
            </button>
          ))}
        </div>

        {/* Carousel Navigation Buttons & Autoplay Toggle */}
        <div className="flex items-center gap-2 text-slate-700">
          <button
            type="button"
            onClick={() => setIsPlaying(!isPlaying)}
            aria-label={isPlaying ? 'Pause auto-sliding' : 'Start auto-sliding'}
            className="h-8 px-2.5 bg-[#F8FAFC] hover:bg-[#EFF4FF] text-slate-700 hover:text-[#0047FF] flex items-center gap-1.5 transition-colors border border-[#E2E8F0] hover:border-[#0047FF] text-xs font-mono"
          >
            {isPlaying ? <Pause className="w-3 h-3 text-[#0047FF]" /> : <Play className="w-3 h-3 text-[#0047FF]" />}
            <span className="hidden sm:inline">{isPlaying ? 'PAUSE' : 'AUTO'}</span>
          </button>

          <button
            type="button"
            onClick={scrollPrev}
            aria-label="Previous event"
            className="w-8 h-8 bg-[#F8FAFC] hover:bg-[#EFF4FF] text-slate-700 hover:text-[#0047FF] flex items-center justify-center transition-colors border border-[#E2E8F0] hover:border-[#0047FF]"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={scrollNext}
            aria-label="Next event"
            className="w-8 h-8 bg-[#F8FAFC] hover:bg-[#EFF4FF] text-slate-700 hover:text-[#0047FF] flex items-center justify-center transition-colors border border-[#E2E8F0] hover:border-[#0047FF]"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </section>
  )
}
