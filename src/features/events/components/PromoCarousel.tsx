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
        'relative w-full bg-champion text-white overflow-hidden select-none',
        'min-h-[50svh] lg:h-[520px] lg:max-h-[520px]',
        'pt-20 sm:pt-22 pb-6 sm:pb-8 flex flex-col justify-between',
        className
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onTouchStart={() => setIsHovered(true)}
      onTouchEnd={() => setIsHovered(false)}
    >
      {/* Background Subtle Mesh Gradient Pattern (pure flat, no glassmorphism) */}
      <div
        className="absolute inset-0 pointer-events-none opacity-40 mix-blend-screen"
        style={{
          background:
            'radial-gradient(ellipse 60% 50% at 80% 20%, rgba(123, 99, 168, 0.4) 0%, transparent 70%), radial-gradient(ellipse 40% 40% at 10% 90%, rgba(47, 75, 214, 0.25) 0%, transparent 60%)',
        }}
        aria-hidden="true"
      />

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
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[13px] font-semibold bg-lavender/15 text-lavender border border-lavender/30">
                        <Sparkles className="w-3.5 h-3.5 text-lavender" />
                        <span>FLAGSHIP SHOWCASE</span>
                      </span>

                      {isFillingFast && (
                        <Badge variant="filling" className="text-[13px]">
                          Filling fast · {event.seatsLeft} spots left
                        </Badge>
                      )}

                      <span className="text-[13px] text-white/60 uppercase tracking-widest font-mono">
                        #{index + 1} of {events.length}
                      </span>
                    </div>

                    {/* Headline in Instrument Serif */}
                    <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-normal leading-[1.08] tracking-tight text-white">
                      <Link
                        to={eventHref}
                        className="hover:text-lavender transition-colors focus:outline-none focus-visible:underline"
                      >
                        {event.title}
                      </Link>
                    </h2>

                    {/* Subtitle / Description Snippet */}
                    <p className="text-white/80 text-[15px] sm:text-[16px] leading-relaxed line-clamp-2 sm:line-clamp-3 max-w-2xl font-normal">
                      {event.subtitle || event.description}
                    </p>

                    {/* Meta Row: Date, Club, Venue */}
                    <div className="flex flex-wrap items-center gap-y-2 gap-x-4 pt-1 text-[13px] text-white/90">
                      {/* Date */}
                      <div className="flex items-center gap-1.5 font-semibold text-lavender uppercase tracking-wider">
                        <Calendar className="w-4 h-4 text-lavender" />
                        <span>{dateStr}</span>
                      </div>

                      <span className="text-white/40">·</span>

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
                          <span title="Verified Club" className="inline-flex items-center text-[#1FA34A]">
                            <CheckCircle2 className="w-3.5 h-3.5 fill-[#1FA34A] text-white" />
                          </span>
                        )}
                      </div>

                      {event.venue?.name && (
                        <>
                          <span className="text-white/40">·</span>
                          <div className="flex items-center gap-1 text-white/70">
                            <MapPin className="w-3.5 h-3.5" />
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
                          className="bg-white text-champion hover:bg-white/90 px-6 font-semibold shadow-card text-[14px]"
                          icon={<ArrowRight className="w-4 h-4" />}
                        >
                          View event
                        </Button>
                      </Link>

                      <Link
                        to={eventHref}
                        className="inline-flex items-center h-10 px-5 rounded-full border border-white/20 text-white/90 hover:text-white hover:bg-white/10 text-[14px] font-medium transition-colors"
                      >
                        Learn more
                      </Link>
                    </div>
                  </div>

                  {/* Right Column: Event Poster (5 Cols) */}
                  <div className="lg:col-span-5 hidden lg:block">
                    <Link
                      to={eventHref}
                      className="group relative block rounded-[28px] p-2.5 bg-white/5 border border-white/15 transition-transform duration-300 hover:scale-[1.01]"
                    >
                      <div className="relative aspect-[5/4] rounded-[22px] overflow-hidden bg-white/10">
                        {hasPoster ? (
                          <img
                            src={event.poster}
                            alt={event.title}
                            loading={index === 0 ? 'eager' : 'lazy'}
                            className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
                          />
                        ) : (
                          <div
                            className="w-full h-full p-6 flex flex-col justify-between"
                            style={{
                              background: `linear-gradient(135deg, ${clubColor}30 0%, #151130 100%)`,
                            }}
                          >
                            <span className="text-[13px] font-semibold uppercase tracking-wider text-white/70">
                              {event.category}
                            </span>
                            <span className="font-serif italic text-2xl leading-tight text-white line-clamp-3">
                              {event.title}
                            </span>
                            <span className="text-[13px] text-white/60">{dateStr}</span>
                          </div>
                        )}

                        {/* Top Badge overlay */}
                        <div className="absolute top-3 left-3 flex items-center gap-1.5 z-10">
                          <Badge variant="promoted">Promoted</Badge>
                          {isFree ? (
                            <Badge variant="free">Free</Badge>
                          ) : (
                            <Badge variant="outline" className="bg-white/90 text-ink border-transparent">
                              {formatPrice(event)}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </Link>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Bottom Controls Strip: Dots, Counter, Navigation & Play/Pause */}
      <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 pt-4 flex items-center justify-between">
        {/* Slide Indicators */}
        <div className="flex items-center gap-2">
          {events.map((_, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => scrollTo(idx)}
              aria-label={`Go to slide ${idx + 1}`}
              className={cn(
                'h-2 rounded-full transition-all duration-300',
                selectedIndex === idx
                  ? 'w-8 bg-white'
                  : 'w-2 bg-white/30 hover:bg-white/50'
              )}
            />
          ))}
        </div>

        {/* Carousel Navigation Buttons & Autoplay Toggle */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsPlaying(!isPlaying)}
            aria-label={isPlaying ? 'Pause auto-sliding' : 'Start auto-sliding'}
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors border border-white/10"
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 ml-0.5" />}
          </button>

          <button
            type="button"
            onClick={scrollPrev}
            aria-label="Previous event"
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors border border-white/10"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={scrollNext}
            aria-label="Next event"
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors border border-white/10"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </section>
  )
}
