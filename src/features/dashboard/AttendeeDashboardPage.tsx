import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { jsPDF } from 'jspdf'
import { Ticket, Award, Download, QrCode } from 'lucide-react'
import { useMyRegistrations, useCancelRegistration } from '@/hooks/useRegistrations'
import { useMyCertificates } from '@/hooks/useCertificates'
import { useClubs } from '@/hooks/useClubs'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/design-system/primitives/Button'
import { QRCode } from '@/design-system/primitives/QRCode'
import { Modal } from '@/design-system/primitives/Modal'
import { Tabs } from '@/design-system/primitives/Tabs'
import { formatDate, formatTime } from '@/lib/dates'
import { Registration, Certificate } from '@/api'
import { useToast } from '@/design-system/primitives/Toast'
import { EmptyState } from '@/design-system/primitives/EmptyState'

export const AttendeeDashboardPage: React.FC = () => {
  const { session, isAuthenticated } = useAuth()
  const { toast } = useToast()
  const { data: registrations = [], isLoading: regsLoading } = useMyRegistrations()
  const { data: certificates = [], isLoading: certsLoading } = useMyCertificates()
  const { data: clubs = [] } = useClubs()
  const cancelMutation = useCancelRegistration()

  const [selectedTicket, setSelectedTicket] = useState<Registration | null>(null)
  const [activeTab, setActiveTab] = useState('passes')

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

  const downloadCertificatePDF = (cert: Certificate) => {
    try {
      const doc = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4',
      })

      doc.setFillColor(251, 250, 248)
      doc.rect(0, 0, 297, 210, 'F')

      doc.setDrawColor(201, 62, 39)
      doc.setLineWidth(1.5)
      doc.rect(12, 12, 273, 186)

      doc.setDrawColor(231, 228, 222)
      doc.setLineWidth(0.5)
      doc.rect(15, 15, 267, 180)

      doc.setFont('helvetica', 'normal')
      doc.setFontSize(11)
      doc.setTextColor(94, 90, 85)
      doc.text('EVENTMESH · VERIFIABLE DIGITAL CREDENTIAL', 148.5, 36, { align: 'center' })

      doc.setFont('helvetica', 'bold')
      doc.setFontSize(26)
      doc.setTextColor(27, 26, 25)
      doc.text('CERTIFICATE OF PARTICIPATION', 148.5, 52, { align: 'center' })

      doc.setFont('helvetica', 'normal')
      doc.setFontSize(13)
      doc.setTextColor(94, 90, 85)
      doc.text('This document certifies that', 148.5, 75, { align: 'center' })

      doc.setFont('helvetica', 'bold')
      doc.setFontSize(22)
      doc.setTextColor(201, 62, 39)
      doc.text(cert.recipientName.toUpperCase(), 148.5, 92, { align: 'center' })

      doc.setFont('helvetica', 'normal')
      doc.setFontSize(13)
      doc.setTextColor(94, 90, 85)
      doc.text('has successfully completed', 148.5, 108, { align: 'center' })

      doc.setFont('helvetica', 'bold')
      doc.setFontSize(18)
      doc.setTextColor(27, 26, 25)
      doc.text(cert.eventTitle.toUpperCase(), 148.5, 122, { align: 'center' })

      doc.setFont('helvetica', 'normal')
      doc.setFontSize(11)
      doc.text(`Organized by ${cert.organizerName}`, 148.5, 134, { align: 'center' })

      doc.save(`${cert.certificateId}.pdf`)

      toast({
        title: 'Certificate downloaded',
        message: `Saved ${cert.certificateId}.pdf`,
        type: 'success',
      })
    } catch (err) {
      toast({ title: 'Download failed', type: 'error' })
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="app-container py-16 flex items-center justify-center">
        <div className="max-w-md w-full bg-surface border border-line rounded-panel p-8 text-center space-y-4">
          <h2 className="text-xl font-semibold text-text">Sign in required</h2>
          <p className="text-small text-text-2">
            Sign in to access your digital entry passes, credentials, and followed clubs.
          </p>
          <Link to="/login">
            <Button variant="primary" size="default">Sign in</Button>
          </Link>
        </div>
      </div>
    )
  }

  const tabs = [
    { id: 'passes', label: 'My tickets', count: registrations.length },
    { id: 'certificates', label: 'Certificates', count: certificates.length },
    { id: 'clubs', label: 'Followed clubs', count: followedClubs.length },
  ]

  return (
    <div className="w-full bg-bg text-text pb-16">
      {/* Header Strip */}
      <div className="border-b border-line bg-surface">
        <div className="app-container py-6 sm:py-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-semibold text-text tracking-tight">
              My tickets & account
            </h1>
            <p className="text-small text-text-2 mt-1">
              {session?.name} · {session?.email}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="px-4 py-2.5 rounded-[10px] bg-subtle border border-line text-center min-w-[90px]">
              <p className="font-semibold text-lg text-text">{registrations.length}</p>
              <p className="text-caption text-text-2">Passes</p>
            </div>
            <div className="px-4 py-2.5 rounded-[10px] bg-subtle border border-line text-center min-w-[90px]">
              <p className="font-semibold text-lg text-text">
                {registrations.filter((r) => r.status === 'checked_in').length}
              </p>
              <p className="text-caption text-text-2">Attended</p>
            </div>
            <div className="px-4 py-2.5 rounded-[10px] bg-subtle border border-line text-center min-w-[90px]">
              <p className="font-semibold text-lg text-text">{certificates.length}</p>
              <p className="text-caption text-text-2">Credentials</p>
            </div>
          </div>
        </div>

        <div className="app-container">
          <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />
        </div>
      </div>

      <div className="app-container py-8">
        {/* TAB 1: PASSES */}
        {activeTab === 'passes' && (
          <div>
            {regsLoading ? (
              <p className="text-small text-text-2">Loading passes...</p>
            ) : registrations.length === 0 ? (
              <EmptyState
                title="No active passes"
                description="You have not registered for any upcoming events yet."
                actionLabel="Explore events"
                onAction={() => window.location.assign('/explore')}
              />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {registrations.map((reg) => (
                  <div
                    key={reg.id}
                    className="bg-surface border border-line rounded-panel p-5 flex flex-col justify-between gap-4"
                  >
                    <div>
                      <div className="flex items-center justify-between border-b border-line pb-3 mb-3">
                        <span className="font-mono text-caption font-semibold px-2 py-0.5 rounded-[6px] bg-subtle text-text">
                          PASS-{reg.id.slice(0, 8).toUpperCase()}
                        </span>
                        <span className="text-caption font-semibold px-2 py-0.5 rounded-full bg-accent-soft text-accent">
                          {reg.status.replace('_', ' ')}
                        </span>
                      </div>

                      <h3 className="font-semibold text-small sm:text-base text-text mb-1">
                        {reg.eventTitle}
                      </h3>
                      <p className="text-caption text-text-2">
                        {formatDate(reg.eventStartsAt || reg.createdAt, 'MMM d, yyyy')} · {reg.venueName || 'Campus Venue'}
                      </p>
                      <p className="text-caption text-text-3 mt-1">
                        Attendee: {reg.userName}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 pt-3 border-t border-line">
                      <Button
                        variant="secondary"
                        size="compact"
                        fullWidth
                        icon={<QrCode className="h-4 w-4" />}
                        onClick={() => setSelectedTicket(reg)}
                      >
                        Show QR
                      </Button>
                      <Button
                        variant="tertiary"
                        size="compact"
                        onClick={() => handleCancelPass(reg)}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: CERTIFICATES */}
        {activeTab === 'certificates' && (
          <div>
            {certsLoading ? (
              <p className="text-small text-text-2">Loading certificates...</p>
            ) : certificates.length === 0 ? (
              <EmptyState
                title="No certificates issued"
                description="Certificates are granted upon verified completion of workshops and hackathons."
              />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {certificates.map((cert) => (
                  <div
                    key={cert.id}
                    className="bg-surface border border-line rounded-panel p-5 space-y-4"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Award className="h-5 w-5 text-accent" />
                        <span className="font-semibold text-small text-text">Certificate</span>
                      </div>
                      <span className="font-mono text-caption text-text-3">
                        {cert.certificateId}
                      </span>
                    </div>

                    <div>
                      <h4 className="font-semibold text-small text-text">{cert.eventTitle}</h4>
                      <p className="text-caption text-text-2 mt-0.5">
                        Issued {formatDate(cert.issuedAt)} by {cert.organizerName}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 pt-2 border-t border-line">
                      <Button
                        variant="secondary"
                        size="compact"
                        fullWidth
                        icon={<Download className="h-4 w-4" />}
                        onClick={() => downloadCertificatePDF(cert)}
                      >
                        Download PDF
                      </Button>
                      <Link to={`/verify/${cert.certificateId}`}>
                        <Button variant="tertiary" size="compact">
                          Verify
                        </Button>
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
              <EmptyState
                title="No followed clubs"
                description="Follow clubs to receive immediate updates about their new events."
                actionLabel="Explore clubs"
                onAction={() => window.location.assign('/clubs')}
              />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {followedClubs.map((club) => (
                  <Link
                    key={club.id}
                    to={`/clubs/${club.slug}`}
                    className="flex items-center gap-3 p-4 rounded-[10px] bg-surface border border-line hover:border-text-3 transition-colors"
                  >
                    <span
                      className="h-3 w-3 rounded-full flex-shrink-0"
                      style={{ backgroundColor: club.color || '#C93E27' }}
                      aria-hidden="true"
                    />
                    <div className="min-w-0">
                      <h4 className="font-semibold text-small text-text truncate">{club.name}</h4>
                      <p className="text-caption text-text-2 truncate">{club.joinMode ? club.joinMode.replace('_', ' ') : 'Collective'}</p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* QR Pass Inspection Modal */}
      {selectedTicket && (
        <Modal
          isOpen={Boolean(selectedTicket)}
          onClose={() => setSelectedTicket(null)}
          title="Digital entry pass"
          subtitle={`PASS-${selectedTicket.id.slice(0, 8).toUpperCase()}`}
        >
          <div className="text-center space-y-4">
            <h3 className="font-semibold text-lg text-text">{selectedTicket.eventTitle}</h3>
            <p className="text-small text-text-2">
              {formatDate(selectedTicket.eventStartsAt || selectedTicket.createdAt, 'EEE, MMM d')} · {selectedTicket.venueName}
            </p>

            <div className="flex justify-center py-2">
              <QRCode value={`PASS-${selectedTicket.id}`} size={200} />
            </div>

            <p className="text-caption text-text-3">
              Present this barcode at the registration gate terminal for admission scan.
            </p>

            <Button
              variant="secondary"
              size="default"
              fullWidth
              onClick={() => setSelectedTicket(null)}
            >
              Done
            </Button>
          </div>
        </Modal>
      )}
    </div>
  )
}
