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
 * EventAdmissionTicket
 *
 * Authentic physical event ticket with:
 * - Scalloped notch cutouts & serrated physical ridges
 * - Mobile-responsive layout (Vertical on mobile, Horizontal on desktop)
 * - Tear-off Gate Stub hosting the scannable QR Code
 * - Intact Keepsake Pass containing all event & attendee details
 * - Interactive manual tear (can re-attach) vs Irreversible Gate Scan (auto-tears & cannot be put back)
 * - "EVENT PASS APPROVED" official clearance seal upon gate admission
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
  const [isMobile, setIsMobile] = useState(() => (typeof window !== 'undefined' ? window.innerWidth < 768 : false))

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

    // 1. Supabase Realtime cross-device channels (Organizer scanner phone -> Attendee phone)
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

    // 4. Smart active polling fallback (guarantees tear even with spotty Wi-Fi or behind campus firewalls)
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
    doc.text(registration.tierName ? registration.tierName.toUpperCase() : 'VIP PASS', 52, 13)

    // Event title
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(13)
    doc.setTextColor(9, 9, 11)
    const splitTitle = doc.splitTextToSize((registration.eventTitle || 'Campus Event').toUpperCase(), 100)
    doc.text(splitTitle, 8, 23)

    // Event details
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(8)
    doc.setTextColor(70, 70, 80)
    doc.text(`DATE:   ${formatDate(registration.eventStartsAt || registration.createdAt, 'medium').toUpperCase()}`, 8, 35)
    doc.text(`VENUE:  ${(registration.venueName || 'Main Campus Venue').toUpperCase()}`, 8, 41)
    doc.text(`ATTENDEE: ${(registration.userName || 'Verified Member').toUpperCase()}`, 8, 47)
    doc.text(`SERIAL:   #${passSerial}`, 8, 53)

    // Perforation divider line
    doc.setDrawColor(180, 180, 190)
    doc.setLineDashPattern([1.5, 1.5], 0)
    doc.line(116, 0, 116, 75)

    // Right stub section
    doc.setFillColor(18, 21, 30)
    doc.rect(116, 0, 54, 75, 'F')
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(8.5)
    doc.setTextColor(255, 255, 255)
    doc.text('GATE STUB', 143, 11, { align: 'center' })
    doc.setFontSize(6.5)
    doc.setTextColor(180, 180, 200)
    doc.text('SCAN AT ENTRY', 143, 16, { align: 'center' })

    // Embed real scannable QR code on gate stub
    try {
      const qrDataUrl = await QRCodeLib.toDataURL(qrValue, {
        margin: 1,
        width: 256,
        errorCorrectionLevel: 'M',
        color: {
          dark: '#0F172A',
          light: '#FFFFFF',
        },
      })
      if (qrDataUrl) {
        doc.setFillColor(255, 255, 255)
        doc.roundedRect(125, 19, 36, 36, 1.5, 1.5, 'F')
        doc.addImage(qrDataUrl, 'PNG', 126, 20, 34, 34)
      }
    } catch (err) {
      console.warn('QR code generation warning for ticket PDF:', err)
    }

    doc.setFont('helvetica', 'bold')
    doc.setFontSize(7.5)
    doc.setTextColor(255, 255, 255)
    doc.text(ticketCode, 143, 61, { align: 'center' })
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(6.5)
    doc.setTextColor(180, 180, 200)
    doc.text((registration.userName || 'ATTENDEE').toUpperCase(), 143, 67, { align: 'center' })

    // Status stamp
    if (isGateScanned) {
      doc.setDrawColor(16, 185, 129)
      doc.setFillColor(236, 253, 245)
      doc.roundedRect(8, 57, 85, 12, 2, 2, 'FD')
      doc.setTextColor(5, 150, 105)
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(9)
      doc.text('APPROVED · ADMITTED AT GATE', 12, 64)
    }

    doc.save(`EventMesh-${passSerial}.pdf`)
  }

  const handleDownloadCalendar = () => {
    downloadICS({
      title: registration.eventTitle || 'EventMesh Campus Event',
      description: `Admission ticket #${passSerial} for ${registration.userName || 'Attendee'}.\nTicket Tier: ${registration.tierName || 'Standard'}\nTicket Code: ${ticketCode}`,
      startsAt: registration.eventStartsAt || registration.createdAt,
      endsAt: registration.eventStartsAt || registration.createdAt,
      venueName: registration.venueName,
      url: window.location.href,
    })
  }

  // Dimensions matching responsive orientation
  const ticketWidth = isMobile ? 340 : 800
  const ticketHeight = isMobile ? 640 : 380
  const stubSize = isMobile ? 280 : 280
  const orientation = isMobile ? 'vertical' : 'horizontal'

  const isPhysicallyTorn = isGateScanned ? true : isVisualTorn

  const ticketContent = (
    <TearTicket
      width={ticketWidth}
      height={ticketHeight}
      stubSize={stubSize}
      orientation={orientation}
      radius={16}
      holes={isMobile ? 11 : 14}
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
      color="#09090B"
      borderColor="rgba(0, 0, 0, 0.15)"
      borderWidth={1.2}
      className="mx-auto"
      onTear={triggerManualTear}
      stub={
        /* ================= TEAR-OFF GATE STUB WITH VIEWFINDER QR CODE ================= */
        <div
          onClick={!isGateScanned && !isVisualTorn ? triggerManualTear : undefined}
          className={cn(
            'h-full w-full flex flex-col justify-between items-center text-center p-3 sm:p-4 font-sans bg-white text-neutral-900 select-none relative',
            !isGateScanned && !isVisualTorn ? 'cursor-pointer hover:bg-neutral-50/80 transition-colors' : ''
          )}
          title={isGateScanned ? 'Official admission validated at gate' : 'Scan QR at gate or click/drag to tear stub'}
        >
          {/* Top Gate Header */}
          <div className="w-full flex items-center justify-center pt-0.5">
            <span className="text-[10px] sm:text-[11px] font-mono tracking-widest text-neutral-700 uppercase font-bold">
              GATE STUB · SCAN AT ENTRY
            </span>
          </div>

          {/* Center Scannable QR Code in Viewfinder Frame */}
          <div className="my-auto flex flex-col items-center justify-center space-y-1.5 py-0.5">
            <div className="relative p-2.5 bg-white">
              {/* Four Viewfinder Brackets */}
              <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-neutral-900 pointer-events-none" />
              <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-neutral-900 pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-neutral-900 pointer-events-none" />
              <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-neutral-900 pointer-events-none" />

              <QRCode
                value={qrValue}
                size={isMobile ? 114 : 118}
                className="block"
              />
            </div>

            {/* Perforation Hint & Event Identifier */}
            <div className="flex items-center gap-1 text-neutral-400 font-mono text-[8.5px] tracking-wider uppercase font-medium">
              <Scissors size={10} weight="bold" />
              <span>··· TEAR TO SCAN ···</span>
            </div>
            <div className="text-[9px] font-mono font-extrabold text-neutral-900 tracking-wider uppercase leading-none">
              {registration.eventTitle ? registration.eventTitle.slice(0, 24).toUpperCase() : 'CAMPUS ADMISSION PASS'}
            </div>
          </div>

          {/* Bottom Attendee Info & Pass Tier */}
          <div className="w-full pt-1 border-t border-neutral-200 flex flex-col items-center justify-center space-y-0.5">
            <p className="text-xs sm:text-sm font-black uppercase text-neutral-950 tracking-tight leading-tight truncate max-w-[210px]">
              {registration.userName || 'Attendee'}
            </p>
            <p className="text-[10px] font-extrabold uppercase text-violet-700 tracking-wider">
              {registration.tierName ? registration.tierName.toUpperCase() : 'GENERAL ADMISSION'}
            </p>
            <p className="text-[8.5px] font-mono text-neutral-500 uppercase tracking-widest">
              TICKET ID: {passSerial}
            </p>
          </div>
        </div>
      }
    >
      {/* ================= INTACT KEEPSAKE PASS (EVENT DETAILS) ================= */}
      <div className="h-full w-full p-6 sm:p-7 flex flex-col justify-between bg-white text-neutral-900 select-none relative overflow-hidden">
        {/* Subtle Tech Blueprint Watermark Background */}
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.04]"
          style={{
            backgroundImage: `radial-gradient(#000000 1.2px, transparent 1.2px), linear-gradient(to right, rgba(0,0,0,0.06) 1px, transparent 1px)`,
            backgroundSize: '20px 20px, 40px 40px'
          }}
        />

        {/* Top Header Strip: Black EVENTMESH Badge (Left) & Purple VIP Pill (Right) */}
        <div className="flex items-center justify-between relative z-10">
          <div className="flex items-center gap-2">
            <div className="px-3 py-1.5 rounded-lg bg-black text-white flex items-center gap-2 shadow-sm">
              <div className="w-4 h-4 rounded-sm bg-gradient-to-tr from-accent to-cobalt flex items-center justify-center font-bold text-[9px] text-white">
                EM
              </div>
              <span className="font-display font-black text-xs tracking-wider uppercase">
                EVENTMESH
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-violet-700 to-purple-800 text-white font-sans font-extrabold text-xs uppercase tracking-widest shadow-sm">
              {registration.tierName ? registration.tierName.toUpperCase() : 'VIP PASS'}
            </span>
          </div>
        </div>

        {/* Middle Section: Event Info (Title) */}
        <div className="my-auto py-2 relative z-10 space-y-3">
          <h2 className="font-display font-black text-2xl sm:text-3xl text-neutral-950 leading-[1.08] tracking-tight uppercase line-clamp-2">
            {registration.eventTitle || 'THE GRAND TURING HACKATHON 2026'}
          </h2>

          {/* Tabular Metadata Grid with Hairline Dividers (Matching Reference Mockup) */}
          <div className="border border-neutral-300 rounded-lg overflow-hidden bg-neutral-50/50">
            {/* Top Row: DATE | TIME | ACCESS */}
            <div className="grid grid-cols-3 divide-x divide-neutral-300 border-b border-neutral-300">
              <div className="p-2 sm:p-2.5">
                <span className="text-[9px] font-mono uppercase tracking-widest text-neutral-500 font-bold block">
                  DATE
                </span>
                <span className="text-xs sm:text-sm font-extrabold text-neutral-900 tracking-tight block truncate">
                  {formatDate(registration.eventStartsAt || registration.createdAt, 'medium').toUpperCase()}
                </span>
              </div>

              <div className="p-2 sm:p-2.5">
                <span className="text-[9px] font-mono uppercase tracking-widest text-neutral-500 font-bold block">
                  TIME
                </span>
                <span className="text-xs sm:text-sm font-extrabold text-neutral-900 tracking-tight block truncate">
                  {registration.eventStartsAt ? formatTime(registration.eventStartsAt).toUpperCase() : '09:00 AM'}
                </span>
              </div>

              <div className="p-2 sm:p-2.5">
                <span className="text-[9px] font-mono uppercase tracking-widest text-neutral-500 font-bold block">
                  ACCESS
                </span>
                <span className="text-xs sm:text-sm font-extrabold text-neutral-900 tracking-tight block truncate">
                  HALL B, LEVEL 3
                </span>
              </div>
            </div>

            {/* Bottom Row: VENUE | ATTENDEE */}
            <div className="grid grid-cols-2 divide-x divide-neutral-300">
              <div className="p-2 sm:p-2.5">
                <span className="text-[9px] font-mono uppercase tracking-widest text-neutral-500 font-bold block">
                  VENUE
                </span>
                <span className="text-xs sm:text-sm font-extrabold text-neutral-900 tracking-tight block truncate">
                  {(registration.venueName || 'TECH ARENA, LEVEL 3').toUpperCase()}
                </span>
              </div>

              <div className="p-2 sm:p-2.5">
                <span className="text-[9px] font-mono uppercase tracking-widest text-neutral-500 font-bold block">
                  ATTENDEE
                </span>
                <span className="text-xs sm:text-sm font-extrabold text-neutral-900 tracking-tight block truncate">
                  {(registration.userName || 'ALEX RIVERA').toUpperCase()}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section: Keepsake Tag */}
        <div className="pt-2 border-t border-neutral-200 flex items-center justify-between relative z-10">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono text-neutral-500 uppercase tracking-widest">
              DEV-CLEARANCE: #{passSerial}
            </span>
          </div>

          <div className="text-right">
            <span className="text-[9px] font-mono font-bold text-neutral-400 uppercase tracking-widest block">
              KEEPSAKE PASS
            </span>
          </div>
        </div>

        {/* Official Verified Admission Stamp (when scanned by gatekeeper) */}
        <AnimatePresence>
          {isGateScanned && (
            <motion.div
              initial={{ scale: 1.5, opacity: 0, rotate: -10 }}
              animate={{ scale: 1, opacity: 1, rotate: -2 }}
              transition={{ type: 'spring', stiffness: 320, damping: 22, delay: 0.18 }}
              className="absolute inset-0 flex items-center justify-center pointer-events-none z-20 p-4"
            >
              <div className="px-5 py-3 rounded-2xl border-3 border-emerald-500 bg-white/95 text-emerald-600 font-display font-extrabold shadow-2xl flex items-center gap-3 backdrop-blur-md">
                <div className="w-9 h-9 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-sm">
                  <CheckCircle size={22} weight="bold" />
                </div>
                <div>
                  <div className="text-sm font-black tracking-wider leading-none uppercase text-emerald-700">
                    EVENT PASS APPROVED
                  </div>
                  <div className="text-[10px] font-mono text-emerald-600/90 mt-1">
                    ADMITTED AT {admissionTimestamp}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </TearTicket>
  )

  // Underlay depth container sized strictly to the intact section so zero white backing bleeds through after tearing
  const underlayWidthClass = isMobile
    ? 'w-full h-[calc(100%-280px)] top-0 left-0'
    : 'h-full w-[calc(100%-280px)] top-0 left-0'

  // Floating Overlay Presentation (Grounded Studio Backdrop + Docked Action Bar)
  if (floatingCanvas) {
    return (
      <div
        className="fixed inset-0 z-50 flex flex-col items-center justify-center p-3 sm:p-6 select-none overflow-y-auto"
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
        <div className="relative my-auto flex flex-col items-center w-full max-w-[800px] px-2">
          {/* Ticket Container with Physical Drop Shadows */}
          <div className="relative max-w-full">
            {/* Scoped Underlay Cardstock Depth (Strictly under keepsake section - zero white backing leakage) */}
            <div className={cn('absolute rounded-2xl bg-white/20 border border-white/10 blur-[1px] pointer-events-none -z-10 translate-y-2', underlayWidthClass)} />
            
            {ticketContent}
          </div>

          {/* Sleek Docked Action Bar Directly Below Ticket */}
          <div className="mt-5 sm:mt-7 flex flex-wrap items-center justify-center gap-2 p-1.5 rounded-full bg-white/10 backdrop-blur-2xl border border-white/20 shadow-2xl animate-in fade-in slide-in-from-bottom-2 duration-300 max-w-full">
            <button
              type="button"
              onClick={handleDownloadPDF}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs font-semibold tracking-wide transition-all active:scale-95 shadow-xs"
            >
              <DownloadSimple size={14} weight="bold" />
              <span>Download PDF</span>
            </button>

            <button
              type="button"
              onClick={handleDownloadCalendar}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs font-semibold tracking-wide transition-all active:scale-95 shadow-xs"
            >
              <CalendarBlank size={14} weight="bold" />
              <span>Add to Calendar</span>
            </button>

            {/* Re-attach button: Only rendered if manually torn and NOT yet gate scanned */}
            {isVisualTorn && !isGateScanned && (
              <button
                type="button"
                onClick={resetManualTear}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-full bg-violet-600/60 hover:bg-violet-600 text-white text-xs font-semibold tracking-wide transition-all active:scale-95 shadow-xs"
                title="Put stub back"
              >
                <ArrowsClockwise size={14} weight="bold" />
                <span>Re-attach</span>
              </button>
            )}

            {/* Simulation button for rapid gatekeeper scan testing */}
            {!isGateScanned && (
              <button
                type="button"
                onClick={() => handleGateAdmission()}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-full bg-emerald-600/30 hover:bg-emerald-600/50 text-emerald-300 text-xs font-semibold tracking-wide transition-all active:scale-95 border border-emerald-500/30 shadow-xs"
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
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-full bg-white/20 hover:bg-white/30 text-white text-xs font-semibold tracking-wide transition-all active:scale-95 shadow-xs"
              >
                <X size={14} weight="bold" />
                <span>Close</span>
              </button>
            )}
          </div>

          {/* Emailed ticket status indicator */}
          <div className="mt-3.5 inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-white/80 text-[11px] font-medium tracking-wide">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>Ticket & scannable QR have been mailed to your email address</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={cn('relative select-none flex flex-col items-center w-full max-w-full', className)}>
      <div className="w-full max-w-[800px] overflow-visible flex justify-center items-center py-4 my-auto">
        <div className="relative max-w-full">
          <div className={cn('absolute rounded-2xl bg-white/20 border border-white/10 blur-[1px] pointer-events-none -z-10 translate-y-2', underlayWidthClass)} />
          {ticketContent}
        </div>
      </div>
    </div>
  )
}

export default EventAdmissionTicket
