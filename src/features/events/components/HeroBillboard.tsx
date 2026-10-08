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
      {/* Vibrant Feral Iridescent Ambient Aura */}
      <div
        className="absolute -top-12 left-1/2 -translate-x-1/2 w-full max-w-5xl h-96 sm:h-[450px] pointer-events-none rounded-full overflow-hidden z-0"
        style={{
          background:
            'radial-gradient(circle, rgba(139, 92, 246, 0.2) 0%, rgba(236, 72, 153, 0.15) 30%, rgba(99, 102, 241, 0.1) 55%, transparent 75%)',
          filter: 'blur(75px)',
        }}
      />

      {/* Top Banner Tagline & Quick Action */}
      <div className="relative z-10 flex items-center justify-between mb-3.5 px-1">
        <div className="flex items-center gap-2.5">
          <span className="neo-gradient-btn inline-flex items-center gap-1.5 px-3.5 py-1 text-xs font-bold text-white shadow-neo-sm select-none">
            <Sparkles className="h-3.5 w-3.5" />
            #1 Trending Discovery
          </span>
          <span className="neo-pill hidden sm:inline-flex items-center gap-1 px-3 py-1 text-xs font-semibold text-slate-700 select-none">
            <Zap className="h-3 w-3 text-amber-500 fill-amber-500" />
            Spring Physics Deck • Tap card to claim pass
          </span>
        </div>

        <button
          type="button"
          onClick={() => navigate('/explore')}
          className="neo-pill px-3.5 py-1 text-xs font-bold text-indigo-600 hover:text-purple-600 flex items-center gap-1 transition-all"
        >
          <span>View All ({events.length})</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Main Feral Blinds Interactive Spring Carousel in Neomorphic Frame */}
      <div
        className="relative z-10 neo-card p-2 sm:p-2.5 overflow-hidden"
        style={{ height: 535 }}
      >
        <div className="w-full h-full rounded-[22px] overflow-hidden bg-slate-900 shadow-neo-inset">
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
      </div>
    </section>
  )
}
