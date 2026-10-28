import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import {
  DownloadSimple,
  CalendarBlank,
  X,
  ArrowsClockwise,
  CheckCircle,
  Scissors,
  User,
  Lightning,
} from '@phosphor-icons/react'
import { Registration, api } from '@/api'
import { supabase } from '@/lib/supabaseClient'
import { QRCode } from '@/design-system/primitives/QRCode'
import { TearTicket } from './TearTicket'
import { stampSound } from '@/components/stamp/sound'
import { fireCelebrationConfetti } from '@/lib/confetti'
import { downloadICS } from '@/lib/ics'
import { formatDate, formatTime } from '@/lib/dates'
import { cn } from '@/lib/utils'

export interface EventAdmissionTicketProps {
  registration: Registration
  state?: 'pending' | 'confirmed' | 'waitlisted' | 'cancelled' | 'checked_in'
  onAdmit?: () => void
  disabled?: boolean
  className?: string
  floatingCanvas?: boolean
  demoMode?: boolean
  onClose?: () => void
}

/**
 * EventAdmissionTicket:
 * High-contrast tactile physical event ticket with:
 * - Scalloped notch cutouts & perforated physical ridges
 * - Mobile-responsive layout (Vertical on mobile, Horizontal on desktop)
 * - Tear-off Gate Stub hosting the scannable viewfinder QR Code
 * - Intact Keepsake Pass containing all event & attendee details
 * - Hybrid Tactile Tear + Official Gate Stamping (plays peel sound, spring detachment, and green admission stamp)
 */
export const EventAdmissionTicket: React.FC<EventAdmissionTicketProps> = ({
  registration,
  state,
  onAdmit,
  disabled = false,
  className = '',
  floatingCanvas = false,
  demoMode = false,
  onClose,
}) => {
  const backendAdmitted = state ? state === 'checked_in' : registration.status === 'checked_in'

  // Gate check-in status (once scanned, permanent and irreversible)
  const [isGateScanned, setIsGateScanned] = useState(backendAdmitted)
  const [isVisualTorn, setIsVisualTorn] = useState(backendAdmitted)

  // Mobile viewport detection
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== 'undefined' ? window.innerWidth < 768 : false
  )

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768)
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const ticketCode = registration.ticketCode || `PASS-${registration.id.slice(0, 8).toUpperCase()}`
  const passSerial = registration.id.slice(0, 8).toUpperCase()

  // Standardized structured QR payload matching AdminCheckinPage validator
  const qrValue = JSON.stringify({
    v: 1,
    ticket: ticketCode,
    ticketId: ticketCode,
    code: ticketCode,
    event: registration.eventSlug || registration.eventId || '',
    eventId: registration.eventId || '',
    reg: registration.id,
    registrationId: registration.id,
    sig: `SIG_${registration.id.slice(0, 8)}`,
  })

  // Format admission timestamp
  const [admissionTimestamp, setAdmissionTimestamp] = useState(() =>
    registration.checkedInAt
      ? formatTime(registration.checkedInAt)
      : formatTime(new Date().toISOString())
  )

  // Manual tear trigger (for user preview / interaction)
  const triggerManualTear = () => {
    if (isGateScanned || isVisualTorn || disabled) return
    stampSound().peel()
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate([25, 15, 30])
    }
    setIsVisualTorn(true)
  }

  // Restore stub (only allowed if NOT yet scanned by gatekeeper)
  const resetManualTear = () => {
    if (isGateScanned) return
    setIsVisualTorn(false)
  }

  // Gatekeeper Scan Admission Handler (Irreversible)
  const handleGateAdmission = (scannedTime?: string | React.MouseEvent) => {
    if (isGateScanned) return
    if (typeof scannedTime === 'string') {
      setAdmissionTimestamp(formatTime(scannedTime))
    }
    // Authentic audio sensory synergy: peel paper tear sound followed by solid stamp chime
    stampSound().peel()
    setTimeout(() => {
      stampSound().chime()
    }, 180)

    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate([40, 30, 60, 30, 80])
    }
    fireCelebrationConfetti()
    setIsGateScanned(true)
    setIsVisualTorn(true)
    if (onAdmit) onAdmit()
  }

  const handleGateAdmissionRef = useRef(handleGateAdmission)
  handleGateAdmissionRef.current = handleGateAdmission

  // Real-time venue gate listeners (Supabase cross-device, BroadcastChannel same-device, window events, & smart polling)
  useEffect(() => {
    if (isGateScanned) return

    const handleBroadcastData = (data: any) => {
      const regId = data?.registrationId || data?.regId || data?.id
      const code = data?.ticketCode || data?.ticket || data?.code
      if (
        (regId && regId === registration.id) ||
        (code && code.toUpperCase() === ticketCode.toUpperCase())
      ) {
        handleGateAdmissionRef.current(data?.checkedInAt)
      }
    }

    // 1. Supabase Realtime cross-device channels
    let targetedChannel: any = null
    let globalChannel: any = null
    try {
      targetedChannel = supabase
        .channel(`ticket_gate_${registration.id}`)
        .on('broadcast', { event: 'gate_admitted' }, (msg: any) => {
          handleBroadcastData(msg.payload)
        })
        .subscribe()

      globalChannel = supabase
        .channel('eventmesh_gate_broadcast')
        .on('broadcast', { event: 'gate_admitted' }, (msg: any) => {
          handleBroadcastData(msg.payload)
        })
        .subscribe()
    } catch (err) {
      console.warn('Supabase Realtime subscription error:', err)
    }

    // 2. Cross-tab BroadcastChannel on same device
    let channel: BroadcastChannel | null = null
    try {
      channel = new BroadcastChannel('eventmesh_gate_admission')
      channel.onmessage = (event) => {
        handleBroadcastData(event.data)
      }
    } catch {}

    // 3. Same-window custom event
    const handleCustomAdmitted = (e: any) => {
      handleBroadcastData(e.detail)
    }
    window.addEventListener('eventmesh_gate_admitted', handleCustomAdmitted)

    // 4. Smart active polling fallback
    const pollInterval = setInterval(async () => {
      try {
        const myRegs = await api.registrations.getMyRegistrations()
        const current = myRegs.find(
          (r) =>
            r.id === registration.id ||
            (r.ticketCode && r.ticketCode.toUpperCase() === ticketCode.toUpperCase())
        )
        if (current && (current.status === 'checked_in' || current.checkedInAt)) {
          handleGateAdmissionRef.current(current.checkedInAt)
        }
      } catch {}
    }, 2000)

    return () => {
      targetedChannel?.unsubscribe()
      globalChannel?.unsubscribe()
      channel?.close()
      window.removeEventListener('eventmesh_gate_admitted', handleCustomAdmitted)
      clearInterval(pollInterval)
    }
  }, [registration.id, ticketCode, isGateScanned])

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
  const handleDownloadPDF = async () => {
    const { jsPDF } = await import('jspdf')
    const QRCodeLib: any = (await import('qrcode')).default || (await import('qrcode'))
    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: [170, 75],
    })

    doc.setFillColor(253, 253, 253)
    doc.rect(0, 0, 170, 75, 'F')

    // Header badge
    doc.setFillColor(9, 9, 11)
    doc.roundedRect(8, 8, 38, 7, 1.5, 1.5, 'F')
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(8)
    doc.setTextColor(255, 255, 255)
    doc.text('EVENTMESH PASS', 10, 13)

    // Tier pill
    doc.setFillColor(109, 40, 217)
    doc.roundedRect(50, 8, 28, 7, 1.5, 1.5, 'F')
    doc.setFontSize(7)
    doc.setTextColor(255, 255, 255)
    doc.text(
      registration.tierName ? registration.tierName.toUpperCase() : 'VIP PASS',
      52,
      13
    )

    // Event title
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(13)
    doc.setTextColor(9, 9, 11)
    doc.text(
      registration.eventTitle
        ? registration.eventTitle.slice(0, 32).toUpperCase()
        : 'CAMPUS PREMIERE EVENT',
      8,
      26
    )

    // Date & Time
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(9)
    doc.setTextColor(80, 80, 80)
    const dateStr = formatDate(registration.eventStartsAt || registration.createdAt, 'full')
    doc.text(dateStr, 8, 33)

    // Venue
    doc.text(`Venue: ${registration.venueName || 'Main Campus Auditorium'}`, 8, 39)

    // Attendee
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(9)
    doc.setTextColor(9, 9, 11)
    doc.text(`Attendee: ${registration.userName || 'Verified Attendee'}`, 8, 47)

    // Serial
    doc.setFont('courier', 'bold')
    doc.setFontSize(8)
    doc.setTextColor(100, 100, 100)
    doc.text(`ID: ${passSerial} · ${ticketCode}`, 8, 54)

    // Perforation line
    doc.setDrawColor(200, 200, 200)
    doc.setLineDashPattern([1.5, 1.5], 0)
    doc.line(116, 5, 116, 70)

    // Stub section
    doc.setLineDashPattern([], 0)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(7)
    doc.setTextColor(100, 100, 100)
    doc.text('GATE STUB', 122, 12)

    try {
      const qrDataUrl = await QRCodeLib.toDataURL(qrValue, {
        margin: 1,
        width: 120,
        errorCorrectionLevel: 'M',
      })
      doc.addImage(qrDataUrl, 'PNG', 122, 16, 40, 40)
    } catch {}

    doc.setFont('courier', 'bold')
    doc.setFontSize(8)
    doc.setTextColor(9, 9, 11)
    doc.text(ticketCode, 142, 60, { align: 'center' })

    doc.save(`${ticketCode}.pdf`)
    fireCelebrationConfetti()
  }

  // Calendar .ics download
  const handleDownloadCalendar = () => {
    downloadICS({
      title: registration.eventTitle || 'Campus Event',
      description: `Entry pass for ${registration.eventTitle || 'Campus Event'}. Pass code: ${ticketCode}. Attendee: ${registration.userName || 'Student'}.`,
      startsAt: registration.eventStartsAt || new Date().toISOString(),
      endsAt: new Date(
        new Date(registration.eventStartsAt || new Date()).getTime() + 3 * 3600000
      ).toISOString(),
      venueName: registration.venueName || 'Main Campus Venue',
      url: window.location.href,
    })
  }

  const isPhysicallyTorn = isGateScanned || isVisualTorn

  const ticketContent = (
    <TearTicket
      orientation={isMobile ? 'vertical' : 'horizontal'}
      width={isMobile ? 320 : 680}
      height={isMobile ? 540 : 260}
      stubSize={isMobile ? 220 : 220}
      radius={14}
      holes={isMobile ? 14 : 14}
      holeSize={isMobile ? 8 : 7.5}
      notch={isMobile ? 13 : 13}
      roughness={0.6}
      tearAngle={18}
      stretch={22}
      resistance={0.2}
      tilt={false}
      rotate={0}
      torn={isPhysicallyTorn}
      disabled={isGateScanned || disabled}
      background="#FFFFFF"
      stubBackground="#FFFFFF"
      color="#0D0E12"
      borderColor="rgba(0, 0, 0, 0.12)"
      borderWidth={1}
      className="mx-auto"
      onTear={triggerManualTear}
      stub={
        /* ================= TEAR-OFF GATE STUB WITH VIEWFINDER QR CODE ================= */
        <div
          onClick={!isGateScanned && !isVisualTorn ? triggerManualTear : undefined}
          className={cn(
            'h-full w-full flex flex-col justify-between items-center text-center p-3 sm:p-4 font-sans bg-white text-slate-900 select-none relative',
            !isGateScanned && !isVisualTorn
              ? 'cursor-pointer hover:bg-slate-50 transition-colors'
              : ''
          )}
          title={
            isGateScanned
              ? 'Official admission validated at gate'
              : 'Scan QR at gate or click/drag to tear stub'
          }
        >
          {/* Top Gate Header */}
          <div className="w-full flex items-center justify-center pt-0.5">
            <span className="text-[10px] sm:text-[11px] font-mono tracking-widest text-slate-600 uppercase font-bold">
              GATE STUB · SCAN AT ENTRY
            </span>
          </div>

          {/* Center Scannable QR Code in Viewfinder Frame */}
          <div className="my-auto flex flex-col items-center justify-center space-y-1.5 py-0.5">
            <div className="relative p-2.5 bg-white border border-slate-200 rounded-[8px]">
              {/* Four Viewfinder Brackets */}
              <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-slate-900 pointer-events-none rounded-tl-[4px]" />
              <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-slate-900 pointer-events-none rounded-tr-[4px]" />
              <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-slate-900 pointer-events-none rounded-bl-[4px]" />
              <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-slate-900 pointer-events-none rounded-br-[4px]" />

              <QRCode value={qrValue} size={isMobile ? 114 : 118} className="block" />
            </div>

            {/* Perforation Hint & Event Identifier */}
            <div className="flex items-center gap-1 text-slate-400 font-mono text-[9px] tracking-wider uppercase font-medium">
              <Scissors size={10} weight="bold" />
              <span>··· TEAR TO SCAN ···</span>
            </div>
            <div className="text-[9px] font-mono font-bold text-slate-900 tracking-wider uppercase leading-none truncate max-w-[190px]">
              {registration.eventTitle
                ? registration.eventTitle.slice(0, 24).toUpperCase()
                : 'CAMPUS ADMISSION PASS'}
            </div>
          </div>

          {/* Bottom Attendee Info & Pass Tier */}
          <div className="w-full pt-1.5 border-t border-slate-200 flex flex-col items-center justify-center space-y-0.5">
            <p className="text-xs sm:text-sm font-bold uppercase text-slate-900 tracking-tight leading-tight truncate max-w-[210px]">
              {registration.userName || 'Attendee'}
            </p>
            <p className="text-[10px] font-extrabold uppercase text-violet-600 tracking-wider">
              {registration.tierName
                ? registration.tierName.toUpperCase()
                : 'GENERAL ADMISSION'}
            </p>
            <p className="text-[9px] font-mono text-slate-400 uppercase tracking-widest tabular-nums">
              TICKET ID: {passSerial}
            </p>
          </div>
        </div>
      }
    >
      {/* ================= INTACT KEEPSAKE PASS (EVENT DETAILS) ================= */}
      <div className="h-full w-full p-6 sm:p-7 flex flex-col justify-between bg-white text-slate-900 select-none relative overflow-hidden">
        {/* Subtle Micro-Dot Grid Pattern */}
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.05]"
          style={{
            backgroundImage: `radial-gradient(#000000 1.2px, transparent 1.2px)`,
            backgroundSize: '20px 20px',
          }}
        />

        {/* Top Header Strip: Black EVENTMESH Badge (Left) & Violet Pill (Right) */}
        <div className="flex items-center justify-between relative z-10">
          <div className="flex items-center gap-2">
            <div className="px-3 py-1 rounded-[6px] bg-[#0D0E12] text-white flex items-center gap-2 shadow-xs border border-white/10">
              <div className="w-3.5 h-3.5 rounded-[3px] bg-violet-600 flex items-center justify-center font-bold text-[8px] text-white">
                EM
              </div>
              <span className="font-mono font-bold text-[11px] tracking-wider uppercase">
                EVENTMESH
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-violet-600 text-white font-mono font-bold text-[10px] uppercase tracking-wider shadow-xs">
              {registration.tierName ? registration.tierName.toUpperCase() : 'VIP PASS'}
            </span>
          </div>
        </div>

        {/* Middle Section: Event Info (Title) */}
        <div className="my-auto py-2 relative z-10 space-y-2.5">
          <h2 className="font-bold text-xl sm:text-2xl text-slate-900 leading-[1.1] tracking-tight uppercase line-clamp-2">
            {registration.eventTitle || 'THE GRAND TURING HACKATHON 2026'}
          </h2>

          {/* Tabular Metadata Grid */}
          <div className="border border-slate-200 rounded-[8px] overflow-hidden bg-slate-50/70">
            {/* Top Row: DATE | TIME | ACCESS */}
            <div className="grid grid-cols-3 divide-x divide-slate-200 border-b border-slate-200">
              <div className="p-2 sm:p-2.5">
                <span className="text-[9px] font-mono uppercase tracking-widest text-slate-400 font-bold block">
                  DATE
                </span>
                <span className="text-xs sm:text-sm font-bold text-slate-900 tracking-tight block truncate tabular-nums">
                  {formatDate(
                    registration.eventStartsAt || registration.createdAt,
                    'short'
                  ).toUpperCase()}
                </span>
              </div>

              <div className="p-2 sm:p-2.5">
                <span className="text-[9px] font-mono uppercase tracking-widest text-slate-400 font-bold block">
                  TIME
                </span>
                <span className="text-xs sm:text-sm font-bold text-slate-900 tracking-tight block truncate tabular-nums">
                  {registration.eventStartsAt
                    ? formatTime(registration.eventStartsAt).toUpperCase()
                    : '09:00 AM'}
                </span>
              </div>

              <div className="p-2 sm:p-2.5">
                <span className="text-[9px] font-mono uppercase tracking-widest text-slate-400 font-bold block">
                  ACCESS
                </span>
                <span className="text-xs sm:text-sm font-bold text-slate-900 tracking-tight block truncate">
                  HALL B, LEVEL 3
                </span>
              </div>
            </div>

            {/* Bottom Row: VENUE | ATTENDEE */}
            <div className="grid grid-cols-2 divide-x divide-slate-200">
              <div className="p-2 sm:p-2.5">
                <span className="text-[9px] font-mono uppercase tracking-widest text-slate-400 font-bold block">
                  VENUE
                </span>
                <span className="text-xs sm:text-sm font-bold text-slate-900 tracking-tight block truncate">
                  {(registration.venueName || 'TECH ARENA, LEVEL 3').toUpperCase()}
                </span>
              </div>

              <div className="p-2 sm:p-2.5">
                <span className="text-[9px] font-mono uppercase tracking-widest text-slate-400 font-bold block">
                  ATTENDEE
                </span>
                <span className="text-xs sm:text-sm font-bold text-slate-900 tracking-tight block truncate">
                  {(registration.userName || 'CAMPUS ATTENDEE').toUpperCase()}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section: Keepsake Tag */}
        <div className="pt-2 border-t border-slate-200 flex items-center justify-between relative z-10 text-[10px] font-mono">
          <span className="text-slate-400 uppercase tracking-widest tabular-nums">
            CLEARANCE: #{passSerial}
          </span>
          <span className="font-bold text-slate-400 uppercase tracking-widest">
            KEEPSAKE PASS
          </span>
        </div>

        {/* Official Verified Admission Stamp (when scanned by gatekeeper) */}
        <AnimatePresence>
          {isGateScanned && (
            <motion.div
              initial={{ scale: 1.4, opacity: 0, rotate: -8 }}
              animate={{ scale: 1, opacity: 1, rotate: -2 }}
              transition={{ type: 'spring', stiffness: 320, damping: 22, delay: 0.15 }}
              className="absolute inset-0 flex items-center justify-center pointer-events-none z-20 p-4"
            >
              <div className="px-5 py-3 rounded-[12px] border-2 border-emerald-500 bg-[#0D0E12] text-white font-mono font-bold shadow-2xl flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-emerald-500 text-slate-900 flex items-center justify-center shrink-0">
                  <CheckCircle size={20} weight="bold" />
                </div>
                <div>
                  <div className="text-xs sm:text-sm font-black tracking-wider leading-none uppercase text-emerald-400">
                    ✓ VERIFIED ADMISSION
                  </div>
                  <div className="text-[10px] font-mono text-slate-300 mt-1 tabular-nums">
                    GATE 01 · {admissionTimestamp}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </TearTicket>
  )

  // Floating Overlay Presentation (Grounded Solid Studio Backdrop + Docked Action Bar)
  if (floatingCanvas) {
    return (
      <div
        className="fixed inset-0 z-50 flex flex-col items-center justify-center p-3 sm:p-6 select-none overflow-y-auto bg-black/85"
        onClick={(e) => {
          if (e.target === e.currentTarget && onClose) onClose()
        }}
        role="dialog"
        aria-modal="true"
        aria-label="Official Admission Ticket"
      >
        <div className="relative my-auto flex flex-col items-center w-full max-w-[800px] px-2">
          {/* Ticket Container */}
          <div className="relative max-w-full">{ticketContent}</div>

          {/* Sleek Docked Action Bar Directly Below Ticket */}
          <div className="mt-5 sm:mt-6 flex flex-wrap items-center justify-center gap-2 p-1.5 rounded-full bg-[#0D0E12] border border-white/15 shadow-2xl animate-in fade-in slide-in-from-bottom-2 duration-300 max-w-full text-white">
            <button
              type="button"
              onClick={handleDownloadPDF}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs font-semibold tracking-wide transition-all active:scale-[0.98] cursor-pointer"
            >
              <DownloadSimple size={14} weight="bold" />
              <span>Download PDF</span>
            </button>

            <button
              type="button"
              onClick={handleDownloadCalendar}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs font-semibold tracking-wide transition-all active:scale-[0.98] cursor-pointer"
            >
              <CalendarBlank size={14} weight="bold" />
              <span>Add to Cal</span>
            </button>

            {/* Re-attach button: Only rendered if manually torn and NOT yet gate scanned */}
            {isVisualTorn && !isGateScanned && (
              <button
                type="button"
                onClick={resetManualTear}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-full bg-violet-600 hover:bg-violet-700 text-white text-xs font-semibold tracking-wide transition-all active:scale-[0.98] cursor-pointer"
                title="Put stub back"
              >
                <ArrowsClockwise size={14} weight="bold" />
                <span>Re-attach</span>
              </button>
            )}

            {/* Simulation button for testing gate check-in */}
            {!isGateScanned && (
              <button
                type="button"
                onClick={() => handleGateAdmission()}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-full bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 text-xs font-semibold tracking-wide transition-all active:scale-[0.98] border border-emerald-500/30 cursor-pointer"
                title="Simulate gatekeeper QR scan"
              >
                <Lightning size={14} weight="fill" />
                <span>Simulate Scan</span>
              </button>
            )}

            {onClose && (
              <button
                type="button"
                onClick={onClose}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs font-semibold tracking-wide transition-all active:scale-[0.98] cursor-pointer"
              >
                <X size={14} weight="bold" />
                <span>Close</span>
              </button>
            )}
          </div>

          {/* Emailed ticket status indicator */}
          <div className="mt-3 inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#0D0E12] border border-white/15 text-slate-300 text-[11px] font-medium tracking-wide">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>Pass token #{passSerial} active on cryptographic ledger</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={cn('relative select-none flex flex-col items-center w-full max-w-full', className)}>
      <div className="w-full max-w-[800px] overflow-visible flex justify-center items-center py-4 my-auto">
        <div className="relative max-w-full">{ticketContent}</div>
      </div>
    </div>
  )
}

export default EventAdmissionTicket
