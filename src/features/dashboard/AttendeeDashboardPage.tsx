import React, { useState, useMemo, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import {
  Ticket,
  Certificate as CertificateIcon,
  DownloadSimple,
  ShieldCheck,
  Copy,
  Check,
  IdentificationCard,
  ArrowRight,
  CalendarBlank,
  PencilSimple,
  ClockCounterClockwise,
  User,
  QrCode,
  MapPin,
  Chair,
} from '@phosphor-icons/react'
import { Button } from '@/design-system/primitives/Button'
import { useMyRegistrations, useCancelRegistration, useUpdateRegistrationStatus } from '@/hooks/useRegistrations'
import { useMyCertificates } from '@/hooks/useCertificates'
import { useEvents } from '@/hooks/useEvents'
import { useAuth } from '@/hooks/useAuth'
import { PageShell } from '@/design-system/layout/PageShell'
import { formatDate } from '@/lib/dates'
import { Registration, Certificate } from '@/api'
import { useToast } from '@/design-system/primitives/Toast'
import { fireCelebrationConfetti } from '@/lib/confetti'
import { EventAdmissionTicket } from '@/design-system/micro/EventAdmissionTicket'
import { StudentIDCard2D } from '@/design-system/3d/StudentIDCard2D'
import { AvatarSelectorModal } from './components/AvatarSelectorModal'
import { ProfileDetailsModal } from './components/ProfileDetailsModal'
import { resolveUserAvatar } from '@/lib/avatars'
import { Modal } from '@/design-system/primitives/Modal'
import { getUserScheduleWebCalUrl, getUserScheduleIcsUrl } from '@/lib/ics'

type MobileSegment = 'passes' | 'identity'

export const AttendeeDashboardPage: React.FC = () => {
  const { session } = useAuth()
  const { toast } = useToast()
  const { data: rawRegistrations = [], isLoading: regsLoading } = useMyRegistrations()
  const { data: certificates = [], isLoading: certsLoading } = useMyCertificates()
  const { data: upcomingData } = useEvents()
  const cancelMutation = useCancelRegistration()
  const updateStatusMutation = useUpdateRegistrationStatus()

  // Cache passes to localStorage so students can display tickets offline at venue gates
  useEffect(() => {
    if (rawRegistrations && rawRegistrations.length > 0) {
      try {
        localStorage.setItem('eventmesh_cached_passes', JSON.stringify(rawRegistrations))
      } catch {}
    }
  }, [rawRegistrations])

  const registrations = useMemo<Registration[]>(() => {
    if (rawRegistrations && rawRegistrations.length > 0) return rawRegistrations
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      try {
        const cached = localStorage.getItem('eventmesh_cached_passes')
        if (cached) return JSON.parse(cached)
      } catch {}
    }
    return []
  }, [rawRegistrations])

  const [searchParams] = useSearchParams()
  const [selectedTicket, setSelectedTicket] = useState<Registration | null>(null)
  const [mobileSegment, setMobileSegment] = useState<MobileSegment>('passes')
  const [walletTab, setWalletTab] = useState<'active' | 'past'>('active')
  const [calendarSyncOpen, setCalendarSyncOpen] = useState(false)
  const [copiedFeed, setCopiedFeed] = useState(false)
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false)
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false)
  const [avatarUrl, setAvatarUrl] = useState<string>(() => resolveUserAvatar(session))

  useEffect(() => {
    const tab = searchParams.get('tab')
    if (tab === 'history') {
      setWalletTab('past')
      setMobileSegment('passes')
    } else if (tab === 'profile' || tab === 'id' || tab === 'certificates') {
      setMobileSegment('identity')
    } else {
      setWalletTab('active')
      setMobileSegment('passes')
    }
  }, [searchParams])

  useEffect(() => {
    if (session) {
      setAvatarUrl(resolveUserAvatar(session))
    }
  }, [session])

  // Student Identity Data
  const studentData = useMemo(() => {
    const s = session as any
    const rawName = s?.name || 'EventMesh Member'
    const cleanName = rawName
      .replace(/\s*\([^)]*\)/g, '')
      .trim() || 'EventMesh Member'

    return {
      name: cleanName,
      registrationNumber: s?.registrationNumber || s?.studentId || 'EM-2026-0814',
      degreeBranch: s?.degreeBranch || s?.branch || 'Campus Student',
      semester: s?.semester || 6,
      email: s?.email || '',
      role: 'EVENTMESH MEMBER',
      campus: s?.campus || s?.institutionName || 'Apex Institute',
      bloodGroup: s?.bloodGroup || 'O+',
      emergencyPhone: s?.emergencyPhone || s?.phone,
      phone: s?.phone || '',
    }
  }, [session])

  const handleCopyRegNo = () => {
    navigator.clipboard.writeText(studentData.registrationNumber)
    toast({
      title: 'Copied ID',
      message: `${studentData.registrationNumber} copied to clipboard`,
      type: 'info',
    })
  }

  const handleCancelPass = async (reg: Registration) => {
    if (window.confirm('Are you sure you want to cancel this ticket pass?')) {
      try {
        await cancelMutation.mutateAsync(reg.eventSlug || reg.eventId)
        setSelectedTicket(null)
        toast({
          title: 'Pass cancelled',
          message: 'Your registration was cancelled and the seat returned to the pool.',
          type: 'info',
        })
      } catch (err: any) {
        toast({
          title: 'Cancellation failed',
          message: err?.message || 'Could not cancel pass.',
          type: 'error',
        })
      }
    }
  }

  const downloadCertificatePDF = async (cert: Certificate) => {
    try {
      const { jsPDF } = await import('jspdf')
      const doc = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4',
      })

      // Warm paper background (#FAF8FF)
      doc.setFillColor(250, 248, 255)
      doc.rect(0, 0, 297, 210, 'F')

      // Double ink border
      doc.setDrawColor(18, 13, 36)
      doc.setLineWidth(1.5)
      doc.rect(12, 12, 273, 186)

      doc.setDrawColor(124, 58, 237)
      doc.setLineWidth(0.6)
      doc.rect(15, 15, 267, 180)

      doc.setFont('helvetica', 'normal')
      doc.setFontSize(11)
      doc.setTextColor(78, 70, 107)
      doc.text('EVENTMESH · VERIFIABLE CAMPUS CREDENTIAL', 148.5, 36, { align: 'center' })

      doc.setFont('helvetica', 'bold')
      doc.setFontSize(28)
      doc.setTextColor(18, 13, 36)
      doc.text('CERTIFICATE OF PARTICIPATION', 148.5, 52, { align: 'center' })

      doc.setFont('helvetica', 'normal')
      doc.setFontSize(13)
      doc.setTextColor(78, 70, 107)
      doc.text('This document certifies that', 148.5, 75, { align: 'center' })

      doc.setFont('helvetica', 'bold')
      doc.setFontSize(22)
      doc.setTextColor(124, 58, 237)
      doc.text(cert.recipientName.toUpperCase(), 148.5, 92, { align: 'center' })

      doc.setFont('helvetica', 'normal')
      doc.setFontSize(13)
      doc.setTextColor(78, 70, 107)
      doc.text('has successfully completed & attended', 148.5, 108, { align: 'center' })

      doc.setFont('helvetica', 'bold')
      doc.setFontSize(18)
      doc.setTextColor(18, 13, 36)
      doc.text(cert.eventTitle.toUpperCase(), 148.5, 122, { align: 'center' })

      doc.setFont('helvetica', 'normal')
      doc.setFontSize(11)
      doc.setTextColor(78, 70, 107)
      doc.text(`Organized by ${cert.organizerName}`, 148.5, 134, { align: 'center' })

      doc.setFont('helvetica', 'normal')
      doc.setFontSize(9)
      doc.setTextColor(78, 70, 107)
      doc.text(
        `Certificate ID: ${cert.certificateId} · Issued ${formatDate(cert.issuedAt)} · Verified by EventMesh`,
        148.5,
        178,
        { align: 'center' }
      )

      doc.save(`${cert.certificateId}.pdf`)
      fireCelebrationConfetti()

      toast({
        title: 'Certificate downloaded',
        message: `Saved ${cert.certificateId}.pdf`,
        type: 'success',
      })
    } catch {
      toast({ title: 'Download failed', type: 'error' })
    }
  }

  // Enriched registrations hydrated with event and attendee details
  const enrichedRegistrations = useMemo(() => {
    const events = upcomingData?.items || []
    const eventsMap = new Map<string, any>()
    for (const e of events) {
      if (e.id) eventsMap.set(String(e.id), e)
      if (e.slug) eventsMap.set(String(e.slug), e)
    }

    return registrations.map((reg) => {
      const match = eventsMap.get(String(reg.eventId)) || eventsMap.get(String(reg.eventSlug))
      const resolvedUserName =
        reg.userName && reg.userName !== 'Passholder' && reg.userName !== 'Student Passholder'
          ? reg.userName
          : studentData.name || session?.name || 'Verified Attendee'

      if (!match) {
        return {
          ...reg,
          userName: resolvedUserName,
        }
      }

      return {
        ...reg,
        eventTitle:
          reg.eventTitle && reg.eventTitle !== 'Event Pass'
            ? reg.eventTitle
            : match.title || 'Event Pass',
        eventSlug: reg.eventSlug || match.slug,
        eventStartsAt: reg.eventStartsAt || match.startsAt,
        venueName:
          reg.venueName && reg.venueName !== 'Main Campus Venue'
            ? reg.venueName
            : match.venue?.name || match.location || 'Main Campus Venue',
        organizerName:
          reg.organizerName && reg.organizerName !== 'Event Host' && reg.organizerName !== 'Campus Host'
            ? reg.organizerName
            : match.clubName || match.organization?.name || 'Campus Organization',
        tierName: reg.tierName || (match.type ? match.type.toUpperCase() : 'GENERAL ADMISSION'),
        userName: resolvedUserName,
      }
    })
  }, [registrations, upcomingData, session, studentData])

  // Active Passes vs Past History
  const activePasses = useMemo(() => {
    return enrichedRegistrations.filter((r) => {
      if (r.status === 'cancelled') return false
      if (r.status === 'checked_in') return false
      if (r.eventStartsAt && new Date(r.eventStartsAt).getTime() < Date.now() - 24 * 3600 * 1000) {
        return false
      }
      return true
    })
  }, [enrichedRegistrations])

  const historyPasses = useMemo(() => {
    return enrichedRegistrations.filter((r) => {
      if (r.status === 'cancelled') return true
      if (r.status === 'checked_in') return true
      if (r.eventStartsAt && new Date(r.eventStartsAt).getTime() < Date.now() - 24 * 3600 * 1000) {
        return true
      }
      return false
    })
  }, [enrichedRegistrations])

  // Check if an event is imminent (today or within 24 hours)
  const isImminent = (startsAt?: string) => {
    if (!startsAt) return false
    const time = new Date(startsAt).getTime()
    const now = Date.now()
    return time >= now && time <= now + 24 * 3600 * 1000
  }

  return (
    <PageShell className="py-6 sm:py-8 space-y-8">
      {/* ========================================================================= */}
      {/* 1. QUIET, CLEAN TOP BAR (Zero Profile Duplication)                         */}
      {/* ========================================================================= */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-line/60 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-mono font-bold tracking-wider uppercase text-text-3">
              CAMPUS WALLET · {studentData.campus.toUpperCase()}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-display font-bold text-text tracking-tight mt-1">
            Attendee Passes &amp; Identity
          </h1>
        </div>

        {/* Quiet Utility Actions */}
        <div className="flex items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={() => setCalendarSyncOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-line bg-surface hover:bg-subtle text-xs font-semibold text-text shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            <CalendarBlank size={15} className="text-accent" weight="bold" />
            <span>Sync Calendar</span>
          </button>
          <button
            type="button"
            onClick={() => setIsProfileModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-line bg-surface hover:bg-subtle text-xs font-semibold text-text shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            <PencilSimple size={15} className="text-accent" />
            <span>Edit Profile</span>
          </button>
        </div>
      </header>

      {/* ========================================================================= */}
      {/* MOBILE SEGMENTED SWITCHER (<1024px)                                       */}
      {/* ========================================================================= */}
      <div className="lg:hidden">
        <div
          role="tablist"
          aria-label="Mobile sections"
          className="flex items-center p-1 rounded-xl bg-subtle border border-line"
        >
          <button
            type="button"
            role="tab"
            aria-selected={mobileSegment === 'passes'}
            onClick={() => setMobileSegment('passes')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold transition-all ${
              mobileSegment === 'passes'
                ? 'bg-surface text-text shadow-xs border border-line'
                : 'text-text-2 hover:text-text'
            }`}
          >
            <Ticket size={16} weight={mobileSegment === 'passes' ? 'fill' : 'regular'} className="text-accent" />
            <span>Passes</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono bg-accent text-white font-bold">
              {activePasses.length}
            </span>
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={mobileSegment === 'identity'}
            onClick={() => setMobileSegment('identity')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold transition-all ${
              mobileSegment === 'identity'
                ? 'bg-surface text-text shadow-xs border border-line'
                : 'text-text-2 hover:text-text'
            }`}
          >
            <IdentificationCard size={16} weight={mobileSegment === 'identity' ? 'fill' : 'regular'} className="text-accent" />
            <span>ID &amp; Credentials</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. MAIN 2-COLUMN PROFESSIONAL STAGE                                       */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

        {/* ======================================================================= */}
        {/* LEFT COLUMN (4 COLS): STUDENT ID CARD & CREDENTIALS SHELF               */}
        {/* ======================================================================= */}
        <aside
          className={`lg:col-span-4 space-y-6 ${
            mobileSegment === 'identity' ? 'block' : 'hidden lg:block'
          }`}
        >
          {/* 1. STANDALONE 3D STUDENT ID CARD */}
          <section className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <span className="text-xs font-mono font-bold tracking-wider uppercase text-text-3">
                CAMPUS SMARTCARD
              </span>
              <span className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                VERIFIED ID
              </span>
            </div>

            {/* Central Identity Card Artifact */}
            <div className="w-full flex flex-col items-center">
              <StudentIDCard2D
                name={studentData.name}
                registrationNumber={studentData.registrationNumber}
                degreeBranch={studentData.degreeBranch}
                semester={studentData.semester}
                email={studentData.email}
                role={studentData.role}
                campus={studentData.campus}
                avatarUrl={avatarUrl}
                onAvatarClick={() => setIsAvatarModalOpen(true)}
                interactive={true}
              />
            </div>

            {/* Identity Sub-Actions */}
            <div className="flex items-center justify-between px-1 text-xs font-mono">
              <button
                type="button"
                onClick={() => setIsAvatarModalOpen(true)}
                className="text-text-2 hover:text-text font-medium transition-colors flex items-center gap-1"
              >
                <User size={13} />
                <span>Change Photo</span>
              </button>
              <button
                type="button"
                onClick={handleCopyRegNo}
                className="text-accent hover:text-accent-hover font-semibold transition-colors flex items-center gap-1"
              >
                <Copy size={13} />
                <span>Copy Student ID</span>
              </button>
            </div>
          </section>

          {/* 2. VERIFIABLE CREDENTIALS SHELF (Directly Beneath ID) */}
          <section className="bg-surface border border-line rounded-2xl p-5 shadow-xs space-y-3.5">
            <div className="flex items-center justify-between border-b border-line/60 pb-3">
              <div className="flex items-center gap-2">
                <CertificateIcon size={16} weight="fill" className="text-accent" />
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-text">
                  VERIFIED CREDENTIALS
                </span>
              </div>
              <span className="text-xs font-mono font-bold text-text-3">
                {certificates.length} Issued
              </span>
            </div>

            <p className="text-xs text-text-2 leading-relaxed">
              Official campus completion credentials attested by EventMesh.
            </p>

            {certsLoading ? (
              <p className="text-xs font-mono text-text-3 py-2">Loading certificates...</p>
            ) : certificates.length === 0 ? (
              <div className="py-4 text-center">
                <p className="text-xs text-text-3">No certificates issued yet.</p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {certificates.map((cert) => (
                  <div
                    key={cert.id || cert.certificateId}
                    className="p-3 rounded-xl border border-line bg-surface-subtle/50 hover:border-line-strong transition-colors flex items-center justify-between gap-3"
                  >
                    <div className="min-w-0">
                      <h4 className="text-xs font-bold text-text truncate">
                        {cert.eventTitle}
                      </h4>
                      <p className="text-[11px] text-text-3 font-mono">
                        {formatDate(cert.issuedAt)} · {cert.organizerName}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => downloadCertificatePDF(cert)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-surface border border-line hover:bg-subtle text-xs font-bold text-text transition-colors shrink-0 shadow-2xs active:scale-98"
                      title="Download Certificate PDF"
                    >
                      <DownloadSimple size={13} weight="bold" />
                      <span>PDF</span>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>
        </aside>

        {/* ======================================================================= */}
        {/* RIGHT COLUMN (8 COLS): PURE TICKET WALLET (Zero Clutter)                */}
        {/* ======================================================================= */}
        <section
          className={`lg:col-span-8 space-y-6 ${
            mobileSegment === 'passes' ? 'block' : 'hidden lg:block'
          }`}
        >
          {/* Top Section Header with In-Place Switcher */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-surface border border-line rounded-2xl p-4 shadow-xs">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-text">Admission Passes</h2>
                <span className="px-2 py-0.5 rounded-full text-xs font-mono font-bold bg-accent text-white">
                  {walletTab === 'active' ? activePasses.length : historyPasses.length}
                </span>
              </div>
              <p className="text-xs text-text-3 mt-0.5">
                {walletTab === 'active'
                  ? 'Tap any pass to view scannable barcode and tear stub'
                  : 'Historical record of events attended on campus'}
              </p>
            </div>

            {/* In-Place Filter Switcher */}
            <div className="flex items-center p-1 bg-subtle rounded-xl border border-line">
              <button
                type="button"
                onClick={() => setWalletTab('active')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  walletTab === 'active'
                    ? 'bg-surface text-text shadow-2xs border border-line'
                    : 'text-text-2 hover:text-text'
                }`}
              >
                Active Passes ({activePasses.length})
              </button>
              <button
                type="button"
                onClick={() => setWalletTab('past')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  walletTab === 'past'
                    ? 'bg-surface text-text shadow-2xs border border-line'
                    : 'text-text-2 hover:text-text'
                }`}
              >
                Past History ({historyPasses.length})
              </button>
            </div>
          </div>

          {/* ===================================================================== */}
          {/* VIEW A: ACTIVE PASSES (SIDE-BY-SIDE TICKET STACK)                     */}
          {/* ===================================================================== */}
          {walletTab === 'active' && (
            <div>
              {regsLoading ? (
                <div className="py-12 text-center">
                  <p className="text-xs font-mono text-text-3">Loading active passes...</p>
                </div>
              ) : activePasses.length === 0 ? (
                <div className="rounded-2xl border border-line bg-surface p-12 text-center space-y-3">
                  <div className="w-12 h-12 rounded-xl bg-subtle border border-line mx-auto flex items-center justify-center text-accent">
                    <Ticket size={24} />
                  </div>
                  <h3 className="font-display font-bold text-lg text-text">No active passes in your wallet</h3>
                  <p className="text-xs sm:text-sm text-text-2 max-w-sm mx-auto">
                    You haven't reserved admission for upcoming campus events. Browse premieres to grab a pass.
                  </p>
                  <div className="pt-2">
                    <Link to="/explore">
                      <Button variant="primary" size="sm">
                        Explore Campus Events
                      </Button>
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {activePasses.map((reg) => {
                    const eventImminent = isImminent(reg.eventStartsAt)
                    const ticketCode = (reg as any).code || (reg as any).ticketCode || `EM-${String(reg.id).slice(-4).toUpperCase()}`

                    return (
                      <div
                        key={reg.id}
                        onClick={() => {
                          setSelectedTicket(reg)
                          fireCelebrationConfetti()
                        }}
                        className="relative bg-surface border border-line hover:border-line-strong rounded-[14px] shadow-xs hover:shadow-md transition-all duration-200 cursor-pointer overflow-hidden flex flex-col justify-between group"
                      >
                        {/* Semi-Circular Punch Notches */}
                        <div
                          className="absolute -top-[10px] right-[125px] w-[20px] h-[20px] rounded-full border-b border-line bg-canvas z-10"
                          style={{ backgroundColor: 'var(--canvas, #FAF8FF)' }}
                        />
                        <div
                          className="absolute -bottom-[10px] right-[125px] w-[20px] h-[20px] rounded-full border-t border-line bg-canvas z-10"
                          style={{ backgroundColor: 'var(--canvas, #FAF8FF)' }}
                        />

                        {/* Top Status Strip */}
                        {eventImminent ? (
                          <div className="bg-emerald-600 px-5 py-2 flex items-center justify-between text-white text-xs font-mono font-bold">
                            <span className="flex items-center gap-1.5 tracking-wider uppercase">
                              <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                              GATE READY · TODAY
                            </span>
                            <span>{reg.eventStartsAt ? formatDate(reg.eventStartsAt).split(',')[0] : 'IMMINENT'}</span>
                          </div>
                        ) : (
                          <div className="bg-ink px-5 py-2 flex items-center justify-between text-white text-xs font-mono font-bold">
                            <span className="tracking-wider uppercase text-white/90">
                              CONFIRMED PASS
                            </span>
                            <span className="text-white/80">
                              {reg.eventStartsAt ? formatDate(reg.eventStartsAt).split(',')[0] : 'UPCOMING'}
                            </span>
                          </div>
                        )}

                        {/* Ticket Interior */}
                        <div className="p-5 flex items-stretch justify-between gap-4">
                          {/* Left Event Details */}
                          <div className="flex-1 space-y-3 min-w-0">
                            <div>
                              <span className="text-[10px] font-mono uppercase tracking-widest text-text-3 font-semibold block truncate">
                                {reg.organizerName || 'CAMPUS PREMIERE'}
                              </span>
                              <h3 className="text-base font-bold text-text leading-snug group-hover:text-accent transition-colors mt-0.5 line-clamp-2">
                                {reg.eventTitle || 'Campus Admission Pass'}
                              </h3>
                            </div>

                            <div className="space-y-1 text-xs">
                              <p className="text-text-2 font-mono flex items-center gap-1.5 truncate">
                                <MapPin size={13} className="shrink-0 text-text-3" />
                                <span className="truncate">{reg.venueName || 'Main Campus Venue'}</span>
                              </p>
                              <p className="text-text-2 font-mono flex items-center gap-1.5">
                                <Chair size={13} className="shrink-0 text-text-3" />
                                <span className="font-bold text-text">Gate Admission · Verified</span>
                              </p>
                            </div>

                            <div className="pt-2 border-t border-line/60">
                              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-subtle text-text-2 border border-line">
                                {reg.tierName || 'GENERAL ADMISSION'}
                              </span>
                            </div>
                          </div>

                          {/* Vertical Dashed Perforation Divider */}
                          <div className="w-px border-r-2 border-dashed border-line my-1 shrink-0" />

                          {/* Right Gate Stub */}
                          <div className="w-[110px] bg-subtle/60 rounded-xl p-2.5 flex flex-col items-center justify-between text-center shrink-0 border border-line">
                            <div>
                              <p className="text-[10px] font-mono uppercase text-text-3">Pass Code</p>
                              <p className="text-xs font-mono font-bold text-text mt-0.5 truncate">{ticketCode}</p>
                            </div>

                            {/* Optical QR Scanner Hint */}
                            <div className="my-1.5 bg-surface p-1 rounded-lg border border-line shadow-2xs">
                              <div className="w-14 h-14 bg-ink rounded p-1 flex items-center justify-center text-white text-[10px] font-mono font-bold text-center">
                                <QrCode size={34} weight="bold" />
                              </div>
                            </div>

                            <span className="text-[11px] font-bold text-accent group-hover:underline">
                              Tap to Tear ➔
                            </span>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )}

          {/* ===================================================================== */}
          {/* VIEW B: PAST HISTORY (COMPACT ARCHIVAL LEDGER LIST)                   */}
          {/* ===================================================================== */}
          {walletTab === 'past' && (
            <div className="space-y-3">
              {regsLoading ? (
                <div className="py-12 text-center">
                  <p className="text-xs font-mono text-text-3">Loading historical passes...</p>
                </div>
              ) : historyPasses.length === 0 ? (
                <div className="rounded-2xl border border-line bg-surface p-12 text-center space-y-3">
                  <div className="w-12 h-12 rounded-xl bg-subtle border border-line mx-auto flex items-center justify-center text-text-3">
                    <ClockCounterClockwise size={24} />
                  </div>
                  <h3 className="font-display font-bold text-lg text-text">No past event history</h3>
                  <p className="text-xs sm:text-sm text-text-2 max-w-sm mx-auto">
                    Once you attend events and check in at campus gates, your keepsake records will appear here.
                  </p>
                </div>
              ) : (
                historyPasses.map((reg) => (
                  <div
                    key={reg.id}
                    onClick={() => {
                      setSelectedTicket(reg)
                      fireCelebrationConfetti()
                    }}
                    className="p-4 rounded-xl border border-line bg-surface hover:border-line-strong transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs group"
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0" />
                      <div className="min-w-0">
                        <h4 className="text-sm font-bold text-text truncate group-hover:text-accent transition-colors">
                          {reg.eventTitle}
                        </h4>
                        <p className="text-xs text-text-3 font-mono truncate">
                          {reg.eventStartsAt ? formatDate(reg.eventStartsAt) : 'Past Event'} · {reg.venueName || 'Main Campus Venue'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0 self-end sm:self-auto">
                      <span className="px-2.5 py-1 rounded-full text-xs font-mono font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                        ✓ ADMISSION VERIFIED
                      </span>
                      <span className="text-xs font-mono text-text-3 group-hover:text-text transition-colors">
                        Inspect Pass ➔
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </section>
      </div>

      {/* ========================================================================= */}
      {/* 3. TACTILE GATE TEAR-OFF MODAL INSPECTION                                 */}
      {/* ========================================================================= */}
      {selectedTicket && (
        <EventAdmissionTicket
          registration={selectedTicket}
          floatingCanvas={true}
          demoMode={false}
          onClose={() => setSelectedTicket(null)}
          onAdmit={() => {
            updateStatusMutation.mutate({
              id: selectedTicket.id,
              status: 'checked_in',
            })
            setSelectedTicket({
              ...selectedTicket,
              status: 'checked_in',
            })
            toast({
              title: 'Admission Verified!',
              message: `Gate stub validated for ${selectedTicket.eventTitle}.`,
              type: 'success',
            })
          }}
        />
      )}

      {/* Profile Details Modal */}
      <ProfileDetailsModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
      />

      {/* Avatar Customizer Modal */}
      <AvatarSelectorModal
        isOpen={isAvatarModalOpen}
        onClose={() => setIsAvatarModalOpen(false)}
        onAvatarSelected={(url) => setAvatarUrl(url)}
      />

      {/* Live Calendar Subscription Modal */}
      <Modal
        isOpen={calendarSyncOpen}
        onClose={() => setCalendarSyncOpen(false)}
        title="Sync Passes to Your Calendar"
        subtitle="Subscribe with Apple Calendar, Google Calendar, or Outlook to keep your confirmed events automatically updated."
        maxWidth="max-w-md"
      >
        <div className="space-y-4 pt-1">
          <div className="p-3.5 rounded-xl bg-subtle border border-line text-xs space-y-1.5">
            <p className="font-semibold text-text flex items-center gap-1.5">
              <span>⚡ Live WebCal Feed</span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-bold">
                Auto-Refreshing
              </span>
            </p>
            <p className="text-text-2">
              Anytime you RSVP to an event or session timings update, your calendar syncs automatically without downloading a new file.
            </p>
          </div>

          <div className="space-y-2">
            {/* 1-Tap Apple Calendar / Outlook */}
            <a
              href={getUserScheduleWebCalUrl(session?.id || 'me')}
              className="flex items-center justify-between p-3.5 rounded-xl border border-line bg-surface hover:bg-subtle text-text transition-colors group"
            >
              <div className="flex items-center gap-3">
                <span className="text-xl">🍏</span>
                <div>
                  <p className="text-sm font-semibold">Apple Calendar / Outlook</p>
                  <p className="text-xs text-text-2">1-tap subscribe via native WebCal</p>
                </div>
              </div>
              <ArrowRight size={15} className="text-text-3 group-hover:text-text transition-colors" />
            </a>

            {/* Direct .ics Download */}
            <a
              href={getUserScheduleIcsUrl(session?.id || 'me')}
              download="eventmesh-my-schedule.ics"
              className="flex items-center justify-between p-3.5 rounded-xl border border-line bg-surface hover:bg-subtle text-text transition-colors group"
            >
              <div className="flex items-center gap-3">
                <span className="text-xl">📥</span>
                <div>
                  <p className="text-sm font-semibold">Download .ICS Snapshot</p>
                  <p className="text-xs text-text-2">Save current passes as a static calendar file</p>
                </div>
              </div>
              <span className="text-xs font-mono text-text-3 group-hover:text-text">.ics</span>
            </a>
          </div>

          {/* Copy WebCal Feed URL */}
          <div className="pt-2 border-t border-line">
            <label className="text-xs font-mono uppercase tracking-wider text-text-3 block mb-1.5">
              Personal WebCal URL
            </label>
            <div className="flex items-center gap-2">
              <input
                readOnly
                value={getUserScheduleWebCalUrl(session?.id || 'me')}
                className="flex-1 bg-subtle border border-line rounded-lg px-3 py-1.5 text-xs font-mono text-text select-all"
              />
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(getUserScheduleWebCalUrl(session?.id || 'me'))
                  setCopiedFeed(true)
                  setTimeout(() => setCopiedFeed(false), 2000)
                  toast({
                    title: 'Feed URL copied',
                    message: 'Add as a subscribed calendar in Google Calendar or Outlook settings.',
                    type: 'success',
                  })
                }}
                className="px-3 py-1.5 bg-accent text-on-accent rounded-lg text-xs font-semibold hover:opacity-90 active:scale-95 transition-transform shrink-0 flex items-center gap-1 shadow-xs"
              >
                {copiedFeed ? <Check size={13} /> : <Copy size={13} />}
                <span>{copiedFeed ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
            <p className="text-[11px] text-text-3 mt-1.5">
              In Google Calendar, go to <i>Other calendars + &gt; From URL</i> and paste this link.
            </p>
          </div>
        </div>
      </Modal>
    </PageShell>
  )
}

export default AttendeeDashboardPage
