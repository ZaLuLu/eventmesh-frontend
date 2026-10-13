import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface SoundStore {
  isMuted: boolean
  hasUserGesture: boolean
  toggleMute: () => void
  setMuted: (muted: boolean) => void
  recordUserGesture: () => void
}

export const useSoundStore = create<SoundStore>()(
  persist(
    (set) => ({
      // Default to muted if user prefers reduced motion
      isMuted:
        typeof window !== 'undefined'
          ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
          : false,
      hasUserGesture: false,
      toggleMute: () => set((state) => ({ isMuted: !state.isMuted })),
      setMuted: (isMuted: boolean) => set({ isMuted }),
      recordUserGesture: () => set({ hasUserGesture: true }),
    }),
    {
      name: 'eventmesh_sound_settings',
      partialize: (state) => ({ isMuted: state.isMuted }),
    }
  )
)
