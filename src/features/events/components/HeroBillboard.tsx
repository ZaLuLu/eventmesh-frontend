import React, { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Sparkles, ArrowRight, Zap } from 'lucide-react'
import { Event } from '@/api'
import { formatDate } from '@/lib/dates'
import { Blinds, BlindsItem } from 'feral-blinds'
import 'feral-blinds/blinds.css'

interface HeroBillboardProps {
  events: Event[]
}

interface EventBlindsItem extends BlindsItem {
  href: string
}

export const HeroBillboard: React.FC<HeroBillboardProps> = ({ events }) => {
  const navigate = useNavigate()

  // Format events into BlindsItem array with navigation links
  const items: EventBlindsItem[] = useMemo(() => {
    if (!events || events.length === 0) return []

    return events.map((event) => {
      const isFree = !event.features?.paid
      const priceText = isFree ? 'Free Pass' : 'Ticketed'
      const dateText = formatDate(event.startsAt)
      const locationText = event.venue?.name || 'In-Person & Live'

      return {
        title: event.title,
        subtitle: `${event.organizerName || 'Featured Collective'} • ${locationText}`,
        meta: `${dateText} • ${priceText}`,
        image:
          event.banner ||
          event.poster ||
          'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1600&q=80',
        href: `/events/${event.slug}`,
      }
    })
  }, [events])

  if (!events || events.length === 0 || items.length === 0) return null

  return (
    <section className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 pt-5 pb-8">
      {/* Subtle Google Blue Ambient Aura */}
      <div
        className="absolute -top-10 left-1/2 -translate-x-1/2 w-full max-w-4xl h-80 sm:h-96 pointer-events-none rounded-full overflow-hidden z-0"
        style={{
          background:
            'radial-gradient(circle, rgba(26, 115, 232, 0.15) 0%, rgba(232, 240, 254, 0.3) 40%, transparent 70%)',
          filter: 'blur(60px)',
        }}
      />

      {/* Top Banner Tagline & Quick Action */}
      <div className="relative z-10 flex items-center justify-between mb-3 px-1">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-md-primary text-white text-xs font-semibold shadow-xs">
            <Sparkles className="h-3.5 w-3.5" />
            #1 Trending Showcase
          </span>
          <span className="hidden sm:inline-flex items-center gap-1 px-3 py-1 rounded-full bg-white/80 border border-md-outline/60 text-xs font-medium text-slate-700 backdrop-blur-xs">
            <Zap className="h-3 w-3 text-amber-500 fill-amber-500" />
            Interactive Spring Deck • Click card to book pass
          </span>
        </div>

        <button
          type="button"
          onClick={() => navigate('/explore')}
          className="text-xs font-semibold text-md-primary hover:underline flex items-center gap-1"
        >
          <span>View All ({events.length})</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Main Feral Blinds Interactive Spring Carousel */}
      <div
        className="relative z-10 rounded-2xl sm:rounded-3xl overflow-hidden border border-[#DADCE0] shadow-card bg-slate-900/40 backdrop-blur-xs"
        style={{ height: 520 }}
      >
        <Blinds
          items={items}
          mode="snap"
          labelStyle="steady"
          labelPosition="bottom"
          spread={1.3}
          radius={17}
          gap={14}
          textSize={1.05}
          expandRatio={1.5}
          tuning={{ k: 75, c: 17, lean: 0.3, squeeze: 1 }}
          autoPlay={3500}
          showIndex={false}
          showBody={false}
          onActivate={(i) => {
            if (items[i]?.href) {
              navigate(items[i].href)
            }
          }}
        />
      </div>
    </section>
  )
}
