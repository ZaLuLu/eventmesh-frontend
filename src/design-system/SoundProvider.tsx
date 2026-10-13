import React, { useEffect, createContext, useContext } from 'react'
import { useSoundStore } from '@/stores/useSoundStore'
import { SpeakerHigh, SpeakerSlash } from '@/design-system/Icon'

interface SoundContextValue {
  isMuted: boolean
  toggleMute: () => void
}

const SoundContext = createContext<SoundContextValue>({
  isMuted: false,
  toggleMute: () => {},
})

export const useSound = () => useContext(SoundContext)

/**
 * SoundProvider Component
 * Listens for user gestures (clicks, taps, keydown) to unlock audio playback safely,
 * and maintains global mute preference (Audit F-14).
 */
export const SoundProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isMuted, toggleMute, recordUserGesture } = useSoundStore()

  useEffect(() => {
    const handleGesture = () => {
      recordUserGesture()
      window.removeEventListener('pointerdown', handleGesture)
      window.removeEventListener('keydown', handleGesture)
    }

    window.addEventListener('pointerdown', handleGesture, { passive: true })
    window.addEventListener('keydown', handleGesture, { passive: true })

    return () => {
      window.removeEventListener('pointerdown', handleGesture)
      window.removeEventListener('keydown', handleGesture)
    }
  }, [recordUserGesture])

  return (
    <SoundContext.Provider value={{ isMuted, toggleMute }}>
      {children}
    </SoundContext.Provider>
  )
}

/**
 * Accessible Sound Toggle Button for Header / Kiosk
 */
export const SoundToggleButton: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { isMuted, toggleMute } = useSound()

  return (
    <button
      type="button"
      onClick={toggleMute}
      className={`p-2 rounded-full border border-ink/15 hover:border-ink/40 text-ink/70 hover:text-ink transition-colors flex items-center justify-center ${className}`}
      title={isMuted ? 'Unmute campus kiosk sounds' : 'Mute campus kiosk sounds'}
      aria-label={isMuted ? 'Unmute campus kiosk sounds' : 'Mute campus kiosk sounds'}
    >
      {isMuted ? (
        <SpeakerSlash size={18} weight="bold" />
      ) : (
        <SpeakerHigh size={18} weight="bold" />
      )}
    </button>
  )
}
