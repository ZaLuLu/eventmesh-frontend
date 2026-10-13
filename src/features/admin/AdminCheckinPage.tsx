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

interface ScanResultState {
  status: 'admitted' | 'already_admitted' | 'wrong_event' | 'invalid'
  title: string
  message: string
  registration?: Registration
  scannedAt: string
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

  // Last scanned code debounce timestamp map
  const lastScannedRef = useRef<{ code: string; time: number }>({ code: '', time: 0 })

  const { data: events = [] } = useAdminEvents({
    orgId: session?.orgId || 'org-1',
    clubId: clubId || undefined,
  })

  const activeEventId = selectedEventId || events[0]?.id || ''
  const activeEvent = events.find((e) => e.id === activeEventId)
  const { data: stats } = useCheckinStats(activeEventId)

  const checkinMutation = useCheckinTicket()
  const undoMutation = useUndoCheckin()

  // Offline queue sync handler
  useEffect(() => {
    const checkOfflineQueue = async () => {
      try {
        const queue = (await get<string[]>('eventmesh_offline_checkins')) || []
        setOfflineCount(queue.length)
      } catch {}
    }
    checkOfflineQueue()

    const handleOnline = async () => {
      try {
        const queue = (await get<string[]>('eventmesh_offline_checkins')) || []
        if (queue.length > 0) {
          toast({
            title: 'Syncing Offline Scans',
            message: `Uploading ${queue.length} scans queued while offline...`,
            type: 'info',
          })
          for (const code of queue) {
            await checkinMutation.mutateAsync({ ticketCode: code, eventId: activeEventId })
          }
          await set('eventmesh_offline_checkins', [])
          setOfflineCount(0)
          toast({
            title: 'Offline Sync Complete',
            message: 'All gate entries successfully synced with registry.',
            type: 'success',
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
    } catch {}

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
        const currentQueue = (await get<string[]>('eventmesh_offline_checkins')) || []
        currentQueue.push(cleanCode)
        await set('eventmesh_offline_checkins', currentQueue)
        setOfflineCount(currentQueue.length)
        if (navigator.vibrate) navigator.vibrate([100, 50, 100])
        playSound('success')
        setLastScanResult({
          status: 'admitted',
          title: 'Admitted (Queued Offline)',
          message: `Pass ${cleanCode} accepted offline and saved to device terminal queue.`,
          scannedAt: new Date().toLocaleTimeString(),
        })
        return
      } catch {}
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
        } catch {}
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
        <div className="rounded-[16px] border-2 border-[#D4F25A] bg-[#181530] p-4 flex items-center justify-between text-xs font-bold text-[#F6F1E7] shadow-[3px_3px_0_#000]">
          <div className="flex items-center gap-2.5">
            <Lightning className="w-5 h-5 text-[#D4F25A]" weight="fill" />
            <span>{offlineCount} scans queued in offline storage</span>
          </div>
          <span className="text-[#D4F25A] font-mono text-[11px] animate-pulse">
            AUTO-SYNCING
          </span>
        </div>
      )}

      {/* Header */}
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <Sticker color="lime" size="sm" className="font-extrabold tracking-wider uppercase text-[10px]">
            GATE ACCESS TERMINAL
          </Sticker>
          <span className="text-xs text-white/50 font-mono">Mobile Scanner v2</span>
        </div>
        <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-white tracking-tight">
          Venue Gate Check-in
        </h1>
        <p className="text-xs text-white/60">
          Fast one-handed optical scanning, duplicate prevention, and real-time pass tear verification.
        </p>
      </div>

      {/* Event Picker & Live Counter Card */}
      <div className="rounded-[20px] border border-white/10 bg-[#181530] p-5 space-y-4 shadow-[4px_4px_0_#000]">
        <div className="space-y-1.5">
          <label htmlFor="active-event-select" className="text-[11px] font-mono font-bold uppercase tracking-wider text-white/50 block">
            Active Event Venue
          </label>
          <select
            id="active-event-select"
            aria-label="Active Event Venue"
            value={activeEventId}
            onChange={(e) => setSelectedEventId(e.target.value)}
            className="w-full bg-[#120F24] border border-white/20 rounded-[12px] p-3 text-xs sm:text-sm font-bold text-white focus:outline-none focus:border-[#D4F25A] transition-colors"
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
          <div className="pt-2 border-t border-white/10 space-y-2">
            <div className="flex items-baseline justify-between text-xs">
              <span className="text-white/60 font-semibold">Attendance Progress</span>
              <div className="flex items-baseline gap-1 font-mono">
                <span className="font-extrabold text-base text-[#D4F25A]">{stats.totalCheckedIn}</span>
                <span className="text-white/50">/ {stats.totalRegistered} registered</span>
                <span className="text-[11px] font-bold text-white/70 ml-1">({stats.percentage}%)</span>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full h-2.5 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-[#D4F25A] transition-[width] duration-300 rounded-full"
                style={{ width: `${Math.min(stats.percentage, 100)}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Optical Camera Viewport */}
      <div className="rounded-[24px] border-2 border-white/15 bg-[#120F24] overflow-hidden shadow-[6px_6px_0_#000] relative">
        <div className="p-3 bg-[#181530] border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Camera className="w-4 h-4 text-[#D4F25A]" weight="bold" />
            <span className="text-xs font-bold text-white">Live Camera Scanner</span>
          </div>
          <button
            type="button"
            onClick={() => setCameraActive(!cameraActive)}
            className="text-[11px] font-mono text-white/60 hover:text-white px-2 py-0.5 rounded border border-white/15"
          >
            {cameraActive ? 'Pause Video' : 'Resume Video'}
          </button>
        </div>

        {/* Camera Scanner Viewport or Error */}
        <div className="relative aspect-[4/3] bg-black flex items-center justify-center overflow-hidden">
          {cameraActive ? (
            cameraError ? (
              <div className="p-6 text-center space-y-3">
                <Camera className="w-10 h-10 text-white/40 mx-auto" />
                <p className="text-xs text-white/80 font-bold">Camera Access Restricted</p>
                <p className="text-[11px] text-white/50 max-w-xs">{cameraError}</p>
                <button
                  type="button"
                  onClick={() => {
                    setCameraError(null)
                    setCameraActive(true)
                  }}
                  className="px-3 py-1.5 rounded-full bg-[#D4F25A] text-[#0F0D1F] text-xs font-bold"
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
                  <div className="w-56 h-56 border-2 border-dashed border-[#D4F25A]/60 rounded-[20px] relative">
                    <div className="absolute top-0 left-0 w-4 h-4 border-t-4 border-l-4 border-[#D4F25A]" />
                    <div className="absolute top-0 right-0 w-4 h-4 border-t-4 border-r-4 border-[#D4F25A]" />
                    <div className="absolute bottom-0 left-0 w-4 h-4 border-b-4 border-l-4 border-[#D4F25A]" />
                    <div className="absolute bottom-0 right-0 w-4 h-4 border-b-4 border-r-4 border-[#D4F25A]" />
                  </div>
                </div>
              </div>
            )
          ) : (
            <div className="p-6 text-center space-y-2">
              <Camera className="w-8 h-8 text-white/40 mx-auto" />
              <p className="text-xs text-white/60">Scanner Paused</p>
            </div>
          )}
        </div>
      </div>

      {/* Last Scan Result Card */}
      {lastScanResult && (
        <div
          className={`rounded-[20px] border-2 p-5 space-y-3 shadow-[4px_4px_0_#000] animate-fade-in ${
            lastScanResult.status === 'admitted'
              ? 'border-[#7FD8B8] bg-[#14231E]'
              : lastScanResult.status === 'already_admitted'
              ? 'border-[#F2B84B] bg-[#241E10]'
              : 'border-[#FF5C8A] bg-[#251019]'
          }`}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              {lastScanResult.status === 'admitted' && (
                <CheckCircle className="w-7 h-7 text-[#7FD8B8] flex-shrink-0" weight="bold" />
              )}
              {lastScanResult.status === 'already_admitted' && (
                <Warning className="w-7 h-7 text-[#F2B84B] flex-shrink-0" weight="bold" />
              )}
              {(lastScanResult.status === 'wrong_event' || lastScanResult.status === 'invalid') && (
                <XCircle className="w-7 h-7 text-[#FF5C8A] flex-shrink-0" weight="bold" />
              )}
              <div>
                <h3 className="font-display font-extrabold text-base text-white">
                  {lastScanResult.title}
                </h3>
                <p className="text-xs text-white/70">{lastScanResult.message}</p>
              </div>
            </div>

            <span className="text-[10px] font-mono font-bold text-white/40">
              {lastScanResult.scannedAt}
            </span>
          </div>

          {lastScanResult.registration && (
            <div className="p-3 rounded-[12px] bg-black/30 border border-white/10 flex items-center justify-between text-xs">
              <div className="space-y-0.5">
                <p className="font-bold text-white text-sm">
                  {lastScanResult.registration.userName}
                </p>
                <p className="text-[11px] font-mono text-white/50">
                  {lastScanResult.registration.ticketCode} · {lastScanResult.registration.tierName || 'Hacker Pass'}
                </p>
              </div>
              <button
                type="button"
                onClick={() =>
                  handleUndo(
                    lastScanResult.registration!.id,
                    lastScanResult.registration!.userName
                  )
                }
                className="px-2.5 py-1 rounded bg-white/10 hover:bg-white/20 text-white font-bold text-[11px] flex items-center gap-1 transition-colors"
              >
                <ArrowCounterClockwise className="w-3.5 h-3.5" weight="bold" />
                <span>Undo</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* Manual Code Fallback Input */}
      <div className="rounded-[20px] border border-white/10 bg-[#181530] p-5 space-y-3 shadow-[4px_4px_0_#000]">
        <label className="text-[11px] font-mono font-bold uppercase tracking-wider text-white/50 block">
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
            className="flex-1 bg-[#120F24] border border-white/20 rounded-[12px] px-4 py-2.5 text-xs sm:text-sm font-mono text-white placeholder:text-white/30 focus:outline-none focus:border-[#D4F25A] uppercase"
          />
          <button
            type="submit"
            disabled={checkinMutation.isPending}
            className="px-4 py-2.5 rounded-[12px] bg-[#D4F25A] hover:bg-[#c2e245] text-[#0F0D1F] text-xs font-bold tracking-wide transition-colors flex-shrink-0"
          >
            Verify Pass
          </button>
        </form>

        {/* Dev Tools Gated Quick Simulate Buttons (Audit F-12, V-13) */}
        {isDevMode && (
          <div className="pt-2 border-t border-white/10 flex items-center gap-2">
            <span className="text-[10px] font-mono text-white/40">DEV SIMULATE:</span>
            <button
              type="button"
              onClick={() => processScanCode('TKT-884192')}
              className="text-[10px] font-mono text-[#D4F25A] hover:underline px-2 py-0.5 rounded bg-white/5"
            >
              Aditya (TKT-884192)
            </button>
            <button
              type="button"
              onClick={() => processScanCode('TKT-104921')}
              className="text-[10px] font-mono text-[#D4F25A] hover:underline px-2 py-0.5 rounded bg-white/5"
            >
              Ananya (TKT-104921)
            </button>
          </div>
        )}
      </div>

      {/* Recent Scans Strip with Instant Undo */}
      {recentScans.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-[11px] font-mono font-bold uppercase tracking-wider text-white/50 px-1">
            Recent Gate Check-ins
          </h4>
          <div className="space-y-1.5">
            {recentScans.map((reg) => (
              <div
                key={reg.id}
                className="rounded-[14px] border border-white/10 bg-[#181530] p-3 flex items-center justify-between gap-3 text-xs"
              >
                <div className="flex items-center gap-2.5">
                  <span className="w-2 h-2 rounded-full bg-[#7FD8B8]" />
                  <div>
                    <span className="font-bold text-white">{reg.userName}</span>
                    <span className="text-[11px] font-mono text-white/40 ml-2">
                      {reg.ticketCode}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleUndo(reg.id, reg.userName)}
                  className="text-[11px] font-semibold text-white/60 hover:text-white flex items-center gap-1"
                >
                  <ArrowCounterClockwise className="w-3.5 h-3.5" />
                  <span>Undo</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
