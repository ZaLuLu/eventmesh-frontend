import React, { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { CheckCircle2, XCircle, Search, ShieldCheck } from 'lucide-react'
import { useVerifyCertificate } from '@/hooks/useCertificates'
import { Button } from '@/design-system/primitives/Button'
import { formatDate } from '@/lib/dates'

export const VerifyCertificatePage: React.FC = () => {
  const { certificateId } = useParams<{ certificateId: string }>()
  const [searchId, setSearchId] = useState(certificateId || '')
  const { data: record, isLoading } = useVerifyCertificate(certificateId || '')

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchId.trim()) {
      window.location.href = `/verify/${encodeURIComponent(searchId.trim().toUpperCase())}`
    }
  }

  return (
    <div className="w-full bg-bg text-text min-h-screen py-8 sm:py-12">
      <div className="app-container max-w-2xl space-y-6">
        <div className="text-center space-y-2">
          <span className="text-caption font-semibold text-accent block">
            Digital Credential Registry
          </span>
          <h1 className="text-2xl sm:text-3xl font-semibold text-text tracking-tight">
            Verify Certificate
          </h1>
          <p className="text-small text-text-2 max-w-lg mx-auto">
            Public verification portal for authenticating digital credentials and certificates issued across technical events.
          </p>
        </div>

        {/* Verification Lookup Input */}
        <form onSubmit={handleSearch} className="flex items-center gap-2 rounded-[10px] border border-line p-1.5 bg-surface">
          <Search className="h-4 w-4 text-text-3 ml-2.5" />
          <input
            type="text"
            value={searchId}
            onChange={(e) => setSearchId(e.target.value)}
            placeholder="Enter certificate ID (e.g. TA-2026-001245)..."
            className="w-full bg-transparent text-small px-2 py-1.5 focus:outline-none placeholder:text-text-3 text-text"
          />
          <Button type="submit" size="compact" variant="primary">
            Verify
          </Button>
        </form>

        {/* Verification Result Card */}
        {isLoading ? (
          <div className="p-8 text-center text-small text-text-2 rounded-panel border border-line bg-surface">
            Querying authentication registry...
          </div>
        ) : certificateId ? (
          record && record.isValid ? (
            <div className="rounded-panel border border-line bg-surface p-6 sm:p-8 space-y-6">
              <div className="flex items-center gap-3 text-success border-b border-line pb-4">
                <CheckCircle2 className="h-6 w-6 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-lg text-text">
                    Official Verification Record
                  </h3>
                  <p className="text-caption font-medium text-success">
                    Status: Validated & Cryptographically Signed
                  </p>
                </div>
              </div>

              <div className="divide-y divide-line text-small">
                <div className="py-2.5 flex justify-between">
                  <span className="text-text-2">Certificate ID</span>
                  <span className="font-mono font-semibold text-text">{record.certificateId}</span>
                </div>
                <div className="py-2.5 flex justify-between">
                  <span className="text-text-2">Recipient name</span>
                  <span className="font-semibold text-text">{record.recipientName}</span>
                </div>
                <div className="py-2.5 flex justify-between">
                  <span className="text-text-2">Event title</span>
                  <span className="font-semibold text-text">{record.eventTitle}</span>
                </div>
                <div className="py-2.5 flex justify-between">
                  <span className="text-text-2">Issuing club</span>
                  <span className="font-semibold text-text">{record.organizerName}</span>
                </div>
                <div className="py-2.5 flex justify-between">
                  <span className="text-text-2">Issue date</span>
                  <span className="text-text">
                    {record.issuedAt ? formatDate(record.issuedAt) : '—'}
                  </span>
                </div>
              </div>

              <div className="p-3 bg-subtle rounded-[8px] border border-line text-caption text-text-2 text-center font-mono">
                Verified at {new Date(record.verifiedAt).toLocaleString()}
              </div>
            </div>
          ) : (
            <div className="rounded-panel border border-danger/30 bg-danger/5 p-6 space-y-3 text-center">
              <XCircle className="h-8 w-8 text-danger mx-auto" />
              <h3 className="text-lg font-semibold text-danger">Invalid Credential</h3>
              <p className="text-small text-text-2">
                No verified certificate record was located for "{certificateId}".
              </p>
            </div>
          )
        ) : null}
      </div>
    </div>
  )
}
