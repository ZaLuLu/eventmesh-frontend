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
import { Lanyard, StudentIDCard2D, generateStudentIDTexture } from '@/design-system/3d'
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

  const [lanyardMode, setLanyardMode] = useState<'3d' | '2d'>('3d')

  const frontTexture = useMemo(() => {
    if (lanyardMode !== '3d') return ''
    return generateStudentIDTexture(
      {
        ...studentData,
        avatarUrl,
        attendedEvents: registrations
          .filter((r) => r.status === 'checked_in')
          .map((r) => ({
            title: r.eventTitle || 'Campus Session',
            date: formatDate(r.checkedInAt || r.createdAt),
          })),
        earnedBadges: certificates.length ? [`${certificates.length} credentials`] : [],
      },
      'front'
    )
  }, [lanyardMode, studentData, avatarUrl, registrations, certificates.length])

  const backTexture = useMemo(() => {
    if (lanyardMode !== '3d') return ''
    return generateStudentIDTexture(
      {
        ...studentData,
        avatarUrl,
        attendedEvents: registrations
          .filter((r) => r.status === 'checked_in')
          .map((r) => ({
            title: r.eventTitle || 'Campus Session',
            date: formatDate(r.checkedInAt || r.createdAt),
          })),
        earnedBadges: certificates.length ? [`${certificates.length} credentials`] : [],
      },
      'back'
    )
  }, [lanyardMode, studentData, avatarUrl, registrations, certificates.length])

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
      {nextEvent && nextPass && (
        <section className="flex flex-col gap-4 rounded-panel border border-line bg-card p-5 sm:flex-row sm:items-center sm:justify-between" aria-label="Next event">
          <div><p className="font-mono text-xs uppercase tracking-widest text-accent">Next up</p><h1 className="mt-1 text-xl font-semibold text-ink">{nextEvent.title}</h1><p className="mt-1 text-sm text-ink-soft">{formatDate(nextEvent.startsAt)} · {nextEvent.venue?.name || 'Venue to be announced'}</p></div>
          <button type="button" onClick={() => setSelectedTicket(nextPass)} className="shrink-0 rounded-full bg-accent px-5 py-3 text-sm font-semibold text-white hover:bg-accent-hover">View ticket</button>
        </section>
      )}
      {/* ========================================================================= */}
      {/* PROFILE BENTO HEADER                                                      */}
      {/* ========================================================================= */}
      <section className="bg-surface-subtle rounded-3xl p-6 sm:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Column (5 cols): Academic Profile Summary & Counters */}
          <div className="lg:col-span-5 space-y-6">
            {/* Header Chips */}
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="neutral" size="sm">
                Campus Identity
              </Badge>
              {session?.role !== 'platform_admin' && session?.role !== 'org_admin' && session?.role !== 'club_admin' && (
                <button
                  type="button"
                  onClick={handleBecomeOrganizer}
                  className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-accent/10 text-accent hover:bg-accent hover:text-white transition-colors border border-accent/30 shadow-xs"
                >
                  <Sparkle className="w-3.5 h-3.5" weight="bold" />
                  <span>Become an Organizer</span>
                </button>
              )}
            </div>

            {/* Student Name & Academic Affiliation */}
            <div>
              <h1 className="font-display font-semibold text-3xl sm:text-4xl text-ink tracking-tight leading-tight">
                {studentData.name}
              </h1>
              <p className="font-mono text-xs text-ink-soft mt-1">
                {studentData.email}
              </p>
              <p className="font-mono text-xs text-accent font-semibold mt-1.5">
                {studentData.degreeBranch} {studentData.semester ? `· Semester 0${studentData.semester}` : ''}
              </p>
            </div>

            {/* Metric Summary Counters */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <div className="px-4 py-2.5 rounded-xl bg-surface text-center min-w-[100px] flex-1 sm:flex-none">
                <p className="font-display font-medium text-2xl text-ink font-mono">{activePasses.length}</p>
                <p className="text-[11px] text-ink-soft">Active Passes</p>
              </div>
              <div className="px-4 py-2.5 rounded-xl bg-surface text-center min-w-[100px] flex-1 sm:flex-none">
                <p className="font-display font-medium text-2xl text-emerald-600 dark:text-emerald-400 font-mono">
                  {attendedPasses.length}
                </p>
                <p className="text-[11px] text-ink-soft">Admitted at Gate</p>
              </div>
              <div className="px-4 py-2.5 rounded-xl bg-surface text-center min-w-[100px] flex-1 sm:flex-none">
                <p className="font-display font-medium text-2xl text-ink font-mono">{certificates.length}</p>
                <p className="text-[11px] text-ink-soft">Credentials</p>
              </div>
            </div>

            {/* Micro Instruction Note */}
            <p className="text-[11px] font-mono text-ink-muted">
              Official 3D Native ID Card · Click directly on the badge to copy your registration number.
            </p>
          </div>

          {/* Right Column (7 cols): Free-Floating 3D Native Campus ID (Zero Bento Box Cage) */}
          <div className="lg:col-span-7 flex flex-col items-center justify-center relative min-h-[580px] sm:min-h-[660px]">
            {/* Minimal Floating Mode Toggle Pill */}
            <div className="absolute top-2 right-2 z-20 flex items-center gap-2">
              <button
                type="button"
                onClick={() => setLanyardMode(lanyardMode === '3d' ? '2d' : '3d')}
                className="px-3 py-1.5 rounded-full border border-line bg-surface/90 hover:bg-surface text-ink text-xs font-mono shadow-sm backdrop-blur-none transition-all hover:border-line-strong active:scale-95"
                title="Switch between 3D Physics Lanyard and 2D Pass View"
              >
                {lanyardMode === '3d' ? 'Switch to 2D Pass' : 'View in 3D Lanyard'}
              </button>
            </div>

            {/* Direct On-Card Copied Toast Notification */}
            {copiedRegNo && (
              <div className="absolute top-12 z-30 px-4 py-2 rounded-full bg-ink text-paper text-xs font-mono shadow-lg flex items-center gap-2 animate-in fade-in zoom-in-95 duration-200">
                <Check className="w-4 h-4 text-emerald-400" weight="bold" />
                <span>Copied {studentData.registrationNumber} to clipboard!</span>
              </div>
            )}

            {/* Free-Floating Canvas Container (Uncaged, Expansive Stage) */}
            <div className="w-full h-[560px] sm:h-[640px] relative flex items-center justify-center">
              {lanyardMode === '3d' ? (
                <div
                  className="w-full h-full cursor-grab active:cursor-grabbing"
                  title="Click card to copy registration number | Drag to swing"
                >
                  <Lanyard
                    frontImage={frontTexture}
                    backImage={backTexture}
                    imageFit="cover"
                    cardColor="#0B0814"
                    strapColor="#7C3AED"
                    strapWidth={0.16}
                    strapLength={0.28}
                    size={0.88}
                    metal="silver"
                    interactive={true}
                    onCardClick={handleCopyRegNo}
                    className="w-full h-full"
                  />
                </div>
              ) : (
                <div
                  onClick={handleCopyRegNo}
                  className="cursor-pointer transition-transform hover:scale-102 active:scale-98"
                  title="Click card to copy registration number"
                >
                  <StudentIDCard2D
                    name={studentData.name}
                    registrationNumber={studentData.registrationNumber}
                    degreeBranch={studentData.degreeBranch}
                    semester={studentData.semester}
                    email={studentData.email}
                    role={studentData.role}
                    campus={studentData.campus}
                  />
                </div>
              )}
            </div>
          </div>
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
