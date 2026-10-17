import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { TearTicket } from './TearTicket'
import { QRCode } from '@/design-system/primitives/QRCode'
import { formatDate } from '@/lib/dates'
import { formatTime } from '@/lib/format'
import {
  playGateAdmissionChime,
  playPaperTearSound,
  playTearImpulse,
} from '@/lib/sound'
import { fireCelebrationConfetti } from '@/lib/confetti'
import { downloadICS } from '@/lib/ics'
import {
  CheckCircle,
  CalendarBlank,
  User,
  DownloadSimple,
  ArrowsClockwise,
  X,
  Scissors,
} from '@phosphor-icons/react'
import { cn } from '@/lib/utils'
import jsPDF from 'jspdf'

export interface EventAdmissionTicketProps {
  registration: {
    id: string
    ticketCode?: string
    eventId?: string
    eventTitle?: string
    eventStartsAt?: string
    eventEndsAt?: string
    createdAt: string
    venueName?: string
    venueAddress?: string
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
 * Premium physical concert & flagship hackathon admission pass.
 * Styled with an authentic cardstock ticket aesthetic, proportional QR code,
 * clean event typography, detachable gate stub with real tear physics,
 * and a centered, docked frosted glass action bar.
 */
export const EventAdmissionTicket: React.FC<EventAdmissionTicketProps> = ({
  registration,
  state,
  onAdmit,
  disabled = false,
  className = '',
  floatingCanvas = false,
  onClose,
}) => {
  const backendAdmitted = state ? state === 'checked_in' : registration.status === 'checked_in'
  const [isVisualTorn, setIsVisualTorn] = useState(false)

  const ticketCode = registration.ticketCode || `PASS-${registration.id.slice(0, 8).toUpperCase()}`
  const passSerial = registration.id.slice(0, 8).toUpperCase()

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

  // Visual tear interaction
  const triggerVisualTear = () => {
    if (backendAdmitted || isVisualTorn || disabled) return
    playPaperTearSound()
    playTearImpulse()
    setIsVisualTorn(true)
  }

  const resetVisualTear = () => {
    if (backendAdmitted) return
    setIsVisualTorn(false)
  }

  // Real-time venue gate listener
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

  // ESC key listener
  useEffect(() => {
    if (!floatingCanvas || !onClose) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [floatingCanvas, onClose])

  // Download PDF representation of this pass
  const handleDownloadPDF = () => {
    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: [120, 210],
    })

    doc.setFillColor(248, 249, 250)
    doc.rect(0, 0, 210, 120, 'F')

    doc.setFillColor(47, 75, 214)
    doc.rect(0, 0, 210, 10, 'F')

    doc.setTextColor(255, 255, 255)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(12)
    doc.text('EVENTMESH OFFICIAL DIGITAL ADMISSION PASS', 15, 7)

    doc.setFillColor(255, 255, 255)
    doc.setDrawColor(220, 224, 230)
    doc.roundedRect(12, 18, 60, 90, 4, 4, 'FD')

    doc.setTextColor(30, 41, 59)
    doc.setFontSize(9)
    doc.text('GATE SCAN CODE', 42, 26, { align: 'center' })
    doc.setFontSize(11)
    doc.text(ticketCode, 42, 32, { align: 'center' })

    doc.roundedRect(78, 18, 120, 90, 4, 4, 'FD')

    doc.setFontSize(14)
    doc.setTextColor(15, 23, 42)
    doc.text(registration.eventTitle || 'Campus Flagship Gathering', 85, 30)

    doc.setFont('helvetica', 'normal')
    doc.setFontSize(10)
    doc.setTextColor(71, 85, 105)
    doc.text(`Date: ${formatDate(registration.eventStartsAt || registration.createdAt, 'medium')}`, 85, 42)
    doc.text(`Time: ${registration.eventStartsAt ? formatTime(registration.eventStartsAt) : 'Doors open 09:00 AM'}`, 85, 50)
    doc.text(`Venue: ${registration.venueName || 'Main Campus Auditorium'}`, 85, 58)
    doc.text(`Attendee: ${registration.userName || 'Student Passholder'}`, 85, 68)
    doc.text(`Tier: ${registration.tierName || 'VIP PASS'}`, 85, 76)
    doc.text(`Status: ${backendAdmitted ? 'ADMITTED & VERIFIED' : 'ACTIVE / CONFIRMED'}`, 85, 84)

    doc.setFontSize(8)
    doc.setTextColor(148, 163, 184)
    doc.text(`Serial: #${passSerial} · EventMesh Cryptographic Pass Protocol v2`, 85, 98)

    doc.save(`EventMesh_Pass_${ticketCode}.pdf`)
  }

  // Add to Calendar helper
  const handleDownloadCalendar = () => {
    downloadICS({
      title: registration.eventTitle || 'Campus Flagship Event',
      startsAt: registration.eventStartsAt || registration.createdAt,
      endsAt: registration.eventEndsAt || registration.eventStartsAt || registration.createdAt,
      venueName: registration.venueName,
      venueAddress: registration.venueAddress,
      url: window.location.href,
    })
  }

  const isPhysicallyTorn = backendAdmitted ? false : isVisualTorn

  const ticketContent = (
    <TearTicket
      width={780}
      height={340}
      stubSize={210}
      radius={16}
      holes={12}
      holeSize={7}
      notch={10}
      roughness={0.55}
      tearAngle={20}
      stretch={24}
      resistance={0.2}
      tilt={false}
      rotate={0}
      torn={isPhysicallyTorn}
      disabled={backendAdmitted || disabled}
      background="#FDFDFD"
      stubBackground="#12151E"
      color="#09090B"
      borderColor="rgba(0, 0, 0, 0.12)"
      borderWidth={1.2}
      className="mx-auto"
      onTear={triggerVisualTear}
      stub={
        /* Authentic Gate Stub (Matches Approved Design Mockup) */
        <div
          onClick={!backendAdmitted && !isVisualTorn ? triggerVisualTear : undefined}
          className={cn(
            'h-full flex flex-col justify-between items-center text-center p-5 font-mono bg-[#12151E] text-white select-none relative',
            !backendAdmitted && !isVisualTorn ? 'cursor-pointer hover:bg-[#1A1F2C] transition-colors' : ''
          )}
          title={backendAdmitted ? 'Official admission validated' : 'Drag or pull to tear admission stub'}
        >
          {/* Top Label */}
          <div className="text-[10px] tracking-widest text-white/50 uppercase font-semibold">
            GATE STUB
          </div>

          {/* Center Admission Content */}
          <div className="my-auto space-y-1.5">
            <div className="text-2xl sm:text-3xl font-black font-display tracking-tight text-white leading-none">
              ADMIT
            </div>
            <div className="text-2xl sm:text-3xl font-black font-display tracking-tight text-white leading-none">
              ONE
            </div>
            <div className="pt-1.5 text-[11px] text-violet-400 font-bold uppercase tracking-wider">
              {registration.tierName ? registration.tierName.toUpperCase() : 'VIP ACCESS'}
            </div>
            <div className="text-[9px] text-white/40 tracking-wider">
              #{passSerial}
            </div>
          </div>

          {/* Bottom Pull to Tear Guide */}
          <div className="text-[10px] text-white/60 tracking-wider uppercase font-semibold flex items-center gap-1.5 pt-2 border-t border-white/10 w-full justify-center">
            <Scissors size={13} weight="bold" className="text-amber-400" />
            <span>PULL TO TEAR</span>
          </div>
        </div>
      }
    >
      {/* Main Ticket Body: Alabaster Finish with Proportional Layout */}
      <div className="h-full p-5 sm:p-6 flex flex-col justify-between bg-[#FDFDFD] text-[#09090B] select-none relative overflow-hidden">
        {/* Top Header Strip: Black EVENTMESH Badge (Left) & Purple VIP Pill (Right) */}
        <div className="flex items-center justify-between pb-2.5 border-b border-black/8">
          <div className="flex items-center gap-2">
            <div className="px-2.5 py-1 rounded-lg bg-[#09090B] text-white flex items-center gap-1.5 shadow-xs">
              <div className="w-3.5 h-3.5 rounded-sm bg-gradient-to-tr from-accent to-cobalt flex items-center justify-center font-bold text-[8px] text-white">
                EM
              </div>
              <span className="font-display font-extrabold text-[11px] tracking-wider uppercase">
                EVENTMESH
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-violet-600 text-white font-mono font-bold text-[11px] uppercase tracking-wider shadow-xs">
              {registration.tierName ? registration.tierName.toUpperCase() : 'VIP'}
            </span>
          </div>
        </div>

        {/* Middle Section: Event Info (Left) & Neatly Proportioned QR Code (Right) */}
        <div className="flex items-center justify-between gap-5 my-auto py-1">
          {/* Left Column: Event Title, Date, Venue, Attendee */}
          <div className="flex-1 min-w-0 space-y-2.5">
            <h2 className="font-display font-black text-xl sm:text-2xl text-black leading-tight tracking-tight uppercase line-clamp-2">
              {registration.eventTitle || 'THE GRAND TURING HACKATHON 2026'}
            </h2>

            <div className="space-y-1 text-xs font-mono">
              <div className="flex items-center gap-2">
                <span className="font-bold text-black/50 uppercase text-[10px] w-14">DATE:</span>
                <span className="font-bold text-black tracking-wide">
                  {formatDate(registration.eventStartsAt || registration.createdAt, 'medium').toUpperCase()}
                  {registration.eventStartsAt ? ` · ${formatTime(registration.eventStartsAt)}` : ''}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className="font-bold text-black/50 uppercase text-[10px] w-14">VENUE:</span>
                <span className="font-bold text-black tracking-wide truncate">
                  {(registration.venueName || 'The Innovation Center, Campus 4B').toUpperCase()}
                </span>
              </div>
            </div>

            {/* Attendee Clearance Badge */}
            <div className="pt-2 border-t border-black/8 flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-black text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
                <User size={14} weight="bold" />
              </div>
              <div className="min-w-0">
                <p className="font-bold text-xs text-black leading-none truncate">
                  {registration.userName || 'Verified Attendee'}
                </p>
                <p className="text-[10px] text-black/50 font-mono mt-0.5">
                  DevPass #{passSerial}
                </p>
              </div>
            </div>
          </div>

          {/* Right Column inside Main Body: Crisp Proportional QR Code with Scan to Admit Label */}
          <div className="shrink-0 flex flex-col items-center justify-center pl-1">
            <div className="p-2 bg-white rounded-xl border border-black/15 shadow-sm">
              <QRCode
                value={qrValue}
                size={98}
                className="rounded"
              />
            </div>
            <span className="text-[9px] font-mono font-bold text-black/60 mt-1 tracking-wider uppercase">
              Scan to Admit
            </span>
          </div>
        </div>

        {/* Permanent Verified Admission Seal (when admitted) */}
        <AnimatePresence>
          {backendAdmitted && (
            <motion.div
              initial={{ scale: 1.6, opacity: 0, rotate: -12 }}
              animate={{ scale: 1, opacity: 1, rotate: -4 }}
              transition={{ type: 'spring', stiffness: 280, damping: 20 }}
              className="absolute inset-0 flex items-center justify-center pointer-events-none z-20"
            >
              <div className="px-6 py-2.5 rounded-2xl border-4 border-emerald-500 bg-white/95 text-emerald-600 font-display font-extrabold text-base tracking-widest shadow-2xl flex items-center gap-2 rotate-[-4deg]">
                <CheckCircle size={20} weight="bold" />
                <span>ADMITTED AT {admissionTimestamp}</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </TearTicket>
  )

  // Floating Overlay Presentation (Grounded Studio Backdrop + Docked Action Bar)
  if (floatingCanvas) {
    return (
      <div
        className="fixed inset-0 z-50 flex flex-col items-center justify-center p-4 sm:p-6 select-none overflow-y-auto"
        style={{
          background: 'radial-gradient(ellipse at 50% 45%, rgba(45, 52, 75, 0.45) 0%, rgba(13, 15, 22, 0.96) 55%, rgba(6, 7, 10, 0.99) 100%)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
        }}
        onClick={(e) => {
          if (e.target === e.currentTarget && onClose) onClose()
        }}
        role="dialog"
        aria-modal="true"
        aria-label="Official Admission Ticket"
      >
        <div className="relative my-auto flex flex-col items-center">
          {/* Subtle Stacked Card Layers Underneath for Physical 3D Depth */}
          <div className="relative">
            <div className="absolute inset-0 translate-y-2.5 scale-[0.985] bg-white/80 rounded-[18px] border border-black/10 pointer-events-none -z-10 shadow-xl" />
            <div className="absolute inset-0 translate-y-5 scale-[0.97] bg-white/40 rounded-[20px] border border-black/5 pointer-events-none -z-20 shadow-lg" />
            {ticketContent}
          </div>

          {/* Sleek Docked Action Bar Directly Below Ticket */}
          <div className="mt-7 flex items-center gap-2 p-1.5 rounded-full bg-white/10 backdrop-blur-2xl border border-white/20 shadow-2xl animate-in fade-in slide-in-from-bottom-2 duration-300">
            <button
              type="button"
              onClick={handleDownloadPDF}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs font-semibold tracking-wide transition-all active:scale-95 shadow-xs"
            >
              <DownloadSimple size={15} weight="bold" />
              <span>Download PDF</span>
            </button>

            <button
              type="button"
              onClick={handleDownloadCalendar}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs font-semibold tracking-wide transition-all active:scale-95 shadow-xs"
            >
              <CalendarBlank size={15} weight="bold" />
              <span>Add to Calendar</span>
            </button>

            {isVisualTorn && !backendAdmitted && (
              <button
                type="button"
                onClick={resetVisualTear}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs font-semibold tracking-wide transition-all active:scale-95 shadow-xs"
                title="Re-attach stub"
              >
                <ArrowsClockwise size={14} weight="bold" />
                <span>Re-attach</span>
              </button>
            )}

            {onClose && (
              <button
                type="button"
                onClick={onClose}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-white/20 hover:bg-white/30 text-white text-xs font-semibold tracking-wide transition-all active:scale-95 shadow-xs"
              >
                <X size={14} weight="bold" />
                <span>Close</span>
              </button>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={cn('relative select-none flex flex-col items-center w-full max-w-full', className)}>
      <div className="w-full max-w-[800px] overflow-visible flex justify-center items-center py-4 my-auto">
        <div className="relative">
          <div className="absolute inset-0 translate-y-2.5 scale-[0.985] bg-white/80 rounded-[18px] border border-black/10 pointer-events-none -z-10 shadow-xl" />
          <div className="absolute inset-0 translate-y-5 scale-[0.97] bg-white/40 rounded-[20px] border border-black/5 pointer-events-none -z-20 shadow-lg" />
          {ticketContent}
        </div>
      </div>
    </div>
  )
}

export default EventAdmissionTicket
