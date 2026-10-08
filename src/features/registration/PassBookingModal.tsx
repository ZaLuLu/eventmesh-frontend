import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import confetti from 'canvas-confetti'
import {
  X,
  Ticket,
  Calendar,
  MapPin,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  User,
  ExternalLink,
} from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useRegisterPass, useMyRegistrations } from '@/hooks/useRegistrations'
import { Button } from '@/design-system/primitives/Button'
import { QRCode } from '@/design-system/primitives/QRCode'
import { formatDate, formatTime } from '@/lib/dates'
import { Event } from '@/api'

export interface PassBookingModalProps {
  isOpen: boolean
  onClose: () => void
  event: Event
}

export const PassBookingModal: React.FC<PassBookingModalProps> = ({
  isOpen,
  onClose,
  event,
}) => {
  const { session, isAuthenticated } = useAuth()
  const registerMutation = useRegisterPass()
  const { data: myRegistrations = [] } = useMyRegistrations()
  const [successRegistration, setSuccessRegistration] = useState<any | null>(null)

  if (!isOpen) return null

  const isAlreadyRegistered =
    myRegistrations.some((r) => r.eventId === event.id || r.eventSlug === event.slug) ||
    Boolean(successRegistration)

  const handleClaimPass = async () => {
    try {
      const result = await registerMutation.mutateAsync(event.slug || event.id)
      setSuccessRegistration(result)
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 },
      })
    } catch (err: any) {
      // Handled by mutation or fallback
    }
  }

  const passholderName = session?.name || 'Registered Attendee'
  const passholderEmail = session?.email || 'attendee@campus.edu'
  const ticketCode =
    successRegistration?.id
      ? `PASS-${successRegistration.id.slice(0, 8).toUpperCase()}`
      : `PASS-${(event.id || 'EM').slice(0, 6).toUpperCase()}`

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-3xl bg-white border border-[#DADCE0] shadow-card-hover p-6 sm:p-8 overflow-hidden">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-[#F1F3F4] transition-colors"
          aria-label="Close dialog"
        >
          <X className="h-5 w-5" />
        </button>

        {!isAlreadyRegistered && !successRegistration ? (
          /* ==============================================================
             STEP 1: PASS CONFIRMATION & 1-TAP CLAIM
             ============================================================== */
          <div className="space-y-6">
            <div className="pr-6">
              <div className="flex items-center gap-2 text-xs font-semibold text-md-primary uppercase tracking-normal mb-1">
                <Ticket className="h-4 w-4" />
                <span>Instant Pass Reservation</span>
              </div>
              <h2 className="font-display font-bold text-2xl text-slate-900 leading-snug">
                {event.title}
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                1-tap confirmation backed by official EventMesh verification.
              </p>
            </div>

            {/* Event Summary Box */}
            <div className="rounded-2xl bg-[#F8F9FA] border border-[#DADCE0] p-4 space-y-3 text-xs">
              <div className="flex items-center justify-between text-slate-700">
                <span className="flex items-center gap-2">
                  <Calendar className="h-3.5 w-3.5 text-md-primary" />
                  <span>{formatDate(event.startsAt)} · {formatTime(event.startsAt)}</span>
                </span>
                <span className="font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 text-[11px]">
                  {event.features.paid ? (event.price ? `₹${event.price}` : 'Paid Pass') : 'Free Pass'}
                </span>
              </div>

              <div className="flex items-center gap-2 text-slate-600">
                <MapPin className="h-3.5 w-3.5 text-slate-400 flex-shrink-0" />
                <span className="truncate">{event.venue?.name || 'Main Campus Venue'}</span>
              </div>
            </div>

            {/* Attendee Profile Info */}
            <div className="rounded-2xl border border-[#DADCE0] p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-md-primary-container text-md-primary font-bold flex items-center justify-center text-sm">
                  {passholderName[0]}
                </div>
                <div>
                  <h4 className="font-bold text-xs text-slate-900">{passholderName}</h4>
                  <p className="text-[11px] text-slate-500">{passholderEmail}</p>
                </div>
              </div>

              <span className="text-[11px] text-emerald-700 bg-emerald-50 px-2 py-1 rounded-md font-semibold flex items-center gap-1">
                <ShieldCheck className="h-3.5 w-3.5" />
                Verified
              </span>
            </div>

            {/* Action Cluster */}
            <div className="space-y-3 pt-2">
              {isAuthenticated ? (
                <Button
                  size="lg"
                  fullWidth
                  variant="primary"
                  loading={registerMutation.isPending}
                  onClick={handleClaimPass}
                  arrow
                >
                  Confirm & Claim Pass
                </Button>
              ) : (
                <Link to="/login" className="block w-full">
                  <Button size="lg" fullWidth variant="primary" arrow>
                    Sign In to Claim Pass
                  </Button>
                </Link>
              )}

              <p className="text-[11px] text-center text-slate-400">
                Free cancellation anytime from your Passes Wallet.
              </p>
            </div>
          </div>
        ) : (
          /* ==============================================================
             STEP 2: CELEBRATION & LIVE QR PASS
             ============================================================== */
          <div className="space-y-6 text-center pt-2">
            <div className="mx-auto w-12 h-12 rounded-full bg-[#E6F4EA] text-[#137333] flex items-center justify-center">
              <CheckCircle2 className="h-7 w-7" />
            </div>

            <div>
              <span className="px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold uppercase tracking-wider inline-block mb-2">
                Pass Confirmed
              </span>
              <h2 className="font-display font-extrabold text-2xl text-slate-900">
                You're In!
              </h2>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                Your entry credential has been verified. Present this pass at the gate terminal.
              </p>
            </div>

            {/* Ticket Graphic */}
            <div className="rounded-2xl border border-[#DADCE0] bg-[#F8F9FA] p-5 max-w-xs mx-auto shadow-subtle space-y-4">
              <div className="flex items-center justify-between text-xs pb-3 border-b border-[#DADCE0]">
                <span className="font-mono font-bold text-slate-900">{ticketCode}</span>
                <span className="text-[10px] font-bold text-md-primary bg-md-primary-container px-2 py-0.5 rounded-full">
                  ACTIVE
                </span>
              </div>

              <div className="flex justify-center py-2 bg-white rounded-xl p-3 border border-slate-200">
                <QRCode
                  value={`EVENTMESH:${ticketCode}:${event.slug}`}
                  size={140}
                />
              </div>

              <div className="text-left text-xs space-y-1">
                <h4 className="font-bold text-slate-900 truncate">{event.title}</h4>
                <p className="text-slate-500 text-[11px]">
                  {formatDate(event.startsAt)} · {event.venue?.name}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <Link to="/attendee/dashboard" className="flex-1">
                <Button size="md" variant="primary" fullWidth icon={<Ticket className="h-4 w-4" />}>
                  Go to My Passes
                </Button>
              </Link>
              <Button size="md" variant="secondary" onClick={onClose}>
                Done
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
