import React, { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { CheckCircle2, XCircle, ShieldCheck, Search, Award } from 'lucide-react'
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
    <div className="w-full bg-paper text-ink min-h-screen py-12 sm:py-20">
      <div className="px-[4vw] max-w-2xl mx-auto space-y-10">
        <div className="text-center space-y-3">
          <span className="font-mono text-[11px] uppercase tracking-widecaps text-ink-60 block">
            Cryptographic Registry
          </span>
          <h1 className="font-display text-4xl sm:text-6xl uppercase text-ink">
            Certificate Verification
          </h1>
          <p className="font-body text-sm sm:text-base text-ink-60 max-w-lg mx-auto">
            Public verification portal for authenticating symposium and hackathon distinction credentials issued by the Technical Association.
          </p>
        </div>

        {/* Verification Lookup Input */}
        <form onSubmit={handleSearch} className="flex items-center gap-2 border-2 border-ink p-1 bg-paper">
          <input
            type="text"
            value={searchId}
            onChange={(e) => setSearchId(e.target.value)}
            placeholder="Enter Certificate Serial (e.g. TA-2026-001245)..."
            className="w-full bg-transparent font-mono text-sm uppercase px-4 py-3 focus:outline-none"
          />
          <Button type="submit" size="sm">
            Verify
          </Button>
        </form>

        {/* Verification Result Card */}
        {isLoading ? (
          <div className="p-12 text-center font-mono text-xs uppercase text-ink-60 border border-ink-15">
            Querying Authentication Registry...
          </div>
        ) : certificateId ? (
          record && record.isValid ? (
            <div className="border-2 border-ink bg-paper p-8 space-y-6">
              <div className="flex items-center gap-3 text-emerald-800 border-b border-ink-15 pb-4">
                <CheckCircle2 className="h-6 w-6 flex-shrink-0" />
                <div>
                  <h3 className="font-display text-2xl uppercase text-ink">
                    Authentic & Valid
                  </h3>
                  <p className="font-mono text-xs uppercase text-ink-60">
                    Official record found in central ledger
                  </p>
                </div>
              </div>

              <div className="divide-y divide-ink-15 font-body text-sm">
                <div className="py-3 flex justify-between">
                  <span className="font-mono text-xs uppercase text-ink-60">Serial ID</span>
                  <span className="font-mono font-bold text-ink">{record.certificateId}</span>
                </div>
                <div className="py-3 flex justify-between">
                  <span className="font-mono text-xs uppercase text-ink-60">Recipient</span>
                  <span className="font-semibold text-ink">{record.recipientName}</span>
                </div>
                <div className="py-3 flex justify-between">
                  <span className="font-mono text-xs uppercase text-ink-60">Exhibition / Event</span>
                  <span className="font-semibold text-ink">{record.eventTitle}</span>
                </div>
                <div className="py-3 flex justify-between">
                  <span className="font-mono text-xs uppercase text-ink-60">Issuing Collective</span>
                  <span className="font-semibold text-ink">{record.organizerName}</span>
                </div>
                <div className="py-3 flex justify-between">
                  <span className="font-mono text-xs uppercase text-ink-60">Issue Date</span>
                  <span className="font-mono text-ink">
                    {record.issuedAt ? formatDate(record.issuedAt) : '—'}
                  </span>
                </div>
              </div>

              <div className="p-3 bg-paper-deep/50 border border-ink-15 font-mono text-[11px] uppercase text-ink-60 text-center">
                Verified at {new Date(record.verifiedAt).toLocaleString()}
              </div>
            </div>
          ) : (
            <div className="border-2 border-[#A32828] bg-[#A32828]/5 p-8 space-y-4 text-center">
              <XCircle className="h-8 w-8 text-[#A32828] mx-auto" />
              <h3 className="font-display text-2xl uppercase text-[#A32828]">
                Invalid or Unrecognized Record
              </h3>
              <p className="font-body text-sm text-ink max-w-md mx-auto">
                No certificate could be verified under the serial{' '}
                <span className="font-mono font-bold">{certificateId}</span>. Please verify the code on your issued document.
              </p>
            </div>
          )
        ) : null}

        <div className="text-center pt-4">
          <Link to="/explore" className="font-mono text-xs uppercase text-ink underline">
            Return to Public Catalogue
          </Link>
        </div>
      </div>
    </div>
  )
}
