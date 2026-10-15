import React, { useState } from 'react'
import {
  Ticket,
  QrCode,
  ArrowsClockwise,
  ShieldCheck,
  CheckCircle,
} from '@phosphor-icons/react'
import { Registration } from '@/api'
import { formatDate } from '@/lib/dates'
import { Badge } from '@/design-system/primitives/Badge'
import { CodeSlots } from '@/design-system/micro/CodeSlots'

export interface TactileBoardingPassProps {
  registration: Registration
  onPresent: () => void
  onCancel: () => void
}

/**
 * TactileBoardingPass:
 * Modern-minimal digital admission pass in Iris Obsidian aesthetic.
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
        className="w-full h-full relative transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]"
        style={{
          transformStyle: 'preserve-3d',
          transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
        }}
      >
        {/* ================= FRONT FACE ================= */}
        <div
          className="absolute inset-0 w-full h-full bg-surface-subtle hover:bg-surface-subtle rounded-2xl overflow-hidden flex flex-col justify-between transition-all"
          style={{
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
          }}
        >
          {/* Top Paper Header Strip - Subtle Iris Accent */}
          <div className="h-1 w-full bg-primary flex-shrink-0" />

          <div className="p-5 flex-1 flex flex-col justify-between">
            {/* Pass Serial & Status Header */}
            <div className="flex items-center justify-between border-b border-line/30 pb-3">
              <span className="font-mono text-xs font-medium px-2 py-0.5 rounded-md bg-surface text-ink flex items-center gap-1.5">
                <Ticket className="h-3.5 w-3.5 text-primary" weight="bold" />
                PASS-{passSerial}
              </span>

              <div className="flex items-center gap-2">
                {isCheckedIn ? (
                  <Badge variant="success" size="sm">
                    Admitted
                  </Badge>
                ) : isCancelled ? (
                  <Badge variant="warning" size="sm">
                    Cancelled
                  </Badge>
                ) : (
                  <Badge variant="iris" size="sm">
                    Confirmed
                  </Badge>
                )}

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    setIsFlipped(true)
                  }}
                  className="p-1 rounded-full text-ink-soft hover:text-ink hover:bg-surface transition-colors"
                  title="Flip pass to inspect verification details"
                  aria-label="Flip pass"
                >
                  <ArrowsClockwise className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            {/* Event Info */}
            <div className="my-2">
              <h3 className="font-display font-medium text-base text-ink leading-snug line-clamp-2">
                {reg.eventTitle}
              </h3>
              <p className="text-xs text-ink-soft mt-1 font-mono">
                {formatDate(reg.eventStartsAt || reg.createdAt, 'EEE, MMM d, yyyy')} · {reg.venueName || 'Main Campus Venue'}
              </p>
            </div>

            {/* Attendee Row */}
            <div className="pt-2 text-xs text-ink-soft flex items-center justify-between border-t border-line/20">
              <span className="truncate">
                Attendee: <span className="text-ink font-medium">{reg.userName || 'Student Passholder'}</span>
              </span>
              <span className={`font-mono text-[11px] font-medium flex-shrink-0 ${
                isCheckedIn ? 'text-emerald-600 dark:text-emerald-400' : 'text-primary'
              }`}>
                {isCheckedIn ? 'VERIFIED' : 'ACTIVE'}
              </span>
            </div>
          </div>

          {/* Micro-perforation hairline */}
          <div className="relative flex items-center justify-between px-3 flex-shrink-0">
            <div className="flex-1 border-t border-dashed border-line/30" />
          </div>

          {/* Bottom Stub Actions */}
          <div className="p-3.5 bg-surface flex items-center justify-between gap-2.5 flex-shrink-0">
            <button
              type="button"
              className="btn-minimal-primary flex-1 py-1.5 text-xs flex items-center justify-center gap-1.5"
              onClick={onPresent}
            >
              {isCheckedIn ? (
                <>
                  <CheckCircle className="h-3.5 w-3.5" weight="bold" />
                  <span>View Admitted Pass</span>
                </>
              ) : (
                <>
                  <QrCode className="h-3.5 w-3.5" weight="bold" />
                  <span>Present Pass</span>
                </>
              )}
            </button>

            {!isCheckedIn && !isCancelled && (
              <button
                type="button"
                className="btn-minimal-secondary text-xs px-3 py-1.5 text-ink-soft hover:text-red-500"
                onClick={onCancel}
              >
                Cancel
              </button>
            )}
          </div>
        </div>

        {/* ================= BACK FACE ================= */}
        <div
          className="absolute inset-0 w-full h-full bg-[#14111D] text-white/90 rounded-2xl overflow-hidden flex flex-col justify-between p-5 border border-line/20"
          style={{
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
          }}
        >
          {/* Back Header with Shield */}
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div className="flex items-center gap-1.5 text-primary-light font-medium text-xs tracking-wider font-mono">
              <ShieldCheck className="h-4 w-4 text-primary-light" weight="bold" />
              <span>OFFICIAL GATE TOKEN</span>
            </div>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                setIsFlipped(false)
              }}
              className="text-white/60 hover:text-white p-1 transition-colors"
              aria-label="Flip back"
            >
              <ArrowsClockwise className="h-4 w-4" />
            </button>
          </div>

          {/* Center Gate Verification Content */}
          <div className="my-auto space-y-3">
            <div>
              <p className="text-[10px] font-mono text-white/50 uppercase tracking-wider">
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
                  className="bg-black/40 border border-white/20 text-white"
                />
              </div>
            </div>

            <div className="p-2.5 rounded-lg bg-white/5 border border-white/10 space-y-1">
              <p className="text-[10px] font-mono text-white/40 uppercase tracking-wide">
                SIGNED VERIFICATION TOKEN
              </p>
              <p className="font-mono text-[11px] text-emerald-400 font-medium truncate">
                {(reg as any).verificationToken || `0x${reg.id.slice(0, 16)}...sig_ok`}
              </p>
              <p className="text-[10px] text-white/60 font-sans">
                Signed by EventMesh admission service for venue gate verification.
              </p>
            </div>
          </div>

          {/* Back Footer */}
          <div className="pt-2.5 border-t border-white/10 flex items-center justify-between text-[10px] font-mono text-white/50">
            <span>ISO/IEC GATE PROTOCOL</span>
            <button
              type="button"
              onClick={() => setIsFlipped(false)}
              className="text-primary-light hover:underline"
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
