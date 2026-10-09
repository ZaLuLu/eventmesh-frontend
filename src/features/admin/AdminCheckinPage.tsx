import React, { useState } from 'react'
import {
  Camera,
  CheckCircle2,
  Undo2,
} from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { usePermission } from '@/hooks/usePermission'
import { useCheckinTicket, useUndoCheckin, useCheckinStats } from '@/hooks/useCheckin'
import { useAdminEvents } from '@/hooks/useEvents'
import { Button } from '@/design-system/primitives/Button'
import { useToast } from '@/design-system/primitives/Toast'
import { Registration } from '@/api'

export const AdminCheckinPage: React.FC = () => {
  const { session } = useAuth()
  const { clubId } = usePermission()
  const { toast } = useToast()

  const [ticketInput, setTicketInput] = useState('')
  const [selectedEventId, setSelectedEventId] = useState('')
  const [lastCheckedIn, setLastCheckedIn] = useState<Registration | null>(null)

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
      <div className="pb-4 border-b border-line">
        <span className="text-caption font-semibold text-accent block mb-1">
          Access control desk
        </span>
        <h1 className="text-h2 font-semibold text-text">
          Gate & Terminal Check-in
        </h1>
        <p className="text-small text-text-2 mt-0.5">
          Fast verification terminal for mobile cameras, laser barcodes, and manual pass lookup.
        </p>
      </div>

      {/* Select Event */}
      <div className="p-4 bg-surface border border-line rounded-panel space-y-1.5">
        <label className="text-caption font-medium text-text-2 block">
          Select active event:
        </label>
        <select
          value={activeEventId}
          onChange={(e) => setSelectedEventId(e.target.value)}
          className="w-full bg-surface border border-line rounded-btn p-2.5 text-small text-text focus:outline-none focus:border-accent"
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
        <div className="p-6 bg-surface border border-line rounded-panel space-y-4">
          <div className="flex items-baseline justify-between">
            <div>
              <span className="text-caption text-text-3 font-medium">
                Live attendance counter
              </span>
              <p className="text-3xl font-semibold text-text tabular-nums">
                {stats.totalCheckedIn}{' '}
                <span className="text-small font-normal text-text-2">
                  / {stats.totalRegistered} checked in
                </span>
              </p>
            </div>
            <span className="text-xl font-semibold text-accent tabular-nums">
              {stats.percentage}%
            </span>
          </div>

          {/* Progress Bar */}
          <div className="w-full h-2.5 bg-subtle rounded-full overflow-hidden">
            <div
              className="h-full bg-accent transition-all duration-300 rounded-full"
              style={{ width: `${stats.percentage}%` }}
            />
          </div>
        </div>
      )}

      {/* Camera Simulator / Scanner */}
      <div className="p-6 bg-surface border border-line rounded-panel text-center space-y-4">
        <div className="py-6 border border-dashed border-line rounded-panel bg-subtle/50 flex flex-col items-center justify-center">
          <Camera className="h-8 w-8 text-text-3 mb-2" />
          <p className="text-small text-text font-semibold">
            Optical Scanner Terminal
          </p>
          <p className="text-caption text-text-2 max-w-xs mt-1">
            Point physical scanner or device camera at the attendee's digital pass QR code.
          </p>

          <div className="mt-4 flex flex-wrap justify-center gap-2">
            <button
              type="button"
              onClick={() => handleCheckin('TKT-884192')}
              className="px-3 py-1.5 bg-surface hover:bg-subtle text-text text-caption rounded-btn border border-line transition-colors"
            >
              Simulate Scan #1 (TKT-884192)
            </button>
            <button
              type="button"
              onClick={() => handleCheckin('TKT-771204')}
              className="px-3 py-1.5 bg-surface hover:bg-subtle text-text text-caption rounded-btn border border-line transition-colors"
            >
              Simulate Scan #2 (TKT-771204)
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
            placeholder="Type ticket pass code (e.g. TKT-884192)..."
            className="flex-1 bg-surface border border-line rounded-btn px-4 py-2.5 text-small text-text focus:outline-none focus:border-accent uppercase font-mono"
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
        <div className="p-4 border border-success/30 bg-success/10 rounded-panel text-text flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="h-6 w-6 text-success flex-shrink-0" />
            <div>
              <p className="text-caption text-success font-semibold">
                Entry confirmed · {lastCheckedIn.ticketCode}
              </p>
              <p className="text-small font-semibold text-text">
                {lastCheckedIn.userName}
              </p>
              <p className="text-caption text-text-3 font-mono">
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
