import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { TearTicket } from './TearTicket'
import { CodeSlots } from './CodeSlots'
import { QRCode } from '@/design-system/primitives/QRCode'
import { formatDate } from '@/lib/dates'
import { formatTime } from '@/lib/format'
import {
  playGateAdmissionChime,
  playPaperTearSound,
  playTearImpulse,
} from '@/lib/sound'
import { fireCelebrationConfetti } from '@/lib/confetti'
import {
  CheckCircle,
  CalendarBlank,
  MapPin,
  QrCode,
  X,
  Ticket,
  ArrowsClockwise,
} from '@/design-system/Icon'
import { Scissors } from '@phosphor-icons/react'
import { cn } from '@/lib/utils'

export interface EventAdmissionTicketProps {
  registration: {
    id: string
    ticketCode?: string
    eventId?: string
    eventTitle?: string
    eventStartsAt?: string
    createdAt: string
    venueName?: string
    status: string
    userName?: string
    userEmail?: string
    checkedInAt?: string
    tierName?: string
    teamName?: string
    verificationToken?: string
  }
  state?: 'intact' | 'checked_in'
  demoMode?: boolean
  onAdmit?: () => void
  disabled?: boolean
  className?: string
  floatingCanvas?: boolean
  onClose?: () => void
}

/**
 * EventAdmissionTicket:
 * Centered, responsive digital admission pass with repeatable user-controlled visual tear
 * and permanent server-validated QR check-in redemption.
 *
 * CRITICAL DISCIPLINE: Visual tearing NEVER consumes admission or changes server state.
 * Only verified gate check-in transitions the pass into the permanent Admitted state.
 */
export const EventAdmissionTicket: React.FC<EventAdmissionTicketProps> = ({
  registration,
  state,
  demoMode = true,
  onAdmit,
  disabled = false,
  className = '',
  floatingCanvas = false,
  onClose,
}) => {
  // Authoritative server admission status
  const backendAdmitted = state ? state === 'checked_in' : registration.status === 'checked_in'

  // User-controlled tactile visual tear state (independent of server admission)
  const [isVisualTorn, setIsVisualTorn] = useState(false)

  const ticketCode = registration.ticketCode || `PASS-${registration.id.slice(0, 8).toUpperCase()}`
  const passSerial = registration.id.slice(0, 6).toUpperCase()

  // 6-digit gate OTP based on ticket code
  const rollingOtp = String(
    Math.abs(ticketCode.split('').reduce((acc, c) => acc * 31 + c.charCodeAt(0), 7) % 900000) + 100000
  ).slice(0, 6)

  // Standardized structured QR payload matching AdminCheckinPage validator
  const qrValue = JSON.stringify({
    v: 1,
    ticketId: ticketCode,
    code: ticketCode,
    registrationId: registration.id,
    eventId: registration.eventId || '',
    sig: `SIG_${registration.id.slice(0, 8)}`,
  })

  // Format admission timestamp
  const admissionTimestamp = registration.checkedInAt
    ? formatTime(registration.checkedInAt)
    : formatTime(new Date().toISOString())

  // User gesture: Trigger visual tear (repeatable, tactile only)
  const triggerVisualTear = () => {
    if (backendAdmitted || isVisualTorn || disabled) return
    playPaperTearSound()
    playTearImpulse()
    setIsVisualTorn(true)
  }

  // User gesture: Reset visual tear (repeatable before admission)
  const resetVisualTear = () => {
    if (backendAdmitted) return
    setIsVisualTorn(false)
  }

  // Real-time venue gate listener: When volunteer scanner records check-in at /admin/checkin
  useEffect(() => {
    let channel: BroadcastChannel | null = null
    try {
      channel = new BroadcastChannel('eventmesh_gate_admission')
      channel.onmessage = (event) => {
        if (event.data?.registrationId === registration.id || event.data?.ticketCode === ticketCode) {
          playGateAdmissionChime()
          fireCelebrationConfetti()
          if (onAdmit) onAdmit()
        }
      }
    } catch {}

    const handleCustomAdmitted = (e: any) => {
      if (e.detail?.registrationId === registration.id || e.detail?.ticketCode === ticketCode) {
        playGateAdmissionChime()
        fireCelebrationConfetti()
        if (onAdmit) onAdmit()
      }
    }
    window.addEventListener('eventmesh_gate_admitted', handleCustomAdmitted)

    return () => {
      channel?.close()
      window.removeEventListener('eventmesh_gate_admitted', handleCustomAdmitted)
    }
  }, [registration.id, ticketCode, onAdmit])

  // ESC key listener for floating canvas
  useEffect(() => {
    if (!floatingCanvas || !onClose) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [floatingCanvas, onClose])

  // Effective torn display state for the TearTicket component
  const isPhysicallyTorn = backendAdmitted ? false : isVisualTorn

  const content = (
    <div className={cn('relative select-none flex flex-col items-center max-w-full', className)}>
      {/* Screen Reader Announcement */}
      <div className="sr-only" aria-live="polite">
        {backendAdmitted
          ? `Ticket validated. Admitted to ${registration.eventTitle || 'event'} at ${admissionTimestamp}.`
          : `Ticket intact. Present QR code to venue coordinator.`}
      </div>

      {/* Centered Ticket Stage with Responsive Scaling Container */}
      <div className="w-full max-w-[880px] overflow-visible flex justify-center items-center py-4 my-auto">
        <TearTicket
          width={840}
          height={360}
          stubSize={260}
          radius={16}
          holes={14}
          holeSize={7}
          notch={8}
          roughness={0.7}
          tearAngle={24}
          stretch={22}
          resistance={0.2}
          tilt={true}
          tiltMax={5}
          torn={isPhysicallyTorn}
          disabled={backendAdmitted || disabled}
          background="var(--card)"
          stubBackground="#151130"
          color="var(--ink)"
          borderColor="var(--line)"
          borderWidth={1.5}
          className="shadow-2xl mx-auto"
          onTear={triggerVisualTear}
          stub={
            /* Physical Gate Stub */
            <div
              onClick={!backendAdmitted && !isVisualTorn ? triggerVisualTear : undefined}
              className={cn(
                'h-full flex flex-col justify-between items-center text-center p-4 font-mono bg-[#14111D] text-white select-none relative',
                !backendAdmitted && !isVisualTorn ? 'cursor-pointer hover:bg-[#1D1929] transition-colors' : ''
              )}
              title={
                backendAdmitted
                  ? 'Official venue admission record'
                  : 'Click or drag to test paper tear'
              }
            >
              {/* Stub Header */}
              <div className="w-full border-b border-white/15 pb-2 flex items-center justify-between">
                <span className="text-[10px] tracking-widest text-accent font-bold uppercase">
                  GATE STUB
                </span>
                <span className="text-[10px] text-white/60 font-mono">
                  #{passSerial}
                </span>
              </div>

              {/* Center OTP & Check-in Status */}
              <div className="my-auto w-full space-y-2">
                <div>
                  <p className="text-xs font-bold text-white tracking-wider">
                    {ticketCode}
                  </p>
                  <p className="text-[9px] text-white/60 uppercase tracking-wider">
                    VENUE ENTRY OTP
                  </p>
                </div>

                {/* 6-Digit Gate OTP Slots */}
                <div className="flex justify-center">
                  <CodeSlots
                    value={rollingOtp}
                    length={6}
                    status={backendAdmitted ? 'success' : 'idle'}
                    slotSize={20}
                    radius={4}
                    gap={3}
                    className="bg-black/40 border border-white/20 px-2 py-1 text-white text-xs font-mono"
                  />
                </div>

                {/* Status Indicator Pill */}
                <div className="pt-1">
                  {backendAdmitted ? (
                    <div className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-500/20 text-emerald-400 text-[10px] font-bold tracking-wider rounded-full border border-emerald-500/40">
                      <CheckCircle size={13} weight="bold" />
                      <span>ADMITTED ✓</span>
                    </div>
                  ) : isVisualTorn ? (
                    <div className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-accent/20 text-accent text-[9px] font-mono rounded-full border border-accent/40">
                      <span>TORN (TEST)</span>
                    </div>
                  ) : (
                    <div className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-white/10 text-white/80 text-[9px] font-mono rounded-full">
                      <span>VENUE GATE READY</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Stub Footer */}
              <div className="text-[9px] text-white/50 border-t border-dashed border-white/15 pt-2 w-full flex items-center justify-between font-mono">
                <span className="text-[8px] text-amber-400 font-bold tracking-tight">✁ PULL OR TAP STUB</span>
                <span className="font-bold text-white/80">
                  {backendAdmitted ? 'VALIDATED' : isVisualTorn ? 'TORN' : 'INTACT'}
                </span>
              </div>
            </div>
          }
        >
          {/* Main Pass Body (Clean Alabaster Surface) */}
          <div className="h-full p-5 sm:p-6 flex flex-col justify-between bg-card text-ink select-none relative overflow-hidden">
            {/* Top Bar */}
            <div className="flex items-center justify-between border-b border-line pb-2.5">
              <div className="flex items-center gap-2">
                <span className="font-sans font-bold text-xs uppercase px-2.5 py-0.5 bg-ink text-paper rounded-md">
                  EVENTMESH
                </span>
                <span className="text-xs font-mono text-ink-soft uppercase font-semibold">
                  {registration.tierName || 'GENERAL PASS'}
                </span>
                {registration.teamName && (
                  <span className="px-2 py-0.5 rounded-md bg-accent/10 text-accent font-mono text-[10px] font-semibold">
                    TEAM: {registration.teamName}
                  </span>
                )}
              </div>

              <div>
                {backendAdmitted ? (
                  <span className="text-xs font-mono uppercase px-2.5 py-0.5 bg-emerald-50 text-emerald-700 font-bold rounded-full border border-emerald-200 flex items-center gap-1">
                    <CheckCircle size={13} weight="bold" />
                    VERIFIED
                  </span>
                ) : (
                  <span className="text-xs font-mono uppercase px-2.5 py-0.5 bg-surface-subtle text-ink-soft font-medium rounded-full border border-line">
                    ACTIVE
                  </span>
                )}
              </div>
            </div>

            {/* Middle Section: Scannable QR Code + Event Details */}
            <div className="flex items-center gap-5 py-2">
              {/* High-Contrast Scannable QR Card */}
              <div className="shrink-0 p-2 bg-white rounded-xl border border-line shadow-xs">
                <QRCode
                  value={qrValue}
                  size={92}
                />
              </div>

              {/* Event Metadata */}
              <div className="flex-1 min-w-0 space-y-1.5">
                <h3 className="font-sans font-bold text-lg sm:text-xl text-ink leading-tight line-clamp-2 tracking-tight">
                  {registration.eventTitle || 'Campus Flagship Event'}
                </h3>

                <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-xs font-mono text-ink-soft">
                  <span className="inline-flex items-center gap-1.5 font-medium text-ink">
                    <CalendarBlank size={13} weight="bold" className="text-accent" />
                    {formatDate(registration.eventStartsAt || registration.createdAt, 'EEE, MMM d, yyyy')}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <MapPin size={13} weight="bold" className="text-ink-soft" />
                    <span className="truncate">{registration.venueName || 'Main Campus Venue'}</span>
                  </span>
                </div>

                <div className="flex items-center gap-2 pt-0.5 text-xs text-ink">
                  <div className="w-5 h-5 rounded-full bg-accent text-white text-[10px] font-bold flex items-center justify-center">
                    {registration.userName ? registration.userName.charAt(0).toUpperCase() : 'S'}
                  </div>
                  <span className="text-ink-soft">
                    Attendee: <strong className="text-ink">{registration.userName || 'Student'}</strong>
                  </span>
                  <span className="text-ink-muted font-mono text-[11px] border-l border-line pl-2">
                    {passSerial}
                  </span>
                </div>
              </div>
            </div>

            {/* Bottom Bar */}
            <div className="pt-2 border-t border-line flex items-center justify-between text-xs font-mono text-ink-soft">
              <span className="tracking-wide text-accent font-semibold">{ticketCode}</span>
              <div className="flex items-center gap-1.5 text-ink-soft">
                <QrCode size={13} weight="bold" className="text-accent" />
                <span>OFFICIAL GATE SCAN READY</span>
              </div>
            </div>

            {/* Permanent Verified Admission Seal (renders only when backendAdmitted is true) */}
            <AnimatePresence>
              {backendAdmitted && (
                <motion.div
                  initial={{ scale: 1.8, opacity: 0, rotate: -15 }}
                  animate={{ scale: 1, opacity: 1, rotate: -4 }}
                  transition={{ type: 'spring', stiffness: 280, damping: 20 }}
                  className="absolute inset-0 flex items-center justify-center pointer-events-none z-20"
                >
                  <div className="px-6 py-2.5 rounded-xl border-2 border-emerald-500 bg-white/95 text-emerald-600 font-sans text-sm font-bold tracking-wider shadow-lg flex items-center gap-2">
                    <CheckCircle size={18} weight="bold" />
                    <span>ADMITTED AT {admissionTimestamp}</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </TearTicket>
      </div>

      {/* Visual Tear Feedback indicator (Only when stub is torn in preview) */}
      {!backendAdmitted && isVisualTorn && (
        <div className="mt-3 flex items-center gap-3">
          <button
            type="button"
            onClick={resetVisualTear}
            className="px-3 py-1 rounded-full bg-card hover:bg-surface-subtle text-ink text-xs font-mono flex items-center gap-1.5 transition-colors border border-line shadow-xs"
            aria-label="Restore intact pass stub"
          >
            <ArrowsClockwise size={13} weight="bold" />
            <span>Restore Stub</span>
          </button>
        </div>
      )}
    </div>
  )

  // Floating Overlay Presentation (Deep Darkened Backdrop with Crisp Focus Blur)
  if (floatingCanvas) {
    return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-8 bg-black/85 backdrop-blur-md overflow-y-auto select-none transition-all"
        onClick={(e) => {
          if (e.target === e.currentTarget && onClose) onClose()
        }}
        role="dialog"
        aria-modal="true"
        aria-label="Official Admission Ticket"
      >
        {/* Floating Close Button */}
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="fixed top-6 right-6 z-50 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-card/95 text-ink border-2 border-line hover:border-accent hover:text-accent text-xs font-mono font-medium shadow-lg hover:shadow-xl transition-all active:scale-95 focus-visible:outline-2 focus-visible:outline-accent"
          >
            <span>Close Pass</span>
            <kbd className="px-1.5 py-0.5 rounded bg-surface-subtle text-[10px] text-ink-soft font-mono">ESC</kbd>
            <X size={14} weight="bold" />
          </button>
        )}

        <div className="my-auto py-6 animate-in fade-in zoom-in-95 duration-200 w-full flex justify-center">
          {content}
        </div>
      </div>
    )
  }

  return content
}

export default EventAdmissionTicket
