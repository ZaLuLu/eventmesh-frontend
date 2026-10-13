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
  Scissors,
  WarningCircle,
} from '@phosphor-icons/react'
import { Sticker } from '@/design-system/primitives/Sticker'

export interface EventAdmissionTicketProps {
  registration: {
    id: string
    ticketCode?: string
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

export const EventAdmissionTicket: React.FC<EventAdmissionTicketProps> = ({
  registration,
  state,
  demoMode = false,
  onAdmit,
  disabled = false,
  className = '',
  floatingCanvas = false,
  onClose,
}) => {
  const backendAdmitted = state ? state === 'checked_in' : registration.status === 'checked_in'
  const [isLocallyTorn, setIsLocallyTorn] = useState(backendAdmitted)

  // Sync with prop changes
  useEffect(() => {
    if (backendAdmitted) {
      setIsLocallyTorn(true)
    }
  }, [backendAdmitted])

  const isTorn = backendAdmitted || isLocallyTorn
  const ticketCode = registration.ticketCode || `PASS-${registration.id.slice(0, 8).toUpperCase()}`
  const passSerial = registration.id.slice(0, 6).toUpperCase()

  // 6-digit gate OTP based on ticket code
  const rollingOtp = String(
    Math.abs(ticketCode.split('').reduce((acc, c) => acc * 31 + c.charCodeAt(0), 7) % 900000) + 100000
  ).slice(0, 6)

  // QR Code payload: signed token from backend or structured standard
  const qrValue = registration.verificationToken || `EVENTMESH:${ticketCode}:${registration.id}`

  // Format admission timestamp
  const admissionTimestamp = registration.checkedInAt
    ? formatTime(registration.checkedInAt)
    : formatTime(new Date().toISOString())

  const triggerDigitalTear = () => {
    if (isTorn || disabled) return

    playPaperTearSound()
    playTearImpulse()
    setIsLocallyTorn(true)

    // Gate chime & confetti upon scan completion
    setTimeout(() => {
      playGateAdmissionChime()
      fireCelebrationConfetti()
      if (onAdmit) {
        onAdmit()
      }
    }, 750)
  }

  // Real-time venue gate listener: tears when volunteer scanner hits /admin/checkin
  useEffect(() => {
    let channel: BroadcastChannel | null = null
    try {
      channel = new BroadcastChannel('eventmesh_gate_admission')
      channel.onmessage = (event) => {
        if (event.data?.registrationId === registration.id || event.data?.ticketCode === ticketCode) {
          triggerDigitalTear()
        }
      }
    } catch {}

    const handleCustomAdmitted = (e: any) => {
      if (e.detail?.registrationId === registration.id || e.detail?.ticketCode === ticketCode) {
        triggerDigitalTear()
      }
    }
    window.addEventListener('eventmesh_gate_admitted', handleCustomAdmitted)

    return () => {
      channel?.close()
      window.removeEventListener('eventmesh_gate_admitted', handleCustomAdmitted)
    }
  }, [registration.id, ticketCode, isTorn, disabled])

  // ESC key listener for floating canvas
  useEffect(() => {
    if (!floatingCanvas || !onClose) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [floatingCanvas, onClose])

  // Dimensions for natural collegiate paper pass
  const WIDTH = 720
  const HEIGHT = 280
  const STUB_SIZE = 220

  const content = (
    <div className={`relative select-none flex flex-col items-center ${className}`}>
      {/* Accessibility Status Region (F-15) */}
      <div className="sr-only" aria-live="polite">
        {isTorn
          ? `Ticket validated. Admitted to ${registration.eventTitle || 'event'} at ${admissionTimestamp}.`
          : `Ticket intact. Present QR code to venue gate volunteer.`}
      </div>

      {/* Floating Canvas Ticket Stage */}
      <div className="w-full flex justify-center py-2 overflow-visible">
        <TearTicket
          width={WIDTH}
          height={HEIGHT}
          stubSize={STUB_SIZE}
          radius={16}
          holes={11}
          notch={14}
          roughness={2}
          tearAngle={28}
          stretch={34}
          resistance={0.4}
          torn={isTorn}
          disabled={disabled || (!demoMode && !isTorn)}
          background="#FFFDF8" // Warm cardstock paper
          stubBackground="#0047FF" // Electric Cobalt gate stub
          color="#151130"
          borderColor="#151130"
          borderWidth={1.5}
          tilt={true}
          tiltMax={5}
          className="shadow-[4px_4px_0_#151130]"
          onTear={() => {
            playGateAdmissionChime()
            fireCelebrationConfetti()
            if (onAdmit) onAdmit()
          }}
          stub={
            /* Physical Gate Stub */
            <div
              onClick={demoMode && !isTorn && !disabled ? triggerDigitalTear : undefined}
              className={`h-full flex flex-col justify-between items-center text-center p-4 font-mono bg-cobalt text-white select-none relative ${
                demoMode && !isTorn && !disabled ? 'cursor-pointer hover:bg-[#0037CC] transition-colors' : ''
              }`}
              title={
                demoMode && !isTorn && !disabled
                  ? 'Click to simulate gate check-in tear'
                  : 'Official venue check-in stub'
              }
            >
              {/* Stub Header */}
              <div className="w-full border-b border-white/20 pb-2 flex items-center justify-between">
                <span className="text-[10px] tracking-widest text-white/90 font-bold uppercase">
                  GATE STUB
                </span>
                <span className="text-[9px] text-white/70 font-mono">
                  #{passSerial}
                </span>
              </div>

              {/* Center OTP & Check-in Details */}
              <div className="my-auto w-full space-y-2">
                <div>
                  <p className="text-xs font-bold text-white tracking-wider">
                    {ticketCode}
                  </p>
                  <p className="text-[10px] text-white/80 uppercase tracking-wider">
                    VENUE CHECK-IN OTP
                  </p>
                </div>

                {/* 6-Digit Gate OTP Slots */}
                <div className="flex justify-center">
                  <CodeSlots
                    value={rollingOtp}
                    length={6}
                    status={isTorn ? 'success' : 'idle'}
                    slotSize={22}
                    radius={4}
                    gap={4}
                    className="bg-black/30 border border-white/30 px-2 py-1 text-white"
                  />
                </div>

                {/* Status Indicator */}
                <div className="pt-1">
                  {isTorn ? (
                    <div className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-mint text-ink text-[10px] font-bold tracking-wider rounded-full border border-ink shadow-[1px_1px_0_#151130]">
                      <CheckCircle className="w-3.5 h-3.5" weight="bold" />
                      <span>ADMITTED ✓</span>
                    </div>
                  ) : demoMode ? (
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-white/15 border border-white/30 text-white text-[9px] font-medium font-mono hover:bg-white/25 transition-colors rounded-full">
                      <Scissors className="w-3 h-3" />
                      <span>CLICK TO TEAR (DEMO)</span>
                    </div>
                  ) : (
                    <div className="inline-flex items-center gap-1 px-2 py-0.5 bg-black/20 text-white/90 text-[9px] font-mono rounded-full">
                      <span>GATE VOLUNTEER SCAN</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Stub Footer */}
              <div className="text-[9px] text-white/70 border-t border-dashed border-white/20 pt-2 w-full flex items-center justify-between font-mono">
                <span>CAMPUS GATE</span>
                <span className="font-bold text-white">{isTorn ? 'TORN / ADMITTED' : 'INTACT'}</span>
              </div>
            </div>
          }
        >
          {/* Main Pass Body (Natural Warm Paper #FFFDF8) */}
          <div className="h-full p-5 sm:p-6 flex flex-col justify-between bg-card text-ink select-none relative overflow-hidden">
            {/* Top Bar */}
            <div className="flex items-center justify-between border-b border-ink/15 pb-2.5">
              <div className="flex items-center gap-2">
                <span className="font-display font-black text-xs uppercase px-2 py-0.5 bg-cobalt text-white border border-ink shadow-[1px_1px_0_#151130]">
                  EVENTMESH
                </span>
                <span className="text-xs font-mono text-ink-soft uppercase font-semibold">
                  {registration.tierName || 'GENERAL ADMISSION'}
                </span>
                {registration.teamName && (
                  <Sticker color="tangerine" size="sm" className="font-mono text-[9px]">
                    TEAM: {registration.teamName}
                  </Sticker>
                )}
              </div>

              <div>
                {isTorn ? (
                  <span className="text-xs font-mono uppercase px-2.5 py-0.5 bg-mint text-ink font-bold border border-ink shadow-[1px_1px_0_#151130] flex items-center gap-1">
                    <CheckCircle className="w-3.5 h-3.5" weight="bold" />
                    ADMITTED
                  </span>
                ) : (
                  <span className="text-xs font-mono uppercase px-2 py-0.5 bg-paper text-ink font-semibold border border-ink/30">
                    PASS INTACT
                  </span>
                )}
              </div>
            </div>

            {/* Middle Section: Integrated QR Code + Event Details */}
            <div className="flex items-center gap-6 py-2">
              {/* Crisp Natural Paper QR Code Card (Mandate 1: QR on ticket face) */}
              <div className="shrink-0 p-2.5 bg-white border-1.5 border-ink relative group shadow-[2px_2px_0_#151130]">
                <QRCode
                  value={qrValue}
                  size={96}
                />
              </div>

              {/* Event Metadata */}
              <div className="flex-1 min-w-0 space-y-1.5">
                <h3 className="font-display font-extrabold text-lg sm:text-xl text-ink leading-tight line-clamp-2 tracking-tight">
                  {registration.eventTitle || 'Campus Flagship Event'}
                </h3>
                <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-xs text-ink-soft">
                  <span className="inline-flex items-center gap-1.5 font-medium">
                    <CalendarBlank className="w-3.5 h-3.5 text-cobalt" weight="bold" />
                    {formatDate(registration.eventStartsAt || registration.createdAt, 'EEE, MMM d, yyyy')}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-ink-soft" weight="bold" />
                    {registration.venueName || 'Main Campus Venue'}
                  </span>
                </div>
                <div className="flex items-center gap-2 pt-0.5 text-xs text-ink">
                  <div className="w-5 h-5 rounded-full bg-cobalt text-white text-[10px] font-bold flex items-center justify-center">
                    {registration.userName ? registration.userName.charAt(0).toUpperCase() : 'S'}
                  </div>
                  <span>
                    Attendee: <strong>{registration.userName || 'Aditya Narayan'}</strong>
                  </span>
                  <span className="text-ink-soft font-mono text-[11px] border-l border-ink/20 pl-2">
                    21BCE1042
                  </span>
                </div>
              </div>
            </div>

            {/* Bottom Bar */}
            <div className="pt-2 border-t border-ink/15 flex items-center justify-between text-xs font-mono text-ink-soft">
              <span className="tracking-wide text-cobalt font-bold">{ticketCode}</span>
              <div className="flex items-center gap-1.5 text-ink-soft">
                <QrCode className="w-3.5 h-3.5 text-cobalt" weight="bold" />
                <span>OFFICIAL GATE SCAN READY</span>
              </div>
            </div>

            {/* Natural Stamped Paper Admission Seal (Zero neon or sci-fi glow, Mandate 1) */}
            <AnimatePresence>
              {isTorn && (
                <motion.div
                  initial={{ scale: 2.2, opacity: 0, rotate: -20 }}
                  animate={{ scale: 1, opacity: 1, rotate: -6 }}
                  transition={{
                    type: 'spring',
                    stiffness: 280,
                    damping: 18,
                    delay: 0.15,
                  }}
                  className="absolute inset-0 flex items-center justify-center pointer-events-none z-20"
                >
                  <div className="px-6 py-2.5 border-3 border-cobalt bg-paper/95 text-cobalt font-display text-base font-black uppercase tracking-widest shadow-[3px_3px_0_#0047FF] flex items-center gap-2 rotate-[-5deg]">
                    <CheckCircle className="w-5 h-5 text-cobalt" weight="bold" />
                    <span>ADMITTED AT {admissionTimestamp}</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </TearTicket>
      </div>

      {/* Accessible Alternative Action Button (F-15) */}
      {demoMode && !isTorn && (
        <div className="mt-3 flex items-center gap-2">
          <button
            type="button"
            onClick={triggerDigitalTear}
            className="btn-funk-secondary text-xs px-3 py-1.5 flex items-center gap-1.5"
            aria-label="Tear stub and simulate admission"
          >
            <Scissors className="w-3.5 h-3.5" />
            <span>Tear stub (Demo / Accessibility fallback)</span>
          </button>
        </div>
      )}
    </div>
  )

  // Floating Canvas Mode (Suspended in paper darkroom overlay)
  if (floatingCanvas) {
    return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-8 backdrop-blur-md bg-ink/80 overflow-y-auto"
        onClick={(e) => {
          if (e.target === e.currentTarget && onClose) onClose()
        }}
        role="dialog"
        aria-modal="true"
        aria-label="Official Admission Ticket"
      >
        {/* Minimalist Floating Close Pill */}
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="fixed top-6 right-6 z-50 inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-paper text-ink border border-ink hover:bg-white text-xs font-mono transition-all cursor-pointer shadow-[2px_2px_0_#151130]"
          >
            <span>Close</span>
            <kbd className="px-1.5 py-0.5 rounded bg-ink/10 text-[10px] text-ink font-semibold">ESC</kbd>
            <X className="w-3.5 h-3.5" />
          </button>
        )}

        {/* Floating Ticket Suspended in Canvas */}
        <div className="my-auto py-6 animate-in fade-in zoom-in-95 duration-300">
          {content}
        </div>
      </div>
    )
  }

  return content
}

export default EventAdmissionTicket
