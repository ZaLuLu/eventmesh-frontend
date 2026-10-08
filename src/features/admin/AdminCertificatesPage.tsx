import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { Award, Plus, CheckCircle2, Download, Eye, ExternalLink } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { usePermission } from '@/hooks/usePermission'
import { useAdminEvents } from '@/hooks/useEvents'
import { useCertificates, useGenerateCertificates } from '@/hooks/useCertificates'
import { useRegistrations } from '@/hooks/useRegistrations'
import { Button } from '@/design-system/primitives/Button'
import { Select } from '@/design-system/primitives/Select'
import { Modal } from '@/design-system/primitives/Modal'
import { formatDate } from '@/lib/dates'
import { useToast } from '@/design-system/primitives/Toast'
import { Certificate } from '@/api'

export const AdminCertificatesPage: React.FC = () => {
  const { session } = useAuth()
  const { clubId } = usePermission()
  const { toast } = useToast()

  const { data: events = [] } = useAdminEvents({
    orgId: session?.orgId || 'org-1',
    clubId: clubId || undefined,
  })

  const [selectedEventId, setSelectedEventId] = useState('')
  const activeEventId = selectedEventId || events[0]?.id || ''

  const { data: certificates = [], isLoading: certsLoading } = useCertificates({
    eventId: activeEventId,
  })

  const { data: registrations = [] } = useRegistrations({
    eventId: activeEventId,
  })

  const generateMutation = useGenerateCertificates()

  const [templateId, setTemplateId] = useState('standard_editorial')
  const [selectedAttendeeIds, setSelectedAttendeeIds] = useState<string[]>([])
  const [previewCert, setPreviewCert] = useState<Certificate | null>(null)

  // Checked in attendees eligible for certificates
  const checkedInAttendees = registrations.filter((r) => r.status === 'checked_in')

  const handleSelectAllCheckedIn = () => {
    setSelectedAttendeeIds(checkedInAttendees.map((a) => a.id))
  }

  const handleBulkGenerate = async () => {
    if (selectedAttendeeIds.length === 0) {
      toast({ title: 'No Attendees Selected', message: 'Select at least one attendee.', type: 'info' })
      return
    }

    try {
      const generated = await generateMutation.mutateAsync({
        eventId: activeEventId,
        recipientIds: selectedAttendeeIds,
        templateId,
      })
      toast({
        title: 'Certificates Dispatched',
        message: `Successfully minted ${generated.length} verifiable credentials.`,
        type: 'success',
      })
      setSelectedAttendeeIds([])
    } catch {
      toast({ title: 'Generation Failed', type: 'error' })
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#C9D0D4]">
        <div>
          <span className="font-mono text-[10px] uppercase tracking-wide text-ink-60 block mb-1">
            Credential Authority
          </span>
          <h1 className="font-display text-3xl sm:text-4xl uppercase text-ink">
            Certificate Generation
          </h1>
          <p className="font-body text-xs text-ink-60 mt-0.5">
            Mint verifiable distinction certificates with standardized serial numbers (e.g. TA-2026-001245).
          </p>
        </div>
      </div>

      {/* Select Event & Template */}
      <div className="p-6 bg-paper border border-[#C9D0D4] grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="font-mono text-[10px] uppercase text-ink-60 block mb-1">
            Target Exhibition:
          </label>
          <select
            value={activeEventId}
            onChange={(e) => setSelectedEventId(e.target.value)}
            className="w-full bg-paper border border-[#C9D0D4] p-2 font-mono text-xs uppercase focus:outline-none"
          >
            {events.map((e) => (
              <option key={e.id} value={e.id}>
                {e.title} ({e.status})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="font-mono text-[10px] uppercase text-ink-60 block mb-1">
            Editorial Certificate Template:
          </label>
          <select
            value={templateId}
            onChange={(e) => setTemplateId(e.target.value)}
            className="w-full bg-paper border border-[#C9D0D4] p-2 font-mono text-xs uppercase focus:outline-none"
          >
            <option value="standard_editorial">Standard Editorial Distinction</option>
            <option value="merit_distinction">Merit & Honor Distinction</option>
            <option value="contributor_lead">Lead Organizing Fellow</option>
          </select>
        </div>
      </div>

      {/* Checked In Candidates Section */}
      <div className="p-6 bg-paper border border-[#C9D0D4] space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#C9D0D4]">
          <div>
            <h3 className="font-display text-xl uppercase text-ink">
              Checked-In Attendees ({checkedInAttendees.length})
            </h3>
            <p className="font-body text-xs text-ink-60">
              Only verified attendees who completed check-in are eligible for automated credential minting.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleSelectAllCheckedIn}
              className="font-mono text-xs uppercase text-ink underline"
            >
              Select All Verified
            </button>
            <Button
              surface="admin"
              size="sm"
              loading={generateMutation.isPending}
              disabled={selectedAttendeeIds.length === 0}
              onClick={handleBulkGenerate}
            >
              Bulk Mint ({selectedAttendeeIds.length})
            </Button>
          </div>
        </div>

        {checkedInAttendees.length === 0 ? (
          <p className="font-mono text-xs uppercase text-ink-60 py-4">
            No attendees checked in yet for this exhibition. Complete check-in first.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {checkedInAttendees.map((att) => {
              const isSelected = selectedAttendeeIds.includes(att.id)
              return (
                <div
                  key={att.id}
                  onClick={() => {
                    setSelectedAttendeeIds(
                      isSelected
                        ? selectedAttendeeIds.filter((id) => id !== att.id)
                        : [...selectedAttendeeIds, att.id]
                    )
                  }}
                  className={`p-3 border cursor-pointer font-body text-xs flex items-center gap-3 transition-colors ${
                    isSelected ? 'border-admin-accent bg-admin-accent/5' : 'border-[#C9D0D4] hover:bg-black/5'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => {}}
                    className="h-4 w-4 rounded-none border border-ink text-admin-accent"
                  />
                  <div className="truncate">
                    <p className="font-semibold text-ink uppercase truncate">{att.userName}</p>
                    <p className="font-mono text-[10px] text-ink-60 truncate">{att.ticketCode}</p>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Issued Certificates Ledger */}
      <div className="p-6 bg-paper border border-[#C9D0D4] space-y-4">
        <h3 className="font-display text-xl uppercase text-ink pb-3 border-b border-[#C9D0D4]">
          Issued Certificates Archive ({certificates.length})
        </h3>

        {certsLoading ? (
          <p className="font-mono text-xs uppercase text-ink-60 py-4">Reading certificate registry...</p>
        ) : certificates.length === 0 ? (
          <p className="font-mono text-xs uppercase text-ink-60 py-4">
            No certificates minted yet for this exhibition.
          </p>
        ) : (
          <div className="divide-y divide-[#C9D0D4]">
            {certificates.map((cert) => (
              <div key={cert.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-ink">{cert.certificateId}</span>
                    <span className="font-mono text-[10px] uppercase text-emerald-800 bg-emerald-100 px-1.5 py-0.5">
                      {cert.status}
                    </span>
                  </div>
                  <p className="font-body text-sm font-semibold text-ink mt-0.5">{cert.recipientName}</p>
                  <p className="font-mono text-[10px] text-ink-60 uppercase">
                    Issued {formatDate(cert.issuedAt)} · {cert.templateId}
                  </p>
                </div>

                <div className="flex items-center gap-3 font-mono text-xs">
                  <Button
                    surface="admin"
                    variant="secondary"
                    size="dense"
                    icon={<Eye className="h-3.5 w-3.5" />}
                    onClick={() => setPreviewCert(cert)}
                  >
                    Inspect
                  </Button>
                  <Link
                    to={`/verify/${cert.certificateId}`}
                    target="_blank"
                    className="p-1 text-ink-60 hover:text-ink"
                    title="Verify Record"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Certificate Preview Modal */}
      {previewCert && (
        <Modal
          isOpen={Boolean(previewCert)}
          onClose={() => setPreviewCert(null)}
          title="Certificate Preview"
          subtitle={previewCert.certificateId}
        >
          <div className="border-2 border-ink p-8 bg-paper text-center space-y-4">
            <span className="font-mono text-xs uppercase text-ink-60 block">
              {previewCert.organizerName} · OFFICIAL DOCUMENT
            </span>
            <h2 className="font-display text-3xl uppercase text-ink">
              Certificate of Distinction
            </h2>
            <p className="font-body text-sm text-ink-60">Presented with cryptographic validity to</p>
            <p className="font-display text-2xl uppercase text-ink">{previewCert.recipientName}</p>
            <p className="font-body text-xs text-ink-60">for successful completion of</p>
            <p className="font-body text-sm font-bold uppercase text-ink">{previewCert.eventTitle}</p>
            <div className="pt-4 border-t border-ink-15 font-mono text-[10px] uppercase text-ink-60">
              Serial: {previewCert.certificateId} · Issued {formatDate(previewCert.issuedAt)}
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}
