import React, { useState, useEffect } from 'react'
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
  CheckCircle2,
  Calendar,
  MapPin,
  Radio,
  QrCode,
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

  // ESC key to close floating canvas
  useEffect(() => {
    if (!floatingCanvas || !onClose) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [floatingCanvas, onClose])

  // Generous luxury dimensions for natural paper pass
  const WIDTH = 720
  const HEIGHT = 270
  const STUB_SIZE = 210

  const content = (
    <div className={`relative select-none flex flex-col items-center ${className}`}>
      {/* Floating Canvas Ticket Stage (Pure floating pass, zero auxiliary dialogue boxes) */}
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
          background="#18181B" // Matte deep charcoal paper (natural luxury)
          stubBackground="#141416" // Matte stub paper
          color="#F8FAFC"
          borderColor="rgba(255,255,255,0.12)"
          tilt={true}
          tiltMax={8}
          className="shadow-[0_25px_60px_-15px_rgba(0,0,0,0.7)]"
          onTear={() => {
            playGateAdmissionChime()
            fireCelebrationConfetti()
            if (onAdmit) onAdmit()
          }}
          stub={
            /* Natural Gate Stub (Direct tap / drag to tear) */
            <div
              onClick={!isTorn && !disabled ? triggerDigitalTear : undefined}
              className={`h-full flex flex-col justify-between items-center text-center p-4 font-mono bg-[#141416] text-zinc-100 select-none ${
                !isTorn && !disabled ? 'cursor-pointer hover:bg-[#18181c] transition-colors' : ''
              }`}
              title={!isTorn && !disabled ? 'Tap or drag stub to simulate venue gate check-in' : undefined}
            >
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

                {/* Status Indicator on Stub */}
                <div className="pt-1">
                  {isTorn ? (
                    <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-[10px] font-bold tracking-wider">
                      <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                      <span>ADMITTED ✓</span>
                    </div>
                  ) : (
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-zinc-800/80 border border-zinc-700 text-zinc-300 text-[9px] font-medium font-mono hover:border-zinc-500 transition-colors">
                      <Radio className="w-2.5 h-2.5 text-zinc-400" />
                      <span>TAP / DRAG TO TEAR</span>
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
    </div>
  )

  // Floating Canvas Mode (Pure floating ticket suspended in space)
  if (floatingCanvas) {
    return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-8 backdrop-blur-2xl bg-black/85 overflow-y-auto"
        onClick={(e) => {
          if (e.target === e.currentTarget && onClose) onClose()
        }}
      >
        {/* Minimalist Floating Close Pill */}
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="fixed top-6 right-6 z-50 inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-700/80 text-zinc-400 hover:text-white text-xs font-mono transition-all cursor-pointer backdrop-blur-md shadow-xl"
          >
            <span>Close</span>
            <kbd className="px-1.5 py-0.5 rounded bg-black/60 text-[10px] text-zinc-400">ESC</kbd>
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
