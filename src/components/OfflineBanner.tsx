import React, { useState, useEffect } from 'react'
import { WifiSlash, ArrowsClockwise } from '@/design-system/Icon'

/**
 * OfflineBanner: Real-time network connectivity detector (Audit F-13).
 * Displays a tactile warning strip when device loses internet access,
 * reassuring attendees that local tickets and scanned passes are queued.
 */
export const OfflineBanner: React.FC = () => {
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  )

  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  if (isOnline) return null

  return (
    <div
      role="status"
      aria-live="polite"
      className="w-full bg-purple-600 dark:bg-purple-700 text-white px-4 py-2 border-b-2 border-ink flex items-center justify-center gap-2.5 text-xs font-mono font-bold uppercase tracking-wider select-none z-50 sticky top-0 shadow-xs"
    >
      <WifiSlash size={16} weight="bold" />
      <span>Network Disconnected — Operating in Local Memory Mode</span>
      <span className="opacity-80 font-normal normal-case hidden sm:inline">
        (Offline passes and scanned check-ins will synchronize automatically upon reconnect)
      </span>
    </div>
  )
}
