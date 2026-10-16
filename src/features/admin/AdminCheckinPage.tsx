// Hallmark macrostructure: AdminConsole-Checkin
import React, { useState, useEffect, useRef } from 'react'
import { Scanner, IDetectedBarcode } from '@yudiel/react-qr-scanner'
import { get, set } from 'idb-keyval'
import {
  Camera,
  CheckCircle,
  Warning,
  XCircle,
  ArrowCounterClockwise,
  Lightning,
  Sparkle,
  SlidersHorizontal,
  CloudSlash,
  ArrowRight,
  ShieldCheck,
} from '@phosphor-icons/react'
import { useAuth } from '@/hooks/useAuth'
import { usePermission } from '@/hooks/usePermission'
import { useCheckinTicket, useUndoCheckin, useCheckinStats } from '@/hooks/useCheckin'
import { useAdminEvents } from '@/hooks/useEvents'
import { Button } from '@/design-system/primitives/Button'
import { Sticker } from '@/design-system/primitives/Sticker'
import { useToast } from '@/design-system/primitives/Toast'
import { triggerBurstConfetti } from '@/lib/confetti'
import { playSound } from '@/lib/sound'
import { Registration } from '@/api'
import { StampActionOverlay, PrintMark } from '@/components/stamp'

interface ScanResultState {
  status: 'admitted' | 'already_admitted' | 'queued' | 'wrong_event' | 'invalid'
  title: string
  message: string
  registration?: Registration
  scannedAt: string
}

interface OfflineCheckin {
  code: string
  eventId: string
}

export const AdminCheckinPage: React.FC = () => {
  const { session } = useAuth()
  const { clubId } = usePermission()
  const { toast } = useToast()

  const [ticketInput, setTicketInput] = useState('')
  const [selectedEventId, setSelectedEventId] = useState('')
  const [lastScanResult, setLastScanResult] = useState<ScanResultState | null>(null)
  const [recentScans, setRecentScans] = useState<Registration[]>([])
  const [cameraActive, setCameraActive] = useState(true)
  const [cameraError, setCameraError] = useState<string | null>(null)
  const [offlineCount, setOfflineCount] = useState<number>(0)
  const [stampOverlayOpen, setStampOverlayOpen] = useState(false)
  const [stampDetails, setStampDetails] = useState<{
    status: 'admitted' | 'void'
    reg?: Registration
    title?: string
  }>({ status: 'admitted' })

  // Last scanned code debounce timestamp map
  const lastScannedRef = useRef<{ code: string; time: number }>({ code: '', time: 0 })

  const { data: events = [] } = useAdminEvents({
    orgId: session?.orgId || 'org-1',
    clubId: clubId || undefined,
  })

  const activeEventId =
    selectedEventId || events.find((e) => e.status === 'published')?.id || events[0]?.id || ''
  const activeEvent = events.find((e) => e.id === activeEventId)
  const { data: stats } = useCheckinStats(activeEventId)

  const checkinMutation = useCheckinTicket()
  const undoMutation = useUndoCheckin()

  // Offline queue sync handler
  useEffect(() => {
    const checkOfflineQueue = async () => {
      try {
        const queue = (await get<Array<OfflineCheckin | string>>('eventmesh_offline_checkins')) || []
        setOfflineCount(queue.length)
      } catch { /* Continue when optional storage or browser API is unavailable. */ }
    }
    checkOfflineQueue()

    const handleOnline = async () => {
      try {
        const queue = (await get<Array<OfflineCheckin | string>>('eventmesh_offline_checkins')) || []
        if (queue.length > 0) {
          toast({
            title: 'Syncing Offline Scans',
            message: `Uploading ${queue.length} scans queued while offline...`,
            type: 'info',
          })
          const pending: Array<OfflineCheckin | string> = []
          for (const entry of queue) {
            const code = typeof entry === 'string' ? entry : entry.code
            const eventId = typeof entry === 'string' ? activeEventId : entry.eventId
            try {
              const result = await checkinMutation.mutateAsync({ ticketCode: code, eventId })
              if (!result.success) pending.push(entry)
            } catch {
              pending.push(entry)
            }
          }
          await set('eventmesh_offline_checkins', pending)
          setOfflineCount(pending.length)
          toast({
            title: pending.length ? 'Some scans still need verification' : 'Offline sync complete',
            message: pending.length ? `${pending.length} scans remain in the queue.` : 'Queued scans were verified with the registry.',
            type: pending.length ? 'info' : 'success',
          })
        }
      } catch (err) {
        console.error('Failed to sync offline queue:', err)
      }
    }

    window.addEventListener('online', handleOnline)
    return () => window.removeEventListener('online', handleOnline)
  }, [activeEventId, checkinMutation, toast])

  const processScanCode = async (rawCode: string) => {
    if (!rawCode.trim()) return
    const now = Date.now()

    // Parse potential signed JSON token: { v, ticketId, sig, eventId }
    let cleanCode = rawCode.trim().toUpperCase()
    let payloadEventId: string | undefined

    try {
      if (rawCode.trim().startsWith('{')) {
        const parsed = JSON.parse(rawCode.trim())
        if (parsed.ticketId) cleanCode = String(parsed.ticketId).toUpperCase()
        if (parsed.eventId) payloadEventId = parsed.eventId
      }
    } catch { /* Continue when optional storage or browser API is unavailable. */ }

    // Debounce duplicate decodes (ignore same token within 3s)
    if (lastScannedRef.current.code === cleanCode && now - lastScannedRef.current.time < 3000) {
      return
    }
    lastScannedRef.current = { code: cleanCode, time: now }

    // Check for wrong event mismatch
    if (payloadEventId && activeEventId && payloadEventId !== activeEventId) {
      if (navigator.vibrate) navigator.vibrate([200, 100, 200])
      playSound('error')
      setLastScanResult({
        status: 'wrong_event',
        title: 'Wrong Event Pass',
        message: 'This credential was issued for a different campus event.',
        scannedAt: new Date().toLocaleTimeString(),
      })
      return
    }

    // Check offline status
    if (!navigator.onLine) {
      try {
        if (!activeEventId) throw new Error('Select an event before queuing a scan')
        const currentQueue = (await get<Array<OfflineCheckin | string>>('eventmesh_offline_checkins')) || []
        currentQueue.push({ code: cleanCode, eventId: activeEventId })
        await set('eventmesh_offline_checkins', currentQueue)
        setOfflineCount(currentQueue.length)
        if (navigator.vibrate) navigator.vibrate([100, 50, 100])
        setLastScanResult({
          status: 'queued',
          title: 'Pending verification',
          message: `Pass ${cleanCode} is queued locally. Verify with the registry before admitting this attendee.`,
          scannedAt: new Date().toLocaleTimeString(),
        })
        return
      } catch { /* Continue when optional storage or browser API is unavailable. */ }
    }

    try {
      const res = await checkinMutation.mutateAsync({
        ticketCode: cleanCode,
        eventId: activeEventId || undefined,
      })

      if (res.success && res.registration) {
        const reg = res.registration
        setRecentScans((prev) => [reg, ...prev.filter((r) => r.id !== reg.id)].slice(0, 5))
        setTicketInput('')

        // Haptic feedback & celebratory audio
        if (navigator.vibrate) navigator.vibrate([100, 50, 100])
        playSound('gate_chime')
        triggerBurstConfetti()

        // Real-time broadcast for attendee ticket tear (Mandate 1)
        try {
          const channel = new BroadcastChannel('eventmesh_gate_admission')
          channel.postMessage({ registrationId: reg.id, ticketCode: reg.ticketCode })
          channel.close()
        } catch { /* Continue when optional storage or browser API is unavailable. */ }
        window.dispatchEvent(
          new CustomEvent('eventmesh_gate_admitted', {
            detail: { registrationId: reg.id, ticketCode: reg.ticketCode },
          })
        )

        setLastScanResult({
          status: 'admitted',
          title: 'Admitted & Verified',
          message: `${reg.userName} is cleared for venue entry.`,
          registration: reg,
          scannedAt: new Date().toLocaleTimeString(),
        })

        // Trigger celebratory 3D physical desk stamp
        setStampDetails({
          status: 'admitted',
          reg,
          title: 'Gate Admission Verified',
        })
        setStampOverlayOpen(true)
      } else {
        if (navigator.vibrate) navigator.vibrate([200, 100, 200])
        playSound('error')

        if (res.message && res.message.toLowerCase().includes('already')) {
          setLastScanResult({
            status: 'already_admitted',
            title: 'Already Admitted',
            message: res.message || 'Pass has already been marked as admitted.',
            scannedAt: new Date().toLocaleTimeString(),
          })
        } else {
          setLastScanResult({
            status: 'invalid',
            title: 'Admission Denied',
            message: res.message || 'Ticket is invalid or cancelled in registry.',
            scannedAt: new Date().toLocaleTimeString(),
          })
        }
      }
    } catch {
      playSound('error')
      setLastScanResult({
        status: 'invalid',
        title: 'Network Communication Error',
        message: 'Could not contact gate admission registry.',
        scannedAt: new Date().toLocaleTimeString(),
      })
    }
  }

  const handleScan = (detectedCodes: IDetectedBarcode[]) => {
    if (detectedCodes && detectedCodes.length > 0) {
      const first = detectedCodes[0]
      if (first.rawValue) {
        processScanCode(first.rawValue)
      }
    }
  }

  const handleUndo = async (registrationId: string, name: string) => {
    try {
      await undoMutation.mutateAsync(registrationId)
      toast({
        title: 'Check-in Reverted',
        message: `Revoked gate admission for ${name}.`,
        type: 'info',
      })
      setRecentScans((prev) => prev.filter((r) => r.id !== registrationId))
      if (lastScanResult?.registration?.id === registrationId) {
        setLastScanResult(null)
      }
    } catch {
      toast({ title: 'Undo failed', type: 'error' })
    }
  }

  const isDevMode = import.meta.env.DEV || (window as any).VITE_ENABLE_DEV_TOOLS === 'true'

  return (
    <div className="max-w-xl mx-auto space-y-6 pb-12 select-none">
      {/* Offline Alert Banner */}
      {offlineCount > 0 && (
        <div className="rounded-panel border-2 border-[var(--color-accent)] bg-[var(--color-surface)] p-4 flex items-center justify-between text-xs font-bold text-[var(--color-ink)] shadow-sm">
          <div className="flex items-center gap-2.5">
            <Lightning className="w-5 h-5 text-[var(--color-accent)]" weight="fill" />
            <span>{offlineCount} scans queued in offline storage</span>
          </div>
          <span className="text-[var(--color-accent)] font-mono text-[11px] animate-pulse">
            PENDING SYNC
          </span>
        </div>
      )}

      {/* Header */}
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <Sticker color="lime" size="sm" className="font-extrabold tracking-wider uppercase text-[10px]">
            GATE ACCESS TERMINAL
          </Sticker>
          <span className="text-xs text-ink-muted font-mono">Mobile Scanner v2</span>
        </div>
        <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-ink tracking-tight">
          Venue Gate Check-in
        </h1>
        <p className="text-xs text-ink-soft">
          Fast one-handed optical scanning, duplicate prevention, and real-time pass tear verification.
        </p>
      </div>

      {/* Event Picker & Live Counter Card */}
      <div className="rounded-panel border border-line bg-[var(--color-surface)] p-5 space-y-4 shadow-sm">
        <div className="space-y-1.5">
          <label htmlFor="active-event-select" className="text-[11px] font-mono font-bold uppercase tracking-wider text-ink-muted block">
            Active Event Venue
          </label>
          <select
            id="active-event-select"
            aria-label="Active Event Venue"
            value={activeEventId}
            onChange={(e) => setSelectedEventId(e.target.value)}
            className="w-full bg-[var(--color-canvas-subtle)] border border-line-strong rounded-lg p-3 text-xs sm:text-sm font-bold text-ink focus:outline-none focus:border-[var(--color-accent)] transition-colors"
          >
            {events.map((e) => (
              <option key={e.id} value={e.id}>
                {e.title}
              </option>
            ))}
          </select>
        </div>

        {/* Live Attendance Counter */}
        {stats && (
          <div className="pt-2 border-t border-line space-y-2">
            <div className="flex items-baseline justify-between text-xs">
              <span className="text-ink-soft font-semibold">Attendance Progress</span>
              <div className="flex items-baseline gap-1 font-mono">
                <span className="font-extrabold text-base text-[var(--color-accent)]">{stats.totalCheckedIn}</span>
                <span className="text-ink-muted">/ {stats.totalRegistered} registered</span>
                <span className="text-[11px] font-bold text-ink-soft ml-1">({stats.percentage}%)</span>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full h-2.5 bg-surface-subtle rounded-full overflow-hidden">
              <div
                className="h-full bg-[var(--color-accent)] transition-[width] duration-300 rounded-full"
                style={{ width: `${Math.min(stats.percentage, 100)}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Optical Camera Viewport */}
      <div className="rounded-[24px] border-2 border-white/15 bg-[var(--color-canvas-subtle)] overflow-hidden shadow-sm relative">
        <div className="p-3 bg-[var(--color-surface)] border-b border-line flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Camera className="w-4 h-4 text-[var(--color-accent)]" weight="bold" />
            <span className="text-xs font-bold text-ink">Live Camera Scanner</span>
          </div>
          <button
            type="button"
            onClick={() => setCameraActive(!cameraActive)}
            className="text-[11px] font-mono text-ink-soft hover:text-ink px-2 py-0.5 rounded border border-white/15"
          >
            {cameraActive ? 'Pause Video' : 'Resume Video'}
          </button>
        </div>

        {/* Camera Scanner Viewport or Error */}
        <div className="relative aspect-[4/3] bg-black flex items-center justify-center overflow-hidden">
          {cameraActive ? (
            cameraError ? (
              <div className="p-6 text-center space-y-3">
                <Camera className="w-10 h-10 text-ink-muted mx-auto" />
                <p className="text-xs text-ink/80 font-bold">Camera Access Restricted</p>
                <p className="text-[11px] text-ink-muted max-w-xs">{cameraError}</p>
                <button
                  type="button"
                  onClick={() => {
                    setCameraError(null)
                    setCameraActive(true)
                  }}
                  className="px-3 py-1.5 rounded-full bg-[var(--color-accent)] text-[var(--color-canvas)] text-xs font-bold"
                >
                  Retry Camera
                </button>
              </div>
            ) : (
              <div className="w-full h-full relative">
                <Scanner
                  onScan={handleScan}
                  onError={(err) => setCameraError(err?.message || 'Permission denied')}
                  allowMultiple={true}
                  scanDelay={2000}
                  styles={{
                    container: { width: '100%', height: '100%' },
                    video: { width: '100%', height: '100%', objectFit: 'cover' },
                  }}
                />

                {/* Tactical Target Frame Over Scanner */}
                <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                  <div className="w-56 h-56 border-2 border-dashed border-[var(--color-accent)]/60 rounded-panel relative">
                    <div className="absolute top-0 left-0 w-4 h-4 border-t-4 border-l-4 border-[var(--color-accent)]" />
                    <div className="absolute top-0 right-0 w-4 h-4 border-t-4 border-r-4 border-[var(--color-accent)]" />
                    <div className="absolute bottom-0 left-0 w-4 h-4 border-b-4 border-l-4 border-[var(--color-accent)]" />
                    <div className="absolute bottom-0 right-0 w-4 h-4 border-b-4 border-r-4 border-[var(--color-accent)]" />
                  </div>
                </div>
              </div>
            )
          ) : (
            <div className="p-6 text-center space-y-2">
              <Camera className="w-8 h-8 text-ink-muted mx-auto" />
              <p className="text-xs text-ink-soft">Scanner Paused</p>
            </div>
          )}
        </div>
      </div>

      {/* Last Scan Result Card */}
      {lastScanResult && (
        <div
          className={`rounded-panel border-2 p-5 space-y-3 shadow-sm animate-fade-in ${
            lastScanResult.status === 'admitted'
              ? 'border-[var(--color-success)] bg-[var(--color-surface)]'
              : lastScanResult.status === 'already_admitted' || lastScanResult.status === 'queued'
              ? 'border-[var(--color-warning)] bg-[var(--color-surface)]'
              : 'border-[var(--color-danger)] bg-[var(--color-surface)]'
          }`}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              {lastScanResult.status === 'admitted' && (
                <CheckCircle className="w-7 h-7 text-[var(--color-success)] flex-shrink-0" weight="bold" />
              )}
              {(lastScanResult.status === 'already_admitted' || lastScanResult.status === 'queued') && (
                <Warning className="w-7 h-7 text-[var(--color-warning)] flex-shrink-0" weight="bold" />
              )}
              {(lastScanResult.status === 'wrong_event' || lastScanResult.status === 'invalid') && (
                <XCircle className="w-7 h-7 text-[var(--color-danger)] flex-shrink-0" weight="bold" />
              )}
              <div>
                <h3 className="font-display font-extrabold text-base text-ink">
                  {lastScanResult.title}
                </h3>
                <p className="text-xs text-ink-soft">{lastScanResult.message}</p>
              </div>
            </div>

            <span className="text-[10px] font-mono font-bold text-ink-muted">
              {lastScanResult.scannedAt}
            </span>
          </div>

          {lastScanResult.registration && (
            <div className="relative overflow-hidden p-4 rounded-card bg-surface border border-line flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
              <div className="space-y-1 z-10">
                <div className="flex items-center gap-2">
                  <p className="font-bold text-text text-base">
                    {lastScanResult.registration.userName}
                  </p>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold border border-emerald-500/20">
                    ADMITTED
                  </span>
                </div>
                <p className="text-[11px] font-mono text-text-3">
                  {lastScanResult.registration.ticketCode} · {lastScanResult.registration.tierName || 'Standard Admission Pass'}
                </p>
              </div>

              {/* Ink Print Stamp Mark positioned organically on the verification slip */}
              <div className="self-end sm:self-auto flex items-center gap-3 z-10">
                <PrintMark
                  print={{
                    status: 'admitted',
                    dateText: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase(),
                    subtitle: 'GATE ADMITTED',
                    seed: 77,
                  }}
                  scale={0.85}
                  className="rotate-[-3deg] hover:rotate-0 transition-transform duration-200"
                />

                <div className="flex flex-col gap-1.5">
                  <Button
                    surface="admin"
                    variant="secondary"
                    size="dense"
                    onClick={() => {
                      setStampDetails({
                        status: 'admitted',
                        reg: lastScanResult.registration,
                        title: 'Gate Admission Re-Verified',
                      })
                      setStampOverlayOpen(true)
                    }}
                    className="font-mono text-[10px]"
                  >
                    <Sparkle className="w-3 h-3 text-accent" weight="bold" />
                    <span>Re-Stamp</span>
                  </Button>

                  <Button
                    surface="admin"
                    variant="danger"
                    size="dense"
                    onClick={() =>
                      handleUndo(
                        lastScanResult.registration!.id,
                        lastScanResult.registration!.userName
                      )
                    }
                  >
                    <ArrowCounterClockwise className="w-3 h-3" weight="bold" />
                    <span>Undo</span>
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Manual Code Fallback Input */}
      <div className="rounded-panel border border-line bg-[var(--color-surface)] p-5 space-y-3 shadow-sm">
        <label className="text-[11px] font-mono font-bold uppercase tracking-wider text-ink-muted block">
          Manual Ticket Code Lookup
        </label>
        <form
          onSubmit={(e) => {
            e.preventDefault()
            processScanCode(ticketInput)
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={ticketInput}
            onChange={(e) => setTicketInput(e.target.value)}
            placeholder="E.g. TKT-884192 or 6-digit OTP..."
            className="flex-1 bg-[var(--color-canvas-subtle)] border border-line-strong rounded-lg px-4 py-2.5 text-xs sm:text-sm font-mono text-ink placeholder:text-ink/30 focus:outline-none focus:border-[var(--color-accent)] uppercase"
          />
          <button
            type="submit"
            disabled={checkinMutation.isPending}
            className="px-4 py-2.5 rounded-lg bg-[var(--color-accent)] hover:bg-accent-hover text-[var(--color-canvas)] text-xs font-bold tracking-wide transition-colors flex-shrink-0"
          >
            Verify Pass
          </button>
        </form>

        {/* Dev Tools Gated Quick Simulate Buttons (Audit F-12, V-13) */}
        {isDevMode && (
          <div className="pt-2 border-t border-line flex items-center gap-2">
            <span className="text-[10px] font-mono text-ink-muted">DEV SIMULATE:</span>
            <button
              type="button"
              onClick={() => processScanCode('TKT-884192')}
              className="text-[10px] font-mono text-[var(--color-accent)] hover:underline px-2 py-0.5 rounded bg-surface-subtle"
            >
              Aditya (TKT-884192)
            </button>
            <button
              type="button"
              onClick={() => processScanCode('TKT-104921')}
              className="text-[10px] font-mono text-[var(--color-accent)] hover:underline px-2 py-0.5 rounded bg-surface-subtle"
            >
              Ananya (TKT-104921)
            </button>
          </div>
        )}
      </div>

      {/* Recent Scans Strip with Instant Undo */}
      {recentScans.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-[11px] font-mono font-bold uppercase tracking-wider text-ink-muted px-1">
            Recent Gate Check-ins
          </h4>
          <div className="space-y-1.5">
            {recentScans.map((reg) => (
              <div
                key={reg.id}
                className="rounded-panel border border-line bg-[var(--color-surface)] p-3 flex items-center justify-between gap-3 text-xs"
              >
                <div className="flex items-center gap-2.5">
                  <span className="w-2 h-2 rounded-full bg-[var(--color-success)]" />
                  <div>
                    <span className="font-bold text-ink">{reg.userName}</span>
                    <span className="text-[11px] font-mono text-ink-muted ml-2">
                      {reg.ticketCode}
                    </span>
                  </div>
                </div>

                <Button
                  surface="admin"
                  variant="ghost"
                  size="dense"
                  onClick={() => handleUndo(reg.id, reg.userName)}
                  className="font-mono text-[11px]"
                >
                  <ArrowCounterClockwise className="w-3.5 h-3.5" />
                  <span>Undo</span>
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3D Physical Desk Stamp Modal */}
      <StampActionOverlay
        isOpen={stampOverlayOpen}
        onClose={() => setStampOverlayOpen(false)}
        status={stampDetails.status === 'admitted' ? 'admitted' : 'void'}
        title="Gate Admission Verified"
        subtitle={stampDetails.reg?.userName || 'GATE ADMISSION CLEARANCE'}
        dateText={new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase()}
      />
    </div>
  )
}
