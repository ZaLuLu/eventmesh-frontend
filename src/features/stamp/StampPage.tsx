import React, { useState } from 'react'
import { Stamp, type StampMotion, type StampResult } from '@/components/stamp'
import { useToast } from '@/design-system/primitives/Toast'
import { Sparkle, SpeakerHigh, SpeakerSlash, ArrowLeft } from '@phosphor-icons/react'
import { Link } from 'react-router-dom'

export const StampPage: React.FC = () => {
  const [motion, setMotion] = useState<StampMotion>('cinematic')
  const [sound, setSound] = useState(true)
  const { success, info } = useToast()

  const handleStamp = (result: StampResult) => {
    success(
      `Invoice ${result.invoiceId} stamped!`,
      `Status: ${result.status.toUpperCase()} on ${result.date.toLocaleDateString()} with ${result.ink} ink.`
    )
  }

  const handleUndo = (result: StampResult) => {
    info(
      `Stamp undone for ${result.invoiceId}`,
      'The invoice mark has been reverted.'
    )
  }

  return (
    <div className="min-h-screen bg-bg text-ink py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-[1008px] mx-auto">
        {/* Navigation & Header */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border-default pb-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Link
                to="/admin/payouts"
                className="inline-flex items-center gap-1.5 text-xs font-mono text-text-3 hover:text-accent transition-colors"
              >
                <ArrowLeft size={14} /> Back to Payouts & Invoices
              </Link>
            </div>
            <h1 className="text-3xl font-display font-extrabold tracking-tight text-ink flex items-center gap-3">
              3D Desk Stamp Studio
              <span className="text-xs font-mono font-medium px-2.5 py-1 rounded-full bg-accent/10 text-accent border border-accent/20">
                Interactive Date Picker
              </span>
            </h1>
            <p className="text-sm text-text-2 mt-1 max-w-xl">
              Turn the brass date wheels, choose your ink status, and press down to stamp physical clearance on the invoice sheet.
            </p>
          </div>

          {/* Quick Controls */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Motion toggle */}
            <div className="inline-flex items-center p-1 bg-surface border border-border-default rounded-xl text-xs font-mono">
              <button
                type="button"
                onClick={() => setMotion('cinematic')}
                className={`px-3 py-1.5 rounded-lg transition-colors ${
                  motion === 'cinematic' ? 'bg-accent text-white font-bold' : 'text-text-2 hover:text-ink'
                }`}
              >
                Cinematic
              </button>
              <button
                type="button"
                onClick={() => setMotion('auto')}
                className={`px-3 py-1.5 rounded-lg transition-colors ${
                  motion === 'auto' ? 'bg-accent text-white font-bold' : 'text-text-2 hover:text-ink'
                }`}
              >
                Auto
              </button>
              <button
                type="button"
                onClick={() => setMotion('quick')}
                className={`px-3 py-1.5 rounded-lg transition-colors ${
                  motion === 'quick' ? 'bg-accent text-white font-bold' : 'text-text-2 hover:text-ink'
                }`}
              >
                Quick
              </button>
            </div>

            {/* Sound toggle */}
            <button
              type="button"
              onClick={() => setSound(!sound)}
              className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-mono border transition-all ${
                sound
                  ? 'bg-mint/10 border-mint/30 text-mint font-semibold'
                  : 'bg-surface border-border-default text-text-3 hover:text-ink'
              }`}
            >
              {sound ? <SpeakerHigh size={16} weight="bold" /> : <SpeakerSlash size={16} />}
              {sound ? 'Sound On' : 'Muted'}
            </button>
          </div>
        </div>

        {/* 3D Stamp Component Container with Real Width */}
        <div className="w-full max-w-[1008px] mx-auto bg-surface border border-border-default rounded-3xl p-4 sm:p-8 shadow-2xl relative overflow-hidden">
          <div className="w-full min-h-[560px] sm:min-h-[720px] flex items-center justify-center">
            <Stamp
              key={motion}
              motion={motion}
              sound={sound}
              onStamp={handleStamp}
              onUndo={handleUndo}
            />
          </div>
        </div>

        {/* Instruction Footer */}
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-mono text-text-3">
          <div className="p-4 rounded-xl bg-surface/50 border border-border-subtle">
            <span className="font-bold text-ink block mb-1">1. Roll Date Wheels</span>
            Drag up/down or scroll the wheels to select day, month, and year.
          </div>
          <div className="p-4 rounded-xl bg-surface/50 border border-border-subtle">
            <span className="font-bold text-ink block mb-1">2. Select Ink & Status</span>
            Choose PAID, RECEIVED, APPROVED, or DUE with custom ink pigments.
          </div>
          <div className="p-4 rounded-xl bg-surface/50 border border-border-subtle">
            <span className="font-bold text-ink block mb-1">3. Press or Hold</span>
            Click Stamp to imprint invoice, or hold down to mark as VOID. Undo is 1-tap away.
          </div>
        </div>
      </div>
    </div>
  )
}
