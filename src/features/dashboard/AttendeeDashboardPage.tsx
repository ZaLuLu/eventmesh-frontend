import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { jsPDF } from 'jspdf'
import { Ticket, Award, Calendar, CheckCircle2, Download, Building2, ExternalLink } from 'lucide-react'
import { useMyRegistrations } from '@/hooks/useRegistrations'
import { useMyCertificates } from '@/hooks/useCertificates'
import { useClubs } from '@/hooks/useClubs'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/design-system/primitives/Button'
import { QRCode } from '@/design-system/primitives/QRCode'
import { Modal } from '@/design-system/primitives/Modal'
import { formatDate, formatTime } from '@/lib/dates'
import { Registration, Certificate } from '@/api'
import { useToast } from '@/design-system/primitives/Toast'

export const AttendeeDashboardPage: React.FC = () => {
  const { session, isAuthenticated } = useAuth()
  const { toast } = useToast()
  const { data: registrations = [], isLoading: regsLoading } = useMyRegistrations()
  const { data: certificates = [], isLoading: certsLoading } = useMyCertificates()
  const { data: clubs = [] } = useClubs()

  const [selectedTicket, setSelectedTicket] = useState<Registration | null>(null)
  const [activeTab, setActiveTab] = useState<'passes' | 'certificates' | 'clubs'>('passes')

  const followedClubs = clubs.filter((c) => c.isFollowed)

  const downloadCertificatePDF = (cert: Certificate) => {
    try {
      const doc = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4',
      })

      // Paper background
      doc.setFillColor(243, 238, 233) // #F3EEE9
      doc.rect(0, 0, 297, 210, 'F')

      // Carbon Ink border
      doc.setDrawColor(17, 16, 15) // #11100F
      doc.setLineWidth(1.5)
      doc.rect(12, 12, 273, 186)

      // Inner thin rule
      doc.setLineWidth(0.5)
      doc.rect(15, 15, 267, 180)

      // Header
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(11)
      doc.setTextColor(17, 16, 15)
      doc.text('TECHNICAL ASSOCIATION · EDITORIAL RECOGNITION ARCHIVE', 148.5, 36, { align: 'center' })

      doc.setFont('helvetica', 'bold')
      doc.setFontSize(26)
      doc.text('CERTIFICATE OF DISTINCTION', 148.5, 52, { align: 'center' })

      // Body text
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(13)
      doc.text('This document certifies with cryptographic validity that', 148.5, 75, { align: 'center' })

      doc.setFont('helvetica', 'bold')
      doc.setFontSize(22)
      doc.text(cert.recipientName.toUpperCase(), 148.5, 92, { align: 'center' })

      doc.setFont('helvetica', 'normal')
      doc.setFontSize(13)
      doc.text(
        `has successfully participated and demonstrated technical rigor in`,
        148.5,
        108,
        { align: 'center' }
      )

      doc.setFont('helvetica', 'bold')
      doc.setFontSize(18)
      doc.text(cert.eventTitle.toUpperCase(), 148.5, 122, { align: 'center' })

      doc.setFont('helvetica', 'normal')
      doc.setFontSize(11)
      doc.text(
        `Organized under the auspices of ${cert.organizerName.toUpperCase()}`,
        148.5,
        134,
        { align: 'center' }
      )

      // Metadata footer
      doc.setLineWidth(0.5)
      doc.line(30, 155, 267, 155)

      doc.setFontSize(9)
      doc.text(`CERTIFICATE SERIAL: ${cert.certificateId}`, 30, 166)
      doc.text(`ISSUED AT: ${formatDate(cert.issuedAt)}`, 30, 174)
      doc.text(`PUBLIC VERIFICATION: ${cert.verifyUrl}`, 30, 182)

      doc.save(`${cert.certificateId}.pdf`)

      toast({
        title: 'PDF Certificate Downloaded',
        message: `Saved ${cert.certificateId} to local drive.`,
        type: 'success',
      })
    } catch (err) {
      console.error('PDF generation error:', err)
      toast({ title: 'Download failed', type: 'error' })
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-paper flex items-center justify-center p-8 text-center">
        <div className="max-w-md space-y-4">
          <h2 className="font-display text-3xl uppercase text-ink">Member Identification Required</h2>
          <p className="font-body text-sm text-ink-60">
            Please sign in with your email to inspect your issued passes, certificates, and followed clubs.
          </p>
          <Link to="/login">
            <Button size="md" arrow>Sign In with Email OTP</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full bg-paper text-ink min-h-screen">
      {/* Header */}
      <div className="px-[4vw] pt-12 pb-8 border-b border-ink-15 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <span className="font-mono text-[11px] uppercase tracking-widecaps text-ink-60 block mb-2">
            Attendee Collective Account
          </span>
          <h1 className="font-display text-4xl sm:text-6xl uppercase text-ink">
            {session?.name || 'Member Profile'}
          </h1>
          <p className="font-mono text-xs text-ink-60 uppercase mt-2">
            {session?.email} · ROLE: {session?.role.replace('_', ' ')}
          </p>
        </div>

        {/* Quick summary stats */}
        <div className="flex items-center gap-6 border-t md:border-t-0 border-ink-15 pt-4 md:pt-0">
          <div>
            <p className="font-display text-3xl sm:text-4xl text-ink">{registrations.length}</p>
            <p className="font-mono text-[10px] uppercase text-ink-60">Passes</p>
          </div>
          <div>
            <p className="font-display text-3xl sm:text-4xl text-ink">
              {registrations.filter((r) => r.status === 'checked_in').length}
            </p>
            <p className="font-mono text-[10px] uppercase text-ink-60">Attended</p>
          </div>
          <div>
            <p className="font-display text-3xl sm:text-4xl text-ink">{certificates.length}</p>
            <p className="font-mono text-[10px] uppercase text-ink-60">Certificates</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="px-[4vw] border-b border-ink-15 bg-paper flex items-center gap-6 font-mono text-xs uppercase tracking-wide">
        <button
          type="button"
          onClick={() => setActiveTab('passes')}
          className={`py-4 border-b-2 ${
            activeTab === 'passes' ? 'border-ink font-bold text-ink' : 'border-transparent text-ink-60'
          }`}
        >
          Access Passes ({registrations.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('certificates')}
          className={`py-4 border-b-2 ${
            activeTab === 'certificates' ? 'border-ink font-bold text-ink' : 'border-transparent text-ink-60'
          }`}
        >
          Certificates ({certificates.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('clubs')}
          className={`py-4 border-b-2 ${
            activeTab === 'clubs' ? 'border-ink font-bold text-ink' : 'border-transparent text-ink-60'
          }`}
        >
          Followed Collectives ({followedClubs.length})
        </button>
      </div>

      {/* TAB CONTENT: PASSES */}
      {activeTab === 'passes' && (
        <div className="px-[4vw] py-10 space-y-6">
          {regsLoading ? (
            <p className="font-mono text-xs uppercase text-ink-60">Loading registration passes...</p>
          ) : registrations.length === 0 ? (
            <p className="font-mono text-xs uppercase text-ink-60 py-8">
              No active passes found. Browse the catalogue to register for upcoming symposiums.
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {registrations.map((reg) => (
                <div
                  key={reg.id}
                  className="border-2 border-ink bg-paper p-6 flex flex-col justify-between space-y-6"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3 font-mono text-[10px] uppercase">
                      <span className="font-bold text-ink">{reg.ticketCode}</span>
                      <span
                        className={`px-2 py-0.5 border ${
                          reg.status === 'checked_in'
                            ? 'bg-emerald-600 text-white border-emerald-600'
                            : 'bg-paper text-ink border-ink'
                        }`}
                      >
                        {reg.status.replace('_', ' ')}
                      </span>
                    </div>

                    <h3 className="font-display text-2xl uppercase text-ink line-clamp-2">
                      {reg.eventTitle}
                    </h3>

                    {reg.eventStartsAt && (
                      <p className="font-mono text-xs text-ink-60 uppercase mt-2">
                        {formatDate(reg.eventStartsAt)}
                      </p>
                    )}
                  </div>

                  <div className="pt-4 border-t border-ink-15 flex items-center justify-between">
                    <Button size="sm" onClick={() => setSelectedTicket(reg)}>
                      Show QR Pass
                    </Button>
                    <Link
                      to={`/events/${reg.eventSlug}`}
                      className="font-mono text-xs uppercase text-ink underline"
                    >
                      Dossier
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT: CERTIFICATES */}
      {activeTab === 'certificates' && (
        <div className="px-[4vw] py-10 space-y-6">
          {certsLoading ? (
            <p className="font-mono text-xs uppercase text-ink-60">Loading certificates...</p>
          ) : certificates.length === 0 ? (
            <p className="font-mono text-xs uppercase text-ink-60 py-8">
              No certificates issued yet. Certificates are unlocked following verified attendance and event conclusion.
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {certificates.map((cert) => (
                <div
                  key={cert.id}
                  className="border-2 border-ink p-6 bg-paper-deep/20 space-y-4"
                >
                  <div className="flex items-center justify-between font-mono text-[10px] uppercase text-ink-60">
                    <span className="font-bold text-ink">{cert.certificateId}</span>
                    <span>ISSUED {formatDate(cert.issuedAt)}</span>
                  </div>

                  <h3 className="font-display text-2xl sm:text-3xl uppercase text-ink">
                    {cert.eventTitle}
                  </h3>

                  <p className="font-mono text-xs uppercase text-ink-60">
                    Authority: {cert.organizerName}
                  </p>

                  <div className="pt-4 border-t border-ink-15 flex flex-wrap items-center gap-3">
                    <Button
                      size="sm"
                      icon={<Download className="h-4 w-4" />}
                      onClick={() => downloadCertificatePDF(cert)}
                    >
                      Download PDF
                    </Button>

                    <Link to={`/verify/${cert.certificateId}`}>
                      <Button size="sm" variant="secondary" icon={<ExternalLink className="h-4 w-4" />}>
                        Verify Public Record
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT: CLUBS */}
      {activeTab === 'clubs' && (
        <div className="px-[4vw] py-10 space-y-6">
          {followedClubs.length === 0 ? (
            <p className="font-mono text-xs uppercase text-ink-60 py-8">
              You have not followed any clubs yet. Follow clubs to receive priority notices.
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {followedClubs.map((club) => (
                <div key={club.id} className="border border-ink-15 p-6 space-y-4 bg-paper">
                  <div className="flex items-center gap-2">
                    <span
                      className="inline-block h-3 w-3"
                      style={{ backgroundColor: club.color }}
                    />
                    <span className="font-mono text-xs uppercase text-ink-60">
                      {club.followersCount} Followers
                    </span>
                  </div>
                  <h3 className="font-display text-3xl uppercase text-ink">
                    {club.name}
                  </h3>
                  <p className="font-body text-xs text-ink-60 line-clamp-2">
                    {club.about}
                  </p>
                  <Link to={`/clubs/${club.slug}`}>
                    <Button size="sm" variant="secondary" fullWidth>
                      View Club
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* QR TICKET MODAL */}
      {selectedTicket && (
        <Modal
          isOpen={Boolean(selectedTicket)}
          onClose={() => setSelectedTicket(null)}
          title="Digital Access Pass"
          subtitle={selectedTicket.eventTitle}
        >
          <div className="space-y-6 text-center">
            <div className="p-4 border-2 border-ink inline-block bg-paper">
              <QRCode value={selectedTicket.ticketCode} size={220} />
            </div>

            <div>
              <p className="font-mono text-2xl font-bold tracking-widest text-ink">
                {selectedTicket.ticketCode}
              </p>
              <p className="font-mono text-xs uppercase text-ink-60 mt-1">
                Attendee: {selectedTicket.userName}
              </p>
            </div>

            <div className="border-t border-ink-15 pt-4 text-xs font-mono uppercase text-ink-60">
              Present this code directly to check-in volunteer staff at the venue entrance.
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}
