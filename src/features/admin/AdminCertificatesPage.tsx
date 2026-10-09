import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { Eye, ExternalLink } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { usePermission } from '@/hooks/usePermission'
import { useAdminEvents } from '@/hooks/useEvents'
import { useCertificates, useGenerateCertificates } from '@/hooks/useCertificates'
import { useRegistrations } from '@/hooks/useRegistrations'
import { Button } from '@/design-system/primitives/Button'
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
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-line">
        <div>
          <span className="text-caption font-semibold text-accent block mb-0.5">
            Credential Authority
          </span>
          <h1 className="text-h2 font-semibold text-text">
            Certificate Generation
          </h1>
          <p className="text-small text-text-2 mt-0.5">
            Mint verifiable distinction certificates with standardized serial numbers (e.g. TA-2026-001245).
          </p>
        </div>
      </div>

      {/* Select Event & Template */}
      <div className="p-4 bg-surface border border-line rounded-panel grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="text-caption font-medium text-text-2 block mb-1">
            Target event:
          </label>
          <select
            value={activeEventId}
            onChange={(e) => setSelectedEventId(e.target.value)}
            className="w-full bg-surface border border-line rounded-btn p-2 text-small text-text focus:outline-none focus:border-accent"
          >
            {events.map((e) => (
              <option key={e.id} value={e.id}>
                {e.title} ({e.status})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-caption font-medium text-text-2 block mb-1">
            Certificate template:
          </label>
          <select
            value={templateId}
            onChange={(e) => setTemplateId(e.target.value)}
            className="w-full bg-surface border border-line rounded-btn p-2 text-small text-text focus:outline-none focus:border-accent"
          >
            <option value="standard_editorial">Standard Editorial Distinction</option>
            <option value="merit_distinction">Merit & Honor Distinction</option>
            <option value="contributor_lead">Lead Organizing Fellow</option>
          </select>
        </div>
      </div>

      {/* Checked In Candidates Section */}
      <div className="p-4 bg-surface border border-line rounded-panel space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-line">
          <div>
            <h3 className="text-h3 font-semibold text-text">
              Checked-in attendees ({checkedInAttendees.length})
            </h3>
            <p className="text-caption text-text-2">
              Only verified attendees who completed check-in are eligible for automated credential minting.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleSelectAllCheckedIn}
              className="text-caption font-medium text-accent hover:underline"
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
          <p className="text-small text-text-3 py-4 text-center">
            No attendees checked in yet for this event. Complete check-in first.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
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
                  className={`p-2.5 border rounded-btn cursor-pointer text-small flex items-center gap-2.5 transition-colors ${
                    isSelected ? 'border-accent bg-accent-soft/30' : 'border-line hover:bg-subtle'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => {}}
                    className="h-4 w-4 rounded text-accent"
                  />
                  <div className="truncate">
                    <p className="font-medium text-text truncate">{att.userName}</p>
                    <p className="text-caption text-text-3 font-mono truncate">{att.ticketCode}</p>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Issued Certificates Ledger */}
      <div className="p-4 bg-surface border border-line rounded-panel space-y-3">
        <h3 className="text-h3 font-semibold text-text pb-2 border-b border-line">
          Issued certificates archive ({certificates.length})
        </h3>

        {certsLoading ? (
          <p className="text-small text-text-3 py-4 text-center">Reading certificate registry...</p>
        ) : certificates.length === 0 ? (
          <p className="text-small text-text-3 py-4 text-center">
            No certificates minted yet for this event.
          </p>
        ) : (
          <div className="divide-y divide-line">
            {certificates.map((cert) => (
              <div key={cert.id} className="py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-small font-semibold text-text">{cert.certificateId}</span>
                    <span className="text-caption capitalize text-success bg-success/10 px-2 py-0.5 rounded-full">
                      {cert.status}
                    </span>
                  </div>
                  <p className="text-small font-medium text-text mt-0.5">{cert.recipientName}</p>
                  <p className="text-caption text-text-3">
                    Issued {formatDate(cert.issuedAt)} · {cert.templateId}
                  </p>
                </div>

                <div className="flex items-center gap-2 text-small">
                  <Button
                    surface="admin"
                    variant="secondary"
                    size="sm"
                    icon={<Eye className="h-3.5 w-3.5" />}
                    onClick={() => setPreviewCert(cert)}
                  >
                    Inspect
                  </Button>
                  <Link
                    to={`/verify/${cert.certificateId}`}
                    target="_blank"
                    className="p-2 border border-line rounded-btn text-text hover:bg-subtle transition-colors"
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
          <div className="border border-line rounded-panel p-6 bg-surface text-center space-y-3">
            <span className="text-caption font-semibold text-accent block">
              {previewCert.organizerName} · Official Document
            </span>
            <h2 className="text-h2 font-semibold text-text">
              Certificate of Distinction
            </h2>
            <p className="text-small text-text-2">Presented with cryptographic validity to</p>
            <p className="text-h3 font-semibold text-text">{previewCert.recipientName}</p>
            <p className="text-caption text-text-2">for successful completion of</p>
            <p className="text-small font-semibold text-text">{previewCert.eventTitle}</p>
            <div className="pt-3 border-t border-line text-caption text-text-3 font-mono">
              Serial: {previewCert.certificateId} · Issued {formatDate(previewCert.issuedAt)}
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}
