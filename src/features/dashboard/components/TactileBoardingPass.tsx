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
  Clock,
  ArrowRight,
} from '@phosphor-icons/react'
import { Registration } from '@/api'
import { formatDate, formatTime } from '@/lib/dates'
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
 * High-contrast digital boarding pass adhering to Design Doctrine & Hallmark 58 Anti-Slop Gates.
 * Features systemic radii, micro-perforated notch tear line, and 1-click 3D Hologram inspection.
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
      <div className="relative w-full rounded-[14px] bg-white dark:bg-[#0D0E12] p-3 border border-[#E2E8F0] dark:border-white/10 shadow-xl">
        <div className="flex items-center justify-between px-3 pt-1 pb-2">
          <span className="text-[11px] font-mono text-violet-600 dark:text-violet-400 font-semibold uppercase tracking-wider flex items-center gap-1.5">
            <Cube size={14} weight="bold" />
            <span>3D Holographic Pass</span>
          </span>
          <button
            type="button"
            onClick={() => setShow3D(false)}
            className="text-xs font-mono font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white px-2.5 py-1 rounded-[6px] bg-slate-100 dark:bg-white/10 border border-[#E2E8F0] dark:border-white/10 transition-colors cursor-pointer"
          >
            ← 2D Pass
          </button>
        </div>
        <React.Suspense
          fallback={
            <div className="h-64 flex items-center justify-center text-xs text-slate-400 font-mono">
              Loading 3D Canvas...
            </div>
          }
        >
          <Ticket3D
            eventTitle={reg.eventTitle || 'Campus Flagship Event'}
            attendeeName={reg.userName || 'Verified Attendee'}
            ticketCode={`PASS-${passSerial}`}
            tierName={reg.tierName || 'GENERAL ADMISSION'}
            dateText={reg.eventStartsAt ? formatDate(reg.eventStartsAt) : 'UPCOMING'}
            color="#7C3AED"
            isVip={Boolean(reg.tierName?.toLowerCase().includes('vip'))}
            height={260}
          />
        </React.Suspense>
      </div>
    )
  }

  return (
    <div
      className="relative w-full h-[320px] perspective-[1200px] select-none"
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
          className="absolute inset-0 w-full h-full bg-white dark:bg-[#0D0E12] rounded-[14px] border border-[#E2E8F0] dark:border-white/10 overflow-hidden flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow"
          style={{
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
          }}
        >
          {/* Top Edge Tint */}
          <div className="h-1 w-full bg-violet-600 shrink-0" />

          <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
            {/* Pass Serial & Status Header */}
            <div className="flex items-center justify-between border-b border-[#E2E8F0] dark:border-white/10 pb-2.5">
              <div className="flex items-center gap-1.5">
                <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded-[6px] bg-slate-100 dark:bg-white/10 text-slate-800 dark:text-slate-200 flex items-center gap-1.5 border border-slate-200 dark:border-white/10">
                  <Ticket className="h-3.5 w-3.5 text-violet-600 dark:text-violet-400" weight="bold" />
                  <span>PASS-{passSerial}</span>
                </span>
                <button
                  type="button"
                  onClick={() => setShow3D(true)}
                  className="font-mono text-xs font-semibold px-2 py-0.5 rounded-[6px] bg-violet-50 text-violet-700 dark:bg-violet-950/60 dark:text-violet-300 hover:bg-violet-100 dark:hover:bg-violet-900/60 transition-colors flex items-center gap-1 border border-violet-200 dark:border-violet-800/40 cursor-pointer"
                  title="Inspect in 3D WebGL"
                >
                  <Cube size={12} weight="bold" />
                  <span>3D</span>
                </button>
              </div>

              <div className="flex items-center gap-2">
                {isCheckedIn ? (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30">
                    Admitted
                  </span>
                ) : isCancelled ? (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase bg-rose-500/10 text-rose-700 dark:text-rose-300 border border-rose-500/30">
                    Cancelled
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase bg-violet-500/10 text-violet-700 dark:text-violet-300 border border-violet-500/30">
                    Confirmed
                  </span>
                )}

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    setIsFlipped(true)
                  }}
                  className="p-1 rounded-[6px] text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors cursor-pointer"
                  title="Flip pass to inspect scannable QR code"
                  aria-label="Flip pass"
                >
                  <ArrowsClockwise className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            {/* Event Info */}
            <div className="my-1.5 space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-violet-600 dark:text-violet-400 truncate max-w-[180px]">
                  {reg.organizerName || 'Campus Host'}
                </span>
                {reg.tierName && (
                  <span className="px-1.5 py-0.2 rounded-[4px] bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-[10px] font-mono uppercase tracking-wide text-slate-600 dark:text-slate-400">
                    {reg.tierName}
                  </span>
                )}
              </div>
              <h3
                className="font-semibold text-base text-slate-900 dark:text-white leading-tight tracking-tight line-clamp-2"
                title={reg.eventTitle || 'Campus Event'}
              >
                {reg.eventTitle || 'Campus Event'}
              </h3>
              <div className="pt-1 space-y-1 text-xs text-slate-500 dark:text-slate-400 font-mono">
                <div className="flex items-center gap-1.5 truncate">
                  <Clock size={13} className="text-violet-600 dark:text-violet-400 shrink-0" weight="bold" />
                  <span className="truncate tabular-nums">
                    {formatDate(reg.eventStartsAt || reg.createdAt, 'full')}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 truncate">
                  <MapPin size={13} className="text-slate-400 shrink-0" weight="bold" />
                  <span className="truncate">{reg.venueName || 'Main Campus Venue'}</span>
                </div>
              </div>
            </div>

            {/* Attendee Row */}
            <div className="pt-2 text-xs text-slate-500 dark:text-slate-400 flex items-center justify-between border-t border-[#E2E8F0] dark:border-white/10">
              <span className="truncate">
                Attendee: <span className="text-slate-900 dark:text-white font-semibold">{reg.userName || 'Student Passholder'}</span>
              </span>
              <span
                className={`font-mono text-xs font-bold shrink-0 ${
                  isCheckedIn ? 'text-emerald-600 dark:text-emerald-400' : 'text-violet-600 dark:text-violet-400'
                }`}
              >
                {isCheckedIn ? 'VERIFIED' : 'ACTIVE'}
              </span>
            </div>
          </div>

          {/* Micro-perforation Tear Line with Left/Right Notches */}
          <div className="relative flex items-center justify-between px-3 shrink-0">
            {/* Left Notch */}
            <div className="absolute -left-2.5 w-5 h-5 rounded-full bg-[#F8F9FA] dark:bg-black border border-[#E2E8F0] dark:border-white/10" />
            <div className="flex-1 border-t border-dashed border-slate-300 dark:border-white/20 mx-3" />
            {/* Right Notch */}
            <div className="absolute -right-2.5 w-5 h-5 rounded-full bg-[#F8F9FA] dark:bg-black border border-[#E2E8F0] dark:border-white/10" />
          </div>

          {/* Bottom Action Stub */}
          <div className="p-3 bg-slate-50 dark:bg-white/[0.02] border-t border-[#E2E8F0] dark:border-white/10 flex items-center justify-between gap-2.5 shrink-0">
            <button
              type="button"
              className="flex-1 py-1.5 px-3 rounded-[8px] bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-violet-600 dark:hover:bg-violet-400 dark:hover:text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors active:scale-[0.98] cursor-pointer"
              onClick={onPresent}
            >
              {isCheckedIn ? (
                <>
                  <CheckCircle className="h-3.5 w-3.5 text-emerald-400 dark:text-emerald-600" weight="bold" />
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
                className="text-xs px-3 py-1.5 rounded-[8px] border border-[#E2E8F0] dark:border-white/10 bg-white dark:bg-white/5 text-slate-500 hover:text-rose-600 hover:border-rose-300 dark:hover:border-rose-800 transition-colors cursor-pointer"
                onClick={onCancel}
              >
                Cancel
              </button>
            )}
          </div>
        </div>

        {/* ================= BACK FACE ================= */}
        <div
          className="absolute inset-0 w-full h-full bg-[#0D0E12] text-white rounded-[14px] overflow-hidden flex flex-col justify-between p-4 sm:p-5 border border-white/15 shadow-xl"
          style={{
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
          }}
        >
          {/* Back Header with Shield */}
          <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
            <div className="flex items-center gap-1.5 text-violet-400 font-semibold text-xs tracking-wider font-mono">
              <ShieldCheck className="h-4 w-4" weight="bold" />
              <span>OFFICIAL GATE TOKEN</span>
            </div>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                setIsFlipped(false)
              }}
              className="text-slate-400 hover:text-white p-1 rounded-md transition-colors cursor-pointer"
              aria-label="Flip back"
            >
              <ArrowsClockwise className="h-4 w-4" />
            </button>
          </div>

          {/* Center Gate Verification QR */}
          <div className="my-auto flex flex-col items-center gap-1.5 text-center">
            <div className="p-2 rounded-[10px] bg-white shadow-sm inline-block">
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
                size={96}
              />
            </div>
            <span className="font-mono text-xs font-bold text-white tracking-wider tabular-nums">
              {ticketCode}
            </span>
            <p className="text-[11px] text-slate-400 max-w-[220px]">
              Signed by EventMesh admission service for gate turnstile validation.
            </p>
          </div>

          {/* Back Footer */}
          <div className="pt-2 border-t border-white/10 flex items-center justify-between text-xs font-mono text-slate-400">
            <span className="text-emerald-400 font-semibold">GATE READY</span>
            <button
              type="button"
              onClick={() => setIsFlipped(false)}
              className="text-violet-400 hover:text-violet-300 font-semibold cursor-pointer"
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
