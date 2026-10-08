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
    <div className="w-full bg-[#EEF2F6] text-slate-800 min-h-screen py-10 sm:py-16">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 space-y-8">
        <div className="text-center space-y-2">
          <span className="text-xs font-bold text-gradient-feral uppercase tracking-wider block">
            Digital Credential Verification
          </span>
          <h1 className="font-display font-bold text-3xl sm:text-4xl text-slate-900 tracking-tight">
            Verify Certificate
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 max-w-lg mx-auto">
            Public verification portal for authenticating digital credentials and certificates issued across events and hackathons.
          </p>
        </div>

        {/* Verification Lookup Input */}
        <form onSubmit={handleSearch} className="flex items-center gap-2 rounded-full border border-white/80 p-2 bg-[#EEF2F6] shadow-neo-inset">
          <Search className="h-4 w-4 text-indigo-500 ml-3" />
          <input
            type="text"
            value={searchId}
            onChange={(e) => setSearchId(e.target.value)}
            placeholder="Enter Certificate ID (e.g. TA-2026-001245)..."
            className="w-full bg-transparent font-body text-xs sm:text-sm px-2 py-2 focus:outline-none placeholder:text-slate-400 text-slate-800"
          />
          <Button type="submit" size="sm" variant="primary">
            Verify
          </Button>
        </form>

        {/* Verification Result Card */}
        {isLoading ? (
          <div className="p-12 text-center text-xs text-slate-500 rounded-3xl border border-white/80 bg-[#EEF2F6] shadow-neo-card animate-pulse">
            Querying Authentication Registry...
          </div>
        ) : certificateId ? (
          record && record.isValid ? (
            <div className="rounded-3xl border border-white/80 bg-[#EEF2F6] p-6 sm:p-8 shadow-neo-card space-y-6">
              <div className="flex items-center gap-3 text-emerald-600 border-b border-slate-200/60 pb-4">
                <CheckCircle2 className="h-6 w-6 flex-shrink-0" />
                <div>
                  <h3 className="font-display font-bold text-xl text-slate-900">
                    Authentic & Valid Certificate
                  </h3>
                  <p className="text-xs text-emerald-600 font-medium">
                    Official verified credential record found
                  </p>
                </div>
              </div>

              <div className="divide-y divide-slate-200/60 text-xs sm:text-sm font-body">
                <div className="py-3 flex justify-between">
                  <span className="text-slate-500">Certificate ID</span>
                  <span className="font-mono font-bold text-slate-900">{record.certificateId}</span>
                </div>
                <div className="py-3 flex justify-between">
                  <span className="text-slate-500">Recipient Name</span>
                  <span className="font-semibold text-slate-900">{record.recipientName}</span>
                </div>
                <div className="py-3 flex justify-between">
                  <span className="text-slate-500">Event Title</span>
                  <span className="font-semibold text-slate-900">{record.eventTitle}</span>
                </div>
                <div className="py-3 flex justify-between">
                  <span className="text-slate-500">Issuing Club</span>
                  <span className="font-semibold text-slate-900">{record.organizerName}</span>
                </div>
                <div className="py-3 flex justify-between">
                  <span className="text-slate-500">Issue Date</span>
                  <span className="text-slate-900">
                    {record.issuedAt ? formatDate(record.issuedAt) : '—'}
                  </span>
                </div>
              </div>

              <div className="p-3.5 bg-[#EEF2F6] shadow-neo-inset rounded-2xl border border-white/60 text-xs text-slate-500 text-center font-mono">
                Verified at {new Date(record.verifiedAt).toLocaleString()}
              </div>
            </div>
          ) : (
            <div className="rounded-3xl border border-rose-200 bg-[#EEF2F6] shadow-neo-card p-8 space-y-4 text-center">
              <XCircle className="h-8 w-8 text-rose-500 mx-auto" />
              <h3 className="font-display font-bold text-xl text-slate-900">
                Invalid Certificate
              </h3>
              <p className="text-xs text-slate-600">
                No matching verified credential was found for ID &quot;{certificateId}&quot;. Please verify the serial code and try again.
              </p>
            </div>
          )
        ) : null}
      </div>
    </div>
  )
}
