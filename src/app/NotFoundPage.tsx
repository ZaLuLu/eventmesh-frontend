import React from 'react'
import { Link } from 'react-router-dom'
import { Ticket, ArrowLeft, House } from '@/design-system/Icon'
import { Sticker } from '@/design-system/primitives/Sticker'

// Hallmark macrostructure: System-State-404
export const NotFoundPage: React.FC = () => {
  return (
    <div className="w-full min-h-[70vh] flex flex-col items-center justify-center p-6 text-center select-none">
      <div className="max-w-md w-full bg-card border-[1.5px] border-ink rounded-ticket p-8 shadow-offset-lg space-y-6">
        <div className="flex justify-center">
          <Sticker color="tangerine" size="md" tilt={-3} icon={<Ticket size={14} weight="bold" />}>
            Voided Pass · 404
          </Sticker>
        </div>

        <div className="space-y-2">
          <h1 className="font-display font-extrabold text-5xl sm:text-6xl text-ink tracking-tight">
            Off the <span className="font-accent text-cobalt not-italic font-normal">grid</span>
          </h1>
          <p className="text-ink-soft text-sm sm:text-base font-sans leading-relaxed">
            The event or checkpoint you are looking for has been moved, completed, or does not exist.
          </p>
        </div>

        <div className="relative py-4 border-y border-dashed border-ink/30 my-4 flex items-center justify-between text-xs font-mono text-ink-soft">
          <span>ZONE: CAMPUS-EXT</span>
          <span className="text-cobalt font-bold">STATUS: TICKET-CANCELLED</span>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Link to="/" className="btn-funk-primary w-full sm:w-auto px-6 py-2.5 text-sm font-bold flex items-center justify-center gap-2">
            <House size={16} weight="bold" />
            <span>Back to Campus</span>
          </Link>
          <Link to="/explore" className="btn-funk-secondary w-full sm:w-auto px-6 py-2.5 text-sm font-bold flex items-center justify-center gap-2">
            <ArrowLeft size={16} weight="bold" />
            <span>Browse Events</span>
          </Link>
        </div>
      </div>
    </div>
  )
}
