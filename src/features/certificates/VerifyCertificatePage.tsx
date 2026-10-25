// Hallmark macrostructure: Certificate-Verification
import React, { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import {
  CheckCircle,
  XCircle,
  MagnifyingGlass,
  ShieldCheck,
  QrCode,
  Certificate as CertificateIcon,
  ArrowSquareOut,
} from '@phosphor-icons/react'
import { useVerifyCertificate } from '@/hooks/useCertificates'
import { PageShell } from '@/design-system/layout/PageShell'
import { SectionHeader } from '@/design-system/SectionHeader'
import { Sticker } from '@/design-system/primitives/Sticker'
import { Button } from '@/design-system/primitives/Button'
import { formatDate } from '@/lib/format'
import { getClubTheme } from '@/design-system/clubColors'
const WaxSeal3D = React.lazy(() =>
  import('@/design-system/3d/WaxSeal3D').then((m) => ({ default: m.WaxSeal3D }))
)

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

  const issuingTheme = record?.organizerName ? getClubTheme(record.organizerName) : null

  return (
    <PageShell className="py-8 sm:py-14 space-y-8 max-w-3xl">
      {/* Header */}
      <div className="text-center space-y-3">
        <SectionHeader
          badge="CREDENTIAL VERIFICATION"
          badgeColor="mint"
          title="Verify Campus Certificate"
          accentWord="Certificate"
          subtitle="Public verification registry for authenticating participation credentials and achievement awards issued by student collectives."
        />
      </div>

      {/* Verification Lookup Input */}
      <form
        onSubmit={handleSearch}
        className="rounded-[20px] border-2 border-ink p-2 bg-card shadow-[4px_4px_0_#151130] flex items-center gap-2"
      >
        <div className="pl-3 text-ink-soft">
          <MagnifyingGlass className="w-5 h-5" weight="bold" />
        </div>
        <input
          type="text"
          value={searchId}
          onChange={(e) => setSearchId(e.target.value)}
          placeholder="Enter certificate ID (e.g. TA-2026-001245)..."
          className="w-full bg-transparent text-sm sm:text-base font-mono px-2 py-2 focus:outline-none placeholder:text-ink-soft/60 text-ink uppercase"
        />
        <Button type="submit" size="default" variant="primary" className="flex-shrink-0 font-bold">
          Verify
        </Button>
      </form>

      {/* Verification Result Card */}
      {isLoading ? (
        <div className="p-12 text-center text-sm font-semibold text-ink-soft rounded-[20px] border-2 border-ink bg-card animate-pulse shadow-[4px_4px_0_#151130]">
          Querying verified credentials registry...
        </div>
      ) : certificateId ? (
        record && record.isValid ? (
          <div className="rounded-[24px] border-2 border-ink bg-card p-6 sm:p-9 space-y-7 shadow-[6px_6px_0_#151130] select-none">
            {/* Status Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b-2 border-ink/10 pb-5">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full border-2 border-ink bg-mint flex items-center justify-center text-ink shadow-[2px_2px_0_#151130]">
                  <CheckCircle className="w-7 h-7" weight="bold" />
                </div>
                <div>
                  <h3 className="font-display font-extrabold text-xl text-ink leading-tight">
                    Official Verification Record
                  </h3>
                  <p className="text-xs font-semibold text-ink-soft mt-0.5">
                    Verified by EventMesh Registry System
                  </p>
                </div>
              </div>

              <Sticker color="mint" size="lg" className="font-extrabold tracking-wide uppercase text-xs">
                VALIDATED ✓
              </Sticker>
            </div>

            {/* 3D Wax Seal Credential Stamp */}
            <div className="w-full flex flex-col items-center justify-center py-2 bg-surface/50 rounded-2xl border border-border-default/60">
              <React.Suspense fallback={<div className="h-[200px] flex items-center justify-center text-xs font-mono text-ink-muted">Loading Wax Seal 3D...</div>}>
                <WaxSeal3D
                  issuerName={record.organizerName || 'EVENTMESH ACADEMY'}
                  sealText="AUTHENTICATED"
                  sealYear={record.issuedAt ? new Date(record.issuedAt).getFullYear().toString() : '2026'}
                  color={issuingTheme?.hex || issuingTheme?.color || '#8A1C14'}
                  height={200}
                />
              </React.Suspense>
              <span className="text-[10px] font-mono text-text-3 uppercase tracking-widest mt-1">
                Interactive 3D University Wax Seal • Drag to inspect
              </span>
            </div>

            {/* Metadata Ledger */}
            <div className="rounded-[16px] border-2 border-ink bg-paper p-5 space-y-3.5 divide-y divide-ink/10 text-sm">
              <div className="pt-1 flex justify-between items-center">
                <span className="text-ink-soft font-medium">Certificate Serial</span>
                <span className="font-mono font-extrabold text-ink text-sm sm:text-base">
                  {record.certificateId}
                </span>
              </div>

              <div className="pt-3 flex justify-between items-center">
                <span className="text-ink-soft font-medium">Recipient Name</span>
                <span className="font-display font-bold text-ink text-base">
                  {record.recipientName}
                </span>
              </div>

              <div className="pt-3 flex justify-between items-center">
                <span className="text-ink-soft font-medium">Event Title</span>
                <span className="font-display font-bold text-ink text-base text-right max-w-xs truncate">
                  {record.eventTitle}
                </span>
              </div>

              <div className="pt-3 flex justify-between items-center">
                <span className="text-ink-soft font-medium">Issuing Collective</span>
                <span className="font-semibold text-ink">
                  {record.organizerName}
                </span>
              </div>

              <div className="pt-3 flex justify-between items-center">
                <span className="text-ink-soft font-medium">Issue Date</span>
                <span className="font-semibold text-ink">
                  {record.issuedAt ? formatDate(record.issuedAt, 'medium') : '—'}
                </span>
              </div>
            </div>

            {/* Verification Proof & Server Hash */}
            <div className="rounded-[14px] border border-ink/20 bg-paper-2 p-3.5 text-center space-y-1">
              <p className="text-xs font-mono font-bold text-ink">
                Record Hash: {record.certificateId}-EVTMESH-{record.verifiedAt ? new Date(record.verifiedAt).getTime() : 'OK'}
              </p>
              <p className="text-[11px] text-ink-soft">
                Verified at {new Date(record.verifiedAt || Date.now()).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })} (IST)
              </p>
            </div>
          </div>
        ) : (
          <div className="rounded-[24px] border-2 border-ink bg-card p-8 sm:p-10 space-y-4 text-center shadow-[6px_6px_0_#151130]">
            <div className="w-14 h-14 rounded-full border-2 border-ink bg-pink/20 text-pink flex items-center justify-center mx-auto shadow-[2px_2px_0_#151130]">
              <XCircle className="w-8 h-8" weight="bold" />
            </div>
            <h3 className="font-display font-extrabold text-2xl text-ink">
              Invalid or Unregistered Credential
            </h3>
            <p className="text-ink-soft text-sm max-w-md mx-auto">
              No authenticated certificate record was found matching serial "{certificateId}". Please confirm the ID printed on your physical badge or PDF.
            </p>
          </div>
        )
      ) : null}
    </PageShell>
  )
}
