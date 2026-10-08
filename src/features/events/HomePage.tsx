import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  ArrowRight,
  Search,
  ArrowUpRight,
  Sparkles,
  Calendar,
  Building2,
  Award,
  Users,
} from 'lucide-react'
import { useEvents, useUpcomingRail, useFeaturedEvents } from '@/hooks/useEvents'
import { useClubs } from '@/hooks/useClubs'
import { useAnnouncements } from '@/hooks/useAnnouncements'
import { useOrg } from '@/hooks/useOrg'
import { Button } from '@/design-system/primitives/Button'
import { Band } from '@/design-system/primitives/Band'
import { IndexRow } from '@/design-system/primitives/IndexRow'
import { EventTheme } from '@/design-system/EventTheme'
import { formatDate, formatTime } from '@/lib/dates'
import { formatNumber } from '@/lib/format'
import { BRAND_CONFIG } from '@/config/brand'

export const HomePage: React.FC = () => {
  const navigate = useNavigate()
  const { data: upcoming = [] } = useUpcomingRail()
  const { data: featured = [] } = useFeaturedEvents()
  const { data: clubs = [] } = useClubs()
  const { data: announcements = [] } = useAnnouncements()
  const { organization } = useOrg()

  const [searchQuery, setSearchQuery] = useState('')
  const [activeCycleIndex, setActiveCycleIndex] = useState(0)

  // Cycle the identity band every 4.5 seconds across featured events or clubs
  useEffect(() => {
    if (featured.length === 0) return
    const interval = setInterval(() => {
      setActiveCycleIndex((prev) => (prev + 1) % featured.length)
    }, 4500)
    return () => clearInterval(interval)
  }, [featured.length])

  const activeShowcase = featured[activeCycleIndex] || featured[0]

  const handleHeroSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/explore?search=${encodeURIComponent(searchQuery.trim())}`)
    }
  }

  return (
    <div className="w-full flex flex-col bg-paper text-ink">
      {/* ==============================================================
          1. HERO SECTION: Giant Statement Type & Identity Band
          ============================================================== */}
      <section className="relative pt-8 sm:pt-16 pb-0 border-b border-ink-15 overflow-hidden">
        {/* Curatorial Header Micro-Row */}
        <div className="px-[4vw] flex items-center justify-between pb-6 sm:pb-8 border-b border-ink-15/60 text-ink-60 font-mono text-[10px] sm:text-[11px] uppercase tracking-widecaps">
          <span>CURATED AUTUMN EXHIBITION 2026</span>
          <span className="hidden sm:inline">NINE AUTONOMOUS TECHNICAL COLLECTIVES</span>
          <span>CURATORIAL ARCHIVE</span>
        </div>

        {/* Giant Hero Headline */}
        <div className="px-[4vw] py-8 sm:py-14">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          >
            <h1 className="font-display text-[14vw] sm:text-[16vw] lg:text-[17.5vw] leading-[0.84] tracking-editorial text-ink uppercase select-none">
              THE PLATFORM <br />
              <span className="inline-block hover:opacity-85 transition-opacity">
                IS A GALLERY.
              </span>
            </h1>
          </motion.div>
        </div>

        {/* Hero Interactive Search Field */}
        <div className="px-[4vw] max-w-4xl pb-10">
          <form onSubmit={handleHeroSearch} className="relative flex items-center">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search across 30 technical symposiums, hackathons & clubs..."
              className="w-full bg-paper text-ink font-body text-base sm:text-lg px-4 sm:px-6 py-4 border-2 border-ink placeholder:text-ink-60/60 focus:outline-none pr-32"
            />
            <div className="absolute right-2 top-2 bottom-2">
              <Button type="submit" size="sm" arrow>
                Explore
              </Button>
            </div>
          </form>
        </div>

        {/* Slicing Horizontal Identity Band (Cycles through featured events) */}
        {activeShowcase && (
          <EventTheme color={activeShowcase.organizerColor}>
            <Band
              color={activeShowcase.organizerColor}
              chipLabel={`FEATURED · ${activeShowcase.organizerName}`}
              tagline={activeShowcase.title}
              metaRight={`${formatDate(activeShowcase.startsAt)} · ${activeShowcase.venue.name}`}
              height="h-28 sm:h-36"
            >
              <div className="flex items-center gap-2">
                {featured.map((item, idx) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setActiveCycleIndex(idx)}
                    className={`h-2.5 transition-all ${
                      idx === activeCycleIndex
                        ? 'w-8 bg-paper'
                        : 'w-2.5 bg-paper/40 hover:bg-paper/70'
                    }`}
                    aria-label={`Show featured event ${idx + 1}`}
                  />
                ))}
              </div>
            </Band>
          </EventTheme>
        )}
      </section>

      {/* ==============================================================
          2. UPCOMING EVENTS RAIL (4:5 Snap Scroll Poster Tiles)
          ============================================================== */}
      <section className="py-14 sm:py-20 border-b border-ink-15">
        <div className="px-[4vw] mb-8 flex flex-col sm:flex-row sm:items-baseline justify-between gap-4">
          <div>
            <span className="font-mono text-[11px] uppercase tracking-widecaps text-ink-60 block mb-1">
              Live Horizon
            </span>
            <h2 className="font-display text-4xl sm:text-5xl uppercase text-ink">
              Upcoming Events
            </h2>
          </div>

          <div className="flex items-center gap-4">
            <span className="font-mono text-xs uppercase tracking-wide text-ink-60 hidden md:inline">
              Swipe or drag horizontally →
            </span>
            <Link to="/explore">
              <Button variant="secondary" size="sm" arrow>
                View Full Index
              </Button>
            </Link>
          </div>
        </div>

        {/* Snap-scroll rail */}
        <div className="px-[4vw] flex gap-6 overflow-x-auto snap-x snap-mandatory pb-6 no-scrollbar">
          {upcoming.map((evt, idx) => (
            <motion.div
              key={evt.id}
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.08 }}
              className="snap-start flex-shrink-0 w-[280px] sm:w-[320px] md:w-[360px] group flex flex-col border border-ink-15 hover:border-ink transition-colors bg-paper"
            >
              {/* 4:5 Aspect Ratio Poster Image with Color Edge */}
              <Link to={`/events/${evt.slug}`} className="relative aspect-[4/5] overflow-hidden bg-paper-deep">
                <img
                  src={evt.poster}
                  alt={evt.title}
                  className="w-full h-full object-cover grayscale-[20%] group-hover:grayscale-0 group-hover:scale-105 transition-all duration-500 ease-out"
                />

                {/* Left signature edge strip */}
                <div
                  className="absolute left-0 top-0 bottom-0 w-2.5 z-10"
                  style={{ backgroundColor: evt.organizerColor }}
                />

                {/* Status Badge */}
                <div className="absolute top-3 right-3 z-10">
                  <span className="bg-paper text-ink font-mono text-[10px] font-bold uppercase tracking-wide px-2 py-1 border border-ink">
                    {evt.status}
                  </span>
                </div>

                {/* Micro Archival Numbering */}
                <div className="absolute bottom-3 left-5 z-10 bg-paper/90 px-2 py-0.5 font-mono text-[9px] uppercase tracking-widest text-ink">
                  FIG. 0{idx + 1} · {evt.organizerName}
                </div>
              </Link>

              {/* Card Meta & Title */}
              <div className="p-5 flex-1 flex flex-col justify-between border-t border-ink-15">
                <div>
                  <div className="flex items-center gap-2 mb-2 font-mono text-[10px] uppercase text-ink-60">
                    <span className="font-semibold text-ink">{evt.category}</span>
                    <span>·</span>
                    <span>{formatDate(evt.startsAt)}</span>
                  </div>

                  <Link to={`/events/${evt.slug}`}>
                    <h3 className="font-display text-2xl text-ink uppercase tracking-tight group-hover:text-ink/80 transition-colors line-clamp-2">
                      {evt.title}
                    </h3>
                  </Link>

                  <p className="font-body text-xs text-ink-60 mt-2 line-clamp-2">
                    {evt.description}
                  </p>
                </div>

                {/* Quick Register / Action Button */}
                <div className="mt-6 pt-4 border-t border-ink-15 flex items-center justify-between">
                  <span className="font-mono text-xs font-semibold">
                    {evt.seatsLeft} SEATS LEFT
                  </span>
                  <Link to={`/events/${evt.slug}/register`}>
                    <Button size="sm" variant="secondary">
                      Register
                    </Button>
                  </Link>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ==============================================================
          3. FEATURED EXHIBITION SHOWCASE (Full-Bleed Alternating)
          ============================================================== */}
      <section className="border-b border-ink-15">
        <div className="px-[4vw] py-12 border-b border-ink-15">
          <span className="font-mono text-[11px] uppercase tracking-widecaps text-ink-60 block mb-1">
            Curatorial Spotlight
          </span>
          <h2 className="font-display text-4xl sm:text-6xl uppercase text-ink">
            Featured Showcases
          </h2>
        </div>

        {featured.slice(0, 2).map((item, idx) => {
          const isReversed = idx % 2 === 1
          return (
            <EventTheme key={item.id} color={item.organizerColor}>
              <div className="border-b border-ink-15 grid grid-cols-1 lg:grid-cols-12 min-h-[550px]">
                {/* Visual Half */}
                <div
                  className={`lg:col-span-7 relative overflow-hidden bg-paper-deep ${
                    isReversed ? 'lg:order-2 border-b lg:border-b-0 lg:border-l border-ink-15' : 'border-b lg:border-b-0 lg:border-r border-ink-15'
                  }`}
                >
                  <img
                    src={item.banner || item.poster}
                    alt={item.title}
                    className="w-full h-full object-cover min-h-[350px] lg:min-h-[550px] grayscale-[15%] hover:grayscale-0 transition-all duration-700"
                  />
                  <div
                    className="absolute inset-x-0 bottom-0 p-4 sm:p-6"
                    style={{
                      background: 'linear-gradient(to top, rgba(17,16,15,0.85), transparent)',
                    }}
                  >
                    <span className="font-mono text-[11px] uppercase tracking-widecaps text-paper bg-ink px-2.5 py-1">
                      {item.isSignature ? '★ SIGNATURE EXHIBITION' : 'CURATED HIGHLIGHT'}
                    </span>
                  </div>
                </div>

                {/* Editorial Content Half */}
                <div
                  className={`lg:col-span-5 p-8 sm:p-12 flex flex-col justify-between ${
                    isReversed ? 'lg:order-1' : ''
                  }`}
                >
                  <div>
                    <div className="flex items-center gap-3 mb-4">
                      <span
                        className="inline-block h-3 w-3"
                        style={{ backgroundColor: item.organizerColor }}
                      />
                      <span className="font-mono text-xs font-semibold uppercase tracking-widecaps text-ink-60">
                        {item.organizerName}
                      </span>
                      <span className="text-ink-15">·</span>
                      <span className="font-mono text-xs uppercase text-ink-60">
                        {item.category}
                      </span>
                    </div>

                    <h3 className="font-display text-4xl sm:text-5xl uppercase tracking-tight text-ink mb-4">
                      {item.title}
                    </h3>

                    {item.subtitle && (
                      <p className="font-body text-base font-medium text-ink-60 mb-6">
                        {item.subtitle}
                      </p>
                    )}

                    <p className="font-body text-sm sm:text-base text-ink leading-relaxed mb-8">
                      {item.description}
                    </p>

                    <div className="space-y-2 border-t border-b border-ink-15 py-4 font-mono text-xs uppercase mb-8">
                      <div className="flex justify-between">
                        <span className="text-ink-60">Date & Time</span>
                        <span className="font-semibold">{formatDate(item.startsAt)} · {formatTime(item.startsAt)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-ink-60">Venue</span>
                        <span className="font-semibold">{item.venue.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-ink-60">Capacity</span>
                        <span className="font-semibold">{item.capacity} Attendees</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-4">
                    <Link to={`/events/${item.slug}/register`}>
                      <Button size="md" arrow>
                        Register for Showcase
                      </Button>
                    </Link>
                    <Link to={`/events/${item.slug}`}>
                      <Button variant="secondary" size="md">
                        Event Dossier
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </EventTheme>
          )
        })}
      </section>

      {/* ==============================================================
          4. STATS TICKER & FEDERATION HIGHLIGHTS
          ============================================================== */}
      <section className="py-16 sm:py-20 border-b border-ink-15 bg-paper">
        <div className="px-[4vw]">
          <span className="font-mono text-[11px] uppercase tracking-widecaps text-ink-60 block mb-3 text-center sm:text-left">
            Federation Architecture In Numbers
          </span>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 pt-4 border-t border-ink-15">
            <div>
              <p className="font-display text-5xl sm:text-7xl lg:text-8xl text-ink">
                {organization?.stats.clubs || 9}
              </p>
              <p className="font-mono text-xs uppercase tracking-widecaps text-ink-60 mt-2">
                Autonomous Clubs
              </p>
            </div>
            <div>
              <p className="font-display text-5xl sm:text-7xl lg:text-8xl text-ink">
                {organization?.stats.events || 30}+
              </p>
              <p className="font-mono text-xs uppercase tracking-widecaps text-ink-60 mt-2">
                Symposiums & Hackathons
              </p>
            </div>
            <div>
              <p className="font-display text-5xl sm:text-7xl lg:text-8xl text-ink">
                {formatNumber(organization?.stats.registrations || 4820)}
              </p>
              <p className="font-mono text-xs uppercase tracking-widecaps text-ink-60 mt-2">
                Registrations
              </p>
            </div>
            <div>
              <p className="font-display text-5xl sm:text-7xl lg:text-8xl text-ink">
                {formatNumber(organization?.stats.certificates || 3190)}
              </p>
              <p className="font-mono text-xs uppercase tracking-widecaps text-ink-60 mt-2">
                Verifiable Certificates
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ==============================================================
          5. CLUB SHOWCASE: Big Typographic Roll-Call of all 9 Clubs
          ============================================================== */}
      <section className="py-16 sm:py-24 border-b border-ink-15">
        <div className="px-[4vw] mb-12 flex flex-col sm:flex-row sm:items-baseline justify-between gap-4">
          <div>
            <span className="font-mono text-[11px] uppercase tracking-widecaps text-ink-60 block mb-1">
              Member Collectives
            </span>
            <h2 className="font-display text-4xl sm:text-6xl uppercase text-ink">
              The 9 Autonomous Clubs
            </h2>
          </div>
          <Link to="/clubs">
            <Button variant="secondary" size="sm" arrow>
              Explore All Clubs
            </Button>
          </Link>
        </div>

        {/* Typographic Roll-Call List */}
        <div className="border-t border-ink-15">
          {clubs.map((club, index) => (
            <Link
              key={club.id}
              to={`/clubs/${club.slug}`}
              className="group border-b border-ink-15 py-6 sm:py-8 px-[4vw] flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-paper-deep transition-colors"
            >
              <div className="flex items-baseline gap-4 sm:gap-8">
                <span className="font-mono text-xs sm:text-sm font-bold opacity-40 group-hover:opacity-100">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className="inline-block h-2.5 w-2.5"
                      style={{ backgroundColor: club.color }}
                    />
                    <span className="font-mono text-[11px] uppercase tracking-widecaps text-ink-60">
                      {club.followersCount} Followers
                    </span>
                  </div>
                  <h3 className="font-display text-3xl sm:text-4xl md:text-5xl uppercase text-ink group-hover:translate-x-2 transition-transform">
                    {club.name}
                  </h3>
                </div>
              </div>

              <div className="flex items-center justify-between md:justify-end gap-6 md:max-w-md text-left md:text-right">
                <p className="font-body text-xs sm:text-sm text-ink-60 line-clamp-2 hidden sm:block">
                  {club.about}
                </p>
                <div className="font-mono text-xs uppercase font-semibold flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                  <span>View</span>
                  <ArrowUpRight className="h-4 w-4" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ==============================================================
          6. LATEST ANNOUNCEMENTS (Typographic Rows)
          ============================================================== */}
      <section className="py-16 sm:py-20">
        <div className="px-[4vw] mb-8 flex items-baseline justify-between">
          <div>
            <span className="font-mono text-[11px] uppercase tracking-widecaps text-ink-60 block mb-1">
              Dispatch Wire
            </span>
            <h2 className="font-display text-4xl sm:text-5xl uppercase text-ink">
              Latest Notices
            </h2>
          </div>
          <Link to="/announcements">
            <Button variant="secondary" size="sm" arrow>
              All Notices
            </Button>
          </Link>
        </div>

        <div className="px-[4vw] divide-y divide-ink-15 border-t border-b border-ink-15">
          {announcements.slice(0, 4).map((ann) => (
            <div
              key={ann.id}
              className="py-5 flex flex-col sm:flex-row sm:items-baseline justify-between gap-3 group hover:bg-paper-deep/60 px-2 transition-colors"
            >
              <div className="flex items-baseline gap-3">
                <span className="font-mono text-[10px] uppercase tracking-wide px-2 py-0.5 border border-ink text-ink font-semibold flex-shrink-0">
                  {ann.kind}
                </span>
                <p className="font-body text-base font-semibold text-ink group-hover:underline">
                  {ann.title}
                </p>
              </div>

              <span className="font-mono text-[11px] uppercase text-ink-60 flex-shrink-0">
                {formatDate(ann.publishedAt)}
              </span>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
