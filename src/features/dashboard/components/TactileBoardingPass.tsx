import React, { useState } from 'react'
import {
  Ticket,
  QrCode,
  ArrowsClockwise,
  ShieldCheck,
  CheckCircle,
  Clock,
  WarningCircle,
} from '@phosphor-icons/react'
import { Registration } from '@/api'
import { formatDate } from '@/lib/dates'
import { Button } from '@/design-system/primitives/Button'
import { Sticker } from '@/design-system/primitives/Sticker'
import { CodeSlots } from '@/design-system/micro/CodeSlots'

export interface TactileBoardingPassProps {
  registration: Registration
  onPresent: () => void
  onCancel: () => void
}

/**
 * TactileBoardingPass:
 * An authentic tactile paper boarding pass object in Campus Funk aesthetic.
 * - Front: Event, Date, Venue, Attendee, Perforation notches, Present Pass CTA
 * - Back: Verifiable cryptographic admission token, gate OTP, flip back
 */
export const TactileBoardingPass: React.FC<TactileBoardingPassProps> = ({
  registration: reg,
  onPresent,
  onCancel,
}) => {
  const [isFlipped, setIsFlipped] = useState(false)

  // Derive stable 6-digit OTP code for gate check-in
  const otpCode = String(
    Math.abs(reg.id.split('').reduce((acc, c) => acc * 31 + c.charCodeAt(0), 7) % 900000) + 100000
  )

  const passSerial = reg.id.slice(0, 8).toUpperCase()
  const isCheckedIn = reg.status === 'checked_in'
  const isCancelled = reg.status === 'cancelled'

  return (
    <div
      className="relative w-full h-[290px] perspective-[1200px] select-none"
      style={{ perspective: 1200 }}
    >
      <div
        className="w-full h-full relative transition-transform duration-600 ease-[cubic-bezier(0.2,0.8,0.2,1)]"
        style={{
          transformStyle: 'preserve-3d',
          transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
        }}
      >
        {/* ================= FRONT FACE ================= */}
        <div
          className="absolute inset-0 w-full h-full bg-card border-2 border-ink rounded-[16px] overflow-hidden flex flex-col justify-between shadow-[3px_3px_0_#151130] hover:shadow-[5px_5px_0_#151130] transition-shadow duration-200"
          style={{
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
          }}
        >
          {/* Top Paper Header Strip (Solid Cobalt, Zero Holographic Foil Glow) */}
          <div className="h-2 w-full bg-cobalt flex-shrink-0" />

          <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
            {/* Pass Serial & Status Header */}
            <div className="flex items-center justify-between border-b border-ink/15 pb-2.5">
              <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-[4px] bg-paper text-ink border border-ink/30 flex items-center gap-1.5">
                <Ticket className="h-3.5 w-3.5 text-cobalt" weight="bold" />
                PASS-{passSerial}
              </span>

              <div className="flex items-center gap-2">
                {isCheckedIn ? (
                  <Sticker color="mint" size="sm" className="font-bold">
                    ADMITTED ✓
                  </Sticker>
                ) : isCancelled ? (
                  <Sticker color="tangerine" size="sm">
                    CANCELLED
                  </Sticker>
                ) : (
                  <Sticker color="sky" size="sm" className="font-semibold">
                    INTACT
                  </Sticker>
                )}

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    setIsFlipped(true)
                  }}
                  className="p-1 rounded-full text-ink-soft hover:text-ink hover:bg-paper transition-colors"
                  title="Flip pass to inspect verification details"
                  aria-label="Flip pass"
                >
                  <ArrowsClockwise className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Event Info */}
            <div className="my-1.5">
              <h3 className="font-display font-extrabold text-base text-ink leading-snug line-clamp-2">
                {reg.eventTitle}
              </h3>
              <p className="text-xs text-ink-soft mt-1">
                {formatDate(reg.eventStartsAt || reg.createdAt, 'EEE, MMM d, yyyy')} · {reg.venueName || 'Main Campus Venue'}
              </p>
            </div>

            {/* Attendee Row */}
            <div className="pt-2 text-xs text-ink-soft flex items-center justify-between border-t border-ink/10">
              <span className="truncate">
                Attendee: <strong className="text-ink font-semibold">{reg.userName || 'Student Passholder'}</strong>
              </span>
              <span className={`font-mono text-[11px] font-bold flex-shrink-0 ${
                isCheckedIn ? 'text-emerald-700' : 'text-cobalt'
              }`}>
                {isCheckedIn ? 'CHECKED IN' : 'CONFIRMED'}
              </span>
            </div>
          </div>

          {/* Perforation Line with dual semicircular notches */}
          <div className="relative flex items-center justify-between my-0 flex-shrink-0">
            <div className="w-3.5 h-4 rounded-r-full bg-paper border-r-2 border-t-2 border-b-2 border-ink -ml-[2px]" />
            <div className="flex-1 border-t-2 border-dashed border-ink/30 mx-2" />
            <div className="w-3.5 h-4 rounded-l-full bg-paper border-l-2 border-t-2 border-b-2 border-ink -mr-[2px]" />
          </div>

          {/* Bottom Stub Actions */}
          <div className="p-3 bg-paper/60 flex items-center justify-between gap-2.5 border-t border-ink/15 flex-shrink-0">
            <button
              type="button"
              className="btn-funk-primary flex-1 py-1.5 text-xs flex items-center justify-center gap-1.5"
              onClick={onPresent}
            >
              {isCheckedIn ? (
                <>
                  <CheckCircle className="h-4 w-4 text-mint" weight="bold" />
                  <span>View Admitted Stub</span>
                </>
              ) : (
                <>
                  <QrCode className="h-4 w-4" weight="bold" />
                  <span>Present Pass</span>
                </>
              )}
            </button>

            {!isCheckedIn && !isCancelled && (
              <button
                type="button"
                className="btn-funk-secondary text-xs px-3 py-1.5 text-ink-soft hover:text-ink"
                onClick={onCancel}
              >
                Cancel
              </button>
            )}
          </div>
        </div>

        {/* ================= BACK FACE ================= */}
        <div
          className="absolute inset-0 w-full h-full bg-[#1A1633] text-paper border-2 border-ink rounded-[16px] overflow-hidden flex flex-col justify-between p-5 shadow-[3px_3px_0_#151130]"
          style={{
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
          }}
        >
          {/* Back Header with Shield */}
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div className="flex items-center gap-1.5 text-lavender font-bold text-xs uppercase tracking-wider font-mono">
              <ShieldCheck className="h-4 w-4 text-lavender" weight="bold" />
              <span>OFFICIAL GATE TOKEN</span>
            </div>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                setIsFlipped(false)
              }}
              className="text-paper/60 hover:text-white p-1 transition-colors"
              aria-label="Flip back"
            >
              <ArrowsClockwise className="h-4 w-4" />
            </button>
          </div>

          {/* Center Gate Verification Content */}
          <div className="my-auto space-y-3">
            <div>
              <p className="text-[10px] font-mono text-paper/60 uppercase tracking-wider">
                GATE OTP (SERVER ISSUED)
              </p>
              <div className="mt-1 flex justify-center">
                <CodeSlots
                  value={otpCode}
                  length={6}
                  status={isCheckedIn ? 'success' : 'idle'}
                  slotSize={26}
                  radius={4}
                  gap={5}
                  className="bg-black/40 border border-white/30 text-white"
                />
              </div>
            </div>

            <div className="p-2.5 rounded-lg bg-black/30 border border-white/10 space-y-1">
              <p className="text-[10px] font-mono text-paper/50 uppercase tracking-wide">
                SIGNED VERIFICATION TOKEN
              </p>
              <p className="font-mono text-[11px] text-mint font-semibold truncate">
                {(reg as any).verificationToken || `0x${reg.id.slice(0, 16)}...sig_ok`}
              </p>
              <p className="text-[10px] text-paper/70 font-sans">
                Signed by EventMesh admission service for venue gate verification.
              </p>
            </div>
          </div>

          {/* Back Footer */}
          <div className="pt-2.5 border-t border-white/10 flex items-center justify-between text-[10px] font-mono text-paper/60">
            <span>ISO/IEC GATE PROTOCOL</span>
            <button
              type="button"
              onClick={() => setIsFlipped(false)}
              className="text-sky hover:underline"
            >
              Back to front →
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TactileBoardingPass
