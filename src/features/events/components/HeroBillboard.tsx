import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Search, ChevronLeft, ChevronRight, Calendar, MapPin, ArrowRight } from 'lucide-react'
import { Event } from '@/api'
import { formatDate } from '@/lib/dates'
import { GradientBackdrop } from '@/design-system/GradientBackdrop'
import { Button } from '@/design-system/primitives/Button'

export interface HeroBillboardProps {
  events: Event[]
}

export const HeroBillboard: React.FC<HeroBillboardProps> = ({ events }) => {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [searchQuery, setSearchQuery] = useState('')
  const navigate = useNavigate()

  const featuredEvents = events && events.length > 0 ? events : []
  const currentEvent = featuredEvents[currentIndex]

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? featuredEvents.length - 1 : prev - 1))
  }

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === featuredEvents.length - 1 ? 0 : prev + 1))
  }

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/explore?search=${encodeURIComponent(searchQuery.trim())}`)
    } else {
      navigate('/explore')
    }
  }

  return (
    <section className="relative w-full overflow-hidden border-b border-line">
      {/* Absolutely positioned Coral Dawn Gradient Backdrop (The only gradient on the public site) */}
      <GradientBackdrop speed={15} />

      {/* Hero Container: max height 440px desktop, auto on mobile */}
      <div className="app-container relative z-10 py-6 sm:py-8 lg:py-10 max-h-[440px] flex items-center">
        <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center">
          {/* Left Column: Solid card surface so small body text is NEVER directly on gradient */}
          <div className="lg:col-span-7 bg-surface/95 border border-line rounded-panel p-6 sm:p-7">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-semibold text-text tracking-tight leading-tight mb-2">
              Discover curated tech events & collectives.
            </h1>

            <p className="text-small text-text-2 mb-5 max-w-xl">
              Connect with collegiate clubs, participate in flagship hackathons, and attend verified technical masterclasses.
            </p>

            {/* Search and Primary Action */}
            <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-2.5">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-text-3" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by keyword, club, or skill..."
                  className="w-full h-12 pl-10 pr-3.5 rounded-[10px] bg-subtle border border-line text-small text-text placeholder:text-text-3 focus:outline-none focus:ring-2 focus:ring-accent"
                />
              </div>

              <Button type="submit" variant="primary" size="default" className="flex-shrink-0">
                Explore events
              </Button>
            </form>
          </div>

          {/* Right Column: Featured Event Flat Carousel on Solid Surface */}
          {currentEvent && (
            <div className="lg:col-span-5 hidden sm:block">
              <div className="bg-surface border border-line rounded-panel p-4 flex flex-col gap-3">
                {/* Flat Event Card Preview */}
                <div className="relative aspect-[16/10] w-full rounded-[10px] overflow-hidden bg-subtle border border-line">
                  {/* 4px Club Top Edge */}
                  <div
                    className="absolute top-0 left-0 right-0 h-1 z-10"
                    style={{ backgroundColor: currentEvent.organizerColor || '#C93E27' }}
                    aria-hidden="true"
                  />
                  <img
                    src={
                      currentEvent.banner ||
                      currentEvent.poster ||
                      'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=800&q=80'
                    }
                    alt={currentEvent.title}
                    className="h-full w-full object-cover"
                  />

                  <div className="absolute bottom-2 right-2">
                    <span className="px-2 py-0.5 rounded-full text-caption font-semibold bg-surface text-text border border-line">
                      {currentEvent.isFree ? 'Free' : `₹${currentEvent.price || 0}`}
                    </span>
                  </div>
                </div>

                {/* Event Meta */}
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center gap-2 text-caption text-text-2">
                    {/* 10px Club Dot */}
                    <span
                      className="h-2.5 w-2.5 rounded-full flex-shrink-0"
                      style={{ backgroundColor: currentEvent.organizerColor || '#C93E27' }}
                      aria-hidden="true"
                    />
                    <span className="font-medium truncate">{currentEvent.organizerName}</span>
                    <span className="text-line">·</span>
                    <span className="truncate">{formatDate(currentEvent.startsAt, 'MMM d, h:mm a')}</span>
                  </div>

                  <Link
                    to={`/events/${currentEvent.slug}`}
                    className="font-semibold text-small sm:text-base text-text hover:underline line-clamp-1"
                  >
                    {currentEvent.title}
                  </Link>

                  <div className="flex items-center justify-between pt-2 border-t border-line/60">
                    <span className="text-caption text-text-3 truncate max-w-[160px]">
                      {currentEvent.venue?.name || 'In-person live session'}
                    </span>

                    <Link to={`/events/${currentEvent.slug}/register`}>
                      <Button variant="primary" size="compact">
                        Register
                      </Button>
                    </Link>
                  </div>
                </div>

                {/* Flat Carousel Controls: Dots & Arrows */}
                {featuredEvents.length > 1 && (
                  <div className="flex items-center justify-between pt-1 border-t border-line/40">
                    <div className="flex items-center gap-1.5" role="tablist" aria-label="Featured slides">
                      {featuredEvents.map((_, idx) => (
                        <button
                          key={idx}
                          role="tab"
                          aria-selected={idx === currentIndex}
                          onClick={() => setCurrentIndex(idx)}
                          className={`h-2 rounded-full transition-all ${
                            idx === currentIndex ? 'w-5 bg-accent' : 'w-2 bg-line hover:bg-text-3'
                          }`}
                          aria-label={`Slide ${idx + 1}`}
                        />
                      ))}
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={handlePrev}
                        className="p-1 rounded-[6px] border border-line text-text-2 hover:text-text hover:bg-subtle transition-colors"
                        aria-label="Previous slide"
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={handleNext}
                        className="p-1 rounded-[6px] border border-line text-text-2 hover:text-text hover:bg-subtle transition-colors"
                        aria-label="Next slide"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
