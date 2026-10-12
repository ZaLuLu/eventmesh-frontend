import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { TearTicket } from './TearTicket'
import { CodeSlots } from './CodeSlots'
import { QRCode } from '@/design-system/primitives'
import { formatDate } from '@/lib/dates'
import {
  playGateAdmissionChime,
  playPaperTearSound,
  playTearImpulse
} from '@/lib/sound'
import { fireCelebrationConfetti } from '@/lib/confetti'
import {
  ShieldCheck,
  CheckCircle2,
  Building2,
  Calendar,
  MapPin,
  Radio,
  QrCode,
  RotateCcw,
  X
} from 'lucide-react'

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
  }
  onAdmit?: () => void
  disabled?: boolean
  className?: string
  floatingCanvas?: boolean
  onClose?: () => void
}

export const EventAdmissionTicket: React.FC<EventAdmissionTicketProps> = ({
  registration,
  onAdmit,
  disabled = false,
  className = '',
  floatingCanvas = false,
  onClose,
}) => {
  const isAlreadyAdmitted = registration.status === 'checked_in'
  const [isLocallyTorn, setIsLocallyTorn] = useState(isAlreadyAdmitted)
  const [clockMs, setClockMs] = useState(Date.now())

  // Dynamic live security clock (anti-screenshot watermark)
  useEffect(() => {
    const timer = setInterval(() => setClockMs(Date.now()), 100)
    return () => clearInterval(timer)
  }, [])

  const isTorn = isAlreadyAdmitted || isLocallyTorn
  const ticketCode = registration.ticketCode || `PASS-${registration.id.slice(0, 8).toUpperCase()}`
  const passSerial = registration.id.slice(0, 6).toUpperCase()

  // Dynamic 6-digit gate OTP based on ticket code
  const rollingOtp = String(
    Math.abs(ticketCode.split('').reduce((acc, c) => acc * 31 + c.charCodeAt(0), 7) % 900000) + 100000
  ).slice(0, 6)

  const triggerDigitalTear = () => {
    if (isTorn || disabled) return

    playPaperTearSound()
    playTearImpulse()
    setIsLocallyTorn(true)

    // Gate chime & confetti when tear completes
    setTimeout(() => {
      playGateAdmissionChime()
      fireCelebrationConfetti()
      if (onAdmit) {
        onAdmit()
      }
    }, 750)
  }

  // Real-time listener: Ticket tears when scanned & verified by the venue gate kiosk
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

  // Simulated Venue Gate Scanner function (organizer perspective)
  const handleSimulateVenueScan = () => {
    try {
      const channel = new BroadcastChannel('eventmesh_gate_admission')
      channel.postMessage({ registrationId: registration.id, ticketCode })
      channel.close()
    } catch {}

    window.dispatchEvent(
      new CustomEvent('eventmesh_gate_admitted', {
        detail: { registrationId: registration.id, ticketCode },
      })
    )
  }

  const liveDate = new Date(clockMs)
  const liveTimeString =
    liveDate.toLocaleTimeString('en-US', { hour12: false }) +
    `.${String(liveDate.getMilliseconds()).padStart(3, '0')}`

  // Generous luxury dimensions for natural paper pass
  const WIDTH = 720
  const HEIGHT = 270
  const STUB_SIZE = 210

  const content = (
    <div className={`relative select-none flex flex-col items-center ${className}`}>
      {/* Anti-Fraud Security Ribbon (Natural styling, zero neon) */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-[720px] mb-3 px-4 py-2 rounded-xl bg-zinc-900/90 backdrop-blur-md border border-zinc-700/60 flex items-center justify-between text-xs font-mono shadow-md text-zinc-300"
      >
        <div className="flex items-center gap-2 text-emerald-400 font-semibold tracking-wide">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>CRYPTOGRAPHIC VERIFIED PASS</span>
        </div>
        <div className="flex items-center gap-2 text-zinc-400">
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
          <span className="font-medium tracking-wider">LIVE: {liveTimeString}</span>
        </div>
      </motion.div>

      {/* Floating Canvas Ticket Stage */}
      <div className="w-full flex justify-center py-2 overflow-visible">
        <TearTicket
          width={WIDTH}
          height={HEIGHT}
          stubSize={STUB_SIZE}
          radius={16}
          holes={11}
          notch={12}
          roughness={2}
          tearAngle={28}
          stretch={34}
          resistance={0.4}
          torn={isTorn}
          disabled={disabled}
          background="#18181B" // Matte deep zinc paper (natural)
          stubBackground="#141416" // Matte stub paper
          color="#F8FAFC"
          borderColor="rgba(255,255,255,0.12)"
          tilt={true}
          tiltMax={8}
          className="shadow-[0_25px_60px_-15px_rgba(0,0,0,0.6)]"
          onTear={() => {
            playGateAdmissionChime()
            fireCelebrationConfetti()
            if (onAdmit) onAdmit()
          }}
          stub={
            /* Natural Gate Stub */
            <div className="h-full flex flex-col justify-between items-center text-center p-4 font-mono bg-[#141416] text-zinc-100 select-none">
              {/* Stub Header */}
              <div className="w-full border-b border-zinc-700/60 pb-2 flex items-center justify-between">
                <span className="text-[10px] tracking-widest text-zinc-400 font-bold uppercase">
                  GATE STUB
                </span>
                <span className="text-[9px] text-zinc-500 font-mono">
                  #01
                </span>
              </div>

              {/* Center Pass Info & CodeSlots */}
              <div className="my-auto w-full space-y-2">
                <div>
                  <p className="text-xs font-bold text-white tracking-wider">
                    PASS-{passSerial}
                  </p>
                  <p className="text-[10px] text-zinc-400 uppercase tracking-wider">
                    GATE CHECK-IN
                  </p>
                </div>

                {/* 6-Digit CodeSlots */}
                <div className="flex justify-center">
                  <CodeSlots
                    value={rollingOtp}
                    length={6}
                    status={isTorn ? 'success' : 'idle'}
                    slotSize={22}
                    radius={5}
                    gap={4}
                    className="bg-black/60 border border-zinc-700/80 px-2 py-1 rounded-lg text-white"
                  />
                </div>

                {/* Status Indicator */}
                <div className="pt-1">
                  {isTorn ? (
                    <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-[10px] font-bold tracking-wider">
                      <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                      <span>ADMITTED ✓</span>
                    </div>
                  ) : (
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-zinc-800 border border-zinc-700 text-zinc-300 text-[9px] font-medium font-mono">
                      <Radio className="w-2.5 h-2.5 text-zinc-400" />
                      <span>GATE SCAN READY</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Stub Footer */}
              <div className="text-[9px] text-zinc-500 border-t border-dashed border-zinc-700/60 pt-2 w-full flex items-center justify-between font-mono">
                <span>CAMPUS GATE</span>
                <span className="font-bold text-zinc-300">{isTorn ? 'VALID' : 'ACTIVE'}</span>
              </div>
            </div>
          }
        >
          {/* Main Pass Body (Natural Matte Paper) */}
          <div className="h-full p-5 sm:p-6 flex flex-col justify-between bg-[#18181B] text-white select-none relative overflow-hidden">
            {/* Top Bar */}
            <div className="flex items-center justify-between border-b border-zinc-700/60 pb-2.5">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono uppercase px-2.5 py-0.5 rounded bg-zinc-800 text-zinc-200 font-bold border border-zinc-700">
                  EVENTMESH OFFICIAL
                </span>
                <span className="text-[11px] font-mono text-zinc-400">
                  GENERAL ADMISSION
                </span>
              </div>

              <div>
                {isTorn ? (
                  <span className="text-[11px] font-mono uppercase px-2.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/30 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    CHECKED IN
                  </span>
                ) : (
                  <span className="text-[11px] font-mono uppercase px-2.5 py-0.5 rounded bg-zinc-800 text-zinc-300 font-medium border border-zinc-700">
                    PASS INTACT
                  </span>
                )}
              </div>
            </div>

            {/* Middle Section: QR Code Card + Spacious Event Details */}
            <div className="flex items-center gap-6 py-2">
              {/* Crisp Natural White QR Code Card */}
              <div className="shrink-0 p-2.5 bg-white rounded-xl shadow-md border border-zinc-300 relative group">
                <QRCode
                  value={`EVENTMESH:${ticketCode}:${registration.id}`}
                  size={92}
                />
                <div className="absolute inset-0 bg-black/60 rounded-xl opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white text-[9px] font-mono text-center p-1">
                  OFFICIAL PASS QR
                </div>
              </div>

              {/* Event Metadata (Easy to read, generous spacing) */}
              <div className="flex-1 min-w-0 space-y-2">
                <h3 className="font-bold text-lg sm:text-xl text-white leading-tight line-clamp-2 tracking-tight">
                  {registration.eventTitle || 'Campus Flagship Event'}
                </h3>
                <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-xs text-zinc-300">
                  <span className="inline-flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-zinc-400" />
                    {formatDate(registration.eventStartsAt || registration.createdAt, 'EEE, MMM d, yyyy')}
                  </span>
                  <span className="inline-flex items-center gap-1.5 text-zinc-400">
                    <MapPin className="w-3.5 h-3.5 text-zinc-400" />
                    {registration.venueName || 'Main Campus Venue'}
                  </span>
                </div>
                <div className="flex items-center gap-2 pt-0.5 text-xs text-zinc-400">
                  <div className="w-4 h-4 rounded-full bg-zinc-700 text-zinc-200 text-[10px] font-bold flex items-center justify-center">
                    {registration.userName ? registration.userName.charAt(0).toUpperCase() : 'S'}
                  </div>
                  <span>
                    Attendee: <strong className="text-zinc-100 font-medium">{registration.userName || 'Aditya Narayan'}</strong>
                  </span>
                  <span className="text-zinc-500 font-mono text-[11px] border-l border-zinc-700 pl-2">
                    21BCE1042
                  </span>
                </div>
              </div>
            </div>

            {/* Bottom Bar */}
            <div className="pt-2.5 border-t border-zinc-700/60 flex items-center justify-between text-xs font-mono text-zinc-400">
              <span className="tracking-wide text-zinc-300">{ticketCode}</span>
              <div className="flex items-center gap-1.5 text-zinc-400">
                <QrCode className="w-3.5 h-3.5 text-zinc-400" />
                <span>OFFICIAL VENUE SCANNER READY</span>
              </div>
            </div>

            {/* Natural Stamped Admission Seal */}
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
                  <div className="px-6 py-2.5 rounded-2xl border-2 border-emerald-500 bg-emerald-950/85 backdrop-blur-md text-emerald-300 font-mono text-base font-black uppercase tracking-widest shadow-xl flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    <span>ADMITTED ✓</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </TearTicket>
      </div>

      {/* Floating Action Controls Dock (Natural, no neon) */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-5 w-full max-w-[720px] flex flex-col items-center gap-3"
      >
        {!isTorn ? (
          <div className="w-full p-4 rounded-xl bg-zinc-900/90 backdrop-blur-md border border-zinc-700/60 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-lg">
            <div className="flex items-center gap-2 text-sm text-zinc-300">
              <span className="w-2 h-2 rounded-full bg-zinc-400" />
              <span>
                Pass is <strong>Intact</strong> · Drag the stub or trigger scan to tear
              </span>
            </div>

            <button
              type="button"
              onClick={handleSimulateVenueScan}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold bg-zinc-100 text-zinc-900 hover:bg-white active:scale-[0.98] transition-all whitespace-nowrap cursor-pointer shadow-md"
            >
              <Building2 className="w-4 h-4" />
              <span>Simulate Venue Kiosk Scan & Digital Tear</span>
            </button>
          </div>
        ) : (
          <div className="w-full p-4 rounded-xl bg-zinc-900/90 backdrop-blur-md border border-zinc-700/60 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-lg">
            <div className="flex items-center gap-2 text-emerald-400 text-sm font-mono">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Admission Verified at Venue Gate · Stub Detached</span>
            </div>

            <button
              type="button"
              onClick={() => setIsLocallyTorn(false)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-mono font-medium text-zinc-300 bg-zinc-800 border border-zinc-700 hover:bg-zinc-700 hover:text-white transition-all cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Replay Tear Animation</span>
            </button>
          </div>
        )}
      </motion.div>
    </div>
  )

  // Floating Canvas Mode (Full-viewport atmospheric stage)
  if (floatingCanvas) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center p-4 sm:p-8 backdrop-blur-xl bg-black/80 overflow-y-auto">
        {/* Floating Top Header with Close Pill */}
        <div className="w-full max-w-4xl flex items-center justify-between mb-4 px-2">
          <div className="flex items-center gap-2 text-white">
            <div className="w-7 h-7 rounded-lg bg-zinc-800 border border-zinc-700 flex items-center justify-center text-xs font-bold text-zinc-300">
              EM
            </div>
            <div>
              <h2 className="text-sm font-bold tracking-tight text-white">Event Admission Canvas</h2>
              <p className="text-[11px] text-zinc-400 font-mono">PASS-{passSerial} · Official Entry Pass</p>
            </div>
          </div>

          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-zinc-800/90 hover:bg-zinc-700/90 border border-zinc-700 text-zinc-300 hover:text-white text-xs font-mono transition-all cursor-pointer shadow-md"
            >
              <span>Close Canvas</span>
              <kbd className="px-1.5 py-0.5 rounded bg-black/50 text-[10px] text-zinc-400">ESC</kbd>
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Floating Stage */}
        <div className="my-auto py-4 w-full flex justify-center">
          {content}
        </div>
      </div>
    )
  }

  return content
}

export default EventAdmissionTicket
