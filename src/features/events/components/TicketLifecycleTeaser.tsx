import React from 'react'
import { Link } from 'react-router-dom'
import { QrCode, Check, Ticket, ShieldCheck, ArrowRight } from '@/design-system/Icon'
import { Sticker } from '@/design-system/primitives/Sticker'

/**
 * TicketLifecycleTeaser: 3-State Lifecycle Teaser Strip
 * Replaces the full campus admission matrix on the Home Page (F-07, Mandate 1).
 * Explains: (1) Registered -> (2) Show Intact QR -> (3) Torn at Venue Gate.
 */
export const TicketLifecycleTeaser: React.FC = () => {
  return (
    <div id="how-tickets-work" className="w-full space-y-8 select-none">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* State 1: Register in Two Taps */}
        <div className="relative flex flex-col justify-between p-6 bg-card border-[1.5px] border-ink rounded-ticket shadow-offset">
          {/* Notches */}
          <div className="absolute -top-3 left-8 w-6 h-6 rounded-full bg-paper border-[1.5px] border-ink" />
          <div className="absolute -bottom-3 left-8 w-6 h-6 rounded-full bg-paper border-[1.5px] border-ink" />

          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="font-mono text-xs font-bold text-cobalt uppercase tracking-wider">
                Step 01
              </span>
              <Sticker color="mint" size="sm" tilt={-2}>
                Two Taps
              </Sticker>
            </div>

            <h3 className="font-display font-extrabold text-2xl text-ink tracking-tight mb-2">
              Reserve your seat
            </h3>
            <p className="text-sm text-ink-soft leading-relaxed">
              Sign in with your verified campus credentials. Single tap RSVP for solo events or invite teammates directly by university email.
            </p>
          </div>

          <div className="mt-6 pt-4 border-t border-dashed border-ink/20 flex items-center justify-between text-xs font-mono text-ink-soft">
            <span className="flex items-center gap-1 font-semibold text-ink">
              <Check size={14} weight="bold" className="text-mint" />
              Instant Confirmation
            </span>
            <span>Intact pass</span>
          </div>
        </div>

        {/* State 2: Scannable Pass Generated Intact */}
        <div className="relative flex flex-col justify-between p-6 bg-card border-[1.5px] border-ink rounded-ticket shadow-offset-lg">
          {/* Notches */}
          <div className="absolute -top-3 left-8 w-6 h-6 rounded-full bg-paper border-[1.5px] border-ink" />
          <div className="absolute -bottom-3 left-8 w-6 h-6 rounded-full bg-paper border-[1.5px] border-ink" />

          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="font-mono text-xs font-bold text-cobalt uppercase tracking-wider">
                Step 02
              </span>
              <Sticker color="mustard" size="sm" tilt={1}>
                QR on Face
              </Sticker>
            </div>

            <h3 className="font-display font-extrabold text-2xl text-ink tracking-tight mb-2">
              Pass stays intact
            </h3>
            <p className="text-sm text-ink-soft leading-relaxed">
              Your pass is generated complete with an authentic cryptographic token and high-contrast QR code on the ticket face. Never torn before arrival.
            </p>
          </div>

          <div className="mt-6 pt-4 border-t border-dashed border-ink/20 flex items-center justify-between text-xs font-mono text-ink-soft">
            <span className="flex items-center gap-1.5 font-bold text-ink">
              <QrCode size={16} weight="bold" className="text-cobalt" />
              Scannable Token
            </span>
            <span className="text-[11px] bg-paper-2 px-2 py-0.5 rounded font-mono">
              Offline Ready
            </span>
          </div>
        </div>

        {/* State 3: Torn at the Venue Gate */}
        <div className="relative flex flex-col justify-between p-6 bg-paper-2 border-[1.5px] border-ink rounded-ticket shadow-offset">
          {/* Notches */}
          <div className="absolute -top-3 left-8 w-6 h-6 rounded-full bg-paper border-[1.5px] border-ink" />
          <div className="absolute -bottom-3 left-8 w-6 h-6 rounded-full bg-paper border-[1.5px] border-ink" />

          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="font-mono text-xs font-bold text-ink uppercase tracking-wider">
                Step 03
              </span>
              <Sticker color="tangerine" size="sm" tilt={-1}>
                Torn at Gate
              </Sticker>
            </div>

            <h3 className="font-display font-extrabold text-2xl text-ink tracking-tight mb-2">
              Tears upon check-in
            </h3>
            <p className="text-sm text-ink-soft leading-relaxed">
              At the venue door, gate volunteers scan your pass with the organizer desk. Your stub tears with natural perforation sound and stamps admitted.
            </p>
          </div>

          <div className="mt-6 pt-4 border-t border-dashed border-ink/20 flex items-center justify-between text-xs font-mono text-ink-soft">
            <span className="flex items-center gap-1.5 font-bold text-ink">
              <ShieldCheck size={16} weight="bold" className="text-tangerine" />
              Admitted Stamp
            </span>
            <span className="font-semibold text-ink">Torn stub</span>
          </div>
        </div>
      </div>

      {/* Helpful Link to Attendee Dashboard */}
      <div className="p-4 rounded-2xl bg-card border border-ink/15 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-cobalt text-white flex items-center justify-center font-bold">
            <Ticket size={20} weight="bold" />
          </div>
          <div>
            <h4 className="font-display font-extrabold text-base text-ink">
              Have existing registrations?
            </h4>
            <p className="text-xs text-ink-soft">
              Access your digital ticket passes, 3D student ID lanyard, and verified certificates anytime.
            </p>
          </div>
        </div>

        <Link
          to="/attendee/dashboard"
          className="btn-funk-primary px-5 py-2.5 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 flex-shrink-0"
        >
          <span>View my tickets</span>
          <ArrowRight size={14} weight="bold" />
        </Link>
      </div>
    </div>
  )
}
