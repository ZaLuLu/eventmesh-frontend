import React, { useState, useEffect } from 'react'
import { Event, Registration } from '@/api'
import { useAuth } from '@/hooks/useAuth'
import { useRegister, useMyRegistrations } from '@/hooks/useRegistrations'
import { useToast } from '@/design-system/primitives/Toast'
import { QRCode } from '@/design-system/primitives/QRCode'
import { downloadICS } from '@/lib/ics'
import { formatDate, formatTime, formatCurrency } from '@/lib/format'
import {
  X,
  CheckCircle,
  CalendarBlank,
  MapPin,
  Ticket,
  ArrowRight,
  DownloadSimple,
  Sparkle,
  User,
} from '@/design-system/Icon'
import { Link } from 'react-router-dom'

interface QuickRSVPModalProps {
  event: Event | null
  isOpen: boolean
  onClose: () => void
}

/**
 * QuickRSVPModal
 * Frictionless 1-Click Registration & RSVP Modal (Luma-inspired pattern)
 *
 * Rules Applied:
 * - Steve Krug (Don't Make Me Think): Strips multi-page redirect friction.
 * - Hick's Law: 1 clear primary action button for logged-in students.
 * - Fitts's Law: Generous touch targets and prominent primary CTA.
 * - Aesthetic-Usability Effect: High-contrast editorial container with crisp typography.
 */
export const QuickRSVPModal: React.FC<QuickRSVPModalProps> = ({
  event,
  isOpen,
  onClose,
}) => {
  const { session, isAuthenticated } = useAuth()
  const { toast } = useToast()
  const registerMutation = useRegister()
  const { data: myRegistrations = [] } = useMyRegistrations()

  // Form states
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [confirmedPass, setConfirmedPass] = useState<Registration | null>(null)
  const [error, setError] = useState('')

  // Check if user is already registered for this event
  const existingRegistration = event
    ? myRegistrations.find(
        (r) =>
          r.eventId === event.id ||
          (r as any).event_id === event.id ||
          (r as any).event?.slug === event.slug
      )
    : null

  useEffect(() => {
    if (session) {
      setName(session.name || 'Suraj Naik')
      setEmail(session.email || 'ceosuraj@email.com')
    } else {
      setName('')
      setEmail('')
    }
    setConfirmedPass(null)
    setError('')
  }, [session, event, isOpen])

  if (!isOpen || !event) return null

  const isPaid = !event.isFree && (event.price || 0) > 0
  const isSoldOut = event.seatsLeft === 0
  const isAlreadyRegistered = Boolean(existingRegistration || confirmedPass)
  const activePass = confirmedPass || existingRegistration

  const handleQuickSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    const submitName = name.trim() || session?.name || 'Attendee'
    const submitEmail = email.trim() || session?.email || ''

    if (!submitEmail || !submitEmail.includes('@')) {
      setError('Please provide a valid email address.')
      return
    }

    try {
      const res = await registerMutation.mutateAsync({
        eventId: event.id,
        answers: {
          fullName: submitName,
          email: submitEmail,
          studentId: (session as any)?.studentId || 'CTU-2026-0814',
          institution: 'Central Technological University',
        },
      })

      setConfirmedPass(res)
      toast({
        title: 'Pass Issued!',
        message: `You are registered for ${event.title}`,
        type: 'success',
      })
    } catch (err: any) {
      setError(err?.message || 'Could not complete registration. Please try again.')
    }
  }

  const handleDownloadCalendar = () => {
    try {
      downloadICS(event)
      toast({
        title: 'Calendar Saved',
        message: 'Event added to your calendar file (.ics).',
        type: 'info',
      })
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="quick-rsvp-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
    >
      {/* Solid High-Contrast Backdrop (Zero Glassmorphism) */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/70 transition-opacity"
        aria-hidden="true"
      />

      {/* Main Solid Editorial Container */}
      <div className="relative w-full max-w-lg rounded-[20px] bg-card border border-line shadow-2xl overflow-hidden z-10 animate-in fade-in zoom-in-95 duration-150">
        {/* Header Bar */}
        <div className="flex items-center justify-between border-b border-line px-6 py-4 bg-surface-subtle">
          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-md bg-accent text-white font-mono text-xs font-bold">
              EM
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-ink-muted">
              {isAlreadyRegistered ? 'Pass Confirmed' : 'Instant Pass Desk'}
            </span>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="rounded-full p-1.5 text-ink-muted hover:text-ink hover:bg-card transition-colors"
          >
            <X size={18} weight="bold" />
          </button>
        </div>

        <div className="p-6 sm:p-7 space-y-6">
          {/* Event Snapshot Block */}
          <div className="flex items-start gap-4 p-3.5 rounded-xl bg-surface-subtle border border-line">
            {event.poster ? (
              <img
                src={event.poster}
                alt={event.title}
                className="h-16 w-16 rounded-lg object-cover shrink-0 border border-line shadow-xs"
              />
            ) : (
              <div className="h-16 w-16 rounded-lg bg-accent-soft text-accent flex items-center justify-center shrink-0">
                <Ticket size={24} weight="bold" />
              </div>
            )}

            <div className="min-w-0 flex-1 space-y-1">
              <span className="inline-block px-2.5 py-0.5 text-xs font-mono font-bold uppercase tracking-wider rounded bg-accent-soft text-accent border border-accent/20">
                {event.category || 'Event'}
              </span>
              <h3 id="quick-rsvp-title" className="text-sm sm:text-base font-bold text-ink leading-snug line-clamp-2">
                {event.title}
              </h3>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-ink-muted font-mono">
                <span className="flex items-center gap-1">
                  <CalendarBlank size={12} className="text-accent" />
                  {formatDate(event.startsAt)} · {formatTime(event.startsAt)}
                </span>
                <span className="flex items-center gap-1">
                  <MapPin size={12} className="text-accent" />
                  {event.venue?.name || (event.isOnline ? 'Online' : 'Campus Venue')}
                </span>
              </div>
            </div>
          </div>

          {/* Conditional View: Pass Success State */}
          {isAlreadyRegistered && activePass ? (
            <div className="space-y-5 text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-success-soft text-success mx-auto">
                <CheckCircle size={28} weight="bold" />
              </div>

              <div className="space-y-1">
                <h4 className="text-lg font-bold text-ink">
                  Admission Pass Active
                </h4>
                <p className="text-xs text-ink-muted">
                  Your pass has been secured. Show this scannable QR ticket at the gate.
                </p>
              </div>

              {/* Scannable Pass Ticket Preview */}
              <div className="p-4 rounded-xl bg-surface-subtle border border-line flex flex-col items-center justify-center space-y-3">
                <div className="p-2 bg-card rounded-lg shadow-xs border border-line">
                  <QRCode
                    value={(activePass as any).qrCode || activePass.qrCodeDataUrl || activePass.id || `EVENTMESH:${event.id}:${session?.email || 'guest'}`}
                    size={140}
                  />
                </div>
                <div className="font-mono text-xs font-bold tracking-wider text-ink">
                  PASS #{activePass.id?.slice(0, 8).toUpperCase() || 'EM-CONFIRMED'}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-2.5">
                <button
                  type="button"
                  onClick={handleDownloadCalendar}
                  className="flex-1 h-11 rounded-xl border border-line hover:bg-surface-subtle text-ink font-semibold text-xs inline-flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <DownloadSimple size={15} weight="bold" />
                  <span>Add to Calendar</span>
                </button>

                <Link
                  to="/attendee/dashboard?tab=passes"
                  onClick={onClose}
                  className="flex-1 h-11 rounded-xl bg-ink text-paper hover:bg-accent hover:text-white font-semibold text-xs inline-flex items-center justify-center gap-1.5 transition-all shadow-sm cursor-pointer"
                >
                  <Ticket size={15} weight="bold" />
                  <span>View in My Passes →</span>
                </Link>
              </div>
            </div>
          ) : isSoldOut ? (
            /* Sold Out View */
            <div className="p-6 rounded-xl bg-danger-soft border border-danger/30 text-center space-y-2">
              <span className="font-mono text-xs font-bold uppercase text-danger">
                Event at Capacity
              </span>
              <p className="text-xs text-ink-soft">
                All allocated seats for this event are currently taken. Check back for cancellations or join the campus waitlist.
              </p>
            </div>
          ) : (
            /* Primary 1-Click Form */
            <form onSubmit={handleQuickSubmit} className="space-y-4">
              {error && (
                <div className="p-3 rounded-xl bg-danger-soft border border-danger/30 text-xs text-danger text-center font-medium">
                  {error}
                </div>
              )}

              {/* Authenticated Mode: 1-Tap Student Card */}
              {isAuthenticated ? (
                <div className="p-3.5 rounded-xl bg-accent-soft border border-accent/20 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-accent text-white flex items-center justify-center font-bold text-xs tracking-wider shadow-xs">
                      {name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase() || 'SN'}
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-ink">
                        {name} <span className="font-normal text-ink-muted text-xs">(CTU Lead)</span>
                      </div>
                      <div className="text-xs font-mono text-ink-muted">
                        {email}
                      </div>
                    </div>
                  </div>
                  <span className="inline-flex items-center gap-1 text-xs font-mono font-bold text-accent bg-card px-2.5 py-0.5 rounded border border-accent/20">
                    <Sparkle size={12} weight="fill" />
                    Verified
                  </span>
                </div>
              ) : (
                /* Unauthenticated Guest Flow (Luma Pattern: Name + Email, zero password) */
                <div className="space-y-3">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-ink-soft block">
                      Your Full Name
                    </label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Alex Morgan"
                      className="w-full h-10 px-3.5 rounded-xl border border-line bg-card text-ink text-xs outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-ink-soft block">
                      Email Address (Tickets delivered here)
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="alex@example.com"
                      className="w-full h-10 px-3.5 rounded-xl border border-line bg-card text-ink text-xs outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
                    />
                  </div>
                </div>
              )}

              {/* Price & Admission Summary */}
              <div className="flex items-center justify-between text-xs py-2 border-t border-line">
                <span className="text-ink-muted">Admission Fee:</span>
                <span className="font-mono font-bold text-ink">
                  {isPaid ? formatCurrency(event.price || 0) : 'Free Admission'}
                </span>
              </div>

              {/* Primary Action Button */}
              <button
                type="submit"
                disabled={registerMutation.isPending}
                className="w-full h-11 rounded-xl bg-ink text-paper hover:bg-accent hover:text-white font-semibold text-sm transition-all shadow-sm active:scale-[0.99] disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
              >
                <Sparkle size={16} weight="fill" />
                <span>
                  {registerMutation.isPending
                    ? 'Securing Pass…'
                    : isPaid
                    ? `Confirm Pass (${formatCurrency(event.price || 0)})`
                    : 'Get Pass · 1-Click RSVP'}
                </span>
              </button>

              <p className="text-xs text-center text-ink-muted font-mono">
                Instant delivery to your account & calendar · No fees
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
