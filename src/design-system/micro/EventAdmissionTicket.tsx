import React, { useState } from 'react'
import { TearTicket } from './TearTicket'
import { CodeSlots } from './CodeSlots'
import { QRCode } from '@/design-system/primitives'
import { formatDate } from '@/lib/dates'
import { playGateAdmissionChime, playTearImpulse } from '@/lib/sound'
import { fireCelebrationConfetti } from '@/lib/confetti'
import { CheckCircle2, QrCode, ScanLine, Sparkles } from 'lucide-react'

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

  const isTorn = isAlreadyAdmitted || isLocallyTorn
  const ticketCode = registration.ticketCode || `PASS-${registration.id.slice(0, 8).toUpperCase()}`
  const passSerial = registration.id.slice(0, 6).toUpperCase()

  // Dynamic 6-digit gate OTP based on ticket code
  const rollingOtp = String(
    Math.abs(ticketCode.split('').reduce((acc, c) => acc * 31 + c.charCodeAt(0), 7) % 900000) + 100000
  ).slice(0, 6)

  const handleTear = () => {
    if (isTorn || disabled) return

    playTearImpulse()
    setIsLocallyTorn(true)
    playGateAdmissionChime()
    fireCelebrationConfetti()

    if (onAdmit) {
      onAdmit()
    }
  }

  return (
    <div className={`flex flex-col items-center select-none ${className}`}>
      <div className="py-2 w-full flex justify-center overflow-hidden">
        <TearTicket
          width={580}
          height={230}
          stubSize={170}
          radius={18}
          holes={9}
          notch={12}
          torn={isTorn}
          onTear={handleTear}
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
                    <div className="inline-flex items-center gap-1 text-[9px] text-indigo-300/80 animate-pulse font-sans font-medium">
                      <ScanLine className="w-3 h-3" />
                      <span>PULL DOWN TO TEAR</span>
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

      {/* Helper Interaction Strip Below Ticket */}
      <div className="flex items-center gap-3 mt-1">
        {!isTorn ? (
          <button
            type="button"
            onClick={handleTear}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-caption font-semibold bg-indigo-500/15 hover:bg-indigo-500/25 text-indigo-300 border border-indigo-500/30 transition-all hover:scale-105"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>Simulate Gate Kiosk Check-In & Tear Stub</span>
          </button>
        ) : (
          <p className="text-caption text-emerald-400 font-mono flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4" />
            <span>Admission validated at campus gate · Stub detached</span>
          </p>
        )}
      </div>
    </div>
  )
}
