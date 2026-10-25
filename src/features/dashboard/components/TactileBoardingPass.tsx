import React, { useState } from 'react'
import {
  Ticket,
  QrCode,
  ArrowsClockwise,
  ShieldCheck,
  CheckCircle,
  Cube,
  CalendarBlank,
  MapPin,
} from '@phosphor-icons/react'
import { Registration } from '@/api'
import { formatDate } from '@/lib/dates'
import { Badge } from '@/design-system/primitives/Badge'
import { QRCode } from '@/design-system/primitives/QRCode'

const Ticket3D = React.lazy(() =>
  import('@/design-system/3d/Ticket3D').then((m) => ({ default: m.Ticket3D }))
)

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
  const [show3D, setShow3D] = useState(false)

  const passSerial = reg.id.slice(0, 8).toUpperCase()
  const ticketCode = reg.ticketCode || `PASS-${passSerial}`
  const isCheckedIn = reg.status === 'checked_in'
  const isCancelled = reg.status === 'cancelled'

  if (show3D) {
    return (
      <div className="relative w-full rounded-2xl bg-surface-subtle p-2 border border-border-default shadow-lg">
        <div className="flex items-center justify-between px-3 pt-2">
          <span className="text-[11px] font-mono text-accent font-semibold uppercase tracking-wider flex items-center gap-1.5">
            <Cube size={14} weight="bold" />
            3D Holographic Pass
          </span>
          <button
            type="button"
            onClick={() => setShow3D(false)}
            className="text-xs font-mono text-text-2 hover:text-ink px-2 py-0.5 rounded bg-surface border border-border-subtle"
          >
            ← 2D Card
          </button>
        </div>
        <React.Suspense fallback={<div className="h-64 flex items-center justify-center text-xs text-text-3 font-mono">Loading 3D Canvas...</div>}>
          <Ticket3D
            eventTitle={reg.eventTitle || 'Campus Flagship Event'}
            attendeeName={reg.userName || 'Verified Attendee'}
            ticketCode={`PASS-${passSerial}`}
            tierName={reg.tierName || 'GENERAL ADMISSION'}
            dateText={reg.eventStartsAt ? formatDate(reg.eventStartsAt) : 'UPCOMING'}
            color="#8FE3C6"
            isVip={Boolean(reg.tierName?.toLowerCase().includes('vip'))}
            height={260}
          />
        </React.Suspense>
      </div>
    )
  }

  return (
    <div
      className="relative w-full h-[310px] perspective-[1200px] select-none"
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

          <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
            {/* Pass Serial & Status Header */}
            <div className="flex items-center justify-between border-b border-line/30 pb-2.5">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-medium px-2 py-0.5 rounded-md bg-surface text-ink flex items-center gap-1.5">
                  <Ticket className="h-3.5 w-3.5 text-primary" weight="bold" />
                  PASS-{passSerial}
                </span>
                <button
                  type="button"
                  onClick={() => setShow3D(true)}
                  className="font-mono text-[11px] font-semibold px-2 py-0.5 rounded-md bg-accent/10 text-accent hover:bg-accent/20 transition-colors flex items-center gap-1"
                  title="Inspect in 3D WebGL"
                >
                  <Cube size={12} weight="bold" />
                  <span>3D</span>
                </button>
              </div>

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
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-accent truncate max-w-[170px]">
                  {reg.organizerName || 'Campus Host'}
                </span>
                {reg.tierName && (
                  <span className="px-1.5 py-0.2 rounded bg-surface border border-line/50 text-[10px] font-mono uppercase tracking-wide text-ink-soft">
                    {reg.tierName}
                  </span>
                )}
              </div>
              <h3
                className="font-display font-semibold text-base sm:text-[17px] text-ink leading-snug line-clamp-2"
                title={reg.eventTitle || 'Campus Event'}
              >
                {reg.eventTitle || 'Campus Event'}
              </h3>
              <div className="mt-2 space-y-1 text-xs text-ink-soft font-mono">
                <div className="flex items-center gap-1.5 truncate">
                  <CalendarBlank size={13} className="text-accent shrink-0" weight="bold" />
                  <span className="truncate">
                    {formatDate(reg.eventStartsAt || reg.createdAt, 'EEE, dd MMM yyyy · hh:mm a')}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 truncate">
                  <MapPin size={13} className="text-ink-muted shrink-0" weight="bold" />
                  <span className="truncate">{reg.venueName || 'Main Campus Venue'}</span>
                </div>
              </div>
            </div>

            {/* Attendee Row */}
            <div className="pt-2 text-xs text-ink-soft flex items-center justify-between border-t border-line/20">
              <span className="truncate">
                Attendee: <span className="text-ink font-semibold">{reg.userName || 'Student Passholder'}</span>
              </span>
              <span className={`font-mono text-[11px] font-bold flex-shrink-0 ${
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
          <div className="my-auto flex flex-col items-center gap-2">
            <div className="text-center w-full px-2">
              <p className="text-xs font-semibold text-white truncate" title={reg.eventTitle}>
                {reg.eventTitle || 'Campus Event'}
              </p>
              <p className="text-[10px] text-white/60 font-mono">
                {formatDate(reg.eventStartsAt || reg.createdAt, 'EEE, dd MMM yyyy')}
              </p>
            </div>
            <div className="p-2 rounded-xl bg-white shadow-xs">
              <QRCode
                value={JSON.stringify({
                  v: 1,
                  ticket: ticketCode,
                  ticketId: ticketCode,
                  code: ticketCode,
                  event: reg.eventSlug || reg.eventId || '',
                  eventId: reg.eventId || '',
                  reg: reg.id,
                  registrationId: reg.id,
                })}
                size={88}
              />
            </div>
            <span className="font-mono text-xs font-bold text-white tracking-wider">
              {ticketCode}
            </span>
            <p className="text-[10px] text-white/60 font-sans text-center">
              Signed by EventMesh admission service for venue gate verification.
            </p>
          </div>

          {/* Back Footer */}
          <div className="pt-2.5 border-t border-white/10 flex items-center justify-between text-[10px] font-mono text-white/50">
            <span>GATE READY</span>
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
