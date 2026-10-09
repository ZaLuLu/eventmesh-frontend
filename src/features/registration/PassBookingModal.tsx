import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import confetti from 'canvas-confetti'
import {
  X,
  Ticket,
  Calendar,
  MapPin,
  CheckCircle2,
  ShieldCheck,
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
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="pass-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-text/40 animate-fade"
    >
      <div className="relative w-full max-w-lg rounded-panel bg-surface border border-line shadow-floating p-6 sm:p-8">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-button text-text-2 hover:text-text hover:bg-subtle transition-colors"
          aria-label="Close dialog"
        >
          <X className="h-5 w-5" />
        </button>

        {!isAlreadyRegistered && !successRegistration ? (
          /* Step 1: Pass Confirmation & 1-Tap Claim */
          <div className="space-y-5">
            <div className="pr-8">
              <div className="inline-flex items-center gap-1.5 text-caption font-semibold text-accent mb-1">
                <Ticket className="h-4 w-4" />
                <span>Instant pass reservation</span>
              </div>
              <h2 id="pass-modal-title" className="font-semibold text-h2 text-text leading-tight">
                {event.title}
              </h2>
              <p className="text-small text-text-2 mt-1">
                1-tap confirmation backed by official EventMesh verification.
              </p>
            </div>

            {/* Event Summary Box */}
            <div className="rounded-input bg-subtle border border-line p-4 space-y-2.5 text-small">
              <div className="flex items-center justify-between text-text">
                <span className="flex items-center gap-2 font-medium">
                  <Calendar className="h-4 w-4 text-accent shrink-0" />
                  <span>{formatDate(event.startsAt)} · {formatTime(event.startsAt)}</span>
                </span>
                <span className="font-semibold text-caption px-2.5 py-0.5 rounded-chip bg-surface border border-line text-text">
                  {event.features.paid ? (event.price ? `₹${event.price}` : 'Paid Pass') : 'Free Pass'}
                </span>
              </div>

              <div className="flex items-center gap-2 text-text-2">
                <MapPin className="h-4 w-4 text-accent shrink-0" />
                <span className="truncate">{event.venue?.name || 'Main Campus Venue'}</span>
              </div>
            </div>

            {/* Attendee Profile Info */}
            <div className="rounded-input bg-surface border border-line p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-input bg-accent-soft text-accent font-semibold flex items-center justify-center text-body">
                  {passholderName[0]}
                </div>
                <div>
                  <h4 className="font-semibold text-small text-text">{passholderName}</h4>
                  <p className="text-caption text-text-2">{passholderEmail}</p>
                </div>
              </div>

              <span className="text-caption text-success bg-surface border border-line px-2.5 py-1 rounded-chip font-semibold flex items-center gap-1">
                <ShieldCheck className="h-4 w-4 text-success" />
                Verified
              </span>
            </div>

            {/* Action Cluster */}
            <div className="space-y-3 pt-1">
              {isAuthenticated ? (
                <Button
                  size="default"
                  fullWidth
                  variant="primary"
                  loading={registerMutation.isPending}
                  onClick={handleClaimPass}
                >
                  Confirm & Claim Pass
                </Button>
              ) : (
                <Link to="/login" className="block w-full">
                  <Button size="default" fullWidth variant="primary">
                    Sign in to claim pass
                  </Button>
                </Link>
              )}

              <p className="text-caption text-center text-text-3">
                Free cancellation anytime from your Passes Wallet.
              </p>
            </div>
          </div>
        ) : (
          /* Step 2: Celebration & Live QR Pass */
          <div className="space-y-5 text-center pt-1">
            <div className="mx-auto w-12 h-12 rounded-full bg-accent-soft text-accent flex items-center justify-center">
              <CheckCircle2 className="h-6 w-6" />
            </div>

            <div>
              <span className="px-3 py-0.5 rounded-chip bg-accent-soft text-accent text-caption font-semibold inline-block mb-1.5">
                Pass confirmed
              </span>
              <h2 id="pass-modal-title" className="font-semibold text-h2 text-text">
                You're in!
              </h2>
              <p className="text-small text-text-2 mt-1 max-w-sm mx-auto">
                Your entry credential has been verified. Present this pass at the gate terminal.
              </p>
            </div>

            {/* Ticket Graphic */}
            <div className="rounded-panel bg-subtle border border-line p-5 max-w-xs mx-auto space-y-4">
              <div className="flex items-center justify-between text-caption pb-3 border-b border-line">
                <span className="font-mono font-semibold text-text">{ticketCode}</span>
                <span className="font-semibold text-on-accent bg-success px-2.5 py-0.5 rounded-chip">
                  ACTIVE
                </span>
              </div>

              <div className="flex justify-center py-2 bg-surface rounded-input p-4 border border-line">
                <QRCode
                  value={`EVENTMESH:${ticketCode}:${event.slug}`}
                  size={140}
                />
              </div>

              <div className="text-left text-small space-y-0.5">
                <h4 className="font-semibold text-text truncate">{event.title}</h4>
                <p className="text-text-2 text-caption">
                  {formatDate(event.startsAt)} · {event.venue?.name}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <Link to="/attendee/dashboard" className="flex-1">
                <Button size="default" variant="primary" fullWidth icon={<Ticket className="h-4 w-4" />}>
                  Go to my passes
                </Button>
              </Link>
              <Button size="default" variant="secondary" onClick={onClose}>
                Done
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

