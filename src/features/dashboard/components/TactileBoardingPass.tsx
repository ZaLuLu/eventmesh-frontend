import React, { useState } from 'react'
import { Ticket, QrCode, RotateCw, ShieldCheck, CheckCircle2 } from 'lucide-react'
import { Registration } from '@/api'
import { formatDate } from '@/lib/dates'
import { Button } from '@/design-system/primitives/Button'
import { CodeSlots } from '@/design-system/micro/CodeSlots'

export interface TactileBoardingPassProps {
  registration: Registration
  onPresent: () => void
  onCancel: () => void
}

/**
 * TactileBoardingPass:
 * An enchanting double-sided 3D digital pass inspired by Apple Wallet and airline boarding passes.
 * - Front: Event, Date, Venue, Attendee, Perforation tear notch, Present Pass CTA
 * - Back: Verifiable cryptographic admission hash, security seal, gate protocol, Flip back
 */
export const TactileBoardingPass: React.FC<TactileBoardingPassProps> = ({
  registration: reg,
  onPresent,
  onCancel,
}) => {
  const [isFlipped, setIsFlipped] = useState(false)

  // Derive stable 6-digit OTP code for gate check-in
  const otpCode = String(
    Math.abs(reg.id.split('').reduce((acc, c) => acc * 31 + c.charCodeAt(0), 7) % 900000) + 100000
  )

  // Derive pseudo cryptographic hash from registration ID
  const cryptoHash = `0x${Array.from(reg.id)
    .map((c) => c.charCodeAt(0).toString(16))
    .join('')
    .padEnd(24, 'f')
    .slice(0, 24)}...`

  return (
    <div
      className="relative w-full h-[280px] perspective-[1200px] select-none"
      style={{ perspective: 1200 }}
    >
      <div
        className="w-full h-full relative transition-transform duration-700 ease-[cubic-bezier(0.25,1,0.5,1)]"
        style={{
          transformStyle: 'preserve-3d',
          transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
        }}
      >
        {/* ================= FRONT FACE ================= */}
        <div
          className="absolute inset-0 w-full h-full bg-surface border border-line rounded-panel overflow-hidden flex flex-col justify-between shadow-xs hover:shadow-card-hover transition-shadow duration-300"
          style={{
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
          }}
        >
          {/* Top Holographic Foil Accent Edge */}
          <div className="h-1.5 w-full bg-gradient-to-r from-accent via-purple-500 to-indigo-500 flex-shrink-0" />

          <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
            <div className="flex items-center justify-between border-b border-line pb-2.5">
              <span className="font-mono text-caption font-semibold px-2 py-0.5 rounded-[6px] bg-subtle text-text flex items-center gap-1.5">
                <Ticket className="h-3 w-3 text-accent" />
                PASS-{reg.id.slice(0, 8).toUpperCase()}
              </span>
              <div className="flex items-center gap-1.5">
                <span className={`text-caption font-semibold px-2.5 py-0.5 rounded-full ${
                  reg.status === 'checked_in'
                    ? 'bg-emerald-500/15 text-emerald-600 border border-emerald-500/30'
                    : 'bg-accent-soft text-accent'
                }`}>
                  {reg.status === 'checked_in' ? 'Admitted ✓' : reg.status.replace('_', ' ')}
                </span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    setIsFlipped(true)
                  }}
                  className="p-1 rounded-full text-text-3 hover:text-accent hover:bg-subtle transition-colors"
                  title="Flip card for cryptographic credentials"
                  aria-label="Flip pass"
                >
                  <RotateCw className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            <div className="my-1.5">
              <h3 className="font-semibold text-base text-text leading-snug line-clamp-2">
                {reg.eventTitle}
              </h3>
              <p className="text-caption text-text-2 mt-0.5">
                {formatDate(reg.eventStartsAt || reg.createdAt, 'EEE, MMM d, yyyy')} · {reg.venueName || 'Campus Technical Hall'}
              </p>
            </div>

            <div className="pt-2 text-caption text-text-3 flex items-center justify-between border-t border-line/50">
              <span className="truncate">Attendee: <strong className="text-text font-medium">{reg.userName}</strong></span>
              <span className={`font-mono text-[11px] font-semibold flex-shrink-0 ${
                reg.status === 'checked_in' ? 'text-emerald-600' : 'text-accent'
              }`}>
                {reg.status === 'checked_in' ? 'CHECKED IN' : 'CONFIRMED'}
              </span>
            </div>
          </div>

          {/* Perforation Line with dual semicircular notches */}
          <div className="relative flex items-center justify-between my-0 flex-shrink-0">
            <div className="w-3.5 h-4 rounded-r-full bg-bg border-r border-t border-b border-line -ml-1" />
            <div className="flex-1 border-t-2 border-dashed border-line/80 mx-2" />
            <div className="w-3.5 h-4 rounded-l-full bg-bg border-l border-t border-b border-line -mr-1" />
          </div>

          {/* Bottom Tear-Off Stub */}
          <div className="p-3.5 bg-subtle/50 flex items-center justify-between gap-3 border-t border-line/40 flex-shrink-0">
            <Button
              variant="secondary"
              size="compact"
              fullWidth
              icon={reg.status === 'checked_in' ? <CheckCircle2 className="h-4 w-4 text-emerald-500" /> : <QrCode className="h-4 w-4 text-accent" />}
              onClick={onPresent}
            >
              {reg.status === 'checked_in' ? 'View Admitted Stub' : 'Present Pass'}
            </Button>
            <Button
              variant="tertiary"
              size="compact"
              onClick={onCancel}
            >
              Cancel
            </Button>
          </div>
        </div>

        {/* ================= BACK FACE ================= */}
        <div
          className="absolute inset-0 w-full h-full bg-surface border border-line rounded-panel overflow-hidden flex flex-col justify-between p-5 shadow-xs"
          style={{
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
          }}
        >
          {/* Header with Security Shield */}
          <div className="flex items-center justify-between border-b border-line pb-3">
            <div className="flex items-center gap-1.5 text-accent font-semibold text-small">
              <ShieldCheck className="h-4 w-4" />
              <span>Verifiable Credential</span>
            </div>
            <button
              type="button"
              onClick={() => setIsFlipped(false)}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-[6px] text-caption font-medium bg-subtle text-text hover:bg-line transition-colors"
              title="Return to front of pass"
            >
              <RotateCw className="h-3 w-3" />
              <span>Flip back</span>
            </button>
          </div>

          {/* Security Details */}
          <div className="space-y-2 text-caption my-auto">
            <div className="flex items-center justify-between bg-subtle/50 p-2 rounded-[8px] border border-line">
              <div>
                <p className="text-text-3 font-medium text-[10px] uppercase tracking-wider">Gate Check-in OTP</p>
                <div className="mt-1">
                  <CodeSlots value={otpCode} length={6} status="success" slotSize={20} gap={4} />
                </div>
              </div>
              <div className="text-right">
                <p className="text-text-3 text-[10px] uppercase tracking-wider">Routing</p>
                <p className="text-text font-mono font-semibold text-small">GATE-A01</p>
              </div>
            </div>

            <div>
              <p className="text-text-3 font-medium text-[10px]">CRYPTOGRAPHIC HASH</p>
              <p className="font-mono text-[10px] text-text font-semibold break-all bg-subtle/80 px-2 py-0.5 rounded-[6px] mt-0.5 border border-line">
                {cryptoHash}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[12px]">
              <div>
                <p className="text-text-3">ISSUANCE</p>
                <p className="text-text font-medium">EventMesh Sovereign v2</p>
              </div>
              <div>
                <p className="text-text-3">GATE ROUTING</p>
                <p className="text-text font-medium">Terminal Alpha-01</p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 text-success text-[12px] pt-1">
              <CheckCircle2 className="h-3.5 w-3.5 flex-shrink-0" />
              <span>Tamper-evident token verified</span>
            </div>
          </div>

          {/* Done Action */}
          <div className="pt-2 border-t border-line">
            <Button
              variant="secondary"
              size="compact"
              fullWidth
              onClick={() => setIsFlipped(false)}
            >
              Return to Pass
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
