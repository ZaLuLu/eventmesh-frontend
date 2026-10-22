// Hallmark macrostructure: Profile Bento & Physical 3D Lanyard ID Badge
import React, { useState, useMemo, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { jsPDF } from 'jspdf'
import {
  Ticket,
  Certificate as CertificateIcon,
  DownloadSimple,
  ShieldCheck,
  Copy,
  Check,
  GraduationCap,
  Sparkle,
  Cube,
  IdentificationCard,
  ArrowRight,
  CalendarBlank,
  PencilSimple,
  ArrowsClockwise,
} from '@phosphor-icons/react'
import { useMyRegistrations, useCancelRegistration, useUpdateRegistrationStatus } from '@/hooks/useRegistrations'
import { useMyCertificates } from '@/hooks/useCertificates'
import { useClubs } from '@/hooks/useClubs'
import { useEvents } from '@/hooks/useEvents'
import { useAuth } from '@/hooks/useAuth'
import { PageShell } from '@/design-system/layout/PageShell'
import { Badge } from '@/design-system/primitives/Badge'
import { Button } from '@/design-system/primitives/Button'
import { formatDate } from '@/lib/dates'
import { api, Registration, Certificate } from '@/api'
import { useToast } from '@/design-system/primitives/Toast'
import { EmptyState } from '@/design-system/primitives/EmptyState'
import { fireCelebrationConfetti } from '@/lib/confetti'
import { TactileBoardingPass } from './components/TactileBoardingPass'
import { EventAdmissionTicket } from '@/design-system/micro/EventAdmissionTicket'
import { StudentIDCard2D } from '@/design-system/3d/StudentIDCard2D'
import { AvatarSelectorModal } from './components/AvatarSelectorModal'
import { resolveUserAvatar } from '@/lib/avatars'

export const AttendeeDashboardPage: React.FC = () => {
  const { session, isAuthenticated } = useAuth()
  const { toast } = useToast()
  const { data: registrations = [], isLoading: regsLoading } = useMyRegistrations()
  const { data: certificates = [], isLoading: certsLoading } = useMyCertificates()
  const { data: clubs = [] } = useClubs()
  const { data: upcomingData } = useEvents()
  const cancelMutation = useCancelRegistration()
  const updateStatusMutation = useUpdateRegistrationStatus()

  const [selectedTicket, setSelectedTicket] = useState<Registration | null>(null)
  const [activeTab, setActiveTab] = useState<'passes' | 'certificates' | 'clubs'>('passes')
  const [copiedRegNo, setCopiedRegNo] = useState(false)
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false)
  const [avatarUrl, setAvatarUrl] = useState<string>(() => resolveUserAvatar(session))

  useEffect(() => {
    if (session) {
      setAvatarUrl(resolveUserAvatar(session))
    }
  }, [session])

  // Student Identity Data
  const studentData = useMemo(() => {
    const s = session as any
    const rawName = s?.name || 'EventMesh member'
    const cleanName = rawName
      .replace(/\s*\([^)]*\)/g, '')
      .trim() || 'EventMesh member'

    return {
      name: cleanName,
      registrationNumber: s?.registrationNumber || '',
      degreeBranch: s?.degreeBranch || '',
      semester: s?.semester,
      email: s?.email || '',
      role: 'EVENTMESH MEMBER',
      campus: s?.campus || '',
      bloodGroup: s?.bloodGroup,
      emergencyPhone: s?.emergencyPhone,
    }
  }, [session])


  const handleCopyRegNo = () => {
    navigator.clipboard.writeText(studentData.registrationNumber)
    setCopiedRegNo(true)
    setTimeout(() => setCopiedRegNo(false), 2000)
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

  const followedClubs = clubs.filter((c) => c.isFollowed)

  const handleBecomeOrganizer = async () => {
    try {
      if (api.auth.becomeOrganizer) {
        await api.auth.becomeOrganizer()
        toast({
          title: 'Role Promoted',
          message: 'You have been granted Club Organizer privileges. You can now host events and lead clubs!',
          type: 'success',
        })
        window.location.reload()
      }
    } catch (err: any) {
      toast({
        title: 'Upgrade failed',
        message: err.detail || 'Unable to promote role at this time.',
        type: 'error',
      })
    }
  }

  const downloadCertificatePDF = (cert: Certificate) => {
    try {
      const doc = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4',
      })

      // Warm paper background (#F6F1E7)
      doc.setFillColor(246, 241, 231)
      doc.rect(0, 0, 297, 210, 'F')

      // Double collegiate ink border
      doc.setDrawColor(21, 17, 48)
      doc.setLineWidth(1.5)
      doc.rect(12, 12, 273, 186)

      doc.setDrawColor(0, 71, 255)
      doc.setLineWidth(0.6)
      doc.rect(15, 15, 267, 180)

      doc.setFont('helvetica', 'normal')
      doc.setFontSize(11)
      doc.setTextColor(74, 70, 104)
      doc.text('EVENTMESH · VERIFIABLE CAMPUS CREDENTIAL', 148.5, 36, { align: 'center' })

      doc.setFont('helvetica', 'bold')
      doc.setFontSize(28)
      doc.setTextColor(21, 17, 48)
      doc.text('CERTIFICATE OF PARTICIPATION', 148.5, 52, { align: 'center' })

      doc.setFont('helvetica', 'normal')
      doc.setFontSize(13)
      doc.setTextColor(74, 70, 104)
      doc.text('This document certifies that', 148.5, 75, { align: 'center' })

      doc.setFont('helvetica', 'bold')
      doc.setFontSize(22)
      doc.setTextColor(0, 71, 255)
      doc.text(cert.recipientName.toUpperCase(), 148.5, 92, { align: 'center' })

      doc.setFont('helvetica', 'normal')
      doc.setFontSize(13)
      doc.setTextColor(74, 70, 104)
      doc.text('has successfully completed & attended', 148.5, 108, { align: 'center' })

      doc.setFont('helvetica', 'bold')
      doc.setFontSize(18)
      doc.setTextColor(21, 17, 48)
      doc.text(cert.eventTitle.toUpperCase(), 148.5, 122, { align: 'center' })

      doc.setFont('helvetica', 'normal')
      doc.setFontSize(11)
      doc.setTextColor(74, 70, 104)
      doc.text(`Organized by ${cert.organizerName}`, 148.5, 134, { align: 'center' })

      doc.setFont('helvetica', 'normal')
      doc.setFontSize(9)
      doc.setTextColor(74, 70, 104)
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

  // Unauthenticated guests see demo passholder identity with permanent 3D lanyard preview

  const activePasses = registrations.filter((r) => r.status !== 'cancelled')
  const attendedPasses = registrations.filter((r) => r.status === 'checked_in')
  const nextEvent = (upcomingData?.items || [])
    .filter((event) => activePasses.some((pass) => pass.eventId === event.id) && new Date(event.startsAt).getTime() >= Date.now())
    .sort((a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime())[0]
  const nextPass = nextEvent && activePasses.find((pass) => pass.eventId === nextEvent.id)

  return (
    <PageShell className="py-6 sm:py-8 space-y-8">
      {/* ========================================================================= */}
      {/* 1. NEXT UP IMMINENT PASS (QUICK GATE ACCESS)                              */}
      {/* ========================================================================= */}
      {nextEvent && nextPass && (
        <section
          className="rounded-2xl border-2 border-primary/20 bg-gradient-to-r from-primary/5 via-surface to-surface p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm"
          aria-label="Next event quick access"
        >
          <div className="flex items-start sm:items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <Ticket size={22} weight="bold" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold tracking-wider uppercase bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  NEXT UP
                </span>
                <span className="text-xs text-ink-soft font-mono">
                  {formatDate(nextEvent.startsAt)}
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-bold text-ink truncate mt-0.5">
                {nextEvent.title}
              </h2>
              <p className="text-xs text-ink-muted truncate font-mono">
                {nextEvent.venue?.name || 'Main Campus Venue'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              setSelectedTicket(nextPass)
              fireCelebrationConfetti()
            }}
            className="shrink-0 inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-ink text-surface hover:opacity-90 font-semibold text-xs tracking-wide uppercase transition-all shadow-sm active:scale-98"
          >
            <Ticket size={16} weight="bold" />
            <span>Present Pass</span>
            <ArrowRight size={14} weight="bold" />
          </button>
        </section>
      )}

      {/* Become an Organizer Banner */}
      {!Boolean(session?.clubId || session?.role === 'org_admin' || session?.role === 'platform_admin') && (
        <section className="rounded-2xl border border-accent/25 bg-gradient-to-r from-accent/10 via-surface to-surface p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
          <div className="flex items-start sm:items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-accent/15 text-accent flex items-center justify-center shrink-0">
              <Sparkle size={22} weight="fill" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-accent text-on-accent">
                  LEADERSHIP UPGRADE
                </span>
                <span className="text-xs font-mono text-text-3">1-Click Fast Charter</span>
              </div>
              <h3 className="text-body font-bold text-text mt-0.5">
                Want to host your own tech meetups or hackathons?
              </h3>
              <p className="text-caption text-text-2">
                Promote your account to Club Organizer. Lead charters, design event registrations, and disburse ticket revenues.
              </p>
            </div>
          </div>

          <div className="shrink-0 flex items-center gap-2">
            <Button
              size="sm"
              variant="primary"
              icon={<Sparkle size={14} weight="fill" />}
              onClick={handleBecomeOrganizer}
            >
              Become an Organizer
            </Button>
          </div>
        </section>
      )}

      {/* Organizer Privileges Active Banner */}
      {Boolean(session?.clubId || session?.role === 'org_admin' || session?.role === 'platform_admin') && (
        <section className="rounded-2xl border border-line bg-subtle p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-small">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-surface border border-line flex items-center justify-center text-accent">
              <GraduationCap size={20} weight="bold" />
            </div>
            <div>
              <span className="font-semibold text-text">Organizer Privileges Active</span>
              <p className="text-caption text-text-3">You manage events and ticket queues for your club.</p>
            </div>
          </div>
          <Link to="/admin">
            <Button surface="admin" size="dense" arrow>
              Open Admin Console
            </Button>
          </Link>
        </section>
      )}

      {/* ========================================================================= */}
      {/* 2. STREAMLINED STUDENT WALLET IDENTITY SECTION                            */}
      {/* ========================================================================= */}
      <section className="rounded-3xl bg-surface-subtle border border-line/40 p-6 sm:p-8 flex flex-col items-center">
        {/* Minimal Identity Bar */}
        <div className="w-full max-w-[460px] flex items-center justify-between mb-4 flex-wrap gap-2">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-surface border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 shadow-xs">
              <ShieldCheck size={14} weight="fill" className="text-emerald-500" />
              <span>Campus Verified: {studentData.email.split('@')[1] || 'apex.edu.in'}</span>
            </span>
            <span className="text-xs font-mono text-ink-muted hidden sm:inline">
              {studentData.degreeBranch || 'Verified Passholder'}
            </span>
          </div>

          <button
            type="button"
            onClick={() => setIsAvatarModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono text-ink-soft hover:text-ink bg-surface border border-line/60 transition-colors shadow-xs"
            title="Edit student avatar photo"
          >
            <PencilSimple size={12} />
            <span>Change Photo</span>
          </button>
        </div>

        {/* Central Identity Card Artifact */}
        <div className="w-full flex flex-col items-center">
          <StudentIDCard2D
            name={studentData.name}
            registrationNumber={studentData.registrationNumber || 'EM-2026-0814'}
            degreeBranch={studentData.degreeBranch}
            semester={studentData.semester}
            email={studentData.email}
            role={studentData.role}
            campus={studentData.campus}
            avatarUrl={avatarUrl}
            onAvatarClick={() => setIsAvatarModalOpen(true)}
            interactive={true}
          />
          <p className="mt-3 text-[11px] font-mono text-ink-muted text-center flex items-center justify-center gap-1.5">
            <ArrowsClockwise size={12} className="text-accent" />
            <span>Click or tap card to flip 3D (Front / Back)</span>
          </p>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* TICKET & CREDENTIAL TABS                                                  */}
      {/* ========================================================================= */}
      <section className="space-y-6">
        {/* Tab Header Controls */}
        <div className="flex flex-wrap items-center gap-2 border-b border-line/30 pb-3">
          <button
            type="button"
            onClick={() => setActiveTab('passes')}
            className={`px-4 py-1.5 rounded-full font-medium text-xs transition-all flex items-center gap-2 ${
              activeTab === 'passes'
                ? 'bg-ink text-surface shadow-xs'
                : 'text-ink-soft hover:text-ink hover:bg-surface-subtle'
            }`}
          >
            <Ticket className="w-3.5 h-3.5" weight="bold" />
            <span>My Tickets</span>
            <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
              activeTab === 'passes' ? 'bg-accent text-white' : 'bg-surface-subtle text-ink-soft'
            }`}>
              {registrations.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('certificates')}
            className={`px-4 py-1.5 rounded-full font-medium text-xs transition-all flex items-center gap-2 ${
              activeTab === 'certificates'
                ? 'bg-ink text-surface shadow-xs'
                : 'text-ink-soft hover:text-ink hover:bg-surface-subtle'
            }`}
          >
            <CertificateIcon className="w-3.5 h-3.5" weight="bold" />
            <span>Certificates</span>
            <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
              activeTab === 'certificates' ? 'bg-accent text-white' : 'bg-surface-subtle text-ink-soft'
            }`}>
              {certificates.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('clubs')}
            className={`px-4 py-1.5 rounded-full font-medium text-xs transition-all flex items-center gap-2 ${
              activeTab === 'clubs'
                ? 'bg-ink text-surface shadow-xs'
                : 'text-ink-soft hover:text-ink hover:bg-surface-subtle'
            }`}
          >
            <GraduationCap className="w-3.5 h-3.5" weight="bold" />
            <span>Followed Clubs</span>
            <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
              activeTab === 'clubs' ? 'bg-accent text-white' : 'bg-surface-subtle text-ink-soft'
            }`}>
              {followedClubs.length}
            </span>
          </button>
        </div>

        {/* TAB 1: PASSES & BOARDING PASSES */}
        {activeTab === 'passes' && (
          <div>
            {regsLoading ? (
              <p className="text-xs font-mono text-ink-soft">Loading tickets...</p>
            ) : registrations.length === 0 ? (
              <div className="bg-surface-subtle rounded-3xl p-10 text-center space-y-3">
                <h3 className="font-display font-medium text-lg text-ink">No active passes yet</h3>
                <p className="text-sm text-ink-soft max-w-sm mx-auto">
                  You haven't reserved seats for upcoming events. Browse campus collectives to grab a pass.
                </p>
                <div className="pt-2">
                  <Link to="/explore">
                    <button type="button" className="btn-minimal-primary px-5 py-2 text-xs">
                      Explore events
                    </button>
                  </Link>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {registrations.map((reg) => (
                  <TactileBoardingPass
                    key={reg.id}
                    registration={reg}
                    onPresent={() => {
                      setSelectedTicket(reg)
                      fireCelebrationConfetti()
                    }}
                    onCancel={() => handleCancelPass(reg)}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: CERTIFICATES */}
        {activeTab === 'certificates' && (
          <div>
            {certsLoading ? (
              <p className="text-xs font-mono text-ink-soft">Loading certificates...</p>
            ) : certificates.length === 0 ? (
              <div className="bg-surface-subtle rounded-3xl p-10 text-center space-y-3">
                <h3 className="font-display font-medium text-lg text-ink">No credentials issued yet</h3>
                <p className="text-sm text-ink-soft max-w-sm mx-auto">
                  Certificates are automatically minted upon verified attendance at hackathons and workshops.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {certificates.map((cert) => (
                  <div
                    key={cert.id}
                    className="bg-surface-subtle hover:bg-surface-subtle rounded-2xl p-5 space-y-4 transition-colors"
                  >
                    <div className="flex items-center justify-between border-b border-line/20 pb-3">
                      <div className="flex items-center gap-2">
                        <CertificateIcon className="h-4 w-4 text-primary" weight="bold" />
                        <span className="font-medium text-xs text-ink uppercase tracking-wider">Credential</span>
                      </div>
                      <span className="font-mono text-xs text-ink-soft">
                        {cert.certificateId}
                      </span>
                    </div>

                    <div>
                      <h4 className="font-display font-medium text-base text-ink leading-snug">
                        {cert.eventTitle}
                      </h4>
                      <p className="text-xs text-ink-soft mt-1">
                        Issued {formatDate(cert.issuedAt)} · {cert.organizerName}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 pt-2 border-t border-line/20">
                      <button
                        type="button"
                        className="btn-minimal-primary flex-1 py-1.5 text-xs flex items-center justify-center gap-1.5"
                        onClick={() => downloadCertificatePDF(cert)}
                      >
                        <DownloadSimple className="h-3.5 w-3.5" weight="bold" />
                        <span>Download PDF</span>
                      </button>
                      <Link to={`/verify/${cert.certificateId}`}>
                        <button type="button" className="btn-minimal-secondary text-xs px-3 py-1.5">
                          Verify
                        </button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: FOLLOWED CLUBS */}
        {activeTab === 'clubs' && (
          <div>
            {followedClubs.length === 0 ? (
              <div className="bg-surface-subtle rounded-3xl p-10 text-center space-y-3">
                <h3 className="font-display font-medium text-lg text-ink">No followed clubs</h3>
                <p className="text-sm text-ink-soft max-w-sm mx-auto">
                  Follow campus collectives to receive immediate updates about their new workshops and flagship gatherings.
                </p>
                <div className="pt-2">
                  <Link to="/clubs">
                    <button type="button" className="btn-minimal-primary px-5 py-2 text-xs">
                      Explore clubs
                    </button>
                  </Link>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {followedClubs.map((club) => (
                  <Link
                    key={club.id}
                    to={`/clubs/${club.slug}`}
                    className="flex items-center gap-3 p-4 rounded-2xl bg-surface-subtle hover:bg-surface-subtle transition-colors"
                  >
                    <span
                      className="h-3.5 w-3.5 rounded-full flex-shrink-0"
                      style={{ backgroundColor: club.color || 'var(--color-accent)' }}
                      aria-hidden="true"
                    />
                    <div className="min-w-0 flex-1">
                      <h4 className="font-medium text-sm text-ink truncate">{club.name}</h4>
                      <p className="text-xs text-ink-soft truncate">
                        {club.joinMode ? club.joinMode.replace('_', ' ') : 'Campus Collective'}
                      </p>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-ink-soft" />
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}
      </section>

      {/* ========================================================================= */}
      {/* FLOATING TICKET PASS INSPECTION (Mandate 1: Intact QR Face / Gate Tear)   */}
      {/* ========================================================================= */}
      {selectedTicket && (
        <EventAdmissionTicket
          registration={selectedTicket}
          floatingCanvas={true}
          demoMode={false} // Normal student flow: pass is presented to volunteer
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



      {/* Avatar Customizer Modal */}
      <AvatarSelectorModal
        isOpen={isAvatarModalOpen}
        onClose={() => setIsAvatarModalOpen(false)}
        onAvatarSelected={(url) => setAvatarUrl(url)}
      />
    </PageShell>
  )
}

export default AttendeeDashboardPage
