import React, { useState } from 'react'
import {
  QrCode,
  Search,
  CheckCircle2,
  XCircle,
  Undo2,
  Users,
  Camera,
  AlertCircle,
} from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { usePermission } from '@/hooks/usePermission'
import { useCheckinTicket, useUndoCheckin, useCheckinStats } from '@/hooks/useCheckin'
import { useAdminEvents } from '@/hooks/useEvents'
import { Button } from '@/design-system/primitives/Button'
import { Field } from '@/design-system/primitives/Field'
import { useToast } from '@/design-system/primitives/Toast'
import { Registration } from '@/api'

export const AdminCheckinPage: React.FC = () => {
  const { session } = useAuth()
  const { clubId } = usePermission()
  const { toast } = useToast()

  const [ticketInput, setTicketInput] = useState('')
  const [selectedEventId, setSelectedEventId] = useState('')
  const [lastCheckedIn, setLastCheckedIn] = useState<Registration | null>(null)
  const [isScanning, setIsScanning] = useState(false)

  const { data: events = [] } = useAdminEvents({
    orgId: session?.orgId || 'org-1',
    clubId: clubId || undefined,
  })

  const activeEventId = selectedEventId || events[0]?.id || ''
  const { data: stats } = useCheckinStats(activeEventId)

  const checkinMutation = useCheckinTicket()
  const undoMutation = useUndoCheckin()

  const handleCheckin = async (code: string) => {
    if (!code.trim()) return
    const clean = code.trim().toUpperCase()

    try {
      const res = await checkinMutation.mutateAsync({
        ticketCode: clean,
        eventId: activeEventId || undefined,
      })

      if (res.success && res.registration) {
        setLastCheckedIn(res.registration)
        setTicketInput('')
        toast({
          title: 'Check-in Verified',
          message: `${res.registration.userName} successfully checked in.`,
          type: 'success',
        })
      } else {
        toast({
          title: 'Check-in Denied',
          message: res.message,
          type: 'error',
        })
      }
    } catch {
      toast({ title: 'Check-in Error', message: 'Failed to process ticket.', type: 'error' })
    }
  }

  const handleUndo = async () => {
    if (!lastCheckedIn) return
    try {
      await undoMutation.mutateAsync(lastCheckedIn.id)
      toast({
        title: 'Check-in Undone',
        message: `Reverted entry for ${lastCheckedIn.userName}.`,
        type: 'info',
      })
      setLastCheckedIn(null)
    } catch {
      toast({ title: 'Undo failed', type: 'error' })
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="pb-4 border-b border-[#C9D0D4]">
        <span className="font-mono text-[10px] uppercase tracking-wide text-ink-60 block mb-1">
          Access Control Desk
        </span>
        <h1 className="font-display text-3xl sm:text-4xl uppercase text-ink">
          Ticket Check-In
        </h1>
        <p className="font-body text-xs text-ink-60 mt-0.5">
          Fast verification terminal for mobile cameras, laser barcodes, and manual pass lookup.
        </p>
      </div>

      {/* Select Event */}
      <div className="p-4 bg-paper border border-[#C9D0D4]">
        <label className="font-mono text-[10px] uppercase text-ink-60 block mb-1">
          Select Active Exhibition:
        </label>
        <select
          value={activeEventId}
          onChange={(e) => setSelectedEventId(e.target.value)}
          className="w-full bg-paper border border-[#C9D0D4] p-2 font-mono text-xs uppercase focus:outline-none"
        >
          {events.map((e) => (
            <option key={e.id} value={e.id}>
              {e.title} ({e.seatsLeft} left)
            </option>
          ))}
        </select>
      </div>

      {/* Live Counter Widget */}
      {stats && (
        <div className="p-6 bg-paper border-2 border-ink space-y-4">
          <div className="flex items-baseline justify-between">
            <div>
              <span className="font-mono text-[10px] uppercase text-ink-60">
                Live Attendance Counter
              </span>
              <p className="font-display text-4xl text-ink">
                {stats.totalCheckedIn}{' '}
                <span className="text-xl font-normal text-ink-60">
                  / {stats.totalRegistered} Checked In
                </span>
              </p>
            </div>
            <span className="font-mono text-xl font-bold text-admin-accent">
              {stats.percentage}%
            </span>
          </div>

          {/* Progress Bar */}
          <div className="w-full h-3 bg-[#E6EAEC] border border-[#C9D0D4] overflow-hidden">
            <div
              className="h-full bg-admin-accent transition-all duration-300"
              style={{ width: `${stats.percentage}%` }}
            />
          </div>
        </div>
      )}

      {/* Camera Simulator / Scanner */}
      <div className="p-6 bg-paper border border-[#C9D0D4] text-center space-y-4">
        <div className="py-8 border-2 border-dashed border-[#C9D0D4] bg-[#E6EAEC]/30 flex flex-col items-center justify-center">
          <Camera className="h-10 w-10 text-ink-60 mb-2" />
          <p className="font-mono text-xs uppercase text-ink font-semibold">
            Optical Scanner Terminal
          </p>
          <p className="font-body text-xs text-ink-60 max-w-xs mt-1">
            Point physical scanner or device camera at the attendee's digital pass QR code.
          </p>

          <div className="mt-4 flex gap-2">
            <button
              type="button"
              onClick={() => handleCheckin('TKT-884192')}
              className="px-2.5 py-1 bg-[#E6EAEC] hover:bg-ink hover:text-paper font-mono text-[10px] uppercase border border-[#C9D0D4]"
            >
              Simulate Scan Pass #1 (TKT-884192)
            </button>
            <button
              type="button"
              onClick={() => handleCheckin('TKT-771204')}
              className="px-2.5 py-1 bg-[#E6EAEC] hover:bg-ink hover:text-paper font-mono text-[10px] uppercase border border-[#C9D0D4]"
            >
              Simulate Scan Pass #2 (TKT-771204)
            </button>
          </div>
        </div>

        {/* Manual Input Fallback */}
        <form
          onSubmit={(e) => {
            e.preventDefault()
            handleCheckin(ticketInput)
          }}
          className="flex items-center gap-2 pt-2"
        >
          <input
            type="text"
            value={ticketInput}
            onChange={(e) => setTicketInput(e.target.value)}
            placeholder="Type Ticket Pass Code (e.g. TKT-884192)..."
            className="flex-1 bg-paper border border-[#C9D0D4] px-4 py-3 font-mono text-sm uppercase focus:outline-none focus:border-admin-accent"
          />
          <Button
            type="submit"
            surface="admin"
            size="md"
            loading={checkinMutation.isPending}
          >
            Verify Pass
          </Button>
        </form>
      </div>

      {/* Last Checked In Banner with Instant Undo */}
      {lastCheckedIn && (
        <div className="p-5 border-2 border-emerald-600 bg-emerald-50 text-emerald-950 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="h-6 w-6 text-emerald-700 flex-shrink-0" />
            <div>
              <p className="font-mono text-xs uppercase text-emerald-800 font-bold">
                Entry Confirmed · {lastCheckedIn.ticketCode}
              </p>
              <p className="font-display text-xl uppercase text-ink">
                {lastCheckedIn.userName}
              </p>
              <p className="font-mono text-[10px] text-ink-60 uppercase">
                {lastCheckedIn.userEmail}
              </p>
            </div>
          </div>

          <Button
            surface="admin"
            variant="secondary"
            size="sm"
            icon={<Undo2 className="h-4 w-4" />}
            onClick={handleUndo}
            loading={undoMutation.isPending}
          >
            Undo Check-in
          </Button>
        </div>
      )}
    </div>
  )
}
