import React, { useState, useMemo, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import {
  Ticket,
  Certificate as CertificateIcon,
  DownloadSimple,
  Copy,
  IdentificationCard,
  CalendarBlank,
  PencilSimple,
  ClockCounterClockwise,
  User,
  QrCode,
  MapPin,
  Chair,
  FolderSimple,
  Sparkle,
  Check,
} from '@phosphor-icons/react'
import { useMyRegistrations, useCancelRegistration, useUpdateRegistrationStatus } from '@/hooks/useRegistrations'
import { useMyCertificates } from '@/hooks/useCertificates'
import { useEvents } from '@/hooks/useEvents'
import { useAuth } from '@/hooks/useAuth'
import { PageShell } from '@/design-system/layout/PageShell'
import { Button } from '@/design-system/primitives/Button'
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
import { getUserScheduleWebCalUrl, getUserScheduleIcsUrl, downloadICS } from '@/lib/ics'
import FolderFloat from '@/components/FolderFloat'

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
  const [mountedTicketId, setMountedTicketId] = useState<string | null>(null)
  const [viewHistoryArchive, setViewHistoryArchive] = useState(false)
  const [calendarSyncOpen, setCalendarSyncOpen] = useState(false)
  const [copiedFeed, setCopiedFeed] = useState(false)
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false)
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false)
  const [avatarUrl, setAvatarUrl] = useState<string>(() => resolveUserAvatar(session))
  const [docketCategory, setDocketCategory] = useState<'passes' | 'honors' | 'keepsakes'>('passes')
  const [selectedCertificateId, setSelectedCertificateId] = useState<string | null>(null)
  const [isBrightnessModalOpen, setIsBrightnessModalOpen] = useState(false)
  const [isVenueModalOpen, setIsVenueModalOpen] = useState(false)
  const [gateCountdown, setGateCountdown] = useState<string>('')
  const [qrDataUrl, setQrDataUrl] = useState<string>('')

  useEffect(() => {
    const tab = searchParams.get('tab')
    if (tab === 'history') {
      setViewHistoryArchive(true)
    } else if (tab === 'profile') {
      setIsProfileModalOpen(true)
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
      registrationNumber: s?.registrationNumber || s?.studentId || 'CTU-2026-0814',
      degreeBranch: s?.degreeBranch || s?.branch || 'B.Tech Computer Science & Eng.',
      semester: s?.semester || 6,
      email: s?.email || '',
      role: 'EVENTMESH MEMBER',
      campus: s?.campus || s?.institutionName || 'Central Technological University (CTU Main Campus)',
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

  // Select the currently mounted ticket for the right side of the folder docket
  const mountedTicket = useMemo<Registration | null>(() => {
    if (mountedTicketId) {
      const match = enrichedRegistrations.find((r) => r.id === mountedTicketId)
      if (match) return match
    }
    // Default to the first active pass, or first past pass if no active passes
    return activePasses[0] || historyPasses[0] || null
  }, [mountedTicketId, activePasses, historyPasses, enrichedRegistrations])

  // Select the currently mounted certificate for the honors stage
  const mountedCertificate = useMemo<Certificate | null>(() => {
    if (selectedCertificateId) {
      const match = certificates.find((c) => String(c.id || c.certificateId) === selectedCertificateId)
      if (match) return match
    }
    return certificates[0] || null
  }, [selectedCertificateId, certificates])

  // Live countdown timer for the mounted ticket (pure tabular-nums, steady update every second)
  useEffect(() => {
    if (!mountedTicket?.eventStartsAt) {
      setGateCountdown('')
      return
    }
    const updateCountdown = () => {
      const starts = new Date(mountedTicket.eventStartsAt!).getTime()
      const now = Date.now()
      const diff = starts - now
      if (diff <= 0 && diff >= -4 * 3600 * 1000) {
        setGateCountdown('GATE OPEN · IN PROGRESS')
      } else if (diff < -4 * 3600 * 1000) {
        setGateCountdown('EVENT CONCLUDED')
      } else if (diff <= 24 * 3600 * 1000) {
        const h = Math.floor(diff / (3600 * 1000))
        const m = Math.floor((diff % (3600 * 1000)) / (60 * 1000))
        const s = Math.floor((diff % (60 * 1000)) / 1000)
        setGateCountdown(`STARTS IN ${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`)
      } else {
        const days = Math.ceil(diff / (24 * 3600 * 1000))
        setGateCountdown(`STARTS IN ${days} DAYS`)
      }
    }
    updateCountdown()
    const timer = setInterval(updateCountdown, 1000)
    return () => clearInterval(timer)
  }, [mountedTicket?.eventStartsAt])

  // Generate high-resolution QR data URL for the laser scanner modal
  useEffect(() => {
    if (mountedTicket) {
      const code =
        (mountedTicket as any).code ||
        (mountedTicket as any).ticketCode ||
        `EM-${String(mountedTicket.id).slice(-4).toUpperCase()}`
      import('qrcode')
        .then((QRCodeModule) => {
          const qrcode = QRCodeModule.default || QRCodeModule
          qrcode
            .toDataURL(code, { width: 320, margin: 1, color: { dark: '#000000', light: '#FFFFFF' } })
            .then(setQrDataUrl)
            .catch(() => {})
        })
        .catch(() => {})
    }
  }, [mountedTicket])

  // Floating ticket pills for FolderFloat based on active category tab
  const folderFloatItems = useMemo(() => {
    if (docketCategory === 'passes') {
      if (activePasses.length === 0) {
        return [{ label: 'Empty Pass Jacket', value: 'empty' }]
      }
      return activePasses.map((p) => {
        const title = p.eventTitle || 'Event Pass'
        const label = title.length > 22 ? `${title.slice(0, 20)}…` : title
        return {
          label: `🎟️ ${label}`,
          value: String(p.id),
        }
      })
    } else if (docketCategory === 'honors') {
      if (certificates.length === 0) {
        return [{ label: 'No Honors Issued', value: 'empty' }]
      }
      return certificates.map((c) => {
        const title = c.eventTitle || 'Certificate'
        const label = title.length > 20 ? `${title.slice(0, 18)}…` : title
        return {
          label: `📜 ${label}`,
          value: `cert-${c.id || c.certificateId}`,
        }
      })
    } else {
      if (historyPasses.length === 0) {
        return [{ label: 'Archive Empty', value: 'empty' }]
      }
      return historyPasses.map((p) => {
        const title = p.eventTitle || 'Keepsake'
        const label = title.length > 22 ? `${title.slice(0, 20)}…` : title
        return {
          label: `📁 ${label}`,
          value: String(p.id),
        }
      })
    }
  }, [docketCategory, activePasses, certificates, historyPasses])

  // Folder visual metadata per category
  const folderMeta = useMemo(() => {
    if (docketCategory === 'passes') {
      return {
        label: 'PASS JACKET',
        sublabel: `${activePasses.length} Active Admission${activePasses.length === 1 ? '' : 's'}`,
        backColor: '#4C1D95',
        frontColor: '#7C3AED',
      }
    } else if (docketCategory === 'honors') {
      return {
        label: 'HONORS VAULT',
        sublabel: `${certificates.length} Verified Credential${certificates.length === 1 ? '' : 's'}`,
        backColor: '#854D0E',
        frontColor: '#D97706',
      }
    } else {
      return {
        label: 'KEEPSAKES',
        sublabel: `${historyPasses.length} Attended Event${historyPasses.length === 1 ? '' : 's'}`,
        backColor: '#374151',
        frontColor: '#4B5563',
      }
    }
  }, [docketCategory, activePasses.length, certificates.length, historyPasses.length])

  // Handle item selection from FolderFloat
  const handleFolderSelect = (val: string) => {
    if (!val || val === 'empty') return
    if (val.startsWith('cert-')) {
      const certId = val.replace('cert-', '')
      setSelectedCertificateId(certId)
      toast({
        title: 'Credential Selected',
        message: 'Loaded verified certificate into the showcase stage.',
      })
    } else {
      setMountedTicketId(val)
      toast({
        title: 'Pass Selected',
        message: 'Mounted onto the main boarding pass stage.',
      })
    }
  }

  // Check if an event starts within 24 hours
  const isImminent = (startsAt?: string) => {
    if (!startsAt) return false
    const time = new Date(startsAt).getTime()
    const now = Date.now()
    return time >= now && time <= now + 24 * 3600 * 1000
  }

  return (
    <PageShell className="py-6 sm:py-8 space-y-8 max-w-5xl mx-auto">
      {/* ========================================================================= */}
      {/* 1. TOP SECTION: THE MAIN ID CARD & PROFILE ANCHOR                         */}
      {/* ========================================================================= */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span className="text-xs font-mono font-bold tracking-wider uppercase text-text-3">
                CAMPUS WALLET · {studentData.campus.toUpperCase()}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-display font-bold text-text tracking-tight mt-0.5">
              {studentData.name}
            </h1>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => setCalendarSyncOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-line bg-surface hover:bg-subtle text-xs font-semibold text-text transition-colors shadow-2xs"
            >
              <CalendarBlank size={15} className="text-accent" weight="bold" />
              <span>Calendar Sync</span>
            </button>
            <button
              type="button"
              onClick={() => setIsProfileModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-line bg-surface hover:bg-subtle text-xs font-semibold text-text transition-colors shadow-2xs"
            >
              <PencilSimple size={15} className="text-accent" />
              <span>Edit Profile</span>
            </button>
          </div>
        </div>

        {/* The Main ID Card Header (Compact Landscape Smartcard + Institutional Summary) */}
        <div className="bg-surface border border-line rounded-2xl p-5 shadow-xs flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Physical 3D Smartcard Container */}
          <div className="w-full md:w-[360px] shrink-0 flex flex-col items-center">
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

          {/* Student Verification & Telemetry Summary */}
          <div className="flex-1 w-full space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                <span>✓</span>
                <span>CAMPUS VERIFIED: {studentData.email.split('@')[1] || 'ctu.edu.in'}</span>
              </span>
              <button
                type="button"
                onClick={handleCopyRegNo}
                className="text-xs font-mono text-accent hover:underline flex items-center gap-1"
              >
                <Copy size={13} />
                <span>{studentData.registrationNumber}</span>
              </button>
            </div>

            <p className="text-xs text-text-2 leading-relaxed">
              Your official institutional pass allows seamless contactless access to campus hackathons, student clubs, workshops, and verified PDF credentials.
            </p>

            <div className="grid grid-cols-3 gap-3 pt-1 border-t border-line/60 text-center font-mono text-xs">
              <div className="p-2.5 rounded-xl bg-subtle border border-line">
                <span className="text-[10px] text-text-3 uppercase block">Active</span>
                <span className="text-sm font-bold text-accent">{activePasses.length} Passes</span>
              </div>
              <div className="p-2.5 rounded-xl bg-subtle border border-line">
                <span className="text-[10px] text-text-3 uppercase block">Attended</span>
                <span className="text-sm font-bold text-text">{historyPasses.length} Events</span>
              </div>
              <div className="p-2.5 rounded-xl bg-subtle border border-line">
                <span className="text-[10px] text-text-3 uppercase block">Credentials</span>
                <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                  {certificates.length} Certs
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 2. THE TACTILE DIVIDER LINE                                               */}
      {/* ========================================================================= */}
      <div className="relative flex items-center justify-center my-6">
        <div className="w-full border-t border-line"></div>
        <div className="absolute px-4 bg-canvas text-xs font-mono uppercase tracking-widest text-text-3 flex items-center gap-2">
          <FolderSimple size={15} weight="bold" className="text-accent" />
          <span>EVENT PASSES &amp; TICKET JACKET</span>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. THE PHYSICAL FOLDER DOCKET (Left: Pocket Sleeve / Right: Main Ticket)   */}
      {/* ========================================================================= */}
      <section className="bg-surface border border-line rounded-2xl shadow-sm overflow-hidden flex flex-col lg:flex-row items-stretch">

        {/* LEFT SIDE: THE DOCKET POCKET SLEEVE (Holding Other Passes & Credentials) */}
        <div className="w-full lg:w-[340px] bg-subtle/50 lg:border-r border-b lg:border-b-0 border-line p-6 flex flex-col justify-between space-y-6 shrink-0">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-line pb-3">
              <div className="flex items-center gap-2">
                <Ticket size={16} weight="fill" className="text-accent" />
                <span className="text-xs font-mono font-bold tracking-wider uppercase text-text">
                  TICKET DOCKET
                </span>
              </div>
              <span className="text-[11px] font-mono text-text-3">Category Vault</span>
            </div>

            {/* Segmented Category Filter Tabs */}
            <div className="grid grid-cols-3 gap-1 bg-surface p-1 rounded-xl border border-line shadow-2xs text-[11px] font-mono font-bold">
              <button
                type="button"
                onClick={() => setDocketCategory('passes')}
                className={`py-1.5 px-1.5 rounded-lg transition-all text-center ${
                  docketCategory === 'passes'
                    ? 'bg-accent text-white shadow-xs'
                    : 'text-text-3 hover:text-text hover:bg-subtle'
                }`}
              >
                Passes ({activePasses.length})
              </button>
              <button
                type="button"
                onClick={() => setDocketCategory('honors')}
                className={`py-1.5 px-1.5 rounded-lg transition-all text-center ${
                  docketCategory === 'honors'
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'text-text-3 hover:text-text hover:bg-subtle'
                }`}
              >
                Honors ({certificates.length})
              </button>
              <button
                type="button"
                onClick={() => setDocketCategory('keepsakes')}
                className={`py-1.5 px-1.5 rounded-lg transition-all text-center ${
                  docketCategory === 'keepsakes'
                    ? 'bg-zinc-700 text-white shadow-xs'
                    : 'text-text-3 hover:text-text hover:bg-subtle'
                }`}
              >
                Archive ({historyPasses.length})
              </button>
            </div>

            {/* 3D Physical Ticket Jacket with Matter.js Floating Cloud */}
            <div className="flex flex-col items-center justify-center pt-16 pb-4 bg-surface/70 rounded-xl border border-line/70 shadow-2xs relative overflow-visible">
              <FolderFloat
                key={docketCategory}
                items={folderFloatItems}
                activeValue={docketCategory === 'honors' ? undefined : (mountedTicket?.id ? String(mountedTicket.id) : undefined)}
                label={folderMeta.label}
                sublabel={folderMeta.sublabel}
                folderColor={folderMeta.backColor}
                frontColor={folderMeta.frontColor}
                paperColor="#FAF5FF"
                itemColor="#FFFFFF"
                itemTextColor="#1E1B4B"
                labelColor="#FFFFFF"
                width={220}
                height={120}
                spread={90}
                lift={40}
                trigger="click"
                defaultOpen={true}
                closeOnSelect={false}
                physics={true}
                onSelect={handleFolderSelect}
              />
              <span className="text-[10px] font-mono text-text-3 mt-3 flex items-center gap-1">
                <span>✦ Click jacket or drag floating stubs</span>
              </span>
            </div>

            {/* Dynamic Sleeve Drawer synchronized with Category Filter */}
            {docketCategory === 'passes' && (
              <div className="space-y-2">
                <span className="text-[10px] font-mono uppercase tracking-wider text-text-3 font-semibold block">
                  Active Events In Sleeve ({activePasses.length})
                </span>

                {regsLoading ? (
                  <p className="text-xs font-mono text-text-3 py-2">Loading docket...</p>
                ) : activePasses.length === 0 ? (
                  <div className="p-3.5 rounded-xl border border-dashed border-line text-center text-xs text-text-3">
                    No active passes in sleeve
                  </div>
                ) : (
                  activePasses.map((reg) => {
                    const isMounted = mountedTicket?.id === reg.id
                    const eventImminent = isImminent(reg.eventStartsAt)

                    return (
                      <div
                        key={reg.id}
                        onClick={() => setMountedTicketId(reg.id)}
                        className={`p-3.5 rounded-xl cursor-pointer shadow-2xs transition-all flex items-center justify-between group ${
                          isMounted
                            ? 'border-2 border-accent bg-surface shadow-xs'
                            : 'border border-line bg-surface/70 hover:bg-surface hover:border-line-strong'
                        }`}
                      >
                        <div className="min-w-0 pr-2">
                          <div className="flex items-center gap-1.5">
                            {eventImminent && <span className="w-2 h-2 rounded-full bg-emerald-500" />}
                            <span
                              className={`text-[10px] font-mono font-bold uppercase truncate ${
                                eventImminent ? 'text-emerald-600 dark:text-emerald-400' : 'text-text-3'
                              }`}
                            >
                              {reg.eventStartsAt ? formatDate(reg.eventStartsAt).split(',')[0] : 'Upcoming'}
                            </span>
                          </div>
                          <h4 className="text-xs font-bold text-text truncate mt-0.5">
                            {reg.eventTitle}
                          </h4>
                          <p className="text-[11px] text-text-3 font-mono truncate">
                            {reg.venueName || 'Main Campus Venue'}
                          </p>
                        </div>

                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold shrink-0 ${
                            isMounted
                              ? 'bg-accent/15 text-accent border border-accent/25'
                              : 'text-text-3 group-hover:text-accent'
                          }`}
                        >
                          {isMounted ? 'In Hand ✓' : 'Inspect ➔'}
                        </span>
                      </div>
                    )
                  })
                )}
              </div>
            )}

            {docketCategory === 'honors' && (
              <div className="space-y-2">
                <span className="text-[10px] font-mono uppercase tracking-wider text-text-3 font-semibold block">
                  Honors &amp; Certificates ({certificates.length})
                </span>

                {certsLoading ? (
                  <p className="text-xs font-mono text-text-3 py-1">Loading credentials...</p>
                ) : certificates.length === 0 ? (
                  <p className="text-[11px] text-text-3 font-mono py-1">No certificates issued yet.</p>
                ) : (
                  certificates.map((cert) => {
                    const isMounted =
                      mountedCertificate &&
                      String(mountedCertificate.id || mountedCertificate.certificateId) ===
                        String(cert.id || cert.certificateId)
                    return (
                      <div
                        key={cert.id || cert.certificateId}
                        onClick={() => setSelectedCertificateId(String(cert.id || cert.certificateId))}
                        className={`p-3 rounded-xl cursor-pointer shadow-2xs transition-all flex items-center justify-between gap-2 group ${
                          isMounted
                            ? 'border-2 border-amber-500 bg-surface shadow-xs'
                            : 'border border-line bg-surface/70 hover:bg-surface hover:border-amber-400'
                        }`}
                      >
                        <div className="min-w-0">
                          <h5 className="text-xs font-bold text-text truncate group-hover:text-amber-600">
                            {cert.eventTitle}
                          </h5>
                          <p className="text-[10px] text-text-3 font-mono">
                            {formatDate(cert.issuedAt)} · {cert.certificateId}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation()
                            downloadCertificatePDF(cert)
                          }}
                          className="px-2 py-1 rounded bg-subtle border border-line hover:bg-surface text-xs font-semibold text-text shrink-0 shadow-2xs active:scale-95"
                          title="Download PDF Certificate"
                        >
                          <DownloadSimple size={12} className="inline mr-1" />
                          <span>PDF</span>
                        </button>
                      </div>
                    )
                  })
                )}
              </div>
            )}

            {docketCategory === 'keepsakes' && (
              <div className="space-y-2">
                <span className="text-[10px] font-mono uppercase tracking-wider text-text-3 font-semibold block">
                  Attended Keepsakes ({historyPasses.length})
                </span>

                {historyPasses.length === 0 ? (
                  <p className="text-[11px] text-text-3 font-mono py-1">No past keepsakes found.</p>
                ) : (
                  historyPasses.map((reg) => {
                    const isMounted = mountedTicket?.id === reg.id
                    return (
                      <div
                        key={reg.id}
                        onClick={() => setMountedTicketId(reg.id)}
                        className={`p-3 rounded-xl cursor-pointer transition-all flex items-center justify-between gap-2 shadow-2xs group ${
                          isMounted
                            ? 'border-2 border-zinc-600 bg-surface shadow-xs'
                            : 'border border-line bg-surface/70 hover:bg-surface hover:border-zinc-400'
                        }`}
                      >
                        <div className="min-w-0">
                          <h5 className="text-xs font-bold text-text truncate group-hover:text-accent">
                            {reg.eventTitle}
                          </h5>
                          <p className="text-[10px] text-text-3 font-mono truncate">
                            {reg.eventStartsAt ? formatDate(reg.eventStartsAt).split(',')[0] : 'Past'} · {reg.venueName || 'Campus'}
                          </p>
                        </div>
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-zinc-500/10 text-zinc-600 dark:text-zinc-400 border border-zinc-500/20 shrink-0">
                          {isMounted ? 'In Hand ✓' : 'ADMITTED'}
                        </span>
                      </div>
                    )
                  })
                )}
              </div>
            )}
          </div>

          {/* Docket Footer Note (Historical Archives Switcher) */}
          <div className="pt-3 border-t border-line text-[11px] font-mono text-text-3 flex items-center justify-between">
            <span>{historyPasses.length} Past Keepsakes</span>
            <button
              type="button"
              onClick={() => setViewHistoryArchive(!viewHistoryArchive)}
              className="text-accent hover:underline font-semibold"
            >
              {viewHistoryArchive ? 'Hide Archive' : 'History Archive ➔'}
            </button>
          </div>
        </div>

        {/* RIGHT SIDE: THE MAIN TICKET STAGE (The Pass in Hand for Recent/Upcoming Event) */}
        <div className="flex-1 p-6 lg:p-8 flex flex-col justify-between space-y-6">
          <div>
            <div className="flex items-center justify-between pb-4 mb-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold tracking-wider uppercase text-text">
                  {docketCategory === 'passes'
                    ? 'MAIN PASS IN HAND · GATE READY'
                    : docketCategory === 'honors'
                    ? 'VERIFIED CREDENTIAL VAULT · OFFICIAL RECORD'
                    : 'COMMEMORATIVE KEEPSAKE · ATTENDANCE RECORD'}
                </span>
              </div>
              <span
                className={`text-xs font-mono font-bold ${
                  docketCategory === 'honors'
                    ? 'text-amber-600 dark:text-amber-400'
                    : docketCategory === 'keepsakes'
                    ? 'text-zinc-600 dark:text-zinc-400'
                    : 'text-emerald-600 dark:text-emerald-400'
                }`}
              >
                {docketCategory === 'passes' && '● FAST GATE LOCK <200MS'}
                {docketCategory === 'honors' && '● CRYPTOGRAPHIC VALIDATION'}
                {docketCategory === 'keepsakes' && '● ARCHIVED ADMISSION'}
              </span>
            </div>

            {/* A. PASSES CATEGORY: THE FULL LANDSCAPE BOARDING PASS */}
            {docketCategory === 'passes' && (
              mountedTicket ? (
                (() => {
                  const eventImminent = isImminent(mountedTicket.eventStartsAt)
                  const ticketCode =
                    (mountedTicket as any).code ||
                    (mountedTicket as any).ticketCode ||
                    `EM-${String(mountedTicket.id).slice(-4).toUpperCase()}`

                  return (
                    <div
                      onClick={() => {
                        setSelectedTicket(mountedTicket)
                        fireCelebrationConfetti()
                      }}
                      className="relative bg-surface border border-line hover:border-line-strong rounded-[14px] shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer overflow-hidden flex flex-col justify-between group"
                    >
                      {/* Semi-Circular Punch Notches accurately aligned to perforation divider */}
                      <div className="absolute -top-[11px] right-[164px] w-[22px] h-[22px] rounded-full border-b border-line bg-surface z-10" />
                      <div className="absolute -bottom-[11px] right-[164px] w-[22px] h-[22px] rounded-full border-t border-line bg-surface z-10" />

                      {/* Top Status Strip */}
                      <div
                        className={`px-6 py-2.5 flex items-center justify-between text-white text-xs font-mono font-bold ${
                          eventImminent ? 'bg-emerald-600' : 'bg-ink'
                        }`}
                      >
                        <span className="flex items-center gap-1.5 uppercase tracking-wider">
                          {eventImminent && <span className="w-2 h-2 rounded-full bg-white shrink-0" />}
                          <span>
                            {eventImminent
                              ? (gateCountdown || 'GATE READY · TODAY')
                              : mountedTicket.eventStartsAt
                              ? `CONFIRMED PASS · ${formatDate(mountedTicket.eventStartsAt).split(',')[0].toUpperCase()}`
                              : 'CONFIRMED PASS'}
                          </span>
                        </span>
                        <span>{mountedTicket.tierName || 'GENERAL ADMISSION'}</span>
                      </div>

                      {/* Ticket Interior & Perforated Stub */}
                      <div className="p-6 flex items-stretch justify-between gap-5">
                        {/* Left Info Area */}
                        <div className="flex-1 space-y-3.5 min-w-0">
                          <div>
                            <span className="text-[10px] font-mono uppercase tracking-widest text-text-3 font-semibold block truncate">
                              {mountedTicket.organizerName || 'CAMPUS PREMIERE'}
                            </span>
                            <h3 className="text-xl font-bold text-text leading-snug group-hover:text-accent transition-colors mt-0.5 line-clamp-2">
                              {mountedTicket.eventTitle}
                            </h3>
                          </div>

                          <div className="space-y-1.5 text-xs font-mono">
                            <p className="text-text-2 flex items-center gap-2 truncate">
                              <MapPin size={14} className="shrink-0 text-text-3" />
                              <span className="truncate">{mountedTicket.venueName || 'Main Campus Venue'}</span>
                            </p>
                            <p className="text-text-2 flex items-center gap-2">
                              <Chair size={14} className="shrink-0 text-text-3" />
                              <span className="font-bold text-text">Gate Admission · Official Pass</span>
                            </p>
                          </div>

                          <div className="pt-3 border-t border-line/60 flex flex-wrap items-center justify-between gap-2">
                            <span className="px-2.5 py-0.5 rounded text-[11px] font-mono font-bold bg-subtle text-text-2 border border-line">
                              PASSHOLDER: {mountedTicket.userName || studentData.name} · {studentData.registrationNumber}
                            </span>
                            <span className="text-[10px] font-mono font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                              <span>OFFLINE READY ✓</span>
                            </span>
                          </div>
                        </div>

                        {/* Vertical Dashed Perforation Divider */}
                        <div className="w-px border-r-2 border-dashed border-line my-1 shrink-0" />

                        {/* Right Gate Stub */}
                        <div className="w-[140px] bg-subtle/60 rounded-xl p-3 flex flex-col items-center justify-between text-center shrink-0 border border-line">
                          <div>
                            <p className="text-[10px] font-mono uppercase text-text-3">Pass Code</p>
                            <p className="text-xs font-mono font-bold text-text mt-0.5 truncate">{ticketCode}</p>
                          </div>

                          <div className="my-1.5 bg-surface p-2 rounded-lg border border-line shadow-2xs">
                            <div className="w-16 h-16 bg-ink rounded flex items-center justify-center text-white text-[10px] font-mono font-bold">
                              <QrCode size={38} weight="bold" />
                            </div>
                          </div>

                          {/* Code-128 Barcode Zebra Striping */}
                          <div className="w-full flex items-center justify-center gap-[1.5px] my-1 opacity-70">
                            <span className="w-0.5 h-3 bg-text" />
                            <span className="w-1 h-3 bg-text" />
                            <span className="w-0.5 h-3 bg-text" />
                            <span className="w-1.5 h-3 bg-text" />
                            <span className="w-0.5 h-3 bg-text" />
                            <span className="w-1 h-3 bg-text" />
                            <span className="w-0.5 h-3 bg-text" />
                            <span className="w-1.5 h-3 bg-text" />
                            <span className="w-0.5 h-3 bg-text" />
                            <span className="w-1 h-3 bg-text" />
                            <span className="w-0.5 h-3 bg-text" />
                            <span className="w-1 h-3 bg-text" />
                          </div>

                          <span className="text-[11px] font-bold text-accent group-hover:underline">
                            Tap to Tear ➔
                          </span>
                        </div>
                      </div>
                    </div>
                  )
                })()
              ) : (
                <div className="p-10 border border-dashed border-line rounded-2xl text-center space-y-3">
                  <p className="text-sm text-text-2">No active ticket mounted in hand.</p>
                  <Link to="/explore">
                    <Button variant="primary" size="sm">
                      Explore Campus Events
                    </Button>
                  </Link>
                </div>
              )
            )}

            {/* B. HONORS CATEGORY: THE VERIFIED CREDENTIAL PLAQUE */}
            {docketCategory === 'honors' && (
              mountedCertificate ? (
                <div className="relative bg-gradient-to-br from-amber-500/5 via-surface to-amber-500/10 border-2 border-amber-500/30 rounded-[14px] shadow-sm p-6 sm:p-8 space-y-6 overflow-hidden">
                  {/* Watermark Crest */}
                  <div className="absolute right-4 bottom-4 opacity-5 pointer-events-none">
                    <CertificateIcon size={180} weight="fill" />
                  </div>

                  {/* Header */}
                  <div className="flex items-center justify-between border-b border-amber-500/20 pb-4">
                    <div className="flex items-center gap-2">
                      <CertificateIcon size={20} className="text-amber-600 dark:text-amber-400" weight="fill" />
                      <span className="text-xs font-mono font-bold tracking-wider uppercase text-amber-900 dark:text-amber-200">
                        OFFICIAL VERIFIED CAMPUS CREDENTIAL
                      </span>
                    </div>
                    <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30">
                      STATUS: CRYPTOGRAPHICALLY VALID
                    </span>
                  </div>

                  {/* Content */}
                  <div className="space-y-4">
                    <div>
                      <span className="text-xs font-mono text-text-3 uppercase tracking-widest block">
                        PROUDLY CONFERRED UPON
                      </span>
                      <h3 className="text-2xl font-display font-bold text-text mt-0.5">
                        {mountedCertificate.recipientName || studentData.name}
                      </h3>
                      <p className="text-xs font-mono text-text-2 mt-0.5">
                        STUDENT ID: {studentData.registrationNumber} · {studentData.campus.toUpperCase()}
                      </p>
                    </div>

                    <div className="p-4 rounded-xl bg-surface/80 border border-amber-500/20 space-y-2 shadow-2xs">
                      <span className="text-[10px] font-mono uppercase tracking-wider text-amber-700 dark:text-amber-400 font-bold block">
                        ACHIEVEMENT &amp; EVENT
                      </span>
                      <h4 className="text-lg font-bold text-text">
                        {mountedCertificate.eventTitle}
                      </h4>
                      <div className="flex flex-wrap items-center gap-3 text-xs font-mono text-text-3 pt-1">
                        <span>ROLE: {mountedCertificate.metadata?.role || 'Verified Participant'}</span>
                        <span>·</span>
                        <span>ISSUED: {formatDate(mountedCertificate.issuedAt)}</span>
                        <span>·</span>
                        <span className="truncate max-w-[180px]">HASH: {mountedCertificate.certificateId}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-amber-500/20">
                    <div className="flex items-center gap-2">
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => downloadCertificatePDF(mountedCertificate)}
                        className="bg-amber-600 hover:bg-amber-700 text-white font-mono text-xs"
                      >
                        <DownloadSimple size={14} className="mr-1.5" />
                        <span>Download Official PDF</span>
                      </Button>
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText(
                            `${window.location.origin}/verify/${mountedCertificate.certificateId}`
                          )
                          toast({
                            title: 'Verification Link Copied',
                            message: 'Public verification URL copied to clipboard.',
                          })
                        }}
                        className="px-3 py-2 rounded-xl border border-line bg-surface hover:bg-subtle text-xs font-semibold text-text transition-colors shadow-2xs"
                      >
                        <Copy size={14} className="inline mr-1 text-accent" />
                        <span>Copy Verification Link</span>
                      </button>
                    </div>

                    <span className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                      <span>✓</span>
                      <span>ISSUED BY REGISTRAR</span>
                    </span>
                  </div>
                </div>
              ) : (
                <div className="p-12 border border-dashed border-line rounded-2xl text-center space-y-3">
                  <CertificateIcon size={36} className="mx-auto text-text-3" />
                  <p className="text-sm font-semibold text-text">No Verified Credentials Issued Yet</p>
                  <p className="text-xs text-text-3 max-w-sm mx-auto">
                    Complete workshops, hackathons, and certified campus sessions to earn cryptographically verifiable PDF honors.
                  </p>
                  <Link to="/explore">
                    <Button variant="secondary" size="sm">
                      Explore Certified Events
                    </Button>
                  </Link>
                </div>
              )
            )}

            {/* C. KEEPSAKES CATEGORY: COMMEMORATIVE ATTENDED PASS */}
            {docketCategory === 'keepsakes' && (
              mountedTicket ? (
                <div className="relative bg-surface border border-line rounded-[14px] shadow-sm p-6 sm:p-8 space-y-6 overflow-hidden">
                  {/* Stamped Watermark */}
                  <div className="absolute right-6 top-6 -rotate-12 pointer-events-none select-none">
                    <div className="px-3.5 py-1.5 border-2 border-emerald-600/40 text-emerald-600 dark:text-emerald-400 font-mono font-bold text-xs uppercase tracking-widest rounded-lg bg-emerald-500/5">
                      ✓ ADMITTED &amp; ATTENDED
                    </div>
                  </div>

                  {/* Content */}
                  <div className="space-y-2">
                    <span className="text-[10px] font-mono uppercase tracking-widest text-text-3 font-semibold block">
                      COMMEMORATIVE KEEPSAKE · ATTENDED EVENT
                    </span>
                    <h3 className="text-2xl font-bold text-text leading-snug">
                      {mountedTicket.eventTitle}
                    </h3>
                    <p className="text-xs font-mono text-text-2">
                      {mountedTicket.eventStartsAt ? formatDate(mountedTicket.eventStartsAt) : 'Past Event'} · {mountedTicket.venueName || 'Main Campus Venue'}
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-subtle border border-line text-xs font-mono space-y-1.5 shadow-2xs">
                    <p className="text-text-2">
                      <span className="font-bold text-text">ORGANIZER:</span> {mountedTicket.organizerName || 'Campus Host'}
                    </p>
                    <p className="text-text-2">
                      <span className="font-bold text-text">ATTENDEE:</span> {mountedTicket.userName || studentData.name} ({studentData.registrationNumber})
                    </p>
                    <p className="text-text-2">
                      <span className="font-bold text-text">GATE STATUS:</span> Verified Gate Attendance Record
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-line text-xs font-mono text-text-3">
                    <span>Archived in your permanent student wallet</span>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedTicket(mountedTicket)
                        fireCelebrationConfetti()
                      }}
                      className="text-accent hover:underline font-bold"
                    >
                      View Digital Ticket Stub ➔
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-12 border border-dashed border-line rounded-2xl text-center space-y-3">
                  <ClockCounterClockwise size={36} className="mx-auto text-text-3" />
                  <p className="text-sm font-semibold text-text">No Past Keepsakes in Archive</p>
                  <p className="text-xs text-text-3 max-w-sm mx-auto">
                    Events you attend and check into will automatically be archived here as keepsake admissions.
                  </p>
                </div>
              )
            )}

            {/* Turnstile Utility Action Bar (Active for Passes category) */}
            {docketCategory === 'passes' && mountedTicket && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-4">
                {/* 1. High Brightness QR */}
                <button
                  type="button"
                  onClick={() => setIsBrightnessModalOpen(true)}
                  className="p-3 rounded-xl border border-line bg-surface hover:bg-subtle text-left flex flex-col justify-between transition-colors shadow-2xs group"
                >
                  <div className="flex items-center justify-between w-full">
                    <QrCode size={18} className="text-accent" weight="bold" />
                    <span className="text-[10px] font-mono text-text-3">Scanner</span>
                  </div>
                  <div className="mt-2">
                    <p className="text-xs font-bold text-text group-hover:text-accent">Laser Scanner QR</p>
                    <p className="text-[10px] text-text-3 font-mono">High-contrast</p>
                  </div>
                </button>

                {/* 2. Add to Calendar */}
                <button
                  type="button"
                  onClick={() => {
                    downloadICS({
                      title: mountedTicket.eventTitle || 'Campus Event',
                      startsAt: mountedTicket.eventStartsAt || new Date().toISOString(),
                      endsAt: mountedTicket.eventStartsAt
                        ? new Date(new Date(mountedTicket.eventStartsAt).getTime() + 3 * 3600 * 1000).toISOString()
                        : new Date().toISOString(),
                      venueName: mountedTicket.venueName || 'Main Campus Venue',
                      description: `Admission Pass for ${mountedTicket.userName || studentData.name}. Code: ${(mountedTicket as any).code || 'CONFIRMED'}`,
                    })
                    toast({
                      title: 'Calendar Event Downloaded',
                      message: 'Exported .ics event for Apple & Google Calendar.',
                    })
                  }}
                  className="p-3 rounded-xl border border-line bg-surface hover:bg-subtle text-left flex flex-col justify-between transition-colors shadow-2xs group"
                >
                  <div className="flex items-center justify-between w-full">
                    <CalendarBlank size={18} className="text-accent" weight="bold" />
                    <span className="text-[10px] font-mono text-text-3">Sync</span>
                  </div>
                  <div className="mt-2">
                    <p className="text-xs font-bold text-text group-hover:text-accent">Add to Calendar</p>
                    <p className="text-[10px] text-text-3 font-mono">.ics export</p>
                  </div>
                </button>

                {/* 3. Venue Doors & Map */}
                <button
                  type="button"
                  onClick={() => setIsVenueModalOpen(true)}
                  className="p-3 rounded-xl border border-line bg-surface hover:bg-subtle text-left flex flex-col justify-between transition-colors shadow-2xs group"
                >
                  <div className="flex items-center justify-between w-full">
                    <MapPin size={18} className="text-accent" weight="bold" />
                    <span className="text-[10px] font-mono text-text-3">Gate Doors</span>
                  </div>
                  <div className="mt-2">
                    <p className="text-xs font-bold text-text group-hover:text-accent">Venue &amp; Entry</p>
                    <p className="text-[10px] text-text-3 font-mono">Hall directions</p>
                  </div>
                </button>

                {/* 4. Share Pass Details */}
                <button
                  type="button"
                  onClick={() => {
                    const ticketCode =
                      (mountedTicket as any).code ||
                      (mountedTicket as any).ticketCode ||
                      `EM-${String(mountedTicket.id).slice(-4).toUpperCase()}`
                    const shareText = `🎟️ ${mountedTicket.eventTitle}\nPassholder: ${studentData.name} (${studentData.registrationNumber})\nPass Code: ${ticketCode}\nVenue: ${mountedTicket.venueName || 'Main Campus Venue'}\nDate: ${mountedTicket.eventStartsAt ? formatDate(mountedTicket.eventStartsAt) : 'Upcoming'}`
                    navigator.clipboard.writeText(shareText)
                    toast({
                      title: 'Copied Pass Details',
                      message: 'Admission details copied to clipboard.',
                    })
                  }}
                  className="p-3 rounded-xl border border-line bg-surface hover:bg-subtle text-left flex flex-col justify-between transition-colors shadow-2xs group"
                >
                  <div className="flex items-center justify-between w-full">
                    <Copy size={18} className="text-accent" weight="bold" />
                    <span className="text-[10px] font-mono text-text-3">Share</span>
                  </div>
                  <div className="mt-2">
                    <p className="text-xs font-bold text-text group-hover:text-accent">Copy Details</p>
                    <p className="text-[10px] text-text-3 font-mono">Share with team</p>
                  </div>
                </button>
              </div>
            )}
          </div>

          {/* Historical Keepsakes Archive (Shown when toggled) */}
          {viewHistoryArchive && (
            <div className="pt-4 border-t border-line space-y-3 animate-in fade-in duration-200">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-text-3">
                  ATTENDED KEEPSAKES ARCHIVE
                </span>
                <span className="text-xs font-mono text-text-3">{historyPasses.length} Total</span>
              </div>

              {historyPasses.length === 0 ? (
                <p className="text-xs text-text-3 py-2">No attended keepsakes in archive.</p>
              ) : (
                historyPasses.map((reg) => (
                  <div
                    key={reg.id}
                    onClick={() => {
                      setSelectedTicket(reg)
                      fireCelebrationConfetti()
                    }}
                    className="p-3.5 rounded-xl border border-line bg-surface hover:border-line-strong transition-all cursor-pointer flex items-center justify-between gap-3 shadow-2xs group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                      <div className="min-w-0">
                        <h5 className="text-xs font-bold text-text truncate group-hover:text-accent transition-colors">
                          {reg.eventTitle}
                        </h5>
                        <p className="text-[11px] text-text-3 font-mono truncate">
                          {reg.eventStartsAt ? formatDate(reg.eventStartsAt) : 'Past Event'} · {reg.venueName || 'Main Campus Venue'}
                        </p>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 shrink-0">
                      ✓ ADMITTED
                    </span>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Dock Bottom Quick Actions Strip */}
          <div className="p-4 bg-subtle border border-line rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 text-text-2">
              <span className="text-base">⚡</span>
              <span>Tap ticket above to open full tactile tear-off stub, physics, and gate validation</span>
            </div>
            {mountedTicket && (
              <button
                type="button"
                onClick={() => {
                  setSelectedTicket(mountedTicket)
                  fireCelebrationConfetti()
                }}
                className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition-colors shadow-2xs shrink-0"
              >
                ✓ Present at Gate
              </button>
            )}
          </div>
        </div>

      </section>

      {/* ========================================================================= */}
      {/* 4. TACTILE GATE TEAR-OFF MODAL INSPECTION                                 */}
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
              <span className="text-xs font-mono text-text-3 group-hover:text-text transition-colors">Subscribe ➔</span>
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

      {/* Laser Scanner High-Brightness QR Modal */}
      {mountedTicket && (
        <Modal
          isOpen={isBrightnessModalOpen}
          onClose={() => setIsBrightnessModalOpen(false)}
          title="Gate Laser Scanner Mode"
          subtitle="Max contrast barcode display for physical optical scanners and handheld gate guns."
          maxWidth="max-w-sm"
        >
          <div className="flex flex-col items-center justify-center p-6 bg-white text-zinc-950 rounded-2xl border border-zinc-200 shadow-md text-center space-y-4">
            <div className="space-y-1">
              <span className="text-[10px] font-mono uppercase font-bold tracking-widest text-zinc-500">
                OFFICIAL ADMISSION BARCODE
              </span>
              <h4 className="text-base font-bold text-zinc-900 leading-tight">
                {mountedTicket.eventTitle}
              </h4>
            </div>

            {/* High Resolution Scannable Target */}
            <div className="p-3 bg-white rounded-xl border-2 border-zinc-900 shadow-sm">
              {qrDataUrl ? (
                <img
                  src={qrDataUrl}
                  alt="Turnstile QR"
                  className="w-56 h-56 object-contain image-rendering-pixelated"
                />
              ) : (
                <div className="w-56 h-56 bg-zinc-100 flex items-center justify-center">
                  <QrCode size={48} className="text-zinc-400" />
                </div>
              )}
            </div>

            <div className="space-y-1 w-full">
              <p className="text-xl font-mono font-bold tracking-wider text-zinc-950">
                {(mountedTicket as any).code || (mountedTicket as any).ticketCode || `EM-${String(mountedTicket.id).slice(-4).toUpperCase()}`}
              </p>
              <p className="text-xs font-mono text-zinc-600">
                {mountedTicket.userName || studentData.name} · {studentData.registrationNumber}
              </p>
              <div className="pt-2">
                <span className="inline-block px-3 py-1 rounded-full text-[10px] font-mono font-bold bg-zinc-100 border border-zinc-300 text-zinc-800">
                  Hold 6 inches in front of turnstile scanner
                </span>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* Venue Entry Doors & Directions Modal */}
      {mountedTicket && (
        <Modal
          isOpen={isVenueModalOpen}
          onClose={() => setIsVenueModalOpen(false)}
          title="Venue Directions & Entry Doors"
          subtitle="Gate access rules, room entry guidelines, and hall location."
          maxWidth="max-w-md"
        >
          <div className="space-y-4 pt-1">
            <div className="p-4 rounded-xl bg-subtle border border-line space-y-2">
              <div className="flex items-center gap-2 text-text font-bold text-sm">
                <MapPin size={18} className="text-accent" />
                <span>{mountedTicket.venueName || 'Main Campus Venue'}</span>
              </div>
              <p className="text-xs text-text-2 font-mono">
                Campus Location: Main Academic Quad · Hall B
              </p>
            </div>

            <div className="space-y-2.5 text-xs text-text-2">
              <div className="flex items-start gap-2.5 p-3 rounded-lg border border-line bg-surface">
                <span className="w-5 h-5 rounded-full bg-accent/15 text-accent font-bold flex items-center justify-center text-[10px] shrink-0">
                  1
                </span>
                <div>
                  <p className="font-semibold text-text">Turnstiles &amp; Security</p>
                  <p className="text-text-3 text-[11px] mt-0.5">
                    Enter through North Security Gates. Have your Student ID and Pass Code ready.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2.5 p-3 rounded-lg border border-line bg-surface">
                <span className="w-5 h-5 rounded-full bg-accent/15 text-accent font-bold flex items-center justify-center text-[10px] shrink-0">
                  2
                </span>
                <div>
                  <p className="font-semibold text-text">Fast-Track Kiosk Check-In</p>
                  <p className="text-text-3 text-[11px] mt-0.5">
                    Self-service kiosks scan in &lt;200ms. Tap &quot;Laser Scanner QR&quot; for instant read.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2.5 p-3 rounded-lg border border-line bg-surface">
                <span className="w-5 h-5 rounded-full bg-accent/15 text-accent font-bold flex items-center justify-center text-[10px] shrink-0">
                  3
                </span>
                <div>
                  <p className="font-semibold text-text">Badge &amp; Lanyard Pickup</p>
                  <p className="text-text-3 text-[11px] mt-0.5">
                    Proceed to Registration Desk 3 to collect your physical hackathon badge.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </PageShell>
  )
}

export default AttendeeDashboardPage
