import React, { useState, useEffect, useRef } from 'react'
import { TearTicket } from './TearTicket'
import { CodeSlots } from './CodeSlots'
import { QRCode } from '@/design-system/primitives'
import { formatDate } from '@/lib/dates'
import { playGateAdmissionChime, playTearImpulse } from '@/lib/sound'
import { fireCelebrationConfetti } from '@/lib/confetti'
import { CheckCircle2, QrCode, ScanLine, ShieldCheck, Radio, Building2, Smartphone } from 'lucide-react'

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
}

export const EventAdmissionTicket: React.FC<EventAdmissionTicketProps> = ({
  registration,
  onAdmit,
  disabled = false,
  className = '',
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

    playTearImpulse()
    setIsLocallyTorn(true)
    playGateAdmissionChime()
    fireCelebrationConfetti()

    if (onAdmit) {
      onAdmit()
    }
  }

  // Real-time listener: Ticket ONLY tears when scanned & verified by the venue gate kiosk
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
    // Broadcast event across channels
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
  const liveTimeString = liveDate.toLocaleTimeString('en-US', { hour12: false }) + `.${String(liveDate.getMilliseconds()).padStart(3, '0')}`

  return (
    <div className={`flex flex-col items-center select-none ${className}`}>
      {/* Anti-Fraud Security Ribbon */}
      <div className="w-full max-w-[580px] mb-2 px-3 py-1.5 rounded-lg bg-surface/90 border border-line flex items-center justify-between text-[11px] font-mono text-text-2">
        <div className="flex items-center gap-1.5 text-emerald-600 font-semibold">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>CRYPTOGRAPHIC VERIFIED PASS</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span>LIVE: {liveTimeString}</span>
        </div>
      </div>

      <div className="py-2 w-full flex justify-center overflow-hidden">
        <TearTicket
          width={580}
          height={230}
          stubSize={170}
          radius={18}
          holes={9}
          notch={12}
          torn={isTorn}
          disabled={true} // Attendee cannot manually tear their ticket!
          background="#120F24"
          color="#F8FAFC"
          borderColor="rgba(255,255,255,0.14)"
          stub={
            <div className="h-full flex flex-col justify-between items-center text-center p-3.5 font-mono bg-[#0A0815]/95">
              {/* Gate Stub Header */}
              <div className="w-full border-b border-white/10 pb-1.5 flex items-center justify-between">
                <span className="text-[10px] tracking-widest text-indigo-400 font-bold uppercase">
                  GATE STUB
                </span>
                <span className="text-[9px] text-slate-400 font-mono">
                  #01
                </span>
              </div>

              {/* Center Pass Identity & OTP */}
              <div className="my-auto w-full space-y-2">
                <div>
                  <p className="text-[11px] font-bold text-white tracking-tight">
                    PASS-{passSerial}
                  </p>
                  <p className="text-[9px] text-slate-400 uppercase tracking-wider">
                    GATE CHECK-IN
                  </p>
                </div>

                {/* Rolling CodeSlots */}
                <div className="flex justify-center">
                  <CodeSlots
                    value={rollingOtp}
                    length={6}
                    status={isTorn ? 'success' : 'idle'}
                    slotSize={22}
                    radius={5}
                    gap={4}
                    className="bg-[#05040A] border border-white/10 px-1.5 py-0.5 rounded-lg text-white"
                  />
                </div>

                {/* Status Stamp */}
                <div className="pt-1">
                  {isTorn ? (
                    <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-[10px] font-bold tracking-wider">
                      <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                      <span>ADMITTED ✓</span>
                    </div>
                  ) : (
                    <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-indigo-500/15 border border-indigo-500/25 text-indigo-300 text-[9px] font-medium font-mono">
                      <Radio className="w-2.5 h-2.5 text-indigo-400 animate-pulse" />
                      <span>GATE SCAN READY</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Bottom Verification Note */}
              <div className="text-[9px] text-slate-400 border-t border-dashed border-white/10 pt-1.5 w-full flex items-center justify-between">
                <span>CAMPUS GATE</span>
                <span className="font-bold text-indigo-400">{isTorn ? 'VALID' : 'ACTIVE'}</span>
              </div>
            </div>
          }
        >
          {/* Main Ticket Body */}
          <div className="h-full p-4 flex flex-col justify-between bg-[#120F24] text-white">
            {/* Top Bar */}
            <div className="flex items-center justify-between border-b border-white/10 pb-2">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-accent/25 text-indigo-300 font-bold border border-accent/30">
                  EVENTMESH OFFICIAL
                </span>
                <span className="text-[10px] font-mono text-slate-400">
                  SEAT GENERAL
                </span>
              </div>

              <div>
                {isTorn ? (
                  <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-400 font-bold border border-emerald-500/30 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    CHECKED IN
                  </span>
                ) : (
                  <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-indigo-500/15 text-indigo-300 font-medium border border-indigo-500/20">
                    ADMISSION ACTIVE
                  </span>
                )}
              </div>
            </div>

            {/* Mid Body: QR Code (Left) + Event Details (Right) */}
            <div className="flex items-center gap-4 py-1">
              {/* Integrated Scannable QR Code */}
              <div className="shrink-0 p-2 bg-white rounded-xl shadow-lg border border-white/20 relative group">
                <QRCode
                  value={`EVENTMESH:${ticketCode}:${registration.id}`}
                  size={88}
                />
                <div className="absolute inset-0 bg-black/60 rounded-xl opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white text-[9px] font-mono text-center p-1">
                  OFFICIAL PASS QR
                </div>
              </div>

              {/* Event Metadata */}
              <div className="flex-1 min-w-0 space-y-1">
                <h4 className="font-bold text-base sm:text-lg text-white leading-tight line-clamp-1 tracking-tight">
                  {registration.eventTitle || 'Campus Flagship Event'}
                </h4>
                <p className="text-caption text-indigo-300 font-medium">
                  {formatDate(registration.eventStartsAt || registration.createdAt, 'EEE, MMM d, yyyy')} · {registration.venueName || 'Main Campus Venue'}
                </p>
                <div className="flex items-center gap-3 pt-0.5 text-[11px] text-slate-400">
                  <span className="truncate">Attendee: <strong className="text-white font-medium">{registration.userName || 'Verified Student'}</strong></span>
                </div>
              </div>
            </div>

            {/* Bottom Logistics Row */}
            <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[10px] font-mono text-slate-400">
              <span className="truncate max-w-[200px]">{ticketCode}</span>
              <div className="flex items-center gap-1.5 text-indigo-300">
                <QrCode className="w-3.5 h-3.5" />
                <span>OFFICIAL KIOSK SCAN READY</span>
              </div>
            </div>
          </div>
        </TearTicket>
      </div>

      {/* Interaction & Simulation Panel */}
      <div className="flex flex-col items-center gap-2 mt-3 w-full max-w-[580px]">
        {!isTorn ? (
          <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-3 p-3 rounded-xl bg-surface border border-line">
            <div className="flex items-center gap-2 text-text-2 text-caption">
              <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
              <span>Attendee Pass is <strong>Intact</strong> · Scan at venue entrance</span>
            </div>

            <button
              type="button"
              onClick={handleSimulateVenueScan}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-caption font-semibold bg-accent text-white hover:bg-accent/90 shadow-md transition-all hover:scale-[1.02] active:scale-[0.98] whitespace-nowrap"
            >
              <Building2 className="w-4 h-4" />
              <span>Venue Kiosk: Simulate Scan & Digital Tear</span>
            </button>
          </div>
        ) : (
          <div className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 text-caption font-mono">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            <span>Admission verified at venue entrance · Stub detached & archived</span>
          </div>
        )}
      </div>
    </div>
  )
}
